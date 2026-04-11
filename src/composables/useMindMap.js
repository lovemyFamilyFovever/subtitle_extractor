import { ref, shallowRef, onBeforeUnmount, markRaw } from 'vue'
import MindMap from 'simple-mind-map'
import Themes from 'simple-mind-map-plugin-themes'
import themeList from 'simple-mind-map-plugin-themes/themeList'
import themeImgMap from 'simple-mind-map-plugin-themes/themeImgMap'
import Export from 'simple-mind-map/src/plugins/Export.js'
// 修复：正确的关联线插件路径
import AssociativeLine from 'simple-mind-map/src/plugins/AssociativeLine.js'

try { Themes.init(MindMap) } catch (e) { /* ignore */ }
MindMap.usePlugin(Export)
MindMap.usePlugin(AssociativeLine)

// ========== 模块级单例 ==========
let mindMapInstance = null
let isInitialized = false
let refCount = 0

const isReady = ref(false)
const activeNodes = ref([])
const canUndo = ref(false)
const canRedo = ref(false)
const currentTheme = ref('classic7')
const currentLayout = ref('logicalStructure')
const scale = ref(1)
const isReadonly = ref(false)
const isAssociativeLineMode = ref(false)

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
        { data: { text: '子主题 1-2' }, children: [] },
      ],
    },
    {
      data: { text: '分支主题 2' },
      children: [{ data: { text: '子主题 2-1' }, children: [] }],
    },
    { data: { text: '分支主题 3' }, children: [] },
  ],
}

// ========== 数据变更标记（用于新建时判断是否需要保存） ==========
const hasUnsavedChanges = ref(false)

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

  } catch (e) {
    console.error('[MindMap] 绑定事件失败', e)
  }
}

function getActiveNodeList() {
  if (!mindMapInstance) return []
  try {
    if (activeNodes.value.length > 0) return activeNodes.value
    return mindMapInstance.renderer?.activeNodeList || []
  } catch (e) { return [] }
}

function destroyInstance() {
  if (mindMapInstance) {
    try { mindMapInstance.destroy() } catch (e) { /* ignore */ }
    mindMapInstance = null
  }
  isInitialized = false
  isReady.value = false
  activeNodes.value = []
  canUndo.value = false
  canRedo.value = false
  isAssociativeLineMode.value = false
  hasUnsavedChanges.value = false
}

// ========== 导出 ==========
export function useMindMap() {
  refCount++

  onBeforeUnmount(() => {
    refCount--
    if (refCount <= 0) {
      refCount = 0
      destroyInstance()
    }
  })

  function init(el, data) {
    if (!el) return
    if (isInitialized && mindMapInstance) return
    if (mindMapInstance) {
      try { mindMapInstance.destroy() } catch (e) { /* ignore */ }
      mindMapInstance = null
    }

    const initData = data || defaultData

    mindMapInstance = new MindMap({
      el,
      data: JSON.parse(JSON.stringify(initData)),
      theme: currentTheme.value,
      layout: currentLayout.value,
      themeConfig: {
        lineStyle: 'curve',
        background: '#f0f2f5',
      },
      openRealtimeRenderOnNodeTextEdit: true,
      defaultInsertSecondLevelNodeText: '分支主题',
      defaultInsertBelowSecondLevelNodeText: '子主题',
      isShowWatermark: false,
      mousewheelAction: 'zoom',
    })

    markRaw(mindMapInstance)
    bindEvents()
    isInitialized = true
    isReady.value = true
    hasUnsavedChanges.value = false
    console.log('[MindMap] 初始化成功')
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

  // ========== 超链接 ==========
  function insertHyperlink(url, name = '') {
    if (!mindMapInstance) return
    const nodeList = getActiveNodeList()
    if (!nodeList.length) return
    nodeList.forEach((node) => {
      const nodeData = node.nodeData?.data || {}
      nodeData.link = url
      nodeData.linkTitle = name || url
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
  function openLocalFile() {
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
            alert('文件格式不正确')
            resolve(null)
          }
        }
        reader.readAsText(file)
      }
      input.click()
    })
  }

  function saveAsJSON() {
    const data = getData()
    if (!data) return
    const pureData = {
      data: data.data,
      children: data.children || [],
    }
    const json = JSON.stringify(pureData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '思维导图.json'
    a.click()
    URL.revokeObjectURL(url)
    hasUnsavedChanges.value = false
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
        const data = mindMapInstance.getData()
        const pureData = {
          data: data.data,
          children: data.children || [],
        }
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
        const data = mindMapInstance.getData()
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

  // ========== 关联线模式 ==========
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

  function exitAssociativeLineMode() {
    isAssociativeLineMode.value = false
    try {
      mindMapInstance?.associativeLine?.cancelCreateLine?.()
    } catch (e) { /* ignore */ }
  }

  function deleteActiveLine() {
    if (!mindMapInstance) return
    try {
      mindMapInstance.associativeLine?.removeLine?.()
    } catch (e) { /* ignore */ }
  }

  // ========== 主题 ==========
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
    init,
    newFile,
    undo,
    redo,
    insertChildNode,
    insertSiblingNode,
    insertParentNode,
    removeNode,
    insertGeneralization,
    setNodeStyle,
    insertImageToNode,
    removeNodeImage,
    insertHyperlink,
    removeHyperlink,
    toggleAssociativeLineMode,
    exitAssociativeLineMode,
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
    saveAsJSON,
    importFile,
    getActiveNodeList,
    getOutlineTree,
  }
}
