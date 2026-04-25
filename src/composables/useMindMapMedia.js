import { formatFileSize, calcBase64Size } from '../utils/commonUtils'

export function collectAllImages(mindMapInstance) {
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
  if (imgSrc) {
    const imgTitle = node.data?.imageTitle
    const imgText = node.data?.text
    const imgSize = node.data?.imageSize
    const fileSize = calcBase64Size(imgSrc)
    images.push({
      imgSrc,
      imgTitle,
      imgText,
      imgSize,
      fileSize,
      fileSizeText: formatFileSize(fileSize),
    })
  }
  node.children?.forEach((child) => traverseCollectImages(child, images))
}

export function insertImageToNode(mindMapInstance, activeNodes, url, title = '', width, height) {
  if (!mindMapInstance || !activeNodes.length) return
  const img = new Image()
  img.onload = () => {
    const finalWidth = width || img.naturalWidth
    const finalHeight = height || img.naturalHeight
    activeNodes.forEach((node) => {
      if (typeof node.setImage === 'function') {
        node.setImage({ url, title: title || '图片', width: finalWidth, height: finalHeight })
      }
    })
    mindMapInstance.render()
  }
  img.onerror = () => {
    activeNodes.forEach((node) => {
      if (typeof node.setImage === 'function') {
        node.setImage({ url, title: title || '图片', width: 200, height: 150 })
      }
    })
    mindMapInstance.render()
  }
  img.src = url
}
