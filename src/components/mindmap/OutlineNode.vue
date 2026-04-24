<template>
  <div class="outline-node">
    <div
      class="node-row"
      :style="{ paddingLeft: depth * 16 + 'px' }"
      @click="$emit('focus-node', node)"
    >
      <!-- 展开/折叠按钮 -->
      <button
        v-if="hasChildren"
        class="expand-btn"
        :class="{ collapsed: !expanded }"
        @click.stop="expanded = !expanded"
      >
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div v-else class="expand-placeholder" />

      <!-- 节点文本 -->
      <span
        class="node-text"
        :class="{ root: depth === 0 }"
      >{{ nodeText }}</span>
    </div>

    <!-- 子节点 -->
    <div v-if="hasChildren && expanded" class="children">
      <OutlineNode
        v-for="(child, index) in node.children"
        :key="index"
        :node="child"
        :depth="depth + 1"
        @focus-node="$emit('focus-node', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
})

defineEmits(['focus-node'])

const expanded = ref(true)

const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

const nodeText = computed(() => {
  return props.node.data?.text || '未命名'
})
</script>

<style scoped>
.node-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s ease;
  min-height: 30px;
}

.node-row:hover {
  background: rgba(0, 0, 0, 0.03);
}

.expand-btn {
  width: 18px;
  height: 18px;
  border: none;
  background: transparent;
  color: #bbb;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.expand-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #888;
}

.expand-btn.collapsed {
  transform: rotate(-90deg);
}

.expand-placeholder {
  width: 18px;
  flex-shrink: 0;
}

.node-text {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-text.root {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.children {
  border-left: 1px solid rgba(0, 0, 0, 0.04);
  margin-left: 9px;
}
</style>
