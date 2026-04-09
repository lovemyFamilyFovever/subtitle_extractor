/**
 * 图片处理工具函数
 * 提供图片压缩、Base64转换、URL验证等功能
 */

/**
 * 将 File 对象转换为 Base64
 * @param {File} file - 图片文件
 * @returns {Promise<string>} Base64 字符串
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 压缩图片
 * @param {File} file - 原始图片文件
 * @param {Object} options - 压缩选项
 * @param {number} options.maxWidth - 最大宽度（默认 1920）
 * @param {number} options.maxHeight - 最大高度（默认 1080）
 * @param {number} options.quality - 压缩质量 0-1（默认 0.8）
 * @param {string} options.format - 输出格式 'image/jpeg' | 'image/png' | 'image/webp'（默认 'image/jpeg'）
 * @returns {Promise<string>} 压缩后的 Base64 字符串
 */
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'image/jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // 计算缩放后的尺寸
      let width = img.width
      let height = img.height

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }

      // 创建 Canvas 进行压缩
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // 转换为 Base64
      const base64 = canvas.toDataURL(format, quality)
      resolve(base64)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败'))
    }

    img.src = url
  })
}

/**
 * 获取文件大小信息
 * @param {string} base64 - Base64 字符串
 * @returns {Object} 包含字节数和 KB 数
 */
export const getBase64Size = (base64) => {
  // Base64 大小估算：(字符串长度 * 3) / 4
  const bytes = Math.ceil((base64.length * 3) / 4)
  return {
    bytes,
    kb: (bytes / 1024).toFixed(2)
  }
}

/**
 * 验证图片 URL
 * @param {string} url - 图片 URL
 * @returns {boolean} 是否有效
 */
export const isValidImageUrl = (url) => {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * 从 URL 加载图片并转换为 Base64
 * @param {string} url - 图片 URL
 * @param {Object} options - 压缩选项（同 compressImage）
 * @returns {Promise<string>} Base64 字符串
 */
export const imageUrlToBase64 = async (url, options = {}) => {
  if (!isValidImageUrl(url)) {
    throw new Error('无效的图片 URL')
  }

  try {
    // 尝试使用 fetch 加载（可能因 CORS 失败）
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const blob = await response.blob()
    
    if (!blob.type.startsWith('image/')) {
      throw new Error('URL 返回的不是图片文件')
    }
    
    const file = new File([blob], 'image.jpg', { type: blob.type })
    return await compressImage(file, options)
  } catch (error) {
    // 如果 fetch 失败，尝试使用 Image + Canvas 方式
    console.warn('Fetch 方式失败，尝试 Image 方式:', error.message)
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          
          const base64 = canvas.toDataURL(options.format || 'image/jpeg', options.quality || 0.8)
          resolve(base64)
        } catch (err) {
          reject(new Error(`Canvas 转换失败: ${err.message}`))
        }
      }
      
      img.onerror = () => {
        reject(new Error(
          '无法加载图片。可能原因：\n' +
          '1. URL 地址不正确\n' +
          '2. 图片服务器禁止跨域访问（CORS）\n' +
          '3. 网络连接失败\n\n' +
          '建议：尝试下载图片后使用"本地上传"方式插入'
        ))
      }
      
      img.src = url
    })
  }
}

/**
 * 根据目标大小自动选择压缩参数
 * @param {File} file - 原始图片文件
 * @param {number} targetSizeKB - 目标大小（KB，默认 500）
 * @returns {Promise<string>} 压缩后的 Base64 字符串
 */
export const compressToTargetSize = async (file, targetSizeKB = 500) => {
  let quality = 0.8
  let maxWidth = 1920
  let attempts = 0
  const maxAttempts = 5

  while (attempts < maxAttempts) {
    const base64 = await compressImage(file, {
      quality,
      maxWidth,
      maxHeight: Math.floor(maxWidth * 0.75) // 保持 4:3 比例
    })

    const size = getBase64Size(base64)
    const sizeKB = parseFloat(size.kb)

    if (sizeKB <= targetSizeKB) {
      return base64
    }

    // 如果太大，降低质量和尺寸
    quality *= 0.7
    maxWidth = Math.floor(maxWidth * 0.8)
    attempts++
  }

  // 如果多次尝试后仍然太大，返回最后一次结果
  return await compressImage(file, {
    quality: 0.5,
    maxWidth: 800,
    maxHeight: 600
  })
}
