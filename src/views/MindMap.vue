<template>
  <div class="mind-map-view">
    <MindMapToolbar :can-undo="canUndo" :can-redo="canRedo" :has-node="hasNode" :current-theme="currentTheme"
      :light-theme-list="lightThemeList" :dark-theme-list="darkThemeList" :theme-preview-map="themePreviewMap"
      :is-associative-line-mode="isAssociativeLineMode" @new-file="handleNewFile" @undo="undo" @redo="redo"
      @insert-sibling="insertSiblingNode" @insert-child="insertChildNode" @remove="removeNode"
      @insert-image="handleInsertImage" @open="handleOpen" @save-as="handleSaveAs" @import="handleImport"
      @export="showExportDialog = true" @set-theme="setTheme" @toggle-outline="handleToggleOutline"
      @toggle-associative-line="toggleAssociativeLineMode" />

    <div class="main-area">
      <MindMapCore />

      <OutlinePanel v-if="showOutline" :tree="outlineTree" @close="showOutline = false" />

      <NodeStylePanel v-if="activeNodes.length > 0 && !isReadonly" :active-nodes="activeNodes" @set-style="setNodeStyle"
        @set-theme-config="setThemeConfig" :theme-config="themeConfig" />
    </div>

    <!-- 图片弹窗 -->
    <Teleport to="body">
      <div v-if="showImageDialog" class="dialog-overlay" @click.self="closeImageDialog">
        <div class="dialog image-dialog">
          <div class="dialog-header">
            <span>插入图片</span>
            <button class="dialog-close" @click="closeImageDialog">&times;</button>
          </div>

          <!-- Tab 栏 -->
          <div class="image-tabs">
            <div class="image-tab" :class="{ active: imageTab === 'local' }" @click="imageTab = 'local'">
              本地图片
            </div>
            <div class="image-tab" :class="{ active: imageTab === 'url' }" @click="imageTab = 'url'">
              在线URL
            </div>
          </div>

          <div class="dialog-body">
            <!-- ====== Tab1: 本地图片 ====== -->
            <div v-show="imageTab === 'local'" class="tab-content">
              <!-- 拖拽/选择区域 -->
              <div class="drop-zone" :class="{ 'drag-over': isDragOver, 'has-file': !!localFile }"
                @dragover.prevent="isDragOver = true" @dragleave.prevent="isDragOver = false" @drop.prevent="handleDrop"
                @click="triggerFileInput">
                <template v-if="localPreview">
                  <img :src="localPreview" class="drop-preview" />
                  <div class="drop-file-name">{{ localFile?.name }}</div>
                  <div class="drop-file-size">{{ formatSize(localFile?.size) }}</div>
                </template>
                <template v-else>
                  <svg class="drop-icon" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor"
                    stroke-width="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <div class="drop-text">拖拽图片到此处，或点击选择文件</div>
                  <div class="drop-hint">支持 JPG、PNG、GIF、WebP 格式</div>
                </template>
              </div>
              <input ref="fileInputRef" type="file" accept="image/*" style="display: none" @change="handleFileSelect" />

              <!-- 压缩选项 -->
              <div class="compress-section" v-if="localFile">
                <div class="compress-title">图片压缩</div>
                <div class="compress-options">
                  <label class="radio-item">
                    <input type="radio" v-model="compressMode" value="none" />
                    <span>不压缩</span>
                  </label>
                  <label class="radio-item">
                    <input type="radio" v-model="compressMode" value="auto" />
                    <span>压缩至 500KB 以下</span>
                  </label>
                  <label class="radio-item">
                    <input type="radio" v-model="compressMode" value="custom" />
                    <span>自定义</span>
                  </label>
                </div>
                <!-- 自定义滑块 -->
                <div v-if="compressMode === 'custom'" class="compress-slider-row">
                  <span class="slider-label">质量</span>
                  <input type="range" class="compress-slider" min="10" max="100" step="5"
                    v-model.number="compressQuality" />
                  <span class="slider-value">{{ compressQuality }}%</span>
                </div>
                <!-- 预估大小 -->
                <div class="compress-estimate">
                  原始大小：{{ formatSize(localFile?.size) }}
                  <template v-if="compressMode !== 'none'">
                    → 预估压缩后：<span class="estimate-value">{{ estimatedSize }}</span>
                  </template>
                </div>
              </div>

              <!-- 按钮 -->
              <div class="dialog-footer">
                <button class="btn btn--ghost" @click="closeImageDialog">取消</button>
                <button class="btn btn--primary" :disabled="!localPreview" @click="confirmLocalImage">
                  确认
                </button>
              </div>
            </div>

            <!-- ====== Tab2: 在线URL ====== -->
            <div v-show="imageTab === 'url'" class="tab-content">
              <div class="url-input-row">
                <input v-model="imageUrl" class="form-input url-input"
                  placeholder="输入图片地址，如 https://example.com/image.png" @keydown.enter="fetchUrlImage" />
                <button class="btn btn--primary btn--sm" @click="fetchUrlImage">
                  获取
                </button>
              </div>

              <!-- URL 预览 -->
              <div v-if="urlPreview" class="url-preview-area">
                <img :src="urlPreview" class="url-preview-img" />
              </div>
              <div v-else-if="urlLoading" class="url-preview-area url-loading">
                加载中...
              </div>
              <div v-else-if="urlError" class="url-preview-area url-error">
                {{ urlError }}
              </div>

              <!-- 按钮 -->
              <div class="dialog-footer">
                <button class="btn btn--ghost" @click="closeImageDialog">取消</button>
                <button class="btn btn--primary" :disabled="!urlPreview" @click="confirmUrlImage">
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 图片查看器 -->
    <ImageViewer v-model="showImageViewer" :images="viewerImages" :viewer-index="viewerIndex" />

    <!-- 导出弹窗 -->
    <Teleport to="body">
      <div v-if="showExportDialog" class="dialog-overlay" @click.self="showExportDialog = false">
        <div class="dialog">
          <div class="dialog-header">
            <span>导出</span>
            <button class="dialog-close" @click="showExportDialog = false">&times;</button>
          </div>
          <div class="dialog-body">
            <div class="downloadTypeSelectBox">
              <div class="downloadTypeList customScrollbar">
                <div v-for="item in exportOptions" :key="item.type" class="downloadTypeItem"
                  @click="confirmExport(item.type)">
                  <div class="typeIcon" :class="item.type"></div>
                  <div class="name">{{ item.name }}</div>
                  <div class="checked-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useMindMap } from '@/composables/useMindMap'
import MindMapToolbar from '@/components/mindmap/MindMapToolbar.vue'
import MindMapCore from '@/components/mindmap/MindMapCore.vue'
import NodeStylePanel from '@/components/mindmap/NodeStylePanel.vue'
import OutlinePanel from '@/components/mindmap/OutlinePanel.vue'
import ImageViewer from '@/components/ImageViewer.vue'

const {
  canUndo,
  canRedo,
  activeNodes,
  isReadonly,
  currentTheme,
  lightThemeList,
  darkThemeList,
  themePreviewMap,
  undo,
  redo,
  insertChildNode,
  insertSiblingNode,
  removeNode,
  setNodeStyle,
  setThemeConfig,
  getThemeConfig,
  themeConfigVersion,
  setTheme,
  insertImageToNode,
  openLocalFile,
  saveAsJSON,
  importFile,
  exportFile,
  hasUnsavedChanges,
  isAssociativeLineMode,
  newFile,
  toggleAssociativeLineMode,
  getOutlineTree,
  imageDblClickData, collectAllImages
} = useMindMap()

const themeConfig = computed(() => {
  themeConfigVersion.value
  return getThemeConfig()
})

// ===== 图片查看器状态 =====
const showImageViewer = ref(false)
const viewerImages = ref([])
const viewerIndex = ref(0)

// 监听双击事件
watch(imageDblClickData, (data) => {
  if (!data || !data.imgSrc) return

  const allImages = collectAllImages()
  if (!allImages.length) return

  viewerImages.value = allImages
  viewerIndex.value = allImages.findIndex(obj => obj.imgSrc === data.imgSrc)
  showImageViewer.value = true
})

// ===== 大纲 =====
const hasNode = computed(() => activeNodes.value.length > 0)
const showOutline = ref(false)

function handleToggleOutline() {
  showOutline.value = !showOutline.value
}

const outlineTree = computed(() => {
  if (!showOutline.value) return null
  return getOutlineTree()
})

// ===== 关联线 =====
const lineTextRef = ref(null)

// 关联线双击事件监听
onMounted(() => {
  // 监听思维导图实例的自定义事件
  // 延迟绑定，等待实例初始化
  const timer = setInterval(() => {
    const { mindMap } = useMindMap()
    if (mindMap && mindMap.value) {
      clearInterval(timer)
      try {
        mindMap.value.on('line_text_edit', (data) => {
          lineTextRef.value?.show(data)
        })
      } catch (e) { /* ignore */ }
    }
  }, 200)
  // 5秒后停止轮询
  setTimeout(() => clearInterval(timer), 5000)
})

// ===== 新建画布 =====
function handleNewFile() {
  if (hasUnsavedChanges.value) {
    const shouldSave = confirm('当前画布有未保存的修改，是否先保存？\n\n点"确定"保存后新建，点"取消"直接新建。')
    if (shouldSave) {
      saveAsJSON()
    }
  }
  newFile()
}

// ===== 插入图片 =====
function handleInsertImage() {
  if (!activeNodes.value.length) {
    alert('请先选中一个节点')
    return
  }
  openImageDialog()
}

function handleOpen() { openLocalFile() }
function handleSaveAs() { saveAsJSON() }
function handleImport() { importFile() }

// ===== 图片弹窗 =====
const showImageDialog = ref(false)
const imageTab = ref('local') // 'local' | 'url'

// 本地图片
const fileInputRef = ref(null)
const localFile = ref(null)
const localPreview = ref('')
const isDragOver = ref(false)
const compressMode = ref('none') // 'none' | 'auto' | 'custom'
const compressQuality = ref(80)
const compressedBlob = ref(null)

// 在线URL
const imageUrl = ref('')
const urlPreview = ref('')
const urlLoading = ref(false)
const urlError = ref('')

// 预估压缩后大小
const estimatedSize = computed(() => {
  if (!localFile.value) return '0 KB'
  if (compressMode.value === 'none') return formatSize(localFile.value.size)

  const quality = compressMode.value === 'auto' ? 0.7 : compressQuality.value / 100
  // 粗略估算：JPEG 压缩比约为原始的 quality 倍
  const estimated = Math.round(localFile.value.size * quality * 0.6)
  return formatSize(estimated)
})

// 格式化文件大小
function formatSize(bytes) {
  if (!bytes) return '0 KB'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 打开弹窗（由工具栏触发）
function openImageDialog() {
  if (!activeNodes.value.length) {
    alert('请先选中一个节点')
    return
  }
  resetImageDialog()
  showImageDialog.value = true
}

// 重置弹窗状态
function resetImageDialog() {
  imageTab.value = 'local'
  localFile.value = null
  localPreview.value = ''
  compressedBlob.value = null
  isDragOver.value = false
  compressMode.value = 'none'
  compressQuality.value = 80
  imageUrl.value = ''
  urlPreview.value = ''
  urlLoading.value = false
  urlError.value = ''
}

// 关闭弹窗
function closeImageDialog() {
  showImageDialog.value = false
  resetImageDialog()
}

// 触发文件选择
function triggerFileInput() {
  fileInputRef.value?.click()
}

// 文件选择
function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) loadLocalFile(file)
  // 重置 input 以便重复选择同一文件
  e.target.value = ''
}

// 拖拽放下
function handleDrop(e) {
  isDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    loadLocalFile(file)
  }
}

// 加载本地文件
function loadLocalFile(file) {
  localFile.value = file
  compressedBlob.value = null

  const reader = new FileReader()
  reader.onload = (ev) => {
    localPreview.value = ev.target.result
  }
  reader.readAsDataURL(file)
}

// 压缩图片
async function compressImage(file) {
  if (compressMode.value === 'none') {
    return file
  }

  const quality = compressMode.value === 'auto' ? 0.7 : compressQuality.value / 100

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          if (blob && compressMode.value === 'auto' && blob.size > 500 * 1024) {
            // 自动模式下如果仍然超过 500KB，进一步降低质量
            canvas.toBlob(
              (blob2) => resolve(blob2 || file),
              'image/jpeg',
              0.4
            )
          } else {
            resolve(blob || file)
          }
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => resolve(file)
    img.src = URL.createObjectURL(file)
  })
}

// 确认本地图片
async function confirmLocalImage() {
  if (!localPreview.value) return

  let finalUrl = localPreview.value

  // 需要压缩时
  if (compressMode.value !== 'none') {
    const blob = await compressImage(localFile.value)
    finalUrl = await blobToDataURL(blob)
  }

  insertImageToNode(finalUrl, localFile.value?.name || '图片')
  closeImageDialog()
}

// Blob 转 DataURL
function blobToDataURL(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (ev) => resolve(ev.target.result)
    reader.readAsDataURL(blob)
  })
}

// 获取在线图片（用 img 标签加载，绕过 CORS）
async function fetchUrlImage() {
  const url = imageUrl.value.trim()
  if (!url) return

  urlLoading.value = true
  urlError.value = ''
  urlPreview.value = ''

  try {
    const result = await loadImageViaElement(url)
    urlPreview.value = result
  } catch (err) {
    urlError.value = err.message || '获取图片失败，请检查链接'
  } finally {
    urlLoading.value = false
  }
}

// 通过 <img> 元素加载图片（不受 CORS 限制）
function loadImageViaElement(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // 不设 crossOrigin，避免触发 CORS 检查
    img.onload = () => {
      // 加载成功，直接返回原始 URL 用于预览
      resolve(url)
    }
    img.onerror = () => {
      reject(new Error('图片加载失败，请检查链接是否有效'))
    }
    img.src = url
  })
}

// 将图片 URL 转为 base64（通过 canvas，需要服务器支持 CORS）
// 如果服务器不支持 CORS，canvas 会被污染，toDataURL 会报错
function urlToDataURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const dataUrl = canvas.toDataURL('image/png')
        resolve(dataUrl)
      } catch (e) {
        // canvas 被污染（CORS 限制），回退到直接用 URL
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now()
  })
}

// 确认在线图片
async function confirmUrlImage() {
  if (!urlPreview.value) return

  try {
    // 先尝试 canvas 转 base64
    const dataUrl = await urlToDataURL(urlPreview.value)
    if (dataUrl) {
      insertImageToNode(dataUrl, imageUrl.value)
    } else {
      // canvas 被污染，用 fetch + blob 转 base64
      const response = await fetch(urlPreview.value)
      if (response.ok) {
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onload = (ev) => {
          insertImageToNode(ev.target.result, imageUrl.value)
        }
        reader.readAsDataURL(blob)
        closeImageDialog()
        return
      }
      // 全部失败，直接用 URL
      insertImageToNode(urlPreview.value, imageUrl.value)
    }
  } catch (err) {
    insertImageToNode(urlPreview.value, imageUrl.value)
  }

  closeImageDialog()
}


// ===== 导出 =====
const showExportDialog = ref(false)

const exportOptions = [
  { type: 'png', name: '图片' },
  { type: 'jpg', name: 'JPG' },
  { type: 'pdf', name: 'PDF' },
  { type: 'md', name: 'Markdown' },
  { type: 'txt', name: 'TXT' },
  { type: 'json', name: 'JSON' },
]

function confirmExport(type) {
  showExportDialog.value = false
  exportFile(type)
}
</script>

<style scoped>
.mind-map-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #f0f2f5;
}

.main-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}


/* ========== 图片弹窗 ========== */
.image-dialog {
  width: 480px;
}

/* Tab 栏 */
.image-tabs {
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0 20px;
}

.image-tab {
  padding: 10px 0;
  margin-right: 24px;
  font-size: 13px;
  color: #999;
  cursor: pointer;
  position: relative;
  transition: color 0.15s ease;
  font-weight: 500;
}

.image-tab:hover {
  color: #666;
}

.image-tab.active {
  color: #333;
  font-weight: 600;
}

.image-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #4a90d9;
  border-radius: 1px;
}

/* Tab 内容 */
.tab-content {
  padding: 0;
}

/* 拖拽区域 */
.drop-zone {
  margin: 16px 20px;
  border: 2px dashed rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(0, 0, 0, 0.01);
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.drop-zone:hover {
  border-color: rgba(74, 144, 217, 0.3);
  background: rgba(74, 144, 217, 0.02);
}

.drop-zone.drag-over {
  border-color: #4a90d9;
  background: rgba(74, 144, 217, 0.05);
}

.drop-zone.has-file {
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.06);
  padding: 16px;
}

.drop-icon {
  color: #ccc;
}

.drop-text {
  font-size: 13px;
  color: #888;
  font-weight: 500;
}

.drop-hint {
  font-size: 11px;
  color: #bbb;
}

.drop-preview {
  max-width: 100%;
  max-height: 180px;
  border-radius: 8px;
  object-fit: contain;
}

.drop-file-name {
  font-size: 12px;
  color: #555;
  margin-top: 6px;
  font-weight: 500;
}

.drop-file-size {
  font-size: 11px;
  color: #aaa;
}

/* 压缩选项 */
.compress-section {
  margin: 0 20px 0;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 10px;
}

.compress-title {
  font-size: 12px;
  color: #888;
  font-weight: 600;
  margin-bottom: 10px;
}

.compress-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
}

.radio-item input[type="radio"] {
  accent-color: #4a90d9;
  width: 15px;
  height: 15px;
}

/* 滑块行 */
.compress-slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.slider-label {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

.compress-slider {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.08);
  outline: none;
}

.compress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #4a90d9;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.slider-value {
  font-size: 12px;
  color: #555;
  font-weight: 600;
  min-width: 36px;
  text-align: right;
}

/* 预估大小 */
.compress-estimate {
  font-size: 11px;
  color: #aaa;
}

.estimate-value {
  color: #4a90d9;
  font-weight: 600;
}

/* URL 输入行 */
.url-input-row {
  display: flex;
  gap: 8px;
  padding: 16px 20px 0;
}

.url-input {
  flex: 1;
}

.btn--sm {
  padding: 8px 16px;
  font-size: 13px;
  white-space: nowrap;
}

/* URL 预览 */
.url-preview-area {
  margin: 12px 20px 0;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.url-preview-img {
  max-width: 100%;
  max-height: 220px;
  object-fit: contain;
  border-radius: 8px;
}

.url-loading {
  color: #aaa;
  font-size: 13px;
}

.url-error {
  color: #e74c3c;
  font-size: 13px;
  padding: 20px;
  text-align: center;
}


.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(6px);
}

.dialog {
  width: 400px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 12px 40px rgba(0, 0, 0, 0.1);
  animation: dialogIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

@keyframes dialogIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  color: #333;
  font-size: 15px;
  font-weight: 600;
}

.dialog-close {
  background: none;
  border: none;
  color: #bbb;
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.15s ease;
}

.dialog-close:hover {
  color: #666;
}

.dialog-body {
  padding: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 500;
}


.downloadTypeSelectBox {
  width: 100%;
}

.downloadTypeList {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customScrollbar {
  max-height: 320px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
}

.customScrollbar::-webkit-scrollbar {
  width: 4px;
}

.customScrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
}

.downloadTypeItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.downloadTypeItem:hover {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.04);
}

.downloadTypeItem:active {
  transform: scale(0.98);
}

.typeIcon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}

.typeIcon.png {
  background: linear-gradient(135deg, #5dade2, #2e86c1);
}

.typeIcon.md {
  background: linear-gradient(135deg, #58d68d, #28b463);
}

.typeIcon.txt {
  background: linear-gradient(135deg, #aab7b8, #839192);
}

.typeIcon.json {
  background: linear-gradient(135deg, #f4d03f, #d4ac0d);
}

.typeIcon.png::after {
  content: 'PNG';
}

.typeIcon.jpg::after {
  content: 'JPG';
}

.typeIcon.pdf::after {
  content: 'PDF';
}

.typeIcon.md::after {
  content: 'MD';
}

.typeIcon.txt::after {
  content: 'TXT';
}

.typeIcon.json::after {
  content: 'JSON';
}

.downloadTypeItem .name {
  flex: 1;
  font-size: 13px;
  color: #555;
  font-weight: 500;
}

.downloadTypeItem:hover .name {
  color: #333;
}

.checked-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a90d9;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.15s ease;
}

.downloadTypeItem:hover .checked-icon {
  opacity: 1;
  transform: scale(1);
}
</style>
