import { ref, computed, nextTick } from 'vue'

export function useMindMapAnnotations(activeNodes, overlayRef) {
  const showHyperlinkDlg = ref(false)
  const hyperlinkDefaultUrl = ref('')
  const hyperlinkDefaultTitle = ref('')

  const showNoteDlg = ref(false)
  const noteDefaultContent = ref('')

  const hyperlinkPositions = computed(() => {
    const items = []
    for (const node of activeNodes.value) {
      const data = node.nodeData?.data || {}
      if (!data.hyperlink) continue
      const left = node.left || 0
      const top = node.top || 0
      const w = node.width || 100
      const h = node.height || 40
      items.push({
        id: 'hl_' + (node.uid || ''),
        nodeId: node.uid || '',
        url: data.hyperlink,
        title: data.hyperlinkTitle || '',
        style: { left: `${left + w - 18}px`, top: `${top + h - 18}px` },
      })
    }
    return items
  })

  const notePositions = computed(() => {
    const items = []
    for (const node of activeNodes.value) {
      const data = node.nodeData?.data || {}
      if (!data.note) continue
      const left = node.left || 0
      const top = node.top || 0
      const w = node.width || 100
      const h = node.height || 40
      items.push({
        id: 'note_' + (node.uid || ''),
        nodeId: node.uid || '',
        preview: String(data.note).slice(0, 30),
        style: { left: `${left + w - 18}px`, top: `${top + h - 18}px` },
      })
    }
    return items
  })

  function openHyperlinkDialog() {
    if (!activeNodes.value.length) {
      alert('请先选中一个节点')
      return
    }
    const node = activeNodes.value[0]
    hyperlinkDefaultUrl.value = node.getData?.('hyperlink') || ''
    hyperlinkDefaultTitle.value = node.getData?.('hyperlinkTitle') || ''
    showHyperlinkDlg.value = true
  }

  function handleHyperlinkConfirm({ url, title }) {
    activeNodes.value.forEach((node) => {
      if (typeof node.setHyperlink === 'function') node.setHyperlink(url, title)
    })
    nextTick(() => overlayRef.value?.refresh())
  }

  function handleHyperlinkRemove() {
    activeNodes.value.forEach((node) => {
      if (typeof node.setHyperlink === 'function') node.setHyperlink('', '')
    })
    nextTick(() => overlayRef.value?.refresh())
  }

  function openNoteDialog() {
    if (!activeNodes.value.length) {
      alert('请先选中一个节点')
      return
    }
    const node = activeNodes.value[0]
    noteDefaultContent.value = node.getData?.('note') || ''
    showNoteDlg.value = true
  }

  function handleNoteConfirm({ content }) {
    activeNodes.value.forEach((node) => {
      if (typeof node.setNote === 'function') node.setNote(content)
    })
    nextTick(() => overlayRef.value?.refresh())
  }

  function handleNoteRemove() {
    activeNodes.value.forEach((node) => {
      if (typeof node.setNote === 'function') node.setNote('')
    })
    nextTick(() => overlayRef.value?.refresh())
  }

  return {
    hyperlinkPositions,
    notePositions,
    showHyperlinkDlg,
    hyperlinkDefaultUrl,
    hyperlinkDefaultTitle,
    openHyperlinkDialog,
    handleHyperlinkConfirm,
    handleHyperlinkRemove,
    showNoteDlg,
    noteDefaultContent,
    openNoteDialog,
    handleNoteConfirm,
    handleNoteRemove,
  }
}
