<template>
  <div class="outline-panel" ref="panelRef">
    <div class="panel-header">
      <span class="panel-title">大纲</span>
      <button class="panel-close" @click="$emit('close')">&times;</button>
    </div>
    <div class="panel-body customScrollbar">
      <div v-if="tree" class="outline-tree">
        <OutlineNode :node="tree" :depth="0" @focus-node="$emit('focus-node', $event)" />
      </div>
      <div v-else class="outline-empty">暂无内容</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import OutlineNode from './OutlineNode.vue'

defineProps({
  tree: { type: Object, default: null },
})

const emit = defineEmits(['close', 'focus-node'])

const panelRef = ref(null)

function handleOutsideClick(e) {
  if (panelRef.value && !panelRef.value.contains(e.target)) {
    emit('close')
  }
}

onMounted(() => {
  setTimeout(() => {
    document.addEventListener('mousedown', handleOutsideClick)
  }, 100)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
})
</script>

<style scoped>
.outline-panel {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 280px;
  max-height: calc(100vh - 32px);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow: hidden;
  animation: panelSlide 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes panelSlide {
  from { opacity: 0; transform: translateX(12px) scale(0.97); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.panel-title { font-size: 13px; font-weight: 600; color: #333; }

.panel-close {
  background: none;
  border: none;
  color: #bbb;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.15s ease;
}
.panel-close:hover { color: #666; }

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 8px;
}

.customScrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.08) transparent;
}
.customScrollbar::-webkit-scrollbar { width: 4px; }
.customScrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 2px; }

.outline-empty {
  text-align: center;
  color: #ccc;
  font-size: 13px;
  padding: 40px 0;
}
</style>
