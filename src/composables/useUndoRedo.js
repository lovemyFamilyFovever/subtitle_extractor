import { ref } from 'vue'

/**
 * 撤销/重做组合式函数
 * 支持任意状态的撤销和重做操作
 */
export function useUndoRedo(maxHistory = 20) {
  // 历史记录栈
  const history = ref([])
  // 当前索引
  const currentIndex = ref(-1)

  /**
   * 添加新状态到历史
   * @param {*} state - 要保存的状态
   */
  const pushState = (state) => {
    // 如果当前不在历史末尾，删除后面的记录
    if (currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1)
    }

    // 添加新状态
    history.value.push(JSON.parse(JSON.stringify(state)))
    
    // 限制历史记录数量
    if (history.value.length > maxHistory) {
      history.value.shift()
    } else {
      currentIndex.value++
    }
  }

  /**
   * 撤销
   * @returns {*} 撤销后的状态，如果没有可撤销的返回 null
   */
  const undo = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
      return JSON.parse(JSON.stringify(history.value[currentIndex.value]))
    }
    return null
  }

  /**
   * 重做
   * @returns {*} 重做后的状态，如果没有可重做的返回 null
   */
  const redo = () => {
    if (currentIndex.value < history.value.length - 1) {
      currentIndex.value++
      return JSON.parse(JSON.stringify(history.value[currentIndex.value]))
    }
    return null
  }

  /**
   * 是否可以撤销
   */
  const canUndo = () => currentIndex.value > 0

  /**
   * 是否可以重做
   */
  const canRedo = () => currentIndex.value < history.value.length - 1

  /**
   * 清空历史
   */
  const clearHistory = () => {
    history.value = []
    currentIndex.value = -1
  }

  return {
    history,
    currentIndex,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory
  }
}
