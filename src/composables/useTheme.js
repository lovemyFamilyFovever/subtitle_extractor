import { ref, onMounted } from 'vue'

const THEME_KEY = 'subtitle-extractor-theme'

// 当前主题状态
const currentTheme = ref('dark')

/**
 * 主题切换组合式函数
 * 支持暗色/亮色主题切换，持久化到 localStorage
 */
export function useTheme() {
  // 初始化主题（在组件挂载时调用）
  const initTheme = () => {
    const savedTheme = localStorage.getItem(THEME_KEY)
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      currentTheme.value = savedTheme
    } else {
      currentTheme.value = 'dark' // 默认暗色主题
    }
    applyTheme(currentTheme.value)
  }

  // 应用主题到 DOM
  const applyTheme = (theme) => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  // 切换主题
  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
    applyTheme(currentTheme.value)
    localStorage.setItem(THEME_KEY, currentTheme.value)
  }

  // 判断是否为亮色主题
  const isLight = () => currentTheme.value === 'light'

  // 获取当前主题
  const getTheme = () => currentTheme.value

  return {
    currentTheme,
    initTheme,
    toggleTheme,
    isLight,
    getTheme
  }
}
