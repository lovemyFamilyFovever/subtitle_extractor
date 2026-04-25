import { formatTime, formatFileSize } from '../utils/commonUtils'

const STORAGE_KEY = 'mindMapData'
let saveTimer = null

export function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null
    return JSON.parse(saved)
  } catch (e) {
    console.warn('[MindMap] localStorage 读取失败:', e)
    return null
  }
}

export function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.warn('[MindMap] localStorage 清除失败:', e)
  }
}

export function createMindMapPersistence({ getData, setData, buildSaveData }) {
  function saveToLocalStorage() {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      try {
        const data = getData()
        if (!data) return
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        console.log('[MindMap] 已自动缓存到 localStorage')
      } catch (e) {
        console.warn('[MindMap] 缓存失败:', e)
      }
    }, 500)
  }

  async function openLocalFile() {
    if (!('showOpenFilePicker' in window)) {
      console.warn('当前浏览器不支持 File System Access API，使用传统模式')
      return openLocalFileLegacy()
    }

    try {
      const fileHandles = await window.showOpenFilePicker({
        types: [
          {
            description: '思维导图文件',
            accept: {
              'application/json': ['.json'],
            }
          }
        ],
        excludeAcceptAllOption: false,
        multiple: true
      })

      if (!fileHandles || fileHandles.length === 0) return null

      const results = []
      for (let i = 0; i < fileHandles.length; i++) {
        const fileHandle = fileHandles[i]
        try {
          const file = await fileHandle.getFile()
          const content = await file.text()
          const data = JSON.parse(content)
          results.push({
            id: i,
            name: fileHandle.name,
            time: formatTime(file.lastModified),
            size: formatFileSize(file.size),
            _raw: {
              data,
              fileName: fileHandle.name,
              fileHandle,
              index: i,
              lastModified: file.lastModified,
              size: file.size,
            }
          })
        } catch (err) {
          console.error(`读取文件 ${fileHandle.name} 失败:`, err)
        }
      }
      return results.length > 0 ? results : null
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('打开文件失败:', err)
      }
      return null
    }
  }

  function openLocalFileLegacy() {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json,.smm'
      input.multiple = true
      input.onchange = async (e) => {
        const files = Array.from(e.target.files)
        if (!files.length) { resolve(null); return }

        const results = []
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          try {
            const content = await file.text()
            const data = JSON.parse(content)
            results.push({
              id: i,
              name: file.name,
              time: formatTime(file.lastModified),
              size: formatFileSize(file.size),
              _raw: {
                data,
                fileName: file.name,
                fileHandle: null,
                index: i,
                lastModified: file.lastModified,
                size: file.size,
              }
            })
          } catch (err) {
            console.error(`文件 ${file.name} 解析失败:`, err)
          }
        }
        resolve(results.length > 0 ? results : null)
      }
      input.click()
    })
  }

  function importFile() {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json,.smm'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (!file) { resolve(null); return }
        const reader = new FileReader()
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result)
            setData(data)
            resolve(data)
          } catch (err) {
            alert('文件解析失败')
            resolve(null)
          }
        }
        reader.readAsText(file)
      }
      input.click()
    })
  }

  function exportFile() {
    const saveData = buildSaveData()
    if (!saveData) return

    const d = new Date()
    const name = d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0') +
      String(d.getHours()).padStart(2, '0') +
      String(d.getMinutes()).padStart(2, '0') +
      String(d.getSeconds()).padStart(2, '0')

    const json = JSON.stringify(saveData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function saveToLocalFile(fileHandle) {
    if (!fileHandle) return false
    try {
      const saveData = buildSaveData()
      if (!saveData) return false
      const json = JSON.stringify(saveData, null, 2)
      const writable = await fileHandle.createWritable()
      await writable.write(json)
      await writable.close()
      return true
    } catch (err) {
      console.error('[MindMap] 保存失败:', err)
      return false
    }
  }

  return {
    saveToLocalStorage,
    openLocalFile,
    openLocalFileLegacy,
    importFile,
    exportFile,
    saveToLocalFile,
  }
}
