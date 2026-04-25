<template>
  <div class="outline-node">
    <div
      class="node-row"
      :style="{ paddingLeft: depth * 24 + 'px' }"
      @click="$emit('focus-node', node)"
    >
      <!-- 展开/折叠按钮 -->
      <button
        v-if="hasChildren"
        class="expand-btn"
        :class="{ collapsed: !expanded }"
        @click.stop="toggleExpanded"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div v-else class="expand-placeholder" />

      <!-- 节点文本 -->
      <span
        class="node-text"
        :class="{ 
          root: depth === 0,
          active: isActive,
          'has-children': hasChildren
        }"
      >{{ nodeText }}</span>
    </div>

    <!-- 子节点 -->
    <transition name="slide-fade">
      <div v-if="hasChildren && expanded" class="children">
        <OutlineNode
          v-for="(child, index) in node.children"
          :key="index"
          :node="child"
          :depth="depth + 1"
          :is-active="isActiveChild(child)"
          @focus-node="$emit('focus-node', $event)"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  isActive: { type: Boolean, default: false }
})

defineEmits(['focus-node'])

const expanded = ref(true)

const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

// 修复nodeText的获取逻辑，去除HTML标签
const nodeText = computed(() => {
  const rawText = props.node.data?.text || '未命名'
  // 创建一个临时div来解析HTML并获取纯文本内容
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = rawText
  const textContent = tempDiv.textContent || tempDiv.innerText || '未命名'
  // 清理临时DOM元素，虽然不是严格必要，但是一种好的实践
  tempDiv.remove()
  return textContent
})

const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const isActiveChild = (child) => {
  // 这里可以根据实际需求判断子节点是否激活
  return false
}
</script>

<style scoped>
.outline-node {
  position: relative;
}

.node-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 2px 8px;
  position: relative;
  overflow: hidden;
}

.node-row:hover {
  background: linear-gradient(to right, rgba(74, 144, 217, 0.1), rgba(74, 144, 217, 0.05));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.node-text {
  font-size: 14px;
  color: #444;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  transition: all 0.25s ease;
}

.node-text.root {
  font-weight: 700;
  color: #2c3e50;
  font-size: 16px;
}

.node-text.active {
  color: #4a90d9;
  background: rgba(74, 144, 217, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.expand-btn {
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
  border-radius: 50%;
  transition: all 0.25s ease;
  margin-left: 2px;
  margin-right: 2px;
}

.expand-btn:hover {
  background: rgba(74, 144, 217, 0.15);
  color: #4a90d9;
  transform: scale(1.1);
}

.expand-btn.collapsed {
  transform: rotate(-90deg);
  color: #666;
}

.expand-btn.collapsed:hover {
  color: #4a90d9;
}

.expand-placeholder {
  width: 22px;
  flex-shrink: 0;
}

.children {
  border-left: 1px solid rgba(74, 144, 217, 0.15);
  margin-left: 11px;
  padding-left: 12px;
  transition: all 0.3s ease;
}

/* 动画效果 */
.slide-fade-enter-active {
  transition: all 0.3s ease;
  max-height: 500px;
}

.slide-fade-leave-active {
  transition: all 0.25s ease;
  max-height: 500px;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
  max-height: 0;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .node-row:hover {
    background: linear-gradient(to right, rgba(74, 144, 217, 0.15), rgba(74, 144, 217, 0.08));
  }
  
  .node-text {
    color: #e0e0e0;
  }
  
  .node-text.root {
    color: #f0f0f0;
  }
  
  .expand-btn {
    color: #aaa;
  }
  
  .expand-btn:hover {
    color: #6ab7ff;
  }
  
  .node-text.active {
    color: #6ab7ff;
  }
}
</style>