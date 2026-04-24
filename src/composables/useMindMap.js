import { ref, shallowRef, onBeforeUnmount, markRaw } from 'vue'
import MindMap from 'simple-mind-map'
import Themes from 'simple-mind-map-plugin-themes'
import themeList from 'simple-mind-map-plugin-themes/themeList'
import themeImgMap from 'simple-mind-map-plugin-themes/themeImgMap'
import Export from 'simple-mind-map/src/plugins/Export.js'
import AssociativeLine from 'simple-mind-map/src/plugins/AssociativeLine.js'
import RichText from 'simple-mind-map/src/plugins/RichText.js'
import NodeImgAdjust from './NodeImgAdjust.js'
import useNodeColorList from './useNodeColorList.js'
import { formatTime, formatFileSize, calcBase64Size } from '../utils/commonUtils'

try { Themes.init(MindMap) } catch (e) { /* ignore */ }
MindMap.usePlugin(Export)
MindMap.usePlugin(AssociativeLine)
MindMap.usePlugin(NodeImgAdjust)
MindMap.usePlugin(RichText)

// ========== 模块级单例 ==========
let mindMapInstance = null

const isReady = ref(false)
const activeNodes = ref([])
const canUndo = ref(false)
const canRedo = ref(false)
const currentTheme = ref('default')
const currentLayout = ref('logicalStructure')
const scale = ref(1)
const isReadonly = ref(false)
const isAssociativeLineMode = ref(false)
const hasUnsavedChanges = ref(false)
const imageDblClickData = ref(null)

// ★★★ 新增：自定义背景状态 ★★★
const customBackground = ref(null) // { type: 'none'|'pure'|'gradient'|'grid'|'image', value: any }

const currentNodeColorListName = ref('default')
const colorListIndex = ref(0)

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
  data: { text: '中心主题' },
  children: [
    {
      data: { text: '分支主题' },
      children: [
        { data: { text: '分支主题' }, children: [] }
      ],
    },
    {
      data: { text: '分支主题' },
      children: [
        { data: { text: '分支主题' }, children: [] }
      ],
    },
  ],
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


// ========== 导出 ==========
export function useMindMap() {

  function init(el, data) {
    if (!el) return
    if (mindMapInstance) {
      try { mindMapInstance.destroy() } catch (e) { /* ignore */ }
      mindMapInstance = null
      resetState()
    }
    mindMapInstance = new MindMap({
      el,
      data: JSON.parse(JSON.stringify(initData)),
      theme: currentTheme.value,
      layout: currentLayout.value,
      initRootNodePosition: ['20%', 'center'], // 根节点位置
      // themeConfig: {
      //   // ========== 通用节点样式 ==========
      //   imgMaxWidth: 333, // 节点内图片最大宽度
      //   imgMaxHeight: 100, // 节点内图片最大高度

      //   // ========== 根节点样式 ==========
      //   root: {
      //     paddingX: 35, // 水平内边距（更大）
      //     paddingY: 15, // 垂直内边距（更大）

      //   },

      //   // ========== 二级节点样式 ==========
      //   second: {
      //     marginX: 130, // 水平间距
      //     marginY: 20, // 垂直间距
      //     paddingX: 35, // 水平内边距
      //     paddingY: 15, // 垂直内边距

      //     textAlign: 'center', // 文字对齐方式
      //   },

      //   // ========== 三级及以下节点样式 ==========
      //   node: {
      //     marginX: 100, // 水平间距
      //     marginY: 80, // 垂直间距
      //     paddingX: 35, // 水平内边距
      //     paddingY: 15, // 垂直内边距

      //     textAlign: 'center', // 文字对齐方式
      //   },

      //   // ========== 概要节点样式 ==========
      //   generalization: {
      //     marginX: 100, // 水平间距
      //     marginY: 40, // 垂直间距

      //     textAlign: 'center', // 文字对齐方式
      //   }
      // },
      // ========== 节点拖拽配置 ==========
      // themeConfig: {
      //   node: {
      //     fillColor: '#fff',
      //   }
      // },
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

    window.mindMapInstance = mindMapInstance // 方便调试

    

    


    markRaw(mindMapInstance)
    bindEvents()
    isReady.value = true
    hasUnsavedChanges.value = false

    console.log('[MindMap] 初始化成功')
  }


  function setStyleForAllNodes(styleConfig) {
    // 1. 获取整棵导图的数据树
    const treeData = mindMapInstance.getData();
    if (!treeData) return;

    // 2. 递归遍历所有数据节点
    function traverse(node) {
        if (!node) return;

        // 3. 通过 uid 找到真实的节点实例
        const nodeInstance = mindMapInstance.renderer.findNodeByUid(node.data.uid);
        if (nodeInstance) {
            // 4. 调用官方 setNodeStyle API 设置样式
            mindMapInstance.setStyles(styleConfig);
        }
        
        // 5. 递归处理子节点
        if (node.children && node.children.length) {
            node.children.forEach(child => traverse(child));
        }
    }

    traverse(treeData);
}


  function destroy() {
    mindMapInstance.destroy()
    mindMapInstance = null
    resetState()
  }

  function newFile() {
    mindMapInstance.setData(JSON.parse(JSON.stringify(initData)))
    mindMapInstance.view.reset()
    mindMapInstance.command.clearHistory?.()
    hasUnsavedChanges.value = false
    canUndo.value = false
    canRedo.value = false
    // 重置背景
    customBackground.value = null
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

  function getNodesCount(node) {
    let count = 1
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        count += getNodesCount(child)
      })
    }
    return count
  }

  function insertChildNode() {
    if (!mindMapInstance) return
    if (!currentNodeColorListName.value) {
      mindMapInstance.execCommand('INSERT_CHILD_NODE')
    } else {

      const totalCount = getNodesCount(mindMapInstance.renderer.root)
      const colorsArray = useNodeColorList.find(item => item.value === currentNodeColorListName.value)
      colorListIndex.value = totalCount % colorsArray.colors.length
      const color = colorsArray.colors[colorListIndex.value]

      mindMapInstance.execCommand('INSERT_CHILD_NODE', false, [], {
        uid: Date.now().toString(),
        text: '分支主题',
        ...color
      })
    }
  }

  function insertSiblingNode() {
    if (!mindMapInstance) return
    if (!currentNodeColorListName.value) {
      mindMapInstance.execCommand('INSERT_NODE')
    } else {

      const totalCount = getNodesCount(mindMapInstance.renderer.root)
      const colorsArray = useNodeColorList.find(item => item.value === currentNodeColorListName.value)
      colorListIndex.value = totalCount % colorsArray.colors.length
      const color = colorsArray.colors[colorListIndex.value]

      mindMapInstance.execCommand('INSERT_NODE', false, [], {
        uid: Date.now().toString(),
        text: '分支主题',
        ...color
      })
    }

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

  function setStyles(styleObj) {
    if (!mindMapInstance) return
    try {
      const nodeList = getActiveNodeList()
      if (!nodeList.length) return
      nodeList.forEach((node) => {
        mindMapInstance.execCommand('SET_NODE_STYLES', node, styleObj)
      })
      mindMapInstance.render()
    } catch (e) { /* ignore */ }
  }

  function setThemeConfig(key, value) {
    if (!mindMapInstance) return
    try {
      const config = JSON.parse(JSON.stringify(mindMapInstance.getThemeConfig() || {}))
      config[key] = value
      mindMapInstance.setThemeConfig(config)
      mindMapInstance.render()
    } catch (e) { /* ignore */ }
  }

  function getThemeConfig(key, value) {
    if (!mindMapInstance) return {}
    try {
      return mindMapInstance.getThemeConfig(key) || value
    } catch (e) { }
  }

  // ★★★ 新增：设置自定义背景 ★★★
  function setCustomBackground(bg) {
    customBackground.value = bg
    applyCustomBackground(bg)
    hasUnsavedChanges.value = true
  }

  // ★★★ 新增：获取自定义背景 ★★★
  function getCustomBackground() {
    return customBackground.value
  }

  // ★★★ 新增：应用自定义背景到SVG ★★★
  function applyCustomBackground(bg) {
    if (!mindMapInstance) return
    const svgEl = mindMapInstance.el
    if (!svgEl) return

    if (bg.type === 'pure') {
      svgEl.style.backgroundImage = ''
      svgEl.style.background = bg.backgroundColor
    } else if (bg.type === 'gradient') {
      svgEl.style.backgroundImage = ''
      svgEl.style.background = bg.backgroundColor
    } else if (bg.type === 'grid') {
      Object.assign(svgEl.style, {
        backgroundImage: bg.backgroundImage,
        backgroundSize: bg.backgroundSize,
        backgroundRepeat: bg.backgroundRepeat,
        backgroundPosition: bg.backgroundPosition,
      })
    } else if (bg.type === 'image') {
      Object.assign(svgEl.style, {
        backgroundImage: bg.backgroundImage,
        backgroundSize: bg.backgroundSize,
        backgroundRepeat: bg.backgroundRepeat,
        backgroundPosition: bg.backgroundPosition,
        backgroundColor: 'transparent',
      })
    }
  }

  // ========== 插入图片 ==========
  function insertImageToNode(url, title = '') {
    if (!mindMapInstance) return
    const nodeList = getActiveNodeList()
    if (!nodeList.length) return
    const img = new Image()
    img.onload = () => {
      const maxWidth = 310
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




  // ========== 文件操作 ==========
  async function openLocalFile() {
    if (!('showOpenFilePicker' in window)) {
      console.warn('当前浏览器不支持 File System Access API，使用传统模式')
      return openLocalFileLegacy()
    }

    try {
      const fileHandles = await window.showOpenFilePicker({
        types: [
          {
            description: '思维导图文件',
            accept: {
              'application/json': ['.json'],
            }
          }
        ],
        excludeAcceptAllOption: false,
        multiple: true
      })

      if (!fileHandles || fileHandles.length === 0) {
        return null
      }

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

  // ★ 替换原来的 exportFile 函数
  function exportFile() {
    if (!mindMapInstance) return
    const data = mindMapInstance.getData()
    if (!data) return

    const d = new Date()
    const name = d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0') +
      String(d.getHours()).padStart(2, '0') +
      String(d.getMinutes()).padStart(2, '0') +
      String(d.getSeconds()).padStart(2, '0')

    // ★ 手动构造包含 customBackground 的完整数据
    const saveData = {
      data: data.data,
      children: data.children || [],
      customBackground: customBackground.value || null,
    }

    const json = JSON.stringify(saveData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name + '.json'
    a.click()
    URL.revokeObjectURL(url)
  }


  // ★ 简化后的 saveToLocalFile
  async function saveToLocalFile(fileHandle) {
    if (!mindMapInstance || !fileHandle) return false
    try {
      const data = getData()  // ★ 现在 getData 已经包含 customBackground
      if (!data) return false

      // 去掉 simple-mind-map 内部可能带的多余字段
      const saveData = {
        data: data.data,
        children: data.children || [],
        customBackground: data.customBackground || null,
      }
      const json = JSON.stringify(saveData, null, 2)

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
    if (!mindMapInstance) return null
    try {
      const data = mindMapInstance.getData()
      if (!data) return null
      // ★ 附加 customBackground
      return {
        ...data,
        customBackground: customBackground.value || null,
      }
    } catch (e) { return null }
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
    saveToLocalFile
  }
}
