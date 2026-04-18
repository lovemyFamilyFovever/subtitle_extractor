<template>
  <div
    v-if="visible"
    ref="overlayRef"
    class="line-text-overlay"
    :style="{ left: posX + 'px', top: posY + 'px' }"
  >
    <!-- 编辑模式 -->
    <div v-if="isEditing" class="line-text-edit">
      <input
        ref="inputRef"
        v-model="editText"
        class="line-text-input"
        placeholder="输入备注..."
        @keydown.enter="handleConfirm"
        @keydown.escape="handleCancel"
        @blur="handleBlur"
      />
    </div>

    <!-- 显示模式 -->
    <div
      v-else
      class="line-text-display"
      @dblclick.stop="startEdit"
    >
      <span class="line-text-content">{{ currentText }}</span>
      <button
        class="line-text-delete"
        title="删除备注"
        @click.stop="handleDelete"
      >
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  mindMapInstance: { type: Object, default: null },
})

const emit = defineEmits(['save'])

const visible = ref(false)
const isEditing = ref(false)
const editText = ref('')
const currentText = ref('')
const posX = ref(0)
const posY = ref(0)
const lineId = ref('')

const inputRef = ref(null)
const overlayRef = ref(null)

// 显示覆盖层
function show(data) {
  lineId.value = data.lineId
  posX.value = data.x
  posY.value = data.y
  currentText.value = data.text || ''
  visible.value = true

  if (currentText.value) {
    isEditing.value = false
  } else {
    isEditing.value = true
    editText.value = ''
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
}

// 隐藏
function hide() {
  visible.value = false
  isEditing.value = false
}

// 开始编辑
function startEdit() {
  isEditing.value = true
  editText.value = currentText.value
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 确认输入
function handleConfirm() {
  const text = editText.value.trim()
  currentText.value = text
  isEditing.value = false
  emit('save', { lineId: lineId.value, text })
  if (!text) {
    visible.value = false
  }
}

// 取消编辑
function handleCancel() {
  isEditing.value = false
  editText.value = ''
  if (!currentText.value) {
    visible.value = false
  }
}

// 失焦
function handleBlur() {
  // 延迟隐藏，防止和按钮点击冲突
  setTimeout(() => {
    if (isEditing.value) {
      handleConfirm()
    }
  }, 150)
}

// 删除备注
function handleDelete() {
  mindMapInstance.removeLine();
  emit('delete', { lineId: lineId.value })
  visible.value = false
}

// 监听 Del 键
function handleKeyDown(e) {
  if (!visible.value) return
  if (isEditing.value) return

  // 检查是否点击在 overlay 上
  if (!overlayRef.value?.contains(document.activeElement)) return

  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault()
    handleDelete()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

defineExpose({ show, hide })
</script>

<style scoped>
.line-text-overlay {
  position: absolute;
  z-index: 50;
  transform: translate(-50%, -100%);
  margin-top: -12px;
  animation: fadeUp 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translate(-50%, -100%) translateY(6px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -100%) translateY(0);
  }
}

/* 编辑模式 */
.line-text-edit {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1.5px solid rgba(74, 144, 217, 0.4);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.line-text-input {
  border: none;
  outline: none;
  background: transparent;
  padding: 6px 12px;
  font-size: 12px;
  color: #333;
  min-width: 120px;
  max-width: 240px;
  font-family: inherit;
}

.line-text-input::placeholder {
  color: #bbb;
}

/* 显示模式 */
.line-text-display {
  background: rgba(74, 144, 217, 0.08);
  border: 1px solid rgba(74, 144, 217, 0.15);
  border-radius: 6px;
  padding: 4px 26px 4px 10px;
  font-size: 12px;
  color: #4a90d9;
  cursor: pointer;
  position: relative;
  max-width: 200px;
  word-break: break-all;
  transition: all 0.15s ease;
  user-select: none;
}

.line-text-display:hover {
  background: rgba(74, 144, 217, 0.12);
  border-color: rgba(74, 144, 217, 0.25);
}

.line-text-content {
  line-height: 1.4;
}

/* 删除按钮 */
.line-text-delete {
  position: absolute;
  top: 50%;
  right: 4px;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #bbb;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  opacity: 0;
  transition: all 0.15s ease;
}

.line-text-display:hover .line-text-delete {
  opacity: 1;
}

.line-text-delete:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}
</style>
