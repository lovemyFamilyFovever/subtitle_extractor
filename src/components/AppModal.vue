<!-- 这是整个项目复用最多的组件。三个功能弹窗都用这个"壳子"，壳子只负责：背景遮罩、弹窗外框、标题栏、关闭按钮、滚动区。具体内容由调用者通过 slot（插槽） 传进来。 -->

<template>
  <!--
    遮罩层：只能通过关闭按钮关闭，防止误操作
    :class 动态绑定 active 类来控制显示/隐藏
  -->
  <div class="modal-overlay" :class="{
    'active': modelValue,
    'full-screen': fullScreen,
  }" role="presentation">

    <!-- 弹窗主体 -->
    <div class="modal" role="dialog" aria-modal="true" :aria-labelledby="titleId" tabindex="-1">

      <!-- ===== 弹窗头部 ===== -->
      <div class="modal-header">
        <h2 :id="titleId">
          <!-- icon 插槽：调用者可以放图标 -->
          <i v-if="icon" :class="icon" aria-hidden="true"></i>
          {{ title }}
        </h2>

        <!-- 关闭按钮 -->
        <button class="close-btn" @click="close" :aria-label="`关闭${title ? ' ' + title : ''}对话框`" title="关闭">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>

      <!-- ===== 弹窗内容区（默认插槽） ===== -->
      <!--
        调用方式：
        <AppModal title="xxx">
          <p>这里的内容会被放进 modal-body</p>
        </AppModal>
      -->
      <div class="modal-body" :class="{'full-screen': fullScreen}">
        <slot />
      </div>

    </div>
  </div>
</template>

<script setup>
// =============================================
// AppModal.vue —— 通用弹窗壳子
// 使用 Vue 3 的 <script setup> 语法
// =============================================

import { onMounted, onUnmounted, watch, nextTick, computed } from 'vue'

// ===== Props：父组件传入的属性 =====
// defineProps 声明这个组件接受哪些属性
const props = defineProps({
  // modelValue 是 v-model 的规范命名，控制弹窗显隐（true=显示）
  modelValue: {
    type: Boolean,
    required: true
  },
  // 弹窗标题
  title: {
    type: String,
    default: ''
  },
  // 标题前的图标 class（FontAwesome 类名）
  icon: {
    type: String,
    default: ''
  },
  // 是否全屏模式（用于思维导图等需要大空间的场景）
  fullScreen: {
    type: Boolean,
    default: false
  }
})

// ===== Computed =====
// 生成唯一的标题 ID（用于 ARIA）
const titleId = computed(() => {
  return `modal-title-${props.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`
})

// ===== Emits：这个组件会向父组件发出哪些事件 =====
// Vue 3 中子组件通过 emit 向父组件通信
const emit = defineEmits(['update:modelValue'])

// 关闭弹窗：通知父组件把 v-model 的值改为 false
const close = () => {
  emit('update:modelValue', false)
}

// ===== 焦点管理 =====
let previousFocusElement = null

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    // 保存当前焦点元素
    previousFocusElement = document.activeElement

    // 聚焦到关闭按钮（可访问性）
    nextTick(() => {
      const closeBtn = document.querySelector('.modal .close-btn')
      if (closeBtn) closeBtn.focus()
    })
  } else {
    // 恢复之前的焦点
    if (previousFocusElement && previousFocusElement.focus) {
      previousFocusElement.focus()
    }
  }
})

</script>

<style scoped>
/*
  scoped：这里的样式只作用于当前组件
  不会影响其他组件，也不会被其他组件的样式影响
*/

/* ===== 遮罩层 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  /* 等价于 top:0; right:0; bottom:0; left:0 */
  z-index: 1000;
  background: var(--overlay);
  display: flex;
  align-items: center;
  justify-content: center;

  /* 默认不可见 */
  opacity: 0;
  visibility: hidden;
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

/* active 状态：可见 */
.modal-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* ===== 弹窗主体 ===== */
.modal {
  position: relative;

  max-height: 92vh;
  /* 最高不超过视口的 92% */
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  /* header + body 上下排列 */
  overflow: hidden;
  box-shadow:
    0 4px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;

  /* 默认缩小+下移，配合 active 做弹出动画 */
  transform: scale(0.9) translateY(30px);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.modal-overlay.active .modal {
  transform: scale(1) translateY(0);
}

/* ===== 弹窗头部 ===== */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.modal-header h2 {
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-header h2 i {
  color: var(--accent);
  font-size: 1rem;
}

/* ===== 关闭按钮 ===== */
.close-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--muted);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  flex-shrink: 0;
}

.close-btn:hover {
  background: var(--danger);
  border-color: var(--danger);
  color: #fff;
}

/* ===== 内容区 ===== */
.modal-body {
  flex: 1;
  /* 占用剩余高度 */
  overflow-y: auto;
  /* 内容超出时可滚动 */
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  /* gap: 1.25rem; */
}

.modal-body.full-screen {
  padding: 0;
}

.modal-overlay.full-screen .modal {
  width: 100vw;
  height: 100vh;
  max-height: 100%;
  max-width: 100%;
  border-radius: 0;
}
</style>