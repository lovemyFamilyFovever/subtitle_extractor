// =============================================
// useToast.js —— Toast 通知逻辑
//
// "composable" 是 Vue 3 的模式：
// 把可复用的响应式逻辑封装成函数，在任何组件里调用
// 相当于 Vue 2 的 mixin，但更清晰、无命名冲突
// =============================================

import { ref } from 'vue'

// Toast 列表，存放所有正在显示的通知
// 用 ref 包裹，这样模板可以响应式地渲染它
const toasts = ref([])

// 全局唯一 id 计数器
let idCounter = 0

/**
 * 显示一条 Toast 通知
 * @param {string} message - 提示文字
 * @param {'info'|'success'|'error'} type - 类型
 * @param {number} duration - 显示时长（毫秒）
 */
const showToast = (message, type = 'info', duration = 2500) => {
  const id = ++idCounter

  // 把新 toast 加入列表
  toasts.value.push({ id, message, type, leaving: false })

  // 到时间后：先加 leaving 类（触发淡出动画），再移除
  setTimeout(() => {
    const toast = toasts.value.find(t => t.id === id)
    if (toast) toast.leaving = true           // 触发淡出

    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id) // 移除
    }, 300)
  }, duration)
}

/**
 * useToast —— 在组件里调用这个函数来使用 Toast 功能
 *
 * 用法：
 *   const { toasts, showToast } = useToast()
 *   showToast('保存成功', 'success')
 */
export function useToast() {
  return { toasts, showToast }
}