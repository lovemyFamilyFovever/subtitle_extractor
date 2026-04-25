import nodeColorList from '../utils/nodeColorList.js'

export function getCurrentColors(currentNodeColorListName) {
  if (!currentNodeColorListName) return null
  const found = nodeColorList.find((item) => item.value === currentNodeColorListName)
  return found?.colors?.length ? found.colors : null
}

export function getNextNodeColor(currentNodeColorListName, mindMapInstance) {
  // 注意：这里保留原始函数用于向后兼容
  // 实际项目中应该只使用优化版本
  const colors = getCurrentColors(currentNodeColorListName)
  if (!colors || !mindMapInstance) return null
  const data = mindMapInstance.getData()
  const totalCount = getNodesCount(data)
  const index = totalCount % colors.length
  return colors[index]
}

// 添加一个新的优化函数导出
export function getNextNodeColorOptimized(currentNodeColorListName, mindMapInstance, nodeCount) {
  const colors = getCurrentColors(currentNodeColorListName)
  if (!colors || !mindMapInstance || typeof nodeCount !== 'number') return null
  const index = nodeCount % colors.length
  return colors[index]
}

export function getNodesCount(node) {
  let count = 1
  if (node?.children?.length) {
    node.children.forEach((child) => {
      count += getNodesCount(child)
    })
  }
  return count
}

export function applyColorsToTree(treeData, currentNodeColorListName) {
  const colors = getCurrentColors(currentNodeColorListName)
  if (!colors) return
  let index = 0

  function walk(node) {
    if (!node?.data) return
    const color = colors[index % colors.length]
    node.data = { ...node.data, ...color }
    index++
    node.children?.forEach((child) => walk(child))
  }

  walk(treeData)
}

export function setNodeStyles(mindMapInstance, nodeList, key, value) {
  if (!mindMapInstance || !nodeList.length) return
  try {
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

export function setNodeStylesBatch(mindMapInstance, nodeList, styleObj) {
  if (!mindMapInstance || !nodeList.length) return
  try {
    nodeList.forEach((node) => {
      mindMapInstance.execCommand('SET_NODE_STYLES', node, styleObj)
    })
    mindMapInstance.render()
  } catch (e) { /* ignore */ }
}

export function setThemeConfig(mindMapInstance, key, value) {
  if (!mindMapInstance) return
  try {
    const config = JSON.parse(JSON.stringify(mindMapInstance.getThemeConfig() || {}))
    config[key] = value
    mindMapInstance.setThemeConfig(config)
    mindMapInstance.render()
  } catch (e) { /* ignore */ }
}

export function getThemeConfig(mindMapInstance, key, fallback) {
  if (!mindMapInstance) return fallback
  try {
    return mindMapInstance.getThemeConfig(key) || fallback
  } catch (e) {
    return fallback
  }
}

export function applyCustomBackground(mindMapInstance, bg) {
  if (!mindMapInstance) return
  const svgEl = mindMapInstance.el
  if (!svgEl) return

  if (bg.type === 'pure' || bg.type === 'gradient') {
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
