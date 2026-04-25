import { ref, shallowRef, onBeforeUnmount, markRaw } from 'vue'
import MindMap from 'simple-mind-map'
import Themes from 'simple-mind-map-plugin-themes'
import themeList from 'simple-mind-map-plugin-themes/themeList'
import themeImgMap from 'simple-mind-map-plugin-themes/themeImgMap'
import Export from 'simple-mind-map/src/plugins/Export.js'
import AssociativeLine from 'simple-mind-map/src/plugins/AssociativeLine.js'
import RichText from 'simple-mind-map/src/plugins/RichText.js'
import NodeImgAdjust from '../plugins/NodeImgAdjust.js'
import { createMindMapPersistence, loadFromLocalStorage, clearLocalStorage } from './useMindMapPersistence.js'
import { getNextNodeColor, applyColorsToTree, setNodeStyles, setNodeStylesBatch, setThemeConfig as setThemeConfigHelper, getThemeConfig as getThemeConfigHelper, applyCustomBackground, getCurrentColors } from './useMindMapTheme.js'
import { collectAllImages as collectImagesFromMindMap, insertImageToNode as insertImageToNodeHelper } from './useMindMapMedia.js'

try { Themes.init(MindMap) } catch (e) { /* ignore */ }
MindMap.usePlugin(Export)
MindMap.usePlugin(AssociativeLine)
MindMap.usePlugin(NodeImgAdjust)
MindMap.usePlugin(RichText)

// ========== 模块级单例 ==========
let mindMapInstance = null
let saveToLocalStorage = () => {}
let onNodeActiveListener = null
let onDataChangeListener = null
let onBackForwardListener = null
let onScaleListener = null
let onNodeImgDblclickListener = null

const isReady = ref(false)
const activeNodes = ref([])
const canUndo = ref(false)
const canRedo = ref(false)
const currentTheme = ref('default')
const currentNodeColorListName = ref('classic')
const colorListIndex = ref(0)
const currentLayout = ref('logicalStructure')
const scale = ref(1)
const isReadonly = ref(false)
const isAssociativeLineMode = ref(false)
const hasUnsavedChanges = ref(false)
const imageDblClickData = ref(null)

// ★ 新增：localStorage 缓存
// ★★★ 新增：自定义背景状态 ★★★
const customBackground = ref(null) // { type: 'none'|'pure'|'gradient'|'grid'|'image', value: any }

// ★ 新增：维护节点计数状态
const nodeCount = ref(0)

// ========== 主题列表 ==========
const fullThemeList = [
  { name: '默认主题', value: 'default', dark: false },
  ...(themeList || []).map((t) => ({ name: t.name, value: t.value, dark: !!t.dark })),
]
const lightThemeList = fullThemeList.filter((t) => !t.dark)
const darkThemeList = fullThemeList.filter((t) => t.dark)
const themePreviewMap = themeImgMap || {}

// ========== 默认数据 ==========
const initData = {
  "data": {
    "text": "中心主题"
  },
  "children": []
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

  onNodeActiveListener = (node, nodeList) => {
    activeNodes.value = nodeList || []
  }

  onDataChangeListener = () => {
    updateHistoryStatus()
    hasUnsavedChanges.value = true
    updateNodeCount() // ★ 数据改变时更新节点计数
    saveToLocalStorage()
  }

  onBackForwardListener = (index, len) => {
    canUndo.value = index > 0
    canRedo.value = index < len - 1
  }

  onScaleListener = (val) => {
    scale.value = val
  }

  onNodeImgDblclickListener = (node, e, imgNode) => {
    const imgSrc = node.getData?.('image') || ''
    if (imgSrc) {
      imageDblClickData.value = { node, imgSrc, imgNode }
    }
  }

  try {
    mindMapInstance.on('node_active', onNodeActiveListener)
    mindMapInstance.on('data_change', onDataChangeListener)
    mindMapInstance.on('back_forward', onBackForwardListener)
    mindMapInstance.on('scale', onScaleListener)
    mindMapInstance.on('node_img_dblclick', onNodeImgDblclickListener)
  } catch (e) { /* ignore */ }
}

function unbindEvents() {
  if (!mindMapInstance) return
  try {
    mindMapInstance.off?.('node_active', onNodeActiveListener)
    mindMapInstance.off?.('data_change', onDataChangeListener)
    mindMapInstance.off?.('back_forward', onBackForwardListener)
    mindMapInstance.off?.('scale', onScaleListener)
    mindMapInstance.off?.('node_img_dblclick', onNodeImgDblclickListener)
  } catch (e) { /* ignore */ }

  onNodeActiveListener = null
  onDataChangeListener = null
  onBackForwardListener = null
  onScaleListener = null
  onNodeImgDblclickListener = null
}

function collectAllImages() {
  return collectImagesFromMindMap(mindMapInstance)
}

function updateNodeCount() {
  if (!mindMapInstance) return
  try {
    const data = mindMapInstance.getData()
    nodeCount.value = calculateNodeCount(data)
  } catch (e) {
    // 如果计算失败，重置为1（根节点）
    nodeCount.value = 1
  }
}

function calculateNodeCount(node) {
  if (!node) return 0
  let count = 1
  if (node.children && node.children.length) {
    for (const child of node.children) {
      count += calculateNodeCount(child)
    }
  }
  return count
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
  customBackground.value = null
}


// ★★★ 新增：应用自定义背景到SVG ★★★

// ========== 导出 ==========
export function useMindMap() {
  const persistence = createMindMapPersistence({ getData, setData, buildSaveData })
  saveToLocalStorage = persistence.saveToLocalStorage
  const {
    openLocalFile,
    importFile,
    exportFile,
    saveToLocalFile,
  } = persistence

  function init(el, data) {
    if (!el) return
    if (mindMapInstance) {
      destroy()
    }

    let finalData = null
    if (data) {
      finalData = data
    } else {
      finalData = loadFromLocalStorage()
    }

    if (!finalData) {
      finalData = JSON.parse(JSON.stringify(initData))
    }

    mindMapInstance = new MindMap({
      el,
      data: finalData,
      theme: currentTheme.value,
      layout: currentLayout.value,
      initRootNodePosition: ['20%', 'center'], // 根节点位置
      customQuickCreateChildBtnClick: (node) => {
        // 使用优化后的逻辑，直接基于当前节点计数获取颜色
        const color = getNextNodeColorOptimized(currentNodeColorListName.value, node.mindMap)
        if (!color) {
          node.mindMap.execCommand('INSERT_CHILD_NODE', false, [node])
        } else {
          node.mindMap.execCommand('INSERT_CHILD_NODE', false, [node], {
            uid: Date.now().toString(),
            text: '分支主题',
            ...color
          })
        }
      },

      themeConfig: {
        // ========== 通用节点样式 ==========
     

        // ========== 根节点样式 ==========
        root: {
          paddingX: 10, // 水平内边距（更大）
          paddingY: 15, // 垂直内边距（更大）

        },

        // ========== 二级节点样式 ==========
        second: {
          marginX: 130, // 水平间距
          marginY: 20, // 垂直间距
          paddingX: 7, // 水平内边距
          paddingY: 15, // 垂直内边距

          textAlign: 'center', // 文字对齐方式
        },

        // ========== 三级及以下节点样式 ==========
        node: {
          marginX: 100, // 水平间距
          marginY: 80, // 垂直间距
          paddingX: 7, // 水平内边距
          paddingY: 15, // 垂直内边距

          textAlign: 'center', // 文字对齐方式
        },

        // ========== 概要节点样式 ==========
        generalization: {
          marginX: 100, // 水平间距
          marginY: 40, // 垂直间距

          textAlign: 'center', // 文字对齐方式
        }
      },
      // ========== 节点拖拽配置 ==========
      enableDragModifyNodeWidth: true, // 允许拖拽修改节点宽度
      minNodeTextModifyWidth: 100, // 节点最小宽度（文本编辑时）
      maxNodeTextModifyWidth: -1, // 节点最大宽度（-1表示无限制）

      // ========== 图片调整配置 ==========
      imgResizeBtnSize: 24, // 图片调整按钮尺寸
      minImgResizeWidth: 40, // 图片最小宽度
      minImgResizeHeight: 40, // 图片最小高度
      maxImgResizeWidthInheritTheme: false, // 是否继承主题的最大宽度限制
      maxImgResizeWidth: 2000, // 图片最大宽度
      maxImgResizeHeight: 2000, // 图片最大高度

      // ========== 画布交互配置 ==========
      mousewheelAction: 'zoom', // 鼠标滚轮行为（zoom=缩放，scroll=平移）
      showNumber: false // 是否显示节点编号
    })


    const _originalRender = mindMapInstance.render.bind(mindMapInstance)
    mindMapInstance.render = function (...args) {
      _originalRender(...args)
      if (customBackground.value) {
        applyCustomBackground(customBackground.value)
      }
    }

    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      window.mindMapInstance = mindMapInstance // 方便调试，仅开发环境保留
    }

    // ★ 恢复 customBackground
    if (finalData.customBackground) {
      customBackground.value = finalData.customBackground
      setTimeout(() => {
        applyCustomBackground(finalData.customBackground)
      }, 100)
    }

    markRaw(mindMapInstance)
    bindEvents()
    
    // 初始化完成后更新节点计数
    updateNodeCount()
    
    isReady.value = true
    hasUnsavedChanges.value = false
  }

  function destroy() {
    if (mindMapInstance) {
      unbindEvents()
      try {
        mindMapInstance.destroy()
      } catch (e) { /* ignore */ }
      mindMapInstance = null
    }
    resetState()
  }

  function newFile() {
    const newData = JSON.parse(JSON.stringify(initData))
    applyColorsToTree(newData, currentNodeColorListName.value)
    mindMapInstance.setData(newData)
    mindMapInstance.view.reset()
    mindMapInstance.command.clearHistory?.()
    hasUnsavedChanges.value = false
    canUndo.value = false
    canRedo.value = false
    customBackground.value = null

    // ★ 新增：清除 localStorage 缓存
    clearLocalStorage()

    // ★ 更新节点计数
    updateNodeCount()

    const svgEl = mindMapInstance.el?.querySelector('svg')
    if (svgEl) {
      svgEl.style.background = '#fff'
      svgEl.style.backgroundImage = ''
    }
  }

  // ========== 节点操作 ==========
  function undo() {
    mindMapInstance.execCommand('BACK')
  }

  function redo() {
    mindMapInstance.execCommand('FORWARD')
  }

  function setCurrentNodeColorList(key) {
    currentNodeColorListName.value = key
  }

  function getCurrentNodeColorList() {
    return currentNodeColorListName.value
  }

  function removeCurrentNodeColorList() {
    currentNodeColorListName.value = ''
  }

  function insertChildNode() {
    if (!mindMapInstance) return
    const color = getNextNodeColorOptimized(currentNodeColorListName.value, mindMapInstance)
    if (!color) {
      mindMapInstance.execCommand('INSERT_CHILD_NODE')
    } else {
      mindMapInstance.execCommand('INSERT_CHILD_NODE', false, [], {
        uid: Date.now().toString(),
        text: '分支主题',
        ...color
      })
    }
    // 插入子节点后增加节点计数
    nodeCount.value++
  }


  function insertSiblingNode() {
    if (!mindMapInstance) return
    const color = getNextNodeColorOptimized(currentNodeColorListName.value, mindMapInstance)
    if (!color) {
      mindMapInstance.execCommand('INSERT_NODE')
    } else {
      mindMapInstance.execCommand('INSERT_NODE', false, [], {
        uid: Date.now().toString(),
        text: '分支主题',
        ...color
      })
    }
    // 插入兄弟节点后增加节点计数
    nodeCount.value++
  }


  function removeLine() {
    if (!mindMapInstance) return
    try {
      mindMapInstance.associativeLine.removeLine()
    } catch (e) { /* ignore */ }
  }

  function removeNode() {
    if (!mindMapInstance) return
    try { mindMapInstance.execCommand('REMOVE_NODE') } catch (e) { /* ignore */ }
  }

  function setNodeStyle(key, value) {
    setNodeStyles(mindMapInstance, getActiveNodeList(), key, value)
  }

  function setStyles(styleObj) {
    setNodeStylesBatch(mindMapInstance, getActiveNodeList(), styleObj)
  }

  function setThemeConfig(key, value) {
    setThemeConfigHelper(mindMapInstance, key, value)
  }

  function getThemeConfig(key, value) {
    return getThemeConfigHelper(mindMapInstance, key, value)
  }

  // ★★★ 新增：设置自定义背景 ★★★
  function setCustomBackground(bg) {
    customBackground.value = bg
    applyCustomBackground(mindMapInstance, bg)
    hasUnsavedChanges.value = true
    saveToLocalStorage()
  }

  // ★★★ 新增：获取自定义背景 ★★★
  function getCustomBackground() {
    return customBackground.value
  }



  // ========== 插入图片 ==========
  function insertImageToNode(url, title = '', width, height) {
    return insertImageToNodeHelper(mindMapInstance, getActiveNodeList(), url, title, width, height)
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

  // ========== 主题/布局 ==========
  function setTheme(themeValue) {
    currentTheme.value = themeValue
    if (mindMapInstance) {
      try {
        mindMapInstance.setTheme(themeValue)
      } catch (e) { /* ignore */ }
    }
  }

  function setLayout(layout) {
    currentLayout.value = layout
    if (mindMapInstance) {
      try { mindMapInstance.setLayout(layout) } catch (e) { /* ignore */ }
    }
  }

  function getLayout() {
    if (!mindMapInstance) return currentLayout.value
    return mindMapInstance.getLayout()
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

  // ★ 替换原来的 getData 函数
  function getData() {
    return buildSaveData()
  }


  // ★★★ 修改：setData 时恢复 customBackground ★★★
  function setData(data) {
    if (!mindMapInstance) return
    try {
      let bgToRestore = null

      if (data.root) {
        // 完整数据格式
        mindMapInstance.setFullData(data)
        bgToRestore = data.customBackground || null
      } else {
        // 纯节点数据格式，检查是否有 customBackground
        const { customBackground: bg, ...nodeData } = data
        mindMapInstance.setData(nodeData)
        bgToRestore = bg || null
      }

      mindMapInstance.view.reset()

      // ★★★ 恢复自定义背景 ★★★
      if (bgToRestore) {
        customBackground.value = bgToRestore
        setTimeout(() => {
          applyCustomBackground(bgToRestore)
        }, 100)
      } else {
        customBackground.value = null
      }

      // ★ 更新节点计数
      updateNodeCount()

      // ★ 新增：加载文件后立即缓存新数据
      saveToLocalStorage()

    } catch (e) { /* ignore */ }
    hasUnsavedChanges.value = false
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

  function getOutlineTree() {
    if (!mindMapInstance) return null
    try {
      const data = mindMapInstance.getData()
      return data || null
    } catch (e) {
      return null
    }
  }


  // ========== 统一保存数据构造 ==========
  function buildSaveData() {
    if (!mindMapInstance) return null
    try {
      const data = mindMapInstance.getData()
      if (!data) return null
      return {
        data: data.data,
        children: data.children || [],
        customBackground: customBackground.value || null,
      }
    } catch (e) {
      return null
    }
  }

  // ★ 新增：优化版本的获取节点颜色函数
  function getNextNodeColorOptimized(currentNodeColorListName, mindMapInstance) {
    const colors = getCurrentColors(currentNodeColorListName)
    if (!colors || !mindMapInstance) return null
    
    // 直接使用维护的节点计数，时间复杂度 O(1)
    const index = nodeCount.value % colors.length
    return colors[index]
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
    customBackground,
    init,
    destroy,
    newFile,
    undo,
    redo,
    insertChildNode,
    insertSiblingNode,
    removeNode,
    removeLine,
    setNodeStyle,
    setStyles,
    setThemeConfig,
    getThemeConfig,
    setCustomBackground,
    getCustomBackground,
    setCurrentNodeColorList,
    getCurrentNodeColorList,
    insertImageToNode,
    toggleAssociativeLineMode,
    setTheme,
    setLayout,
    getLayout,
    zoomIn,
    zoomOut,
    fit,
    resetPosition,
    setScale,
    getData,
    setData,
    exportFile,
    toggleReadonly,
    render,
    openLocalFile,
    importFile,
    getActiveNodeList,
    getOutlineTree,
    imageDblClickData,
    collectAllImages,
    saveToLocalFile,
    buildSaveData,
  }
}
