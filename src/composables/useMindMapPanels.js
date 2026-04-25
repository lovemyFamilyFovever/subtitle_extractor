import { ref, computed, watch } from 'vue'

export function useMindMapPanels(activeNodes) {
  const activePanel = ref(null)

  const showThemePanel = computed(() => activePanel.value === 'theme')
  const showStructure = computed(() => activePanel.value === 'structure')
  const showOutline = computed(() => activePanel.value === 'outline')
  const showBaseStyle = computed(() => activePanel.value === 'basestyle')
  const showNodeStyle = computed(() => activePanel.value === 'node' && activeNodes.value.length > 0)
  const showFileList = computed(() => activePanel.value === 'filelist')

  function openPanel(name) {
    activePanel.value = name
  }

  function closePanel() {
    activePanel.value = null
  }

  function togglePanel(name) {
    activePanel.value = activePanel.value === name ? null : name
  }

  function handleToggleTheme() {
    togglePanel('theme')
  }

  function handleToggleLayout() {
    togglePanel('structure')
  }

  function handleToggleOutline() {
    togglePanel('outline')
  }

  function handleToggleBaseStyle() {
    togglePanel('basestyle')
  }

  watch(activeNodes, (nodes, prevNodes) => {
    const current = activePanel.value
    if (nodes.length > 0) {
      openPanel('node')
      return
    }
    if (current === 'node') {
      closePanel()
    }
  })

  return {
    activePanel,
    showThemePanel,
    showStructure,
    showOutline,
    showBaseStyle,
    showNodeStyle,
    showFileList,
    openPanel,
    closePanel,
    togglePanel,
    handleToggleTheme,
    handleToggleLayout,
    handleToggleOutline,
    handleToggleBaseStyle,
  }
}
