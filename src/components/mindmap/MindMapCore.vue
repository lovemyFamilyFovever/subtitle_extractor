<template>
  <div class="mind-map-core">
    <div ref="containerRef" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useMindMap } from '@/composables/useMindMap'

const { init, removeNode, insertSiblingNode, getActiveNodeList } = useMindMap()
const containerRef = ref(null)

function handleKeyDown(e) {
  const tag = e.target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
  if (isNodeEditing()) return

  const hasNode = getActiveNodeList().length > 0

  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (hasNode) {
      e.preventDefault()
      e.stopPropagation()
      removeNode()
    }
  }

  if (e.key === 'Enter') {
    if (hasNode) {
      e.preventDefault()
      e.stopPropagation()
      insertSiblingNode()
    }
  }
}

function isNodeEditing() {
  const activeEl = document.activeElement
  if (activeEl?.getAttribute?.('contenteditable') === 'true') return true
  if (containerRef.value) {
    const editing = containerRef.value.querySelector('[contenteditable="true"]:focus')
    if (editing) return true
  }
  return false
}

onMounted(async () => {
  await nextTick()
  // 等待 DOM 完全渲染
  await new Promise((resolve) => setTimeout(resolve, 50))

  if (!containerRef.value) {
    console.error('[MindMap] 容器未就绪')
    return
  }

  let data = null
  const saved = localStorage.getItem('mindMapData')
  if (saved) {
    try { data = JSON.parse(saved) } catch (e) { /* ignore */ }
  }

  init(containerRef.value, data || undefined)
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.mind-map-core {
    height: 100%;
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #f0f2f5;
  background-image: radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px);
  background-size: 24px 24px;
}

.map-container {
  width: 100%;
  height: 100%;
}

.map-container :deep(*) {
  margin: 0;
  padding: 0;
}
</style>
