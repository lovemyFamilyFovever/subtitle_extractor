import { ref, shallowRef, onBeforeUnmount, markRaw } from 'vue'
import MindMap from 'simple-mind-map'
import Themes from 'simple-mind-map-plugin-themes'
import themeList from 'simple-mind-map-plugin-themes/themeList'
import themeImgMap from 'simple-mind-map-plugin-themes/themeImgMap'
import Export from 'simple-mind-map/src/plugins/Export.js'
import AssociativeLine from 'simple-mind-map/src/plugins/AssociativeLine.js'
import RichText from 'simple-mind-map/src/plugins/RichText.js'
import NodeImgAdjust from './NodeImgAdjust.js'

try { Themes.init(MindMap) } catch (e) { /* ignore */ }
MindMap.usePlugin(Export)
MindMap.usePlugin(AssociativeLine)


MindMap.usePlugin(NodeImgAdjust)  // 【新增】注册图片拖拽插件
MindMap.usePlugin(RichText) //注册 RichText 插件

// ========== 模块级单例 ==========
let mindMapInstance = null

let exposedMindMap = null  // ← 新增：暴露给外部访问

const isReady = ref(false)
const activeNodes = ref([])
const canUndo = ref(false)
const canRedo = ref(false)
const currentTheme = ref('classic7')
const currentLayout = ref('logicalStructure')
const scale = ref(1)
const isReadonly = ref(false)
const isAssociativeLineMode = ref(false)
const hasUnsavedChanges = ref(false)
const imageDblClickData = ref(null)

// ========== 主题列表 ==========
const fullThemeList = [
  { name: '默认主题', value: 'default', dark: false },
  ...(themeList || []).map((t) => ({ name: t.name, value: t.value, dark: !!t.dark })),
]
const lightThemeList = fullThemeList.filter((t) => !t.dark)
const darkThemeList = fullThemeList.filter((t) => t.dark)
const themePreviewMap = themeImgMap || {}

// ========== 默认数据 ==========
const defaultData = {
  data: { text: '中心主题' },
  children: [
    {
      data: { text: '分支主题 1' },
      children: [
        { data: { text: '子主题 1-1' }, children: [] },
      ],
    },
    {
      data: { text: '分支主题 2' },
      children: [{ data: { text: '子主题 2-1' }, children: [] }],
    },
  ],
}

// ========== 工具函数 ==========
function formatTime(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function updateHistoryStatus() {
  if (!mindMapInstance) return
  try {
    const history = mindMapInstance.command?.history
    if (history) {
      canUndo.value = history.activeIndex > 0
      canRedo.value = history.activeIndex < history.length - 1
    }
  } catch (e) { /* ignore */ }
}

function bindEvents() {
  if (!mindMapInstance) return
  try {
    mindMapInstance.on('node_active', (node, nodeList) => {
      activeNodes.value = nodeList || []
    })

    mindMapInstance.on('data_change', () => {
      updateHistoryStatus()
      hasUnsavedChanges.value = true
    })

    mindMapInstance.on('back_forward', (index, len) => {
      canUndo.value = index > 0
      canRedo.value = index < len - 1
    })

    mindMapInstance.on('scale', (val) => {
      scale.value = val
    })

    mindMapInstance.on('node_img_dblclick', (node, e, imgNode) => {
      const imgSrc = node.getData?.('image') || ''
      if (imgSrc) {
        imageDblClickData.value = { node, imgSrc, imgNode }
      }
    })
  } catch (e) { /* ignore */ }
}

// ========== 收集所有节点的图片 ==========
function collectAllImages() {
  if (!mindMapInstance) return []
  try {
    const data = mindMapInstance.getData()
    const images = []
    traverseCollectImages(data, images)
    return images
  } catch (e) {
    return []
  }
}

function traverseCollectImages(node, images) {
  if (!node) return
  const imgSrc = node.data?.image
  const imgTitle = node.data?.imageTitle
  const imgText = node.data?.text
  const imgSize = node.data?.imageSize

  if (imgSrc) {
    const fileSize = calcBase64Size(imgSrc)
    images.push({
      imgSrc, imgTitle, imgText, imgSize,
      fileSize,
      fileSizeText: formatFileSize(fileSize),
    })
  }
  if (node.children && node.children.length) {
    node.children.forEach((child) => {
      traverseCollectImages(child, images)
    })
  }
}


/**
 * base64 dataURL → 原始文件大小（字节）
 * base64 编码后体积膨胀约 33%
 * 公式：去掉前缀后，每4个字符代表3个字节
 */
function calcBase64Size(dataUrl) {
  // 去掉 "data:image/png;base64," 前缀
  const base64 = dataUrl.split(',')[1]
  if (!base64) return 0

  // 原始字节数
  let bytes = base64.length * 3 / 4

  // 减去末尾的 padding 字符（=）
  if (base64.endsWith('==')) bytes -= 2
  else if (base64.endsWith('=')) bytes -= 1
  return Math.round(bytes)
}

function getActiveNodeList() {
  if (!mindMapInstance) return []
  try {
    if (activeNodes.value.length > 0) return activeNodes.value
    return mindMapInstance.renderer?.activeNodeList || []
  } catch (e) { return [] }
}

function resetState() {
  isReady.value = false
  activeNodes.value = []
  canUndo.value = false
  canRedo.value = false
  isAssociativeLineMode.value = false
  hasUnsavedChanges.value = false
}

// ========== 导出 ==========
export function useMindMap() {

  function init(el, data) {
    if (!el) return
    // 先销毁旧实例
    if (mindMapInstance) {
      try { mindMapInstance.destroy() } catch (e) { /* ignore */ }
      mindMapInstance = null
      resetState()
    }

    const initData = data || defaultData

    mindMapInstance = new MindMap({
      el,
      data: JSON.parse(JSON.stringify(initData)),
      theme: currentTheme.value,
      layout: currentLayout.value,
      themeConfig: {
        lineStyle: 'curve',

        borderWidth: 1,
        background: '#f0f2f5',
        // 二级节点样式
        second: {
          marginX: 130,
          marginY: 20
        },
        // 三级及以下节点样式
        node: {
          marginX: 100,
          marginY: 80
        }
      },
      openRealtimeRenderOnNodeTextEdit: true,
      defaultInsertSecondLevelNodeText: '分支主题',
      defaultInsertBelowSecondLevelNodeText: '子主题',
      isShowWatermark: false,
      // ==================== 【新增】节点宽度拖拽调整（官方内置功能） ====================
      enableDragModifyNodeWidth: true,          // 开启拖拽调整节点宽度
      minNodeTextModifyWidth: 100,               // 最小宽度（推荐 50~80，根据你的主题调整）
      maxNodeTextModifyWidth: -1,               // 最大宽度（-1 = 不限制）

      // ==================== 【新增】NodeImgAdjust 图片拖拽插件配置 ====================
      imgResizeBtnSize: 24,                    // 拖拽按钮大小（推荐 18~24）
      minImgResizeWidth: 40,                   // 最小宽度
      minImgResizeHeight: 40,                  // 最小高度
      maxImgResizeWidthInheritTheme: false,     // 推荐开启：最大尺寸跟随主题配置
      maxImgResizeWidth: 2000,              // 如果上面设为 false 才需要手动写
      maxImgResizeHeight: 2000,
      beforeDeleteNodeImg: async (node) => {
        // 删除前确认（可删掉这整个函数就直接删除）
        return confirm(`确定删除节点「${node.getData('text') || '未知'}」的图片吗？`)
      },
      // customResizeBtnInnerHTML: '<svg>...</svg>',   // 可自定义拖拽图标 SVG
      // customDeleteBtnInnerHTML: '<svg>...</svg>',   // 可自定义删除按钮 SVG

      mousewheelAction: 'zoom',
      showNumber: false,
    })

    markRaw(mindMapInstance)
    exposedMindMap = mindMapInstance  // ← 新增：暴露
    window.__mindMap = mindMapInstance // ← 新增：全局暴露方便调试
    bindEvents()
    isReady.value = true
    hasUnsavedChanges.value = false
    console.log('[MindMap] 初始化成功')
  }

  // ========== 销毁（由 MindMapCore 的 onBeforeUnmount 调用） ==========
  function destroy() {
    if (mindMapInstance) {
      try { mindMapInstance.destroy() } catch (e) { /* ignore */ }
      mindMapInstance = null
    }
    exposedMindMap = null     // ← 新增
    window.__mindMap = null   // ← 新增
    resetState()
    console.log('[MindMap] 已销毁')
  }

  // ========== 新建画布 ==========
  function newFile() {
    if (!mindMapInstance) return
    mindMapInstance.setData(JSON.parse(JSON.stringify(defaultData)))
    mindMapInstance.view.reset()
    mindMapInstance.command.clearHistory?.()
    hasUnsavedChanges.value = false
    canUndo.value = false
    canRedo.value = false
  }

  // ========== 节点操作 ==========
  function undo() {
    if (!mindMapInstance) return
    try { mindMapInstance.execCommand('BACK') } catch (e) { /* ignore */ }
  }

  function redo() {
    if (!mindMapInstance) return
    try { mindMapInstance.execCommand('FORWARD') } catch (e) { /* ignore */ }
  }

  function insertChildNode() {
    if (!mindMapInstance) return
    try { mindMapInstance.execCommand('INSERT_CHILD_NODE') } catch (e) { /* ignore */ }
  }

  function insertSiblingNode() {
    if (!mindMapInstance) return
    try { mindMapInstance.execCommand('INSERT_NODE') } catch (e) { /* ignore */ }
  }

  function removeNode() {
    if (!mindMapInstance) return
    try { mindMapInstance.execCommand('REMOVE_NODE') } catch (e) { /* ignore */ }
  }

  function insertParentNode() {
    if (!mindMapInstance) return
    try { mindMapInstance.execCommand('INSERT_PARENT_NODE') } catch (e) { /* ignore */ }
  }

  function insertGeneralization() {
    if (!mindMapInstance) return
    try { mindMapInstance.execCommand('ADD_GENERALIZATION') } catch (e) { /* ignore */ }
  }

  function setNodeStyle(key, value) {
    if (!mindMapInstance) return
    try {
      const nodeList = getActiveNodeList()
      if (!nodeList.length) return
      nodeList.forEach((node) => {
        if (typeof node.setStyle === 'function') {
          node.setStyle(key, value, true)
        } else {
          const nodeData = node.nodeData?.data || {}
          nodeData[key] = value
        }
      })
      mindMapInstance.render()
    } catch (e) { /* ignore */ }
  }


  //  修改多个样式
  function setStyles(style) {

    if (!mindMapInstance) return
    try {
      const nodeList = getActiveNodeList()
      if (!nodeList.length) return
      nodeList.forEach((node) => {
        if (typeof node.setStyle === 'function') {

          mindMapInstance.execCommand('SET_NODE_STYLES', node, style)

          node.setStyle(key, value, true)
        } else {
          const nodeData = node.nodeData?.data || {}
          nodeData[key] = value
        }
      })
      mindMapInstance.render()
    } catch (e) { /* ignore */ }
  }


  // 修改 setThemeConfig 函数：深拷贝后再修改 
  function setThemeConfig(key, value) {
    if (!mindMapInstance) return
    try {
      const config = JSON.parse(JSON.stringify(mindMapInstance.getThemeConfig() || {}))
      config[key] = value
      mindMapInstance.setThemeConfig(config)
      mindMapInstance.render()
    } catch (e) { /* ignore */ }
  }

  function getThemeConfig() {
    if (!mindMapInstance) return {}
    try {
      return mindMapInstance.getThemeConfig() || {}
    } catch (e) {
      console.warn('Failed to get theme config:', e)
      return {}
    }
  }


  // ========== 插入图片 ==========
  function insertImageToNode(url, title = '') {
    if (!mindMapInstance) return
    const nodeList = getActiveNodeList()
    if (!nodeList.length) return
    const img = new Image()
    img.onload = () => {
      const maxWidth = 200
      let width = img.naturalWidth
      let height = img.naturalHeight
      if (width > maxWidth) {
        const ratio = maxWidth / width
        width = maxWidth
        height = Math.round(height * ratio)
      }
      nodeList.forEach((node) => {
        if (typeof node.setImage === 'function') {
          node.setImage({ url, title: title || '图片', width, height })
        }
      })
      mindMapInstance.render()
    }
    img.onerror = () => {
      nodeList.forEach((node) => {
        if (typeof node.setImage === 'function') {
          node.setImage({ url, title: title || '图片', width: 200, height: 150 })
        }
      })
      mindMapInstance.render()
    }
    img.src = url
  }

  function removeNodeImage() {
    if (!mindMapInstance) return
    const nodeList = getActiveNodeList()
    if (!nodeList.length) return
    nodeList.forEach((node) => {
      if (typeof node.setImage === 'function') {
        node.setImage({ url: '', title: '', width: 0, height: 0 })
      }
    })
    mindMapInstance.render()
  }

  function removeHyperlink() {
    if (!mindMapInstance) return
    const nodeList = getActiveNodeList()
    if (!nodeList.length) return
    nodeList.forEach((node) => {
      const nodeData = node.nodeData?.data || {}
      delete nodeData.link
      delete nodeData.linkTitle
    })
    mindMapInstance.render()
  }

  // ========== 文件操作 ==========

  /**
   * 打开本地文件
   * 返回格式化后的数组: [{ id, name, time, size, _raw }]
   * 如果浏览器不支持 File System API，回退到传统模式
   */
  async function openLocalFile() {
    // 检查浏览器是否支持 File System Access API
    if (!('showOpenFilePicker' in window)) {
      console.warn('当前浏览器不支持 File System Access API，使用传统模式')
      return openLocalFileLegacy()
    }

    try {
      // 打开文件选择器，获取读写权限
      const fileHandles = await window.showOpenFilePicker({
        types: [
          {
            description: '思维导图文件',
            accept: {
              'application/json': ['.json'],  // 支持多种扩展名
            }
          }
        ],
        excludeAcceptAllOption: false,
        multiple: true  // 开启多选
      })

      if (!fileHandles || fileHandles.length === 0) {
        return null
      }

      // 逐个读取文件内容
      const results = []
      for (let i = 0; i < fileHandles.length; i++) {
        const fileHandle = fileHandles[i]
        try {
          const file = await fileHandle.getFile()
          const content = await file.text()

          try {
            const data = JSON.parse(content)

            results.push({
              id: i,
              name: fileHandle.name,
              time: formatTime(file.lastModified),
              size: formatFileSize(file.size),
              _raw: {
                data,
                fileName: fileHandle.name,
                fileHandle,
                index: i,
                lastModified: file.lastModified,
                size: file.size,
              }
            })

            console.log(`已打开文件: ${fileHandle.name}`)

          } catch (err) {
            console.error(`文件 ${fileHandle.name} 解析失败:`, err)
          }
        } catch (err) {
          console.error(`读取文件 ${fileHandle.name} 失败:`, err)
        }
      }

      if (results.length > 0) {
        console.log(`[MindMap] 共加载 ${results.length} 个文件`)
        return results
      } else {
        return null
      }

    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('打开文件失败:', err)
      }
      return null
    }
  }

  /**
   * 传统模式（不支持 File System API 的浏览器）
   */
  function openLocalFileLegacy() {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json,.smm'
      input.multiple = true
      input.onchange = async (e) => {
        const files = Array.from(e.target.files)
        if (!files.length) { resolve(null); return }

        const results = []
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          try {
            const content = await file.text()
            const data = JSON.parse(content)

            results.push({
              id: i,
              name: file.name,
              time: formatTime(file.lastModified),
              size: formatFileSize(file.size),
              _raw: {
                data,
                fileName: file.name,
                fileHandle: null,
                index: i,
                lastModified: file.lastModified,
                size: file.size,
              }
            })

            console.log(`已打开文件: ${file.name}`)

          } catch (err) {
            console.error(`文件 ${file.name} 解析失败:`, err)
          }
        }

        resolve(results.length > 0 ? results : null)
      }
      input.click()
    })
  }

  function importFile() {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json,.smm'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (!file) { resolve(null); return }
        const reader = new FileReader()
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result)
            setData(data)
            resolve(data)
          } catch (err) {
            alert('文件解析失败')
            resolve(null)
          }
        }
        reader.readAsText(file)
      }
      input.click()
    })
  }

  // ========== 导出 ==========
  function exportFile(type = 'png') {
    if (!mindMapInstance) return
    try {
      if (type === 'json') {
        const data = getData()
        const pureData = { data: data.data, children: data.children || [] }
        const json = JSON.stringify(pureData, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = '思维导图.json'
        a.click()
        URL.revokeObjectURL(url)
        return
      }

      if (type === 'txt') {
        const data = getData()
        const text = nodeToText(data, 0)
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = '思维导图.txt'
        a.click()
        URL.revokeObjectURL(url)
        return
      }

      if (mindMapInstance.doExport && typeof mindMapInstance.doExport[type] === 'function') {
        mindMapInstance.doExport[type]().then((data) => {
          const a = document.createElement('a')
          a.href = data
          a.download = '思维导图.' + type
          a.click()
        }).catch((err) => {
          console.error('[MindMap] 导出失败', err)
        })
      }
    } catch (e) {
      console.error('[MindMap] 导出异常', e)
    }
  }

  // ========== 保存到本地文件 ==========
  async function saveToLocalFile(fileHandle) {
    if (!mindMapInstance || !fileHandle) return false
    try {
      const data = mindMapInstance.getData()
      if (!data) return false

      const pureData = {
        data: data.data,
        children: data.children || [],
      }
      const json = JSON.stringify(pureData, null, 2)

      const writable = await fileHandle.createWritable()
      await writable.write(json)
      await writable.close()

      hasUnsavedChanges.value = false
      console.log(`[MindMap] 已保存到: ${fileHandle.name}`)
      return true
    } catch (err) {
      console.error('[MindMap] 保存失败:', err)
      return false
    }
  }


  function nodeToText(node, level) {
    if (!node) return ''
    const indent = '  '.repeat(level)
    const text = (node.data?.text || '').replace(/<[^>]*>/g, '')
    let result = indent + '- ' + text + '\n'
    if (node.children && node.children.length) {
      node.children.forEach((child) => {
        result += nodeToText(child, level + 1)
      })
    }
    return result
  }

  // ========== 关联线 ==========
  function toggleAssociativeLineMode() {
    if (!mindMapInstance) return
    isAssociativeLineMode.value = !isAssociativeLineMode.value
    try {
      if (isAssociativeLineMode.value) {
        mindMapInstance.associativeLine?.createLineFromActiveNode?.()
      } else {
        mindMapInstance.associativeLine?.cancelCreateLine?.()
      }
    } catch (e) { /* ignore */ }
  }

  function deleteActiveLine() {
    if (!mindMapInstance) return
    try { mindMapInstance.associativeLine?.removeLine?.() } catch (e) { /* ignore */ }
  }

  // ========== 主题/布局 ==========
  function setTheme(themeValue) {
    currentTheme.value = themeValue
    if (mindMapInstance) {
      try { mindMapInstance.setTheme(themeValue) } catch (e) { /* ignore */ }
    }
  }

  function setLayout(layout) {
    currentLayout.value = layout
    if (mindMapInstance) {
      try { mindMapInstance.setLayout(layout) } catch (e) { /* ignore */ }
    }
  }

  function zoomIn() {
    if (!mindMapInstance) return
    try {
      mindMapInstance.view.enlarge()
      scale.value = mindMapInstance.view.scale
    } catch (e) { /* ignore */ }
  }

  function zoomOut() {
    if (!mindMapInstance) return
    try {
      mindMapInstance.view.narrow()
      scale.value = mindMapInstance.view.scale
    } catch (e) { /* ignore */ }
  }

  function fit() {
    if (!mindMapInstance) return
    try {
      mindMapInstance.view.fit()
      scale.value = mindMapInstance.view.scale
    } catch (e) { /* ignore */ }
  }

  function resetPosition() {
    if (!mindMapInstance) return
    try { mindMapInstance.view.reset() } catch (e) { /* ignore */ }
  }

  function setScale(val) {
    if (!mindMapInstance) return
    try {
      mindMapInstance.view.setScale(val)
      scale.value = val
    } catch (e) { /* ignore */ }
  }

  function getData() {
    if (!mindMapInstance) return null
    try { return mindMapInstance.getData() } catch (e) { return null }
  }

  function setData(data) {
    if (!mindMapInstance) return
    try { mindMapInstance.setData(data) } catch (e) { /* ignore */ }
    hasUnsavedChanges.value = false
  }

  function selectAll() {
    if (!mindMapInstance) return
    try { mindMapInstance.execCommand('SELECT_ALL') } catch (e) { /* ignore */ }
  }

  function expandAll() {
    if (!mindMapInstance) return
    try { mindMapInstance.execCommand('EXPAND_ALL') } catch (e) { /* ignore */ }
  }

  function collapseAll() {
    if (!mindMapInstance) return
    try { mindMapInstance.execCommand('COLLAPSE_ALL') } catch (e) { /* ignore */ }
  }

  function toggleReadonly() {
    isReadonly.value = !isReadonly.value
    if (mindMapInstance) {
      try { mindMapInstance.setMode(isReadonly.value ? 'readonly' : 'edit') } catch (e) { /* ignore */ }
    }
  }

  function render() {
    if (mindMapInstance) {
      try { mindMapInstance.render() } catch (e) { /* ignore */ }
    }
  }


  // ========== 大纲数据 ==========
  function getOutlineTree() {
    if (!mindMapInstance) return null
    try {
      const data = mindMapInstance.getData()
      return data || null
    } catch (e) {
      return null
    }
  }


  // ========== 应用图片尺寸到所有节点 ==========
  function applyImageSizeToAll(width, height) {
    if (!mindMapInstance) return
    try {
      const root = mindMapInstance.renderer?.root
      if (!root) return
      traverseAndApplyImage(root, width, height)
      mindMapInstance.render()
    } catch (e) { /* ignore */ }
  }

  function traverseAndApplyImage(node, width, height) {
    if (!node) return
    try {
      const imgData = node.getData?.('image')
      if (imgData && typeof node.setImage === 'function') {
        const title = node.getData?.('imageTitle') || ''
        node.setImage({ url: imgData, title, width, height })
      }
    } catch (e) { /* ignore */ }
    if (node.children && node.children.length) {
      node.children.forEach((child) => {
        traverseAndApplyImage(child, width, height)
      })
    }
  }

  return {
    isReady,
    activeNodes,
    canUndo,
    canRedo,
    currentTheme,
    currentLayout,
    scale,
    isReadonly,
    isAssociativeLineMode,
    hasUnsavedChanges,
    fullThemeList,
    lightThemeList,
    darkThemeList,
    themePreviewMap,
    mindMap: exposedMindMap,  // ← 新增：暴露实例引用
    init,
    destroy,
    newFile,
    undo,
    redo,
    insertChildNode,
    insertSiblingNode,
    insertParentNode,
    removeNode,
    insertGeneralization,
    setNodeStyle,
    setStyles,
    setThemeConfig,
    getThemeConfig,
    insertImageToNode,
    removeNodeImage,
    removeHyperlink,
    toggleAssociativeLineMode,
    deleteActiveLine,
    setTheme,
    setLayout,
    zoomIn,
    zoomOut,
    fit,
    resetPosition,
    setScale,
    getData,
    setData,
    exportFile,
    selectAll,
    expandAll,
    collapseAll,
    toggleReadonly,
    render,
    openLocalFile,
    importFile,
    getActiveNodeList,
    getOutlineTree,
    imageDblClickData,
    collectAllImages,
    saveToLocalFile
  }
}
