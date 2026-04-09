<template>
  <div class="mindmap-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="tool-btn" @click="goBack" title="返回主页">
          <i class="fa-solid fa-arrow-left"></i>
        </button>

        <div class="divider"></div>

        <button class="tool-btn" @click="addNode" title="添加子节点 (Tab)">
          <i class="fa-solid fa-plus"></i>
          <span>添加节点</span>
        </button>

        <button class="tool-btn" @click="deleteNode" title="删除节点 (Delete)">
          <i class="fa-solid fa-trash"></i>
          <span>删除</span>
        </button>

        <div class="divider"></div>

        <!-- 布局切换 -->
        <div class="layout-selector">
          <label class="label">布局：</label>
          <select v-model="currentLayout" @change="changeLayout" class="select-input">
            <option value="logicalStructure">逻辑结构图</option>
            <option value="mindMap">思维导图</option>
            <option value="organizationStructure">组织结构图</option>
            <option value="verticalTimeline">垂直时间轴</option>
            <option value="horizontalTimeline">水平时间轴</option>
          </select>
        </div>

        <!-- 选中状态指示 -->
        <div class="selection-indicator" :class="{ active: selectedNode }">
          <i class="fa-solid fa-circle-check"></i>
          <span>{{ selectedNode ? '已选中节点' : '未选择节点' }}</span>
        </div>
      </div>

      <div class="toolbar-right">
        <button class="tool-btn" @click="showImageDialog" title="插入图片">
          <i class="fa-solid fa-image"></i>
          <span>插入图片</span>
        </button>

        <button class="tool-btn" @click="showStylePanel = !showStylePanel" title="节点样式">
          <i class="fa-solid fa-palette"></i>
          <span>样式</span>
        </button>

        <div class="divider"></div>

        <button class="tool-btn" @click="exportJSON" title="导出 JSON">
          <i class="fa-solid fa-file-export"></i>
          <span>导出 JSON</span>
        </button>

        <button class="tool-btn" @click="importJSON" title="导入 JSON">
          <i class="fa-solid fa-file-import"></i>
          <span>导入 JSON</span>
        </button>

        <button class="tool-btn btn-primary" @click="exportImage" title="导出为图片">
          <i class="fa-solid fa-download"></i>
          <span>导出 PNG</span>
        </button>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="canvas-wrapper" ref="canvasWrapper">
      <div id="mindMapContainer" class="mindmap-canvas"></div>
    </div>

    <!-- 样式面板 -->
    <div v-if="showStylePanel" class="style-panel">
      <div class="panel-header">
        <h3><i class="fa-solid fa-palette"></i> 节点样式</h3>
        <button class="close-btn" @click="showStylePanel = false">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="panel-content">
        <!-- 背景颜色 -->
        <div class="style-group">
          <label class="style-label">背景颜色</label>
          <div class="color-picker-wrapper">
            <input
              v-model="nodeStyle.fillColor"
              type="color"
              class="color-input"
              @change="applyNodeStyle"
            />
            <span class="color-value">{{ nodeStyle.fillColor }}</span>
          </div>
        </div>

        <!-- 文字颜色 -->
        <div class="style-group">
          <label class="style-label">文字颜色</label>
          <div class="color-picker-wrapper">
            <input
              v-model="nodeStyle.textColor"
              type="color"
              class="color-input"
              @change="applyNodeStyle"
            />
            <span class="color-value">{{ nodeStyle.textColor }}</span>
          </div>
        </div>

        <!-- 边框颜色 -->
        <div class="style-group">
          <label class="style-label">边框颜色</label>
          <div class="color-picker-wrapper">
            <input
              v-model="nodeStyle.borderColor"
              type="color"
              class="color-input"
              @change="applyNodeStyle"
            />
            <span class="color-value">{{ nodeStyle.borderColor }}</span>
          </div>
        </div>

        <!-- 边框宽度 -->
        <div class="style-group">
          <label class="style-label">边框宽度</label>
          <input
            v-model.number="nodeStyle.borderWidth"
            type="range"
            min="0"
            max="10"
            step="1"
            class="range-input"
            @input="applyNodeStyle"
          />
          <span class="range-value">{{ nodeStyle.borderWidth }}px</span>
        </div>

        <!-- 圆角 -->
        <div class="style-group">
          <label class="style-label">圆角半径</label>
          <input
            v-model.number="nodeStyle.borderRadius"
            type="range"
            min="0"
            max="20"
            step="2"
            class="range-input"
            @input="applyNodeStyle"
          />
          <span class="range-value">{{ nodeStyle.borderRadius }}px</span>
        </div>

        <!-- 应用按钮 -->
        <button class="btn btn-block" @click="resetStyle">
          <i class="fa-solid fa-rotate-left"></i>
          重置样式
        </button>
      </div>
    </div>

    <!-- 图片插入对话框 -->
    <ImageCompressor
      v-model="showImageCompressor"
      @confirm="handleImageConfirm"
    />

    <!-- 图片查看器 -->
    <ImageViewer
      v-model="showImageViewer"
      :images="viewerImages"
      :initial-index="viewerInitialIndex"
      @close="handleViewerClose"
    />

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="hidden-input"
      @change="handleFileImport"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import MindMap from 'simple-mind-map'
import ImageCompressor from '../components/ImageCompressor.vue'
import ImageViewer from '../components/ImageViewer.vue'
import { useToast } from '../composables/useToast.js'

const { showToast } = useToast()

// ==================== 状态管理 ====================
const canvasWrapper = ref(null)
const mindMapInstance = ref(null)
const currentLayout = ref('logicalStructure')
const showStylePanel = ref(false)
const showImageCompressor = ref(false)
const fileInput = ref(null)
const selectedNode = ref(null) // 当前选中的节点

// 图片查看器状态
const showImageViewer = ref(false)
const viewerImages = ref([])
const viewerInitialIndex = ref(0)

// 节点样式
const nodeStyle = ref({
  fillColor: '#ffffff',
  textColor: '#333333',
  borderColor: '#4a90e2',
  borderWidth: 2,
  borderRadius: 5
})

// ==================== 初始化思维导图 ====================
onMounted(async () => {
  await nextTick()
  initMindMap()
})

onUnmounted(() => {
  if (mindMapInstance.value) {
    mindMapInstance.value.destroy()
  }
})

const initMindMap = () => {
  const container = document.getElementById('mindMapContainer')
  if (!container) return

  // 初始数据
  const data = {
    data: {
      text: '中心主题',
      image: '', // 预留图片字段
      expand: true
    },
    children: [
      {
        data: {
          text: '分支 1',
          image: ''
        },
        children: []
      },
      {
        data: {
          text: '分支 2',
          image: ''
        },
        children: []
      }
    ]
  }

  // 创建思维导图实例
  mindMapInstance.value = new MindMap({
    el: container,
    data: data,
    theme: 'default',
    layout: currentLayout.value,
    enableFreeDrag: true, // 启用自由拖拽
    enableDblclickResetTransform: true, // 双击重置视图
    mousewheelAction: 'zoom', // 滚轮缩放
    customNoteContentShow: null,
    fitPadding: 50
  })

  // 绑定键盘事件
  mindMapInstance.value.on('keydown', handleKeydown)

  // 绑定节点点击事件
  mindMapInstance.value.on('node_click', handleNodeClick)

  // 绑定节点图片点击事件
  mindMapInstance.value.on('node_img_dblclick', handleImageClick)

  // 绑定画布点击事件（取消选中）
  mindMapInstance.value.on('svg_mousedown', () => {
    selectedNode.value = null
  })

  showToast('思维导图已就绪', 'success')
}

// ==================== 图片查看器 ====================

/**
 * 收集所有节点的图片
 */
const collectAllImages = () => {
  const images = []
  
  if (!mindMapInstance.value) return images
  
  // 递归遍历所有节点
  const traverse = (node) => {
    const data = node.getData()
    if (data && data.image) {
      images.push(data.image)
    }
    
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => traverse(child))
    }
  }
  
  // 从根节点开始遍历
  const root = mindMapInstance.value.renderer.root
  if (root) {
    traverse(root)
  }
  
  return images
}

/**
 * 处理图片点击事件
 */
const handleImageClick = (node, e) => {
  console.log('图片被点击:', node)
  
  // 收集所有图片
  const allImages = collectAllImages()
  
  if (allImages.length === 0) {
    showToast('没有找到图片', 'warning')
    return
  }
  
  // 获取当前点击图片的索引
  const nodeData = node.getData()
  const currentImage = nodeData?.image
  
  let initialIndex = 0
  if (currentImage) {
    initialIndex = allImages.indexOf(currentImage)
    if (initialIndex === -1) initialIndex = 0
  }
  
  // 打开查看器
  viewerImages.value = allImages
  viewerInitialIndex.value = initialIndex
  showImageViewer.value = true
}

const handleViewerClose = () => {
  console.log('图片查看器关闭')
}

// ==================== 节点操作 ====================

const addNode = () => {
  if (!mindMapInstance.value) return

  // 使用 execCommand API 添加子节点
  try {
    mindMapInstance.value.execCommand('INSERT_CHILD_NODE')
    showToast('已添加子节点', 'success')
  } catch (error) {
    console.error('添加节点失败:', error)
    showToast('添加节点失败：' + error.message, 'error')
  }
}

const deleteNode = () => {
  if (!mindMapInstance.value) return

  const node = selectedNode.value
  if (node) {
    // 不能删除根节点
    if (node.isRoot) {
      showToast('不能删除根节点', 'warning')
      return
    }

    node.remove()
    selectedNode.value = null
    showToast('已删除节点', 'success')
  } else {
    showToast('请先选择一个节点', 'warning')
  }
}

const handleNodeClick = (node, e) => {
  console.log('节点点击:', node)
  selectedNode.value = node
  showToast('已选中节点', 'success')
}

// ==================== 键盘快捷键 ====================

const handleKeydown = (e) => {
  // Tab: 添加子节点
  if (e.key === 'Tab') {
    e.preventDefault()
    addNode()
  }

  // Delete/Backspace: 删除节点
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedNode.value && !selectedNode.value.isRoot) {
      e.preventDefault()
      deleteNode()
    }
  }

  // Enter: 编辑节点
  if (e.key === 'Enter') {
    if (selectedNode.value) {
      e.preventDefault()
      selectedNode.value.beginTextEdit()
    }
  }
}

// ==================== 布局切换 ====================

const changeLayout = () => {
  if (!mindMapInstance.value) return

  mindMapInstance.value.setLayout(currentLayout.value)
  showToast(`已切换到${getLayoutName(currentLayout.value)}`, 'success')
}

const getLayoutName = (layout) => {
  const names = {
    logicalStructure: '逻辑结构图',
    mindMap: '思维导图',
    organizationStructure: '组织结构图',
    verticalTimeline: '垂直时间轴',
    horizontalTimeline: '水平时间轴'
  }
  return names[layout] || layout
}

// ==================== 图片处理 ====================

const showImageDialog = () => {
  if (!selectedNode.value) {
    showToast('请先点击选择一个节点', 'warning')
    return
  }

  showImageCompressor.value = true
}

const handleImageConfirm = ({ base64, size }) => {
  if (!mindMapInstance.value || !selectedNode.value) {
    showToast('请先选择一个节点', 'warning')
    return
  }

  try {
    console.log('开始插入图片...')
    
    // 使用 simple-mind-map 的 execCommand API 设置图片
    // SET_NODE_IMAGE 需要传入节点和图片数据对象
    const imgData = {
      url: base64,
      width: 200,  // 默认宽度
      height: 150  // 默认高度
    }
    
    console.log('准备插入的图片数据:', imgData)
    
    // 执行命令
    mindMapInstance.value.execCommand('SET_NODE_IMAGE', selectedNode.value, imgData)
    
    console.log('SET_NODE_IMAGE 命令执行成功')
    
    showToast(`图片已插入 (${size})`, 'success')
  } catch (error) {
    console.error('插入图片失败:', error)
    showToast('插入图片失败：' + error.message, 'error')
  }
}

// ==================== 样式设置 ====================

const applyNodeStyle = () => {
  if (!mindMapInstance.value || !selectedNode.value) {
    showToast('请先选择一个节点', 'warning')
    return
  }

  // 应用样式到当前节点
  selectedNode.value.setStyle({
    fill: nodeStyle.value.fillColor,
    color: nodeStyle.value.textColor,
    borderColor: nodeStyle.value.borderColor,
    borderWidth: nodeStyle.value.borderWidth,
    borderRadius: nodeStyle.value.borderRadius
  })
}

const resetStyle = () => {
  nodeStyle.value = {
    fillColor: '#ffffff',
    textColor: '#333333',
    borderColor: '#4a90e2',
    borderWidth: 2,
    borderRadius: 5
  }

  if (mindMapInstance.value && selectedNode.value) {
    selectedNode.value.setStyle({})
    showToast('样式已重置', 'success')
  }
}

// ==================== 导入导出 ====================

const exportJSON = () => {
  if (!mindMapInstance.value) return

  const data = mindMapInstance.value.getData()
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `mindmap_${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  showToast('已导出 JSON 文件', 'success')
}

const importJSON = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileImport = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result)

      // 验证数据格式
      if (!data.data || !data.data.text) {
        throw new Error('无效的思维导图数据')
      }

      // 加载数据
      if (mindMapInstance.value) {
        mindMapInstance.value.setData(data)
        showToast('已导入思维导图', 'success')
      }
    } catch (error) {
      console.error('导入失败:', error)
      showToast('导入失败：' + error.message, 'error')
    }
  }

  reader.readAsText(file)
  e.target.value = ''
}

const exportImage = async () => {
  if (!mindMapInstance.value) return

  try {
    // 导出为 PNG，simple-mind-map 的 export 返回的是 base64 或 blob
    const result = await mindMapInstance.value.export('png', {
      padding: 20,
      bg: '#ffffff'
    })

    console.log('导出结果类型:', typeof result)
    console.log('导出结果:', result)

    let blob
    let url

    // 如果结果是 base64 字符串
    if (typeof result === 'string') {
      // 将 base64 转换为 blob
      const response = await fetch(result)
      blob = await response.blob()
      url = URL.createObjectURL(blob)
    } 
    // 如果结果已经是 blob
    else if (result instanceof Blob) {
      url = URL.createObjectURL(result)
    }
    // 其他情况（可能是对象包含 data 字段）
    else if (result && result.data) {
      if (typeof result.data === 'string') {
        const response = await fetch(result.data)
        blob = await response.blob()
        url = URL.createObjectURL(blob)
      } else {
        throw new Error('不支持的导出格式')
      }
    } else {
      throw new Error('未知的导出结果格式')
    }

    const a = document.createElement('a')
    a.href = url
    a.download = `mindmap_${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showToast('已导出 PNG 图片', 'success')
  } catch (error) {
    console.error('导出失败:', error)
    showToast('导出失败：' + error.message, 'error')
  }
}

// ==================== 导航 ====================

const goBack = () => {
  window.location.hash = '#'
}
</script>

<style scoped>
.mindmap-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  position: relative;
  overflow: hidden;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.2rem;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  gap: 1rem;
  flex-wrap: wrap;
  z-index: 10;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.8rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--fg);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tool-btn:hover {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--accent);
}

.tool-btn.btn-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
}

.tool-btn.btn-primary:hover {
  opacity: 0.9;
}

.tool-btn i {
  font-size: 0.9rem;
}

.divider {
  width: 1px;
  height: 24px;
  background: var(--border);
  margin: 0 0.3rem;
}

/* 布局选择器 */
.layout-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.layout-selector .label {
  font-size: 0.85rem;
  color: var(--muted);
}

.select-input {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--fg);
  font-size: 0.85rem;
  cursor: pointer;
}

.select-input:focus {
  outline: none;
  border-color: var(--accent);
}

/* 选中状态指示器 */
.selection-indicator {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  color: var(--muted);
  transition: all 0.2s;
}

.selection-indicator.active {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--accent);
}

.selection-indicator i {
  font-size: 0.75rem;
}

/* 画布区域 */
.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: linear-gradient(45deg, var(--bg) 25%, transparent 25%),
              linear-gradient(-45deg, var(--bg) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, var(--bg) 75%),
              linear-gradient(-45deg, transparent 75%, var(--bg) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.mindmap-canvas {
  width: 100%;
  height: 100%;
}

/* 样式面板 */
.style-panel {
  position: absolute;
  top: 60px;
  right: 20px;
  width: 280px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  z-index: 20;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.panel-header h3 {
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
}

.panel-header h3 i {
  color: var(--accent);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--muted);
  cursor: pointer;
  padding: 0.3rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--accent-dim);
  color: var(--accent);
}

.panel-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: calc(100vh - 150px);
  overflow-y: auto;
}

.style-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.style-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--fg);
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.color-input {
  width: 50px;
  height: 35px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: transparent;
}

.color-value {
  font-size: 0.8rem;
  color: var(--muted);
  font-family: monospace;
}

.range-input {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--border);
  border-radius: 2px;
  outline: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
}

.range-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.range-value {
  font-size: 0.8rem;
  color: var(--accent);
  font-weight: 600;
  text-align: right;
}

/* 隐藏文件输入 */
.hidden-input {
  display: none;
}

/* 响应式 */
@media (max-width: 768px) {
  .toolbar {
    padding: 0.6rem 0.8rem;
  }

  .tool-btn span {
    display: none;
  }

  .style-panel {
    width: calc(100% - 40px);
    right: 20px;
    left: 20px;
  }
}
</style>
