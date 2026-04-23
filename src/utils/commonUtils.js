// ========== 工具函数 ==========

function formatTime(timestamp) {
    if (!timestamp) return ''
    const d = new Date(timestamp)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatFileSize(bytes) {
    if (!bytes) return '0 B'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function calcBase64Size(dataUrl) {
  const base64 = dataUrl.split(',')[1]
  if (!base64) return 0
  let bytes = base64.length * 3 / 4
  if (base64.endsWith('==')) bytes -= 2
  else if (base64.endsWith('=')) bytes -= 1
  return Math.round(bytes)
}

export {
    formatTime,
    formatFileSize,
    calcBase64Size
}