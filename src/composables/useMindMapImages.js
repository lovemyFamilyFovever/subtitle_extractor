import { ref, watch } from 'vue'

export function useMindMapImages(activeNodes, imageDblClickData, collectAllImages, insertImageToNode) {
  const showImageDlg = ref(false)
  const showImageViewer = ref(false)
  const viewerImages = ref([])
  const viewerIndex = ref(0)

  function handleInsertImage() {
    showImageDlg.value = true
  }

  function handleImageConfirm({ url, title, width, height }) {
    insertImageToNode(url, title, width, height)
  }

  watch(imageDblClickData, (data) => {
    if (!data || !data.imgSrc) return
    const allImages = collectAllImages()
    if (!allImages.length) return
    viewerImages.value = allImages
    viewerIndex.value = allImages.findIndex((obj) => obj.imgSrc === data.imgSrc)
    showImageViewer.value = true
  })

  return {
    showImageDlg,
    showImageViewer,
    viewerImages,
    viewerIndex,
    handleInsertImage,
    handleImageConfirm,
  }
}
