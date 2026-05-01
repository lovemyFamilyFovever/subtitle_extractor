import { ref } from 'vue'

export function useMindMapFileManager({ openLocalFile, setData, getData, saveToLocalFile }) {
  const fileList = ref([])
  const currentFileIndex = ref(-1)

  async function openFileList(openPanel) {
    const files = await openLocalFile()
    if (!files || files.length === 0) return
    fileList.value = files
    currentFileIndex.value = -1
    openPanel?.('filelist')
  }

  function handleLoadFile(file) {
    if (file._raw?.data) {
      setData(file._raw.data)
      // 加载新文件后清空撤销历史，防止上一个文件的 undo 栈混入
      if (window.mindMapInstance?.command?.clearHistory) {
        window.mindMapInstance.command.clearHistory()
      }
      currentFileIndex.value = file.id
    }
  }

  async function handleAddFiles() {
    const newFiles = await openLocalFile()
    if (!newFiles || newFiles.length === 0) return

    const existingNames = new Set(fileList.value.map((f) => f.name))
    const duplicates = newFiles.filter((file) => existingNames.has(file.name))

    if (duplicates.length > 0) {
      const names = duplicates.map((file) => file.name).join('、')
      const confirmed = confirm(`以下文件已存在：\n${names}\n\n是否覆盖？\n\n点"确定"覆盖，点"取消"跳过重复文件。`)
      if (!confirmed) {
        const nonDuplicates = newFiles.filter((file) => !existingNames.has(file.name))
        if (nonDuplicates.length === 0) return
        appendFiles(nonDuplicates)
        return
      }
      const newNames = new Set(newFiles.map((file) => file.name))
      fileList.value = fileList.value.filter((file) => !newNames.has(file.name))
    }

    appendFiles(newFiles)
  }

  function appendFiles(files) {
    const maxId = fileList.value.reduce((max, file) => Math.max(max, file.id), -1)
    const offset = maxId + 1
    const formatted = files.map((file, index) => ({
      id: offset + index,
      name: file.name,
      time: file.time,
      size: file.size,
      _raw: file._raw,
    }))
    fileList.value = [...fileList.value, ...formatted]
  }

  function handleRemoveFile(id) {
    fileList.value = fileList.value.filter((file) => file.id !== id)
    if (currentFileIndex.value === id) {
      currentFileIndex.value = -1
    }
  }

  function getCurrentFileHandle() {
    if (currentFileIndex.value < 0) return null
    const file = fileList.value.find((item) => item.id === currentFileIndex.value)
    return file?._raw?.fileHandle || null
  }

  async function handleSave() {
    const fileHandle = getCurrentFileHandle()
    if (!fileHandle) {
      const data = getData()
      if (!data) return
      const saveData = {
        data: data.data,
        children: data.children || [],
        customBackground: data.customBackground || null,
      }
      const json = JSON.stringify(saveData, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = generateSafeFileName('json')
      a.click()
      URL.revokeObjectURL(url)
      return
    }

    const success = await saveToLocalFile(fileHandle)
    if (success) {
      console.log('保存成功')
    }
  }

  function generateSafeFileName(ext = 'json') {
    const d = new Date()
    const pad = (n, len = 2) => String(n).padStart(len, '0')
    return `思维导图_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.${ext}`
  }

  return {
    fileList,
    currentFileIndex,
    openFileList,
    handleLoadFile,
    handleAddFiles,
    handleRemoveFile,
    handleSave,
    getCurrentFileHandle,
  }
}
