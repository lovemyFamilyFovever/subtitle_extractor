<template>
  <div class="mindmap-overlay" ref="overlayRef">
    <!-- 超链接图标 -->
    <div
      v-for="ind in hyperlinkIndicators"
      :key="ind.id"
      class="overlay-indicator overlay-hyperlink"
      :style="ind.style"
      @dblclick.stop="$emit('edit-hyperlink', ind.nodeId)"
      :title="'超链接: ' + (ind.title || ind.url)"
    >
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#4a90d9" stroke-width="1.5">
        <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1 1" />
        <path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1" />
      </svg>
    </div>

    <!-- 备注图标 -->
    <div
      v-for="ind in noteIndicators"
      :key="ind.id"
      class="overlay-indicator overlay-note"
      :style="ind.style"
      @dblclick.stop="$emit('edit-note', ind.nodeId)"
      :title="'备注: ' + ind.preview"
    >
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#f39c12" stroke-width="1.5">
        <path d="M14 10a2 2 0 0 1-2 2H5l-3 3V3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  hyperlinks: { type: Array, default: () => [] },
  notes: { type: Array, default: () => [] },
})

const emit = defineEmits(['edit-hyperlink', 'edit-note'])

// 直接用传入的坐标数据，不再自己算
const hyperlinkIndicators = computed(() => props.hyperlinks)
const noteIndicators = computed(() => props.notes)

function refresh() {
  nextTick(() => { /* vue 自动响应 */ })
}

defineExpose({ refresh })
</script>

<style scoped>
.mindmap-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  overflow: visible;
}

.overlay-indicator {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.15s ease;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.overlay-indicator:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 20;
}

.overlay-hyperlink:hover {
  background: rgba(74, 144, 217, 0.1);
  border-color: rgba(74, 144, 217, 0.3);
}

.overlay-note:hover {
  background: rgba(243, 156, 18, 0.1);
  border-color: rgba(243, 156, 18, 0.3);
}
</style>
