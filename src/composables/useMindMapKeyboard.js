import { onMounted, onBeforeUnmount } from 'vue'

export function useMindMapKeyboard({
  handleSave,
  removeLine,
  removeNode,
  insertSiblingNode,
  isAssociativeLineMode,
  isNodeEditing = () => false,
}) {
  const handleKeydown = (e) => {
    if (isNodeEditing()) return

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      handleSave?.()
      return
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (isAssociativeLineMode?.value) {
        e.preventDefault()
        removeLine?.()
        return
      }

      if (removeNode) {
        e.preventDefault()
        removeNode()
      }
      return
    }

    if (e.key === 'Enter' && insertSiblingNode) {
      e.preventDefault()
      insertSiblingNode()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
}
