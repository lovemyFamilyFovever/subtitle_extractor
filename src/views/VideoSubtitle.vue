<template>
  <div class="app-layout">

    <!-- ==================== 左栏：视频播放器 ==================== -->
    <div class="app-left">

      <!-- 视频文件上传区 -->
      <div class="upload-zone" :class="{ 'drag-over': isDragOver, 'has-video': videoUrl }" @click="fileInput.click()"
        @dragover.prevent="isDragOver = true" @dragleave.prevent="isDragOver = false" @drop.prevent="onDrop">
        <i class="fa-solid fa-film upload-icon"></i>
        <p class="upload-text">
          {{ videoUrl ? '点击或拖拽新视频到此处' : '点击或拖拽视频到此处' }}
        </p>
        <p class="upload-hint">支持 MP4 / WebM / MOV 等浏览器可播放格式</p>
        <input ref="fileInput" type="file" accept="video/*" class="hidden-input" @change="onFileChange" />
      </div>

      <!-- 视频播放器 + 覆盖层 Canvas 容器 -->
      <div v-if="videoUrl" class="video-wrapper" ref="videoWrapper">

        <!-- 关闭按钮（悬浮显示） -->
        <button class="video-close-btn" @click.stop="removeVideo" title="移除当前视频">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <!-- 原生视频播放器 -->
        <video 
          ref="videoEl" 
          :src="videoUrl" 
          controls 
          class="video-player" 
          @loadedmetadata="onVideoLoaded"
          @error="onVideoError"
        ></video>

        <!-- 覆盖层 Canvas：仅视觉参考，不拦截事件 -->
        <canvas ref="overlayCanvas" class="overlay-canvas"></canvas>
      </div>

      <!-- 视频信息栏 -->
      <div v-if="videoInfo" class="video-info-bar">
        <span><i class="fa-solid fa-file-video"></i> {{ videoInfo.name }}</span>
        <span><i class="fa-solid fa-expand"></i> {{ videoInfo.width }} × {{ videoInfo.height }}</span>
        <span><i class="fa-solid fa-weight-hanging"></i> {{ videoInfo.size }}</span>
      </div>

      <!-- 工具栏 -->
      <div v-if="videoUrl" class="toolbar">

        <div class="cover-btn-container">
          <button class="btn cover-btn" :class="{ 'cover-active': coverTimeSec !== null || customCoverImage !== null }" @click="toggleCoverOptions"
            @mouseenter="showCoverTip = true" @mouseleave="showCoverTip = false" title="设置封面">
            <i class="fa-solid fa-image"></i>
            {{ customCoverImage ? '本地封面' : coverTimeSec !== null ? '当前封面' : '封面设置' }}
            <i class="fa-solid fa-circle-question cover-tip-icon"></i>
          </button>

          <div v-if="showCoverOptions" class="cover-options">
            <button class="btn" @click="setCoverFrameFromVideo">当前封面</button>
            <button class="btn" @click="coverFileInput.click()">本地封面</button>
            <button class="btn" @click="clearCoverFrame" title="清除封面帧设置">
              <i class="fa-solid fa-rotate-left"></i> 自动封面
            </button>
            <input ref="coverFileInput" type="file" accept="image/*" @change="onCoverFileChange" class="hidden-input" />
          </div>
        </div>

        <button class="btn" :disabled="!videoUrl" @click="markCurrentTime" style="margin-left: auto;">
          <i class="fa-solid fa-circle-dot"></i> 标记当前帧
        </button>

      </div>

    </div>

    <!-- ==================== 中栏：控制面板 ==================== -->
    <div class="app-middle">

      <!-- 拼接设置 -->
      <div class="settings-panel">
        <div class="panel-title">
          <i class="fa-solid fa-sliders"></i> 拼接设置
          <span class="panel-hint">输入框支持滚轮和键盘上下键调整</span>
        </div>

        <div class="setting-item">
          <label class="form-label">
            <span class="line-dot line-dot-red"></span>
            红线位置（字幕上边界）
          </label>
          <SliderInput :model-value="Math.round(topCutRatio * 100)" label="" unit="%" :min="0" :max="100"
            @update:model-value="val => topCutRatio = val / 100" step="1" />
        </div>

        <div class="setting-item">
          <label class="form-label">
            <span class="line-dot line-dot-blue"></span>
            蓝线位置（字幕下边界）
          </label>
          <SliderInput :model-value="Math.round(bottomCutRatio * 100)" label="" unit="%" :min="2" :max="100"
            @update:model-value="val => bottomCutRatio = val / 100" step="1" />
        </div>

        <div class="setting-item">
          <label class="form-label">输出格式</label>
          <div class="seg-control">
            <button v-for="fmt in ['png', 'jpeg', 'webp']" :key="fmt" class="seg-btn"
              :class="{ active: format === fmt }" @click="format = fmt">{{ fmt.toUpperCase() }}</button>
          </div>
        </div>

        <div class="setting-item">
          <label class="form-label">
            <label class="form-label" style="display: inline-block;">图片压缩</label>
            <span v-if="format === 'png'" class="form-hint">（PNG 无损，此项无效）</span>
          </label>
          <div class="seg-control">
            <button v-for="opt in compressionOptions" :key="opt.value" class="seg-btn"
              :class="{ active: compression === opt.value }" :disabled="format === 'png'"
              @click="compression = opt.value">{{ opt.label }}</button>
          </div>
        </div>

        <!-- 时间标记 -->
        <div class="panel-title">
          <i class="fa-solid fa-clock"></i> 时间标记
          <span class="panel-hint">Enter 添加帧 · Space 播放/暂停</span>
        </div>

        <div class="time-wrapper">

          <div class="time-item" v-for="(time, index) in timePoints" :key="index" @click="goToTime(time.timeSec)">
            <span class="time-item-text">{{ formatTime(time.timeSec) }}</span>

            <button class="time-item-btn" @click="removeTimePoint(time)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

        </div>


        <div class="action-row">
          <!-- 撤销/重做按钮 -->
          <button 
            class="btn" 
            :disabled="!canUndo()" 
            @click="handleUndo"
            title="撤销 (Ctrl+Z)"
            style="flex: 0 0 auto; padding: 0.6rem 0.8rem;"
          >
            <i class="fa-solid fa-undo"></i>
          </button>
          
          <button 
            class="btn" 
            :disabled="!canRedo()" 
            @click="handleRedo"
            title="重做 (Ctrl+Y)"
            style="flex: 0 0 auto; padding: 0.6rem 0.8rem;"
          >
            <i class="fa-solid fa-redo"></i>
          </button>

          <button class="btn btn-danger" :disabled="timePoints.length === 0" @click="clearMarks">
            <i class="fa-solid fa-trash"></i> 清空标记
          </button>

          <button class="btn btn-primary btn-block" :disabled="!videoUrl || isExtracting" @click="extractAndStitch">
            <i class="fa-solid" :class="isExtracting ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'"></i>
            {{ isExtracting ? statusMsg : '智能提取并拼接' }}
          </button>
        </div>

        <!-- 进度条（处理时显示） -->
        <div v-if="isExtracting && progressInfo.total > 0" class="progress-container">
          <div class="progress-header">
            <span class="progress-text">
              <i class="fa-solid fa-layer-group"></i>
              处理进度：{{ progressInfo.current }} / {{ progressInfo.total }} 帧
            </span>
            <span class="progress-percent">{{ progressInfo.percent }}%</span>
          </div>
          
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: progressInfo.percent + '%' }"
            ></div>
          </div>
          
          <div class="progress-footer">
            <span v-if="progressInfo.estimatedTime > 0" class="progress-time">
              <i class="fa-regular fa-clock"></i>
              剩余时间：{{ formatRemainingTime(progressInfo.estimatedTime) }}
            </span>
            <span v-else class="progress-time">
              <i class="fa-solid fa-spinner fa-spin"></i>
              正在初始化...
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 右栏：结果预览 ==================== -->
    <div class="app-right" v-if="resultCanvas">

      <div class="result-section">
        <div class="result-header">
          <i class="fa-solid fa-check-circle" style="color:var(--accent)"></i>
          提取完成 · {{ resultWidth }} × {{ resultHeight }} px · 共 {{ extractedCount }} 帧
        </div>

        <div class="result-canvas-container">
          <canvas ref="resultCanvasEl" class="result-canvas"></canvas>
        </div>
        <div class="result-actions">
          <button class="btn btn-primary" @click="saveResult">
            <i class="fa-solid fa-download"></i>
            保存 {{ format.toUpperCase() }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import SliderInput from '../components/SliderInput.vue'
import { useToast } from '../composables/useToast.js'
import { useUndoRedo } from '../composables/useUndoRedo.js'

const { showToast } = useToast()

// ==================== 撤销/重做 ====================
const { pushState: pushHistory, undo, redo, canUndo, canRedo } = useUndoRedo(20)

// 撤销操作
const handleUndo = () => {
  const previousState = undo()
  if (previousState && previousState.timePoints) {
    timePoints.value = previousState.timePoints
    showToast('已撤销', 'success')
  }
}

// 重做操作
const handleRedo = () => {
  const nextState = redo()
  if (nextState && nextState.timePoints) {
    timePoints.value = nextState.timePoints
    showToast('已重做', 'success')
  }
}

// ==================== DOM 引用 ====================
const fileInput = ref(null)
const videoEl = ref(null)
const overlayCanvas = ref(null)
const videoWrapper = ref(null)
const resultCanvasEl = ref(null)

// ==================== 视频状态 ====================
const videoUrl = ref(null)
const isDragOver = ref(false)
const videoInfo = ref(null)
const videoNativeW = ref(0)
const videoNativeH = ref(0)

// ==================== 裁剪线状态 ====================
const topCutRatio = ref(0.75)
const bottomCutRatio = ref(1)

// ==================== 封面帧 ====================
const coverTimeSec = ref(null)
const showCoverTip = ref(false)
const showCoverOptions = ref(false)
const customCoverImage = ref(null)
const coverFileInput = ref(null)

// ==================== 时间标记 ====================
const timePoints = ref([])
const fps = ref(30)

// 监听时间点变化，保存到历史（用于撤销/重做）
watch(timePoints, (newVal) => {
  pushHistory({ timePoints: JSON.parse(JSON.stringify(newVal)) })
}, { deep: true })

// ==================== 进度状态 ====================
const progressInfo = ref({
  current: 0,      // 当前处理的帧数
  total: 0,        // 总帧数
  percent: 0,      // 进度百分比
  startTime: null, // 开始时间
  estimatedTime: 0 // 预计剩余时间（秒）
})

// ==================== 拼接设置 ====================
const format = ref('png')
const compression = ref(1.0)

const compressionOptions = [
  { label: '不压缩', value: 1.0 },
  { label: '2x 压缩', value: 0.5 },
  { label: '4x 压缩', value: 0.25 },
  { label: '8x 压缩', value: 0.125 }
]

// ==================== 结果状态 ====================
const resultCanvas = ref(null)
const resultWidth = ref(0)
const resultHeight = ref(0)
const extractedCount = ref(0)
const isExtracting = ref(false)

// ==================== 状态提示 ====================
const statusMsg = ref('就绪 · 上传视频后通过滑块调整裁剪线')
const statusType = ref('')

const setStatus = (msg, type = '') => {
  statusMsg.value = msg
  statusType.value = type
}

/**
 * 更新进度信息
 * @param {number} current - 当前处理的帧数
 * @param {number} total - 总帧数
 */
const updateProgress = (current, total) => {
  progressInfo.value.current = current
  progressInfo.value.total = total
  progressInfo.value.percent = Math.floor((current / total) * 100)
  
  // 计算预计剩余时间
  if (progressInfo.value.startTime && current > 0) {
    const elapsed = (Date.now() - progressInfo.value.startTime) / 1000
    const avgTimePerFrame = elapsed / current
    const remaining = (total - current) * avgTimePerFrame
    progressInfo.value.estimatedTime = Math.ceil(remaining)
  }
}

/**
 * 重置进度信息
 */
const resetProgress = () => {
  progressInfo.value = {
    current: 0,
    total: 0,
    percent: 0,
    startTime: null,
    estimatedTime: 0
  }
}

/**
 * 格式化剩余时间
 */
const formatRemainingTime = (seconds) => {
  if (seconds < 60) return `约 ${seconds} 秒`
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `约 ${minutes} 分 ${secs} 秒`
}

// ==================== 工具函数 ====================

const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined) return '--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return String(h).padStart(2, '0') + ':' +
    String(m).padStart(2, '0') + ':' +
    String(s).padStart(2, '0') + '.' +
    String(ms).padStart(3, '0')
}

const formatBytes = (bytes) => {
  if (!bytes) return '-'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

// ==================== 文件处理 ====================

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) loadVideo(file)
  e.target.value = ''
}

const onDrop = (e) => {
  isDragOver.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('video/')) loadVideo(file)
}

const loadVideo = (file) => {
  // 验证文件类型
  if (!file.type.startsWith('video/')) {
    showToast('请选择有效的视频文件（支持 MP4、WebM、MOV 等格式）', 'error')
    return
  }

  // 验证文件大小（限制 2GB）
  const maxSize = 2 * 1024 * 1024 * 1024
  if (file.size > maxSize) {
    showToast('视频文件过大，请选择小于 2GB 的文件', 'error')
    return
  }

  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  videoUrl.value = URL.createObjectURL(file)

  videoInfo.value = {
    name: file.name,
    width: '加载中...',
    height: '',
    size: formatBytes(file.size)
  }

  topCutRatio.value = 0.88
  bottomCutRatio.value = 1
  coverTimeSec.value = null
  showCoverTip.value = false
  showCoverOptions.value = false
  customCoverImage.value = null
  timePoints.value = []
  resultCanvas.value = null

  setStatus('视频加载中...', 'processing')
}

const removeVideo = () => {
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  videoUrl.value = null
  videoInfo.value = null
  resultCanvas.value = null

  topCutRatio.value = 0.88
  bottomCutRatio.value = 1
  coverTimeSec.value = null
  showCoverTip.value = false
  showCoverOptions.value = false
  customCoverImage.value = null
  timePoints.value = []

  setStatus('就绪 · 上传视频后通过滑块调整裁剪线')
  showToast('视频已移除', 'success')
}

// ==================== 视频错误处理 ====================

const onVideoError = (e) => {
  console.error('视频加载错误:', e)
  const errorMessages = {
    1: '视频加载被中止，请重试',
    2: '网络错误，请检查网络连接后重新上传',
    3: '视频解码失败，您的浏览器可能不支持此格式，请转换为 MP4 后重试',
    4: '视频文件损坏或格式不受支持，请尝试其他文件'
  }
  const errorCode = videoEl.value?.error?.code || 4
  const errorMsg = errorMessages[errorCode] || '视频加载失败，请检查文件是否完整'
  
  showToast(errorMsg, 'error')
  setStatus(`错误：${errorMsg}`, 'error')
  
  // 清理无效的视频 URL
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
    videoUrl.value = null
  }
  videoInfo.value = null
}

// ==================== 视频加载 ====================

const onVideoLoaded = async () => {
  const video = videoEl.value
  if (!video) return

  videoNativeW.value = video.videoWidth
  videoNativeH.value = video.videoHeight
  fps.value = 30

  videoInfo.value = {
    ...videoInfo.value,
    width: video.videoWidth,
    height: video.videoHeight
  }

  video.addEventListener('keydown', onVideoKeyDown)

  setStatus('视频就绪 · ' + video.videoWidth + '×' + video.videoHeight + ' · 时长 ' + formatTime(video.duration))

  await nextTick()
  resizeOverlayCanvas()
  showToast('视频加载成功', 'success')
}

// ==================== 视频按键拦截 ====================

const onVideoKeyDown = (e) => {
  if (e.code === 'Space' || e.code === 'Enter') {
    e.preventDefault()
    e.stopPropagation()
    onKeydown(e)
  }
}

// ==================== 覆盖层 Canvas ====================

const resizeOverlayCanvas = () => {
  const video = videoEl.value
  const canvas = overlayCanvas.value
  if (!video || !canvas) return

  const rect = video.getBoundingClientRect()
  const controlBarH = 44
  const contentH = Math.max(0, rect.height - controlBarH)

  canvas.width = Math.round(rect.width)
  canvas.height = Math.round(contentH)
  canvas.style.width = rect.width + 'px'
  canvas.style.height = contentH + 'px'

  drawOverlay()
}

/**
 * 计算 video 元素内，视频画面实际渲染的区域（排除黑边）
 * 返回相对于 video 元素左上角的坐标（像素）
 */
const getVideoRenderRect = () => {
  const video = videoEl.value
  if (!video) return null

  const containerW = video.clientWidth
  const containerH = video.clientHeight  // 注意：这里用 clientHeight（不含控制条，控制条是浏览器原生UI，不在 clientHeight 内）

  // 等比缩放：contain 模式
  const videoRatio = video.videoWidth / video.videoHeight
  const containerRatio = containerW / containerH

  let renderW, renderH, offsetX, offsetY

  if (videoRatio > containerRatio) {
    // 视频更宽：左右撑满，上下有黑边
    renderW = containerW
    renderH = containerW / videoRatio
    offsetX = 0
    offsetY = (containerH - renderH) / 2
  } else {
    // 视频更高：上下撑满，左右有黑边
    renderH = containerH
    renderW = containerH * videoRatio
    offsetX = (containerW - renderW) / 2
    offsetY = 0
  }

  return { offsetX, offsetY, renderW, renderH }
}

const drawOverlay = () => {
  const canvas = overlayCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const renderRect = getVideoRenderRect()
  if (!renderRect) return

  // 红蓝线的 Y = 黑边偏移 + ratio * 视频画面实际高度
  const topY = Math.round(renderRect.offsetY + topCutRatio.value * renderRect.renderH)
  const bottomY = Math.round(renderRect.offsetY + bottomCutRatio.value * renderRect.renderH)


  // 封面帧区域
  ctx.fillStyle = 'rgba(251, 146, 60, 0.08)'
  ctx.fillRect(0, 0, canvas.width, topY)

  ctx.fillStyle = 'rgba(251, 146, 60, 0.6)'
  ctx.font = 'bold 11px system-ui'
  ctx.fillText('封面帧区域', 8, Math.max(16, topY / 2))

  // 字幕区域
  ctx.fillStyle = 'rgba(0, 224, 158, 0.08)'
  ctx.fillRect(0, topY, canvas.width, bottomY - topY)

  // 红线
  ctx.save()
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 2
  ctx.setLineDash([12, 8])
  ctx.beginPath()
  ctx.moveTo(0, topY)
  ctx.lineTo(canvas.width, topY)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = '#ef4444'
  ctx.font = 'bold 12px system-ui'
  //添加上边界线距离视频区域的顶部的距离
  ctx.fillText('▲ 上边界 ' + Math.round(topCutRatio.value * 100) + '%', 8, topY - 6)
  ctx.restore()

  // 蓝线
  ctx.save()
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.setLineDash([12, 8])
  ctx.beginPath()
  ctx.moveTo(0, bottomY)
  ctx.lineTo(canvas.width, bottomY)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = '#3b82f6'
  ctx.font = 'bold 12px system-ui'
  ctx.fillText('▼ 下边界 ' + Math.round(bottomCutRatio.value * 100) + '%', 8, bottomY + 18)
  ctx.restore()
}

watch([topCutRatio, bottomCutRatio], () => {
  drawOverlay()
})

// ==================== 封面帧 ====================

const toggleCoverOptions = () => {
  showCoverOptions.value = !showCoverOptions.value
}

const setCoverFrameFromVideo = () => {
  const video = videoEl.value
  if (!video) return
  coverTimeSec.value = video.currentTime
  customCoverImage.value = null
  showCoverOptions.value = false
  showToast('封面帧已设为 ' + formatTime(video.currentTime), 'success')
}

const onCoverFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    const img = new Image()
    img.onload = () => {
      customCoverImage.value = img
      coverTimeSec.value = null
      showCoverOptions.value = false
      showToast('自定义封面已设置', 'success')
    }
    img.src = URL.createObjectURL(file)
  }
  e.target.value = ''
}

const clearCoverFrame = () => {
  coverTimeSec.value = null
  customCoverImage.value = null
  showCoverOptions.value = false
}

// ==================== 时间标记 ====================

const markCurrentTime = () => {
  const video = videoEl.value
  if (!video) return
  const timeSec = video.currentTime
  const frameIdx = Math.round(timeSec * fps.value)
  timePoints.value.push({ timeSec: timeSec, frameIdx: frameIdx })
  setStatus('已标记 ' + timePoints.value.length + ' 个时间点')
}

const clearMarks = () => {
  timePoints.value = []
}

//删除时间点
const removeTimePoint = (timePoint) => {
  const index = timePoints.value.indexOf(timePoint)
  if (index !== -1) {
    timePoints.value.splice(index, 1)
    setStatus('已删除 ' + timePoint.timeSec + ' 的时间点')
  }
}

//跳转到时间点
const goToTime = (timeSec) => {
  const video = videoEl.value
  if (!video) return
  video.currentTime = timeSec
}

// ==================== 视频播放 ====================

const onVideoPlay = () => {
  const video = videoEl.value
  if (!video) return
  if (video.paused) {
    setStatus('正在播放')
  } else {
    setStatus('暂停中')
  }
}

// ==================== 视频拖拽 ==========

const onDragOver = (e) => {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = true
}


// ==================== 键盘快捷键 ====================

const onKeydown = (e) => {
  const tag = document.activeElement ? document.activeElement.tagName : ''
  if (tag === 'TEXTAREA') return
  if (tag === 'INPUT') return

  if (!videoUrl.value) return
  const video = videoEl.value
  if (!video) return

  // Ctrl+Z 撤销
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    handleUndo()
    return
  }

  // Ctrl+Y 或 Ctrl+Shift+Z 重做
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault()
    handleRedo()
    return
  }

  if (e.code === 'Space') {
    e.preventDefault()
    e.stopPropagation()
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  if (e.code === 'Enter') {
    e.preventDefault()
    e.stopPropagation()
    markCurrentTime()
  }
}

// ==================== 逐帧截图 ====================

const captureFrame = (video, timeSec, cropArea) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(function () {
      video.removeEventListener('seeked', onSeeked)
      reject(new Error('Seek 超时 @ ' + formatTime(timeSec)))
    }, 8000)

    function onSeeked() {
      clearTimeout(timeout)
      video.removeEventListener('seeked', onSeeked)
      try {
        const w = cropArea.x2 - cropArea.x1
        const h = cropArea.y2 - cropArea.y1
        
        // 验证裁剪区域有效性
        if (w <= 0 || h <= 0) {
          throw new Error(`无效的裁剪区域: ${w}x${h}`)
        }
        
        if (cropArea.x1 < 0 || cropArea.y1 < 0 || 
            cropArea.x2 > video.videoWidth || cropArea.y2 > video.videoHeight) {
          throw new Error('裁剪区域超出视频边界')
        }
        
        const c = document.createElement('canvas')
        c.width = w
        c.height = h

        console.log(`捕获帧 @ ${formatTime(timeSec)}，裁剪区域: (${cropArea.x1}, ${cropArea.y1}) - (${cropArea.x2}, ${cropArea.y2})`)

        c.getContext('2d').drawImage(video, cropArea.x1, cropArea.y1, w, h, 0, 0, w, h)
        resolve(c)
      } catch (err) {
        reject(err)
      }
    }

    video.addEventListener('seeked', onSeeked)
    video.currentTime = timeSec
  })
}

// ==================== 内存监控 ====================

/**
 * 检查当前内存使用情况
 * @returns {Object|null} 内存信息或 null（如果浏览器不支持）
 */
const checkMemoryUsage = () => {
  if (performance.memory) {
    const usedMB = performance.memory.usedJSHeapSize / 1024 / 1024
    const totalMB = performance.memory.jsHeapSizeLimit / 1024 / 1024
    const percent = (usedMB / totalMB) * 100
    
    return {
      used: usedMB.toFixed(1),
      total: totalMB.toFixed(1),
      percent: percent.toFixed(1)
    }
  }
  return null
}

/**
 * 估算 Canvas 占用的内存（字节）
 * @param {HTMLCanvasElement} canvas 
 * @returns {number} 估算的内存占用
 */
const estimateCanvasMemory = (canvas) => {
  // 每个像素约 4 字节 (RGBA)
  return canvas.width * canvas.height * 4
}

/**
 * 释放 Canvas 内存
 * @param {HTMLCanvasElement} canvas 
 */
const releaseCanvas = (canvas) => {
  if (!canvas) return
  
  // 清空画布内容
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
  
  // 重置尺寸（触发内存释放）
  canvas.width = 0
  canvas.height = 0
}

// ==================== 主提取流程 ====================

const extractAndStitch = async () => {

  const video = videoEl.value
  if (!video || !videoUrl.value) return

  // 验证裁剪区域
  if (topCutRatio.value >= bottomCutRatio.value) {
    showToast('裁剪区域无效：红线必须在蓝线上方', 'error')
    setStatus('裁剪区域无效：红线必须在蓝线上方', 'error')
    return
  }

  // 验证时间点数量（防止内存溢出）
  const maxFrames = 200
  const estimatedFrames = timePoints.value.length > 0 
    ? timePoints.value.length 
    : Math.ceil(video.duration)
  
  if (estimatedFrames > maxFrames) {
    const memInfo = checkMemoryUsage()
    const memWarning = memInfo ? ` (当前内存: ${memInfo.used}MB / ${memInfo.total}MB)` : ''
    
    showToast(`帧数过多（${estimatedFrames} 帧），建议减少到 ${maxFrames} 帧以内${memWarning}`, 'warning')
    setStatus(`警告：预计提取 ${estimatedFrames} 帧，可能影响性能`, 'warning')
    
    // 如果内存使用率已经超过 50%，强烈建议减少帧数
    if (memInfo && parseFloat(memInfo.percent) > 50) {
      const confirmed = confirm(`内存使用率已达 ${memInfo.percent}%，处理 ${estimatedFrames} 帧可能导致浏览器崩溃。\n\n是否继续？`)
      if (!confirmed) {
        isExtracting.value = false
        return
      }
    }
  }

  isExtracting.value = true
  resultCanvas.value = null
  
  // 初始化进度信息
  resetProgress()
  progressInfo.value.startTime = Date.now()
  
  setStatus('提取中...', 'processing')

  try {
    // 【修复】计算正确的裁剪坐标
    // 原因：topCutRatio 和 bottomCutRatio 是基于 (视频显示高度 - 44px 控制条) 计算的。
    // 直接乘以 videoNativeH 会导致坐标偏下。需要还原到视频原始分辨率坐标系。
    const rect = video.getBoundingClientRect()
    const controlBarH = 44 // 与 resizeOverlayCanvas 中保持一致
    const visualVideoH = rect.height // 视频元素在屏幕上的总高度
    const effectiveVisualH = visualVideoH - controlBarH // 实际用于绘制裁剪线的高度

    // 防止除以零或负数
    if (effectiveVisualH <= 0 || visualVideoH <= 0) {
      throw new Error('视频显示尺寸异常，无法计算裁剪区域')
    }

    // 计算从“可视坐标比例”到“原始视频像素”的转换系数
    // 屏幕上的 Y 像素 = ratio * effectiveVisualH
    // 原始视频 Y 像素 = (屏幕 Y / visualVideoH) * videoNativeH
    // 合并后：原始视频 Y = ratio * (effectiveVisualH / visualVideoH) * videoNativeH
    const scaleToNative = (effectiveVisualH / visualVideoH) * videoNativeH.value

    const renderRect = getVideoRenderRect()
    if (!renderRect) throw new Error('无法计算视频渲染区域')

    // ratio 直接乘以原始视频高度（renderRect 已经排除黑边，ratio 是相对于纯画面的）
    const nativeTopY = Math.round(topCutRatio.value * videoNativeH.value)
    const nativeBottomY = Math.round(bottomCutRatio.value * videoNativeH.value)

    // 1. 确定字幕时间点列表
    var subtitlePoints = []

    if (timePoints.value.length > 0) {
      subtitlePoints = timePoints.value.map(function (p) { return p.timeSec })
    } else {
      var duration = video.duration
      if (!duration || !isFinite(duration)) throw new Error('无法获取视频时长')
      for (var t = 0; t <= duration; t += 1) {
        subtitlePoints.push(Math.min(t, duration - 0.001))
      }
    }

    // 2. 确定封面帧时间点
    var coverTime
    if (coverTimeSec.value !== null) {
      coverTime = coverTimeSec.value
    } else {
      coverTime = subtitlePoints.length > 0 ? subtitlePoints[0] : 0
    }

    // 3. 封面帧裁剪区域：视频顶部到红线 (使用修正后的坐标)
    var coverCrop = {
      x1: 0,
      y1: 0,
      x2: videoNativeW.value,
      y2: Math.round(nativeTopY)
    }

    // 4. 字幕裁剪区域：红线到蓝线 (使用修正后的坐标)
    var subCrop = {
      x1: 0,
      y1: Math.round(nativeTopY),
      x2: videoNativeW.value,
      y2: Math.round(nativeBottomY)
    }

    // 5. 提取封面帧
    const allFrames = []

    if (customCoverImage.value) {
      setStatus('处理自定义封面...', 'processing')
      const canvas = document.createElement('canvas')
      canvas.width = videoNativeW.value
      canvas.height = Math.round(nativeTopY)
      const ctx = canvas.getContext('2d')
      // 缩放图片以适应宽度，裁剪高度
      const scale = videoNativeW.value / customCoverImage.value.width
      const scaledHeight = customCoverImage.value.height * scale
      ctx.drawImage(customCoverImage.value, 0, 0, videoNativeW.value, Math.min(scaledHeight, canvas.height))
      allFrames.push(canvas)
    } else if (coverCrop.y2 > coverCrop.y1) {
      setStatus('提取封面帧...', 'processing')
      const coverFrame = await captureFrame(video, coverTime, coverCrop)
      allFrames.push(coverFrame)
    }

    // 6. 分块逐帧提取字幕（每10帧处理一次，避免内存溢出）
    const CHUNK_SIZE = 10 // 每块处理的帧数
    const subtitleFrames = []
    
    for (let i = 0; i < subtitlePoints.length; i++) {
      // 更新进度
      updateProgress(i + 1, subtitlePoints.length)
      
      const frame = await captureFrame(video, subtitlePoints[i], subCrop)
      subtitleFrames.push(frame)
      
      // 检查内存使用情况
      if ((i + 1) % CHUNK_SIZE === 0 || i === subtitlePoints.length - 1) {
        const memInfo = checkMemoryUsage()
        if (memInfo && parseFloat(memInfo.percent) > 70) {
          console.warn(`内存使用率较高: ${memInfo.used}MB / ${memInfo.total}MB (${memInfo.percent}%)`)
          showToast(`内存使用率较高 (${memInfo.percent}%)，建议减少提取帧数`, 'warning')
        }
        
        // 如果是最后一块，继续；否则可以提示用户
        if (i < subtitlePoints.length - 1) {
          console.log(`已处理 ${i + 1} 帧，继续处理...`)
        }
      }
    }

    if (subtitleFrames.length === 0) throw new Error('没有成功提取到任何字幕帧')

    allFrames.push(...subtitleFrames)
    
    // 释放字幕帧数组中的 Canvas（拼接后不再需要单独引用）
    // 注意：这里不立即释放，因为后面还需要用于拼接

    // 7. 垂直拼接
    setStatus('拼接中...', 'processing')

    let maxW = 0
    for (let j = 0; j < allFrames.length; j++) {
      if (allFrames[j].width > maxW) maxW = allFrames[j].width
    }

    let totalH = 0
    for (let k = 0; k < allFrames.length; k++) {
      totalH += allFrames[k].height
    }

    const result = document.createElement('canvas')
    result.width = maxW
    result.height = totalH

    const ctx = result.getContext('2d')

    let y = 0
    for (let m = 0; m < allFrames.length; m++) {
      const offsetX = Math.floor((maxW - allFrames[m].width) / 2)
      ctx.drawImage(allFrames[m], offsetX, y)
      y += allFrames[m].height
      
      // 拼接完成后释放单个帧的内存
      if (m > 0) { // 保留第一个（封面）用于可能的调试
        releaseCanvas(allFrames[m])
      }
    }

    // 8. 显示结果
    resultCanvas.value = result
    resultWidth.value = result.width
    resultHeight.value = result.height
    extractedCount.value = subtitleFrames.length

    await nextTick()
    if (resultCanvasEl.value) {
      resultCanvasEl.value.width = result.width
      resultCanvasEl.value.height = result.height
      resultCanvasEl.value.getContext('2d').drawImage(result, 0, 0)
      resultCanvasEl.value.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    const coverCount = allFrames.length - subtitleFrames.length
    const coverLabel = coverCount > 0 ? ('封面帧 ' + coverCount + ' 张 + ') : ''
    setStatus(
      '完成！' + coverLabel + '字幕帧 ' + subtitleFrames.length + ' 张 · ' + result.width + '×' + result.height + ' px',
      'success'
    )
    showToast('提取完成，共 ' + allFrames.length + ' 帧', 'success')
    
    // 9. 最终内存清理提示
    const finalMem = checkMemoryUsage()
    if (finalMem) {
      console.log(`处理完成，当前内存使用: ${finalMem.used}MB / ${finalMem.total}MB (${finalMem.percent}%)`)
    }

  } catch (err) {
    console.error('提取失败:', err)
    const errorMsg = err.message || '未知错误'
    setStatus('提取失败：' + errorMsg, 'error')
    showToast('字幕提取失败：' + errorMsg + '，请检查视频文件后重试', 'error')
  } finally {
    isExtracting.value = false
    // 重置进度（延迟一下让用户看到100%）
    setTimeout(() => {
      resetProgress()
    }, 1000)
  }
}

// ==================== 保存结果 ====================

const saveResult = () => {
  if (!resultCanvas.value) return

  var mimeMap = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' }
  var mime = mimeMap[format.value] || 'image/png'

  var extMap = { png: 'png', jpeg: 'jpg', webp: 'webp' }
  var ext = extMap[format.value] || 'png'

  var quality = (format.value === 'png') ? undefined : compression.value

  resultCanvas.value.toBlob(function (blob) {
    if (!blob) { showToast('保存失败', 'error'); return }
    var url = URL.createObjectURL(blob)
    var a = document.createElement('a')
    a.href = url
    a.download = 'subtitles_' + Date.now() + '.' + ext
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('已保存 ' + format.value.toUpperCase() + '，' + (blob.size / 1024).toFixed(0) + ' KB', 'success')
  }, mime, quality)
}

// ==================== ResizeObserver ====================

var resizeObserver = null

watch(videoEl, function (el) {
  if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null }
  if (!el) return

  resizeObserver = new ResizeObserver(function () {
    resizeOverlayCanvas()
  })
  resizeObserver.observe(el)
})

// ==================== 生命周期 ====================

onMounted(function () {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(function () {
  document.removeEventListener('keydown', onKeydown)
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (resizeObserver) resizeObserver.disconnect()
})
</script>
<style scoped>
/* ===== 三栏布局 ===== */
.app-layout {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  overflow-x: auto;
  min-height: 0;
}

.app-left {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  width: 700px;
  position: relative;
}

.app-middle {
  width: 335px;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.app-right {
  width: 335px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ===== 隐藏文件输入 ===== */
.hidden-input {
  display: none;
}

/* ===== 上传区 ===== */
.upload-zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 1.25rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
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

/* 视频已加载时：隐藏 icon 和 hint，只保留 text */
.upload-zone.has-video .upload-icon {
  display: none;
}

.upload-zone.has-video .upload-hint {
  display: none;
}

.upload-zone.has-video {
  padding: 0.6rem 1rem;
}

/* ===== 视频容器 ===== */
.video-wrapper {
  position: relative;
  background: #000;
  border-radius: var(--radius);
  overflow: hidden;
  line-height: 0;
}

.video-player {
  width: 100%;
  height: 62vh;
  display: block;
  background: #000;
}

.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 44px;
  width: 100% !important;
  pointer-events: none;
}

/* ===== 关闭按钮 ===== */
.video-close-btn {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(100, 100, 100, 0.7);
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.25s ease;
  backdrop-filter: blur(4px);
}

.video-wrapper:hover .video-close-btn {
  opacity: 1;
}

.video-close-btn:hover {
  background: rgba(200, 50, 50, 0.85);
}

/* ===== 视频信息栏 ===== */
.video-info-bar {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.78rem;
  color: var(--muted);
  padding: 0.45rem 0.85rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 50px;
}

.video-info-bar i {
  color: var(--accent);
  margin-right: 0.25rem;
}

/* ===== 工具栏 ===== */
.toolbar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.cover-btn-container {
  position: relative;
}

.cover-options {
  position: absolute;
  top: -70px;
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

.cover-tip-icon {
  margin-left: 4px;
  font-size: 0.7rem;
  opacity: 0.6;
}

.cover-active {
  border-color: #fb923c !important;
  color: #fb923c !important;
  background: rgba(251, 146, 60, 0.1) !important;
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
  flex-wrap: wrap;
}


.result-canvas-container {
  overflow: hidden;
  overflow-y: scroll;
  height: 665px;
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

/* ===== 设置面板 ===== */
.settings-panel {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
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


.time-wrapper {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  min-height: 200px;
  height: 270px;
  overflow-y: scroll;
}

.time-item {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--fg);
  margin-bottom: 7px;
  padding: 5px 10px;
  cursor: pointer;
  transition: all 0.1s ease-in;
  border-radius: 7px;
  display: flex;
}

.time-item:hover {
  transform: translateX(10px);
  background: var(--accent);
    color: var(--bg);
}

.time-item-btn {
  background: transparent;
  border: none;
  color: var(--muted);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.time-item-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--fg);
}

.time-item-btn:first-child {
  margin-left: auto;
}

.time-item-btn:nth-child(2) {
  margin-left: 5px;
}

.time-item-text {
  flex: 1;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

/* ===== 背景色圆形按钮 ===== */
.bg-color-options {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

.bg-color-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.bg-color-btn:hover {
  transform: scale(1.1);
}

.bg-color-btn.active {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-dim);
}

.bg-transparent-icon {
  font-size: 12px;
  color: #888;
}

/* ===== 表单元素 ===== */
.form-hint {
  color: var(--muted);
  font-weight: 400;
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

/* ===== 操作按钮行 ===== */
.action-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-block {
  flex: 1;
}

/* ===== 分段控制器 ===== */
.seg-control {
  display: flex;
  gap: 0.3rem;
  margin-top: 0.25rem;
  flex-wrap: wrap;
}

.seg-btn {
  flex: 1;
  min-width: 0;
  padding: 0.35rem 0.4rem;
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
  white-space: nowrap;
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

/* ===== 进度条样式 ===== */
.progress-container {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.progress-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--fg);
}

.progress-percent {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--accent);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #00ffaa);
  border-radius: 4px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px var(--accent-dim);
}

.progress-footer {
  display: flex;
  justify-content: center;
}

.progress-time {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--muted);
}

/* 组件特定样式已在上方定义 */
/* 响应式样式已移至 global.css 统一管理 */
</style>
