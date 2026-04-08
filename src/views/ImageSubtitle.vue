<template>
  <div class="app-layout">

    <!-- ==================== 左栏：图片预览 + Canvas ==================== -->
    <div class="app-left">

      <!-- Canvas 预览舞台（包含上传区） -->

      <!-- 上传区域：仿照视频模块设计 -->
      <div class="upload-zone" :class="{ 'drag-over': isDragOver, 'has-images': images.length > 0 }"
        @click="fileInput.click()" @dragover.prevent="isDragOver = true" @dragleave.prevent="isDragOver = false"
        @drop.prevent="onDrop">

        <i class="fa-solid fa-image upload-icon"></i>
        <p class="upload-text">
          {{ images.length > 0 ? '点击或拖拽新图片到此处' : '点击或拖拽图片到此处' }}
        </p>
        <p class="upload-hint" v-if="images.length === 0">
          支持 JPG / PNG / WEBP 等常见格式
        </p>

        <!-- 隐藏的文件选择框，支持多选 -->
        <input ref="fileInput" type="file" accept="image/*" multiple class="hidden-input" @change="onFileChange" />
      </div>

      <!-- Canvas：仅在有图片时显示 -->
      <div class="canvas-container">
        <canvas v-show="images.length > 0" ref="canvas" class="preview-canvas" @mousedown="onMouseDown"
          @mousemove="onMouseMove" @mouseup="onMouseUp" @mouseleave="onMouseUp" @touchstart.prevent="onTouchStart"
          @touchmove.prevent="onTouchMove" @touchend="onMouseUp"></canvas>
      </div>

      <!-- 图片导航栏 -->
      <div v-if="images.length > 0" class="nav-bar">
        <button class="btn" @click="goPrev">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <span class="nav-info">
          {{ currentIndex + 1 }} / {{ images.length }}
        </span>
        <button class="btn" @click="goNext">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
        <div class="cover-btn-container">
          <button class="btn cover-btn" :class="{ 'cover-active': coverMode !== 'auto' || customCoverImage !== null }"
            @click="toggleCoverOptions" :disabled="images.length == 0" title="设置封面">
            <i class="fa-solid fa-image"></i>
            {{ customCoverImage ? '本地封面' : coverMode === 'current' ? '当前封面' : '封面设置' }}
          </button>

          <div v-if="showCoverOptions" class="cover-options">
            <button class="btn" @click="setCoverFromCurrentImage" :disabled="images.length == 0">当前封面</button>
            <button class="btn" @click="coverFileInput.click()" :disabled="images.length == 0">本地封面</button>
            <button class="btn" @click="clearCoverFrame" :disabled="images.length == 0">
              <i class="fa-solid fa-rotate-left"></i> 自动封面
            </button>
            <input ref="coverFileInput" type="file" accept="image/*" @change="onCoverFileChange" class="hidden-input" />
          </div>
        </div>
        <button class="btn btn-danger" @click="deleteCurrentImage" :disabled="images.length == 0">
          <i class="fa-solid fa-trash"></i> 删除
        </button>

        <!-- 清空 -->
        <button class="btn  btn-primary" @click="clearImages" :disabled="images.length == 0">
          <i class="fa-solid fa-trash-alt"></i> 清空
        </button>
      </div>

      <!-- 图片信息栏 -->
      <div v-if="images.length > 0" class="info-bar">
        <span class="nav-filename">{{ images[currentIndex]?.name }}</span>
        <span><i class="fa-solid fa-expand"></i> {{ images[currentIndex]?.width }} × {{ images[currentIndex]?.height
        }}</span>
        <span><i class="fa-solid fa-weight-hanging"></i> {{ formatBytes(images[currentIndex]?.size) }}</span>
      </div>

    </div>

    <!-- ==================== 中栏：设置 ==================== -->
    <div class="app-middle">

      <!-- 裁剪比例精确输入 -->
      <div class="settings-panel">

        <div class="panel-title">
          <i class="fa-solid fa-sliders"></i> 拼接设置
          <span class="panel-hint">输入框支持滚轮和键盘上下键调整</span>
        </div>

        <div class="setting-item">
          <label class="form-label">
            <span class="line-dot" style="background:#ef4444;display:inline-block"></span>
            红线位置（字幕上边界）
          </label>
          <SliderInput :model-value="Math.round(topCutRatio * 100)" label="" unit="%" :min="0" :max="98"
            @update:model-value="val => topCutRatio = val / 100" />
        </div>

        <div class="setting-item">
          <label class="form-label">
            <span class="line-dot" style="background:#3b82f6;display:inline-block"></span>
            蓝线位置（字幕下边界）
          </label>
          <SliderInput :model-value="Math.round(bottomCutRatio * 100)" label="" unit="%" :min="2" :max="100"
            @update:model-value="val => bottomCutRatio = val / 100" />
        </div>

        <!-- 输出格式 -->
        <div class="setting-item">
          <label class="form-label">输出格式</label>
          <div class="seg-control">
            <button v-for="fmt in ['png', 'jpeg', 'webp']" :key="fmt" class="seg-btn"
              :class="{ active: format === fmt }" @click="format = fmt">{{ fmt.toUpperCase() }}</button>
          </div>
        </div>

        <!-- 压缩选项 -->
        <div class="setting-item">
          <label class="form-label">
            <label class="form-label" style="display: inline;">图片压缩</label>
            <span v-if="format === 'png'" class="form-hint">（PNG 无损，此项无效）</span>
          </label>
          <div class="seg-control">
            <button v-for="opt in compressionOptions" :key="opt.value" class="seg-btn"
              :class="{ active: compression === opt.value }" :disabled="format === 'png'"
              @click="compression = opt.value">{{ opt.label }}</button>
          </div>
        </div>

        <!-- 生成按钮 -->
        <div class="action-row">
          <button class="btn btn-primary btn-block" :disabled="images.length === 0 || isGenerating" @click="generate">
            <i class="fa-solid" :class="isGenerating ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'"></i>
            {{ isGenerating ? '生成中...' : '生成长拼接图' }}
          </button>
        </div>

      </div>

    </div>


    <!-- ==================== 右栏：设置 ==================== -->

    <!-- 结果预览区（生成后显示） -->
    <div v-if="resultCanvas" class="app-right result-section">
      <div class="result-header">
        <i class="fa-solid fa-check-circle" style="color:var(--accent)"></i>
        拼接完成 · {{ resultWidth }} × {{ resultHeight }} px
      </div>
      <div class="result-canvas-container">
        <canvas ref="resultCanvasEl" class="result-canvas"></canvas>
      </div>
      <div class="result-actions">
        <button class="btn btn-primary" @click="saveResult(format)">
          <i class="fa-solid fa-download"></i> 保存 {{ format.toUpperCase() }}
        </button>
      </div>
    </div>


  </div>
</template>

<script setup>
// =============================================
// ImageSubtitle.vue —— 图片截取字幕
// 核心：Canvas 上的红/蓝裁剪线拖拽交互
// =============================================

import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import SliderInput from '../components/SliderInput.vue'
import { useToast } from '../composables/useToast.js'

const { showToast } = useToast()

// ==================== DOM 引用 ====================
const fileInput = ref(null)  // 文件选择框
const canvas = ref(null)  // 预览 Canvas
const resultCanvasEl = ref(null) // 结果展示 Canvas

// ==================== 图片状态 ====================
const images = ref([])   // [{ id, name, size, width, height, url, img }]
const currentIndex = ref(0)    // 当前预览的图片索引

// ==================== 封面设置 ====================
const coverMode = ref('auto') // auto | current | custom
const coverImageIndex = ref(null)
const showCoverOptions = ref(false)
const customCoverImage = ref(null)
const coverFileInput = ref(null)

// ==================== 拖拽状态 ====================
const isDragOver = ref(false)

// ==================== 裁剪线状态 ====================
const topCutRatio = ref(0.75) // 红线位置（比例 0~1）
const bottomCutRatio = ref(0.92) // 蓝线位置（比例 0~1）
const dragging = ref(null) // 'top' | 'bottom' | null

// ==================== 其他设置 ====================
const spacing = ref(0)     // 拼接间距
const format = ref('png') // 输出格式
const compressionOptions = [
  { label: '不压缩', value: 1.0 },
  { label: '2x 压缩', value: 0.5 },
  { label: '4x 压缩', value: 0.25 },
  { label: '8x 压缩', value: 0.125 }
]
const compression = ref(1) // 压缩级别: 1(不压缩), 2, 4, 8

// ==================== 结果状态 ====================
const resultCanvas = ref(null)  // 生成的 Canvas 对象（非 DOM）
const resultWidth = ref(0)
const resultHeight = ref(0)
const isGenerating = ref(false)

// ==================== 状态提示 ====================
const statusMsg = ref('')
const statusType = ref('')

const setStatus = (msg, type = '') => {
  statusMsg.value = msg
  statusType.value = type
}
// ==================== 工具函数 ====================

const formatBytes = (bytes) => {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

// ==================== 文件处理 ====================

const onDrop = (e) => {
  isDragOver.value = false
  const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
  if (files.length > 0) {
    addFiles(files)
  }
}

const onFileChange = async (e) => {
  const files = Array.from(e.target.files)
  if (files.length > 0) {
    await addFiles(files)
  }
  e.target.value = ''
}

const addFiles = async (files) => {
  const newItems = await Promise.all(
    files.map(file => new Promise(resolve => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => resolve({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        width: img.naturalWidth,
        height: img.naturalHeight,
        url,
        img
      })
      img.src = url
    }))
  )
  images.value.push(...newItems)
  // 加载完第一批图片后，自动跳到第一张
  if (images.value.length === newItems.length) currentIndex.value = 0
  setStatus(`已加载 ${images.value.length} 张图片`, 'success')
  showToast(`已添加 ${newItems.length} 张图片`, 'success')
  // 等 DOM 更新后重绘 Canvas
  await nextTick()
  drawCanvas()
}

const clearAll = () => {
  images.value.forEach(item => URL.revokeObjectURL(item.url))
  images.value = []
  currentIndex.value = 0
  resultCanvas.value = null
  clearCoverFrame()
  setStatus('已清空所有图片')
  clearCanvas()
}

// ==================== 导航 ====================

const goPrev = () => {
  if (images.value.length === 0) return
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length
}

const goNext = () => {
  if (images.value.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % images.value.length
}


const toggleCoverOptions = () => {
  showCoverOptions.value = !showCoverOptions.value
}

const setCoverFromCurrentImage = () => {
  if (images.value.length === 0) return
  coverMode.value = 'current'
  coverImageIndex.value = currentIndex.value
  customCoverImage.value = null
  showCoverOptions.value = false
  showToast('已将当前图片设为封面', 'success')
}

const onCoverFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const img = new Image()
  img.onload = () => {
    customCoverImage.value = img
    coverMode.value = 'custom'
    coverImageIndex.value = null
    showCoverOptions.value = false
    showToast('自定义封面已设置', 'success')
  }
  img.src = URL.createObjectURL(file)
  e.target.value = ''
}

const clearCoverFrame = () => {
  coverMode.value = 'auto'
  coverImageIndex.value = null
  customCoverImage.value = null
  showCoverOptions.value = false
  showToast('已恢复自动封面', 'success')
}

const deleteCurrentImage = () => {
  const index = currentIndex.value
  images.value.splice(index, 1)

  if (coverMode.value === 'current' && coverImageIndex.value !== null) {
    if (coverImageIndex.value === index) {
      clearCoverFrame()
    } else if (coverImageIndex.value > index) {
      coverImageIndex.value--
    }
  }

  if (images.value.length === 0) {
    currentIndex.value = 0
  } else if (index >= images.value.length) {
    // 如果删除的是最后一项，则索引向前移动一位
    currentIndex.value = images.value.length - 1
  }
  // 否则 currentIndex 保持不变，因为后面的项目前移了

  setStatus(`已删除第 ${index + 1} 张图片`)
  showToast(`已删除第 ${index + 1} 张图片`, 'success')
}


const clearImages = () => {
  clearAll()
  if (images.value.length > 0) {
    showToast('已清空所有图片', 'success')
  }
}

// ==================== Canvas 绘制 ====================

/**
 * 核心绘制函数：把当前图片 + 两条裁剪线画到 Canvas 上
 * 每次切换图片、移动裁剪线、修改设置都会调用
 */
const drawCanvas = () => {
  const cvs = canvas.value
  if (!cvs || images.value.length === 0) return

  const item = images.value[currentIndex.value]
  if (!item) return

  const img = item.img

  // ---- 计算 Canvas 的显示尺寸 ----
  // Canvas 实际像素 = 图片原始像素（1:1 保真）
  // 但显示时用 CSS 限制最大宽度（在 style scoped 里设置）
  const displayW = img.naturalWidth
  const displayH = img.naturalHeight

  cvs.width = displayW
  cvs.height = displayH

  const ctx = cvs.getContext('2d')

  // 绘制图片
  ctx.drawImage(img, 0, 0, displayW, displayH)

  // ---- 绘制两条裁剪线 ----
  const topY = Math.round(topCutRatio.value * displayH)
  const bottomY = Math.round(bottomCutRatio.value * displayH)

  // 半透明遮罩：让裁剪区域外稍暗，更直观
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fillRect(0, 0, displayW, topY)              // 红线以上（被裁掉的部分）
  // 蓝线以下不加遮罩，保持原色（全图保留的 bottomCutRatio 以下部分很少）

  // ---- 红线（上边界） ----
  ctx.save()
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = Math.max(2, displayH * 0.003)  // 线宽自适应图片尺寸
  ctx.setLineDash([12, 8])
  ctx.beginPath()
  ctx.moveTo(0, topY)
  ctx.lineTo(displayW, topY)
  ctx.stroke()

  // 红线标签
  ctx.fillStyle = '#ef4444'
  ctx.font = `bold ${Math.max(12, displayH * 0.018)}px system-ui`
  ctx.fillText('▲ 上边界' + Math.round(topCutRatio.value * 100) + '%', 8, topY - 6)

  ctx.restore()

  // ---- 蓝线（下边界） ----
  ctx.save()
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = Math.max(2, displayH * 0.003)
  ctx.setLineDash([12, 8])
  ctx.beginPath()
  ctx.moveTo(0, bottomY)
  ctx.lineTo(displayW, bottomY)
  ctx.stroke()

  // 蓝线标签
  ctx.fillStyle = '#3b82f6'
  ctx.font = `bold ${Math.max(12, displayH * 0.018)}px system-ui`
  ctx.fillText('▼ 下边界' + Math.round(bottomCutRatio.value * 100) + '%', 8, bottomY + Math.max(16, displayH * 0.022))

  ctx.restore()
}

/** 清空 Canvas */
const clearCanvas = () => {
  const cvs = canvas.value
  if (!cvs) return
  const ctx = cvs.getContext('2d')
  ctx.clearRect(0, 0, cvs.width, cvs.height)
  cvs.width = 0
  cvs.height = 0
}

// ==================== 鼠标交互（裁剪线拖拽） ====================

/**
 * 把鼠标/触摸事件的客户端坐标转为 Canvas 内的比例值
 * 因为 Canvas 的 CSS 显示尺寸可能和 width/height 属性不同
 * 必须用 getBoundingClientRect 换算
 */
const getCanvasRatio = (clientY) => {
  const cvs = canvas.value
  const rect = cvs.getBoundingClientRect()
  // 把像素坐标转成 0~1 的比例
  return (clientY - rect.top) / rect.height
}

/**
 * 鼠标按下：判断点击的是哪条线
 * 判断规则：点击位置到某条线的距离 < 阈值（5%）
 */
const onMouseDown = (e) => {
  if (images.value.length === 0) return
  const ratio = getCanvasRatio(e.clientY)

  if (Math.abs(ratio - topCutRatio.value) < 0.05) dragging.value = 'top'
  else if (Math.abs(ratio - bottomCutRatio.value) < 0.05) dragging.value = 'bottom'
}

/**
 * 鼠标移动：更新被拖拽的线的位置
 */
const onMouseMove = (e) => {
  if (!dragging.value || images.value.length === 0) return

  // 限制在 2%~98% 范围内，避免线条跑到图片边缘外
  const ratio = Math.min(0.98, Math.max(0.02, getCanvasRatio(e.clientY)))

  if (dragging.value === 'top') {
    // 红线不能超过蓝线（保持 2% 间距）
    if (ratio < bottomCutRatio.value - 0.02) topCutRatio.value = ratio
  } else {
    // 蓝线不能低于红线
    if (ratio > topCutRatio.value + 0.02) bottomCutRatio.value = ratio
  }
  // ratio 变化 → watch 触发 → drawCanvas
}

/** 鼠标释放：停止拖拽 */
const onMouseUp = () => { dragging.value = null }

// ---- 触摸事件（移动端支持） ----
const onTouchStart = (e) => {
  if (e.touches.length === 1) onMouseDown({ clientY: e.touches[0].clientY })
}
const onTouchMove = (e) => {
  if (e.touches.length === 1) onMouseMove({ clientY: e.touches[0].clientY })
}

// ==================== Watch：数据变化 → 重绘 ====================

// 监听所有会影响 Canvas 显示的数据
watch([currentIndex, topCutRatio, bottomCutRatio], () => {
  nextTick(drawCanvas)
})

// images 数组变化时也要重绘
watch(images, () => {
  nextTick(drawCanvas)
}, { deep: true })

// ==================== 裁剪工具函数 ====================

/**
 * 从图片中裁剪指定区域，返回 Canvas
 */
const cropImage = (img, y, height) => {
  const cvs = document.createElement('canvas')
  cvs.width = img.naturalWidth
  cvs.height = height
  cvs.getContext('2d').drawImage(
    img,
    0, y,                       // 源图片的起始坐标
    img.naturalWidth, height,   // 源图片的裁剪尺寸
    0, 0,                       // 目标 Canvas 的起始坐标
    img.naturalWidth, height    // 目标 Canvas 的绘制尺寸
  )
  return cvs
}

/**
 * 垂直拼接多个 Canvas
 */
const stitchVertically = (canvases, gap, bgColor) => {
  const maxW = Math.max(...canvases.map(c => c.width))
  const totalH = canvases.reduce((sum, c) => sum + c.height, 0) + gap * (canvases.length - 1)

  const result = document.createElement('canvas')
  result.width = maxW
  result.height = totalH

  const ctx = result.getContext('2d')
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, maxW, totalH)

  let y = 0
  canvases.forEach((c, i) => {
    const offsetX = Math.floor((maxW - c.width) / 2) // 居中对齐
    ctx.drawImage(c, offsetX, y)
    y += c.height
    if (i < canvases.length - 1) y += gap
  })

  return result
}

// ==================== 生成拼接图 ====================

const generate = async () => {
  if (images.value.length === 0) return

  isGenerating.value = true
  setStatus('生成中...', 'processing')

  try {
    const croppedList = []

    // 先处理封面
    if (coverMode.value === 'custom' && customCoverImage.value) {
      setStatus('处理自定义封面...', 'processing')
      const item = images.value[0] // 使用第一张图片的尺寸作为参考
      const canvas = document.createElement('canvas')
      canvas.width = item.width
      canvas.height = Math.round(item.height * topCutRatio.value)
      const ctx = canvas.getContext('2d')
      // 等比例缩放图片以适应宽度，裁剪高度
      const scale = item.width / customCoverImage.value.naturalWidth
      const scaledHeight = customCoverImage.value.naturalHeight * scale
      ctx.drawImage(customCoverImage.value, 0, 0, item.width, Math.min(scaledHeight, canvas.height))
      croppedList.push(canvas)
    } else if (coverMode.value === 'current' && coverImageIndex.value !== null && images.value[coverImageIndex.value]) {
      const item = images.value[coverImageIndex.value]
      const cropH = Math.round(item.height * topCutRatio.value)
      if (cropH > 0) {
        croppedList.push(cropImage(item.img, 0, cropH))
      }
    }

    if (coverMode.value === 'auto') {
      for (let i = 0; i < images.value.length; i++) {
        const { img, height } = images.value[i]

        if (i === 0) {
          // 第一张：从顶部 (0) 裁到蓝线
          const cropH = Math.round(height * bottomCutRatio.value)
          croppedList.push(cropImage(img, 0, cropH))
        } else {
          // 后续张：从红线裁到蓝线
          const cropY = Math.round(height * topCutRatio.value)
          const cropH = Math.round(height * bottomCutRatio.value) - cropY
          if (cropH <= 0) continue
          croppedList.push(cropImage(img, cropY, cropH))
        }
      }
    } else {
      for (let i = 0; i < images.value.length; i++) {
        const { img, height } = images.value[i]
        const cropY = Math.round(height * topCutRatio.value)
        const cropH = Math.round(height * bottomCutRatio.value) - cropY
        if (cropH <= 0) continue
        croppedList.push(cropImage(img, cropY, cropH))
      }
    }

    // 垂直拼接所有裁剪后的图片
    const result = stitchVertically(croppedList, spacing.value, '#ffffff')

    // 把结果画到结果 Canvas（DOM 元素）
    resultCanvas.value = result
    resultWidth.value = result.width
    resultHeight.value = result.height

    // nextTick 等 resultCanvasEl 出现在 DOM 后再操作
    await nextTick()
    if (resultCanvasEl.value) {
      resultCanvasEl.value.width = result.width
      resultCanvasEl.value.height = result.height
      resultCanvasEl.value.getContext('2d').drawImage(result, 0, 0)

      // 平滑滚动到结果区
      resultCanvasEl.value.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    setStatus(`拼接完成！${result.width} × ${result.height} px`, 'success')
    showToast('字幕拼接完成', 'success')
  } catch (err) {
    console.error(err)
    const errorMsg = err.message || '未知错误'
    setStatus('生成失败：' + errorMsg, 'error')
    showToast('字幕拼接失败：' + errorMsg + '，请检查图片后重试', 'error')
  } finally {
    isGenerating.value = false
  }
}

// ==================== 保存结果 ====================

const saveResult = (fmt) => {
  if (!resultCanvas.value) return

  let mimeType = 'image/png'
  let fileExt = 'png'

  if (fmt === 'jpeg') {
    mimeType = 'image/jpeg'
    fileExt = 'jpg'
  } else if (fmt === 'webp') {
    mimeType = 'image/webp'
    fileExt = 'webp'
  }

  // 处理压缩
  let exportCanvas = resultCanvas.value
  if (compression.value > 1) {
    const scale = 1 / compression.value
    const compressedCanvas = document.createElement('canvas')
    compressedCanvas.width = Math.round(resultCanvas.value.width * scale)
    compressedCanvas.height = Math.round(resultCanvas.value.height * scale)
    const ctx = compressedCanvas.getContext('2d')
    ctx.drawImage(resultCanvas.value, 0, 0, compressedCanvas.width, compressedCanvas.height)
    exportCanvas = compressedCanvas
  }

  exportCanvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subtitles_${Date.now()}.${fileExt}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, mimeType, compression.value)
}

// ==================== 生命周期 ====================

onUnmounted(() => {
  // 释放所有 ObjectURL
  images.value.forEach(item => URL.revokeObjectURL(item.url))
})
</script>

<style scoped>
/* ===== 两栏布局 ===== */
.app-layout {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

/* 左栏 */
.app-left {
  flex: 1 1 auto;
  /* 关键：让左侧占据剩余空间，但不会被压缩 */
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  width: 700px;
  /* 最小宽度保证可用性 */
}

/* 中栏 */
.app-middle {
  width: 335px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}


/* ===== 裁剪线指示点 ===== */
.line-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}

.line-dot-red {
  background: #ef4444;
}

.line-dot-blue {
  background: #3b82f6;
}


/* 右栏 */
.app-right {
  width: 335px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ===== Canvas 容器 ===== */
.canvas-stage {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  /* 防止 Canvas 超出圆角 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  gap: 0;
}

/* ===== 上传区域 (仿照 VideoSubtitle.vue) ===== */
.upload-zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 1.25rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  background: var(--bg);
}

.upload-zone::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent-dim);
  opacity: 0;
  transition: opacity 0.3s;
}

.upload-zone:hover,
.upload-zone.drag-over {
  border-color: var(--accent);
}

.upload-zone:hover::before,
.upload-zone.drag-over::before {
  opacity: 1;
}

.upload-icon {
  position: relative;
  font-size: 1.75rem;
  color: var(--accent);
  display: block;
  margin-bottom: 0.4rem;
}

.upload-text {
  position: relative;
  font-size: 0.9rem;
  font-weight: 600;
}

.upload-hint {
  position: relative;
  font-size: 0.75rem;
  color: var(--muted);
  margin-top: 0.2rem;
}

/* 有图片时：隐藏 icon 和 hint，只保留 text，缩小 padding */
.upload-zone.has-images .upload-icon {
  display: none;
}

.upload-zone.has-images .upload-hint {
  display: none;
}

.upload-zone.has-images {
  padding: 0.6rem 1rem;
  border-style: solid;
  border-width: 1px;
}

/* 隐藏文件输入 */
.hidden-input {
  display: none;
}

/*
  Canvas 本身：
  - width:100% 让它自适应容器宽度（CSS 层面）
  - 但 canvas.width/height 属性保持原始图片分辨率（JS 层面设置）
  - 这样既保持清晰度，又不超出弹窗宽度
  - cursor:ns-resize 提示用户可以上下拖拽
*/



.canvas-container {
  position: relative;
  background: #000;
  border-radius: var(--radius);
  overflow: hidden;
  line-height: 0;
}

.preview-canvas {
  width: 100%;
  height: auto;
  max-height: 55vh;
  object-fit: contain;
  cursor: ns-resize;
  display: block;
  user-select: none;
}

/* ===== 导航栏 ===== */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.cover-btn-container {
  position: relative;
}

.cover-options {
  position: absolute;
  top: -60px;
  left: 0;
  display: flex;
  gap: 0.5rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.5rem;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cover-btn {
  position: relative;
}

.cover-active {
  border-color: #fb923c !important;
  color: #fb923c !important;
  background: rgba(251, 146, 60, 0.1) !important;
}

.nav-info {
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-filename {
  font-weight: 400;
  font-size: 0.75rem;
  color: var(--muted);
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 信息栏 ===== */
.info-bar {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  font-size: 0.78rem;
  color: var(--muted);
  padding: 0.5rem 0.75rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 50px;
  justify-content: center;
}

.info-bar i {
  color: var(--accent);
  margin-right: 0.25rem;
}

/* ===== 结果区 ===== */
.result-section {
  background: var(--bg);
  border: 1px solid var(--accent);
  border-radius: var(--radius);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-header {
  font-size: 0.875rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}


.result-canvas-container {
  overflow: hidden;
  overflow-y: scroll;
  height: 600px;
}


.result-canvas {
  width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
  display: block;
  border: 1px solid var(--border);
}

.result-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: center;
}

/* ===== 右栏设置 ===== */


.settings-panel {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}


.panel-title {
  font-size: 0.875rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.panel-title i {
  color: var(--accent);
}


.panel-hint {
  font-size: 0.72rem;
  color: var(--muted);
  font-weight: 400;
  margin-left: auto;
}


.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

/* 分段控制器（复用） */
.seg-control {
  display: flex;
  gap: 0.3rem;
}

.seg-btn {
  flex: 1;
  padding: 0.35rem 0.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  text-align: center;
}

.seg-btn.active {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--accent);
}

.seg-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ===== 表单元素 ===== */
.form-hint {
  color: var(--muted);
  font-weight: 400;
  font-size: 0.75rem;
  margin-left: auto;
}

/* 响应式样式已移至 global.css 统一管理 */
</style>