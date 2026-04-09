<template>
  <div class="gif-converter">
    <!-- ==================== 左栏：视频播放器 ==================== -->
    <div class="converter-left">
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

      <!-- 视频播放器 -->
      <div v-if="videoUrl" class="video-wrapper" ref="videoWrapper">
        <button class="video-close-btn" @click.stop="removeVideo" title="移除当前视频">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <video ref="videoEl" :src="videoUrl" controls muted class="video-player" @loadedmetadata="onVideoLoaded"
          @error="onVideoError" @timeupdate="onTimeUpdate"></video>
      </div>

      <!-- 视频信息栏 -->
      <div v-if="videoInfo" class="video-info-bar">
        <span><i class="fa-solid fa-file-video"></i> {{ videoInfo.name }}</span>
        <span><i class="fa-solid fa-clock"></i> 时长: {{ formatTime(videoInfo.duration) }}</span>
        <span><i class="fa-solid fa-weight-hanging"></i> {{ videoInfo.size }}</span>
      </div>

      <!-- 可视时间轴 -->
      <div v-if="videoUrl" class="timeline-container">
        <div class="timeline-header">
          <span class="timeline-label">
            <i class="fa-solid fa-sliders"></i>
            选择片段范围
          </span>
          <span class="timeline-time">{{ formatTime(trimStart) }} - {{ formatTime(trimEnd) }} ({{ formatTime(trimEnd - trimStart) }})</span>
        </div>

        <div class="timeline-track" ref="timelineTrack" @mousedown="onTimelineMouseDown" @mousemove="onTimelineMouseMove"
          @mouseup="onTimelineMouseUp" @mouseleave="onTimelineMouseUp">
          <!-- 背景条 -->
          <div class="timeline-bg"></div>

          <!-- 选中区域 -->
          <div class="timeline-selection" :style="selectionStyle"></div>

          <!-- 开始手柄 -->
          <div class="timeline-handle timeline-handle-start" :style="handleStartStyle" @mousedown.stop="onHandleMouseDown($event, 'start')">
            <div class="handle-line"></div>
            <div class="handle-label">{{ formatTime(trimStart) }}</div>
          </div>

          <!-- 结束手柄 -->
          <div class="timeline-handle timeline-handle-end" :style="handleEndStyle" @mousedown.stop="onHandleMouseDown($event, 'end')">
            <div class="handle-line"></div>
            <div class="handle-label">{{ formatTime(trimEnd) }}</div>
          </div>

          <!-- 播放头 -->
          <div class="timeline-playhead" :style="playheadStyle"></div>
        </div>

        <div class="timeline-actions">
          <!-- 播放/暂停整个视频 -->
          <button class="btn btn-sm" @click="togglePlayPause" :disabled="!videoUrl">
            <i class="fa-solid fa-play" v-show="!isPlaying"></i>
            <i class="fa-solid fa-pause" v-show="isPlaying"></i>
            {{ isPlaying ? '暂停' : '播放' }}
          </button>

          <!-- 播放/暂停片段 -->
          <button class="btn btn-sm" @click="playSegment" :disabled="!videoUrl">
            <i class="fa-solid fa-play" v-show="!isPlayingSegment"></i>
            <i class="fa-solid fa-pause" v-show="isPlayingSegment"></i>
            {{ isPlayingSegment ? '暂停片段' : '播放片段' }}
          </button>

          <button class="btn btn-sm" @click="resetTrim">
            <i class="fa-solid fa-rotate-left"></i> 重置
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== 中栏：设置面板 ==================== -->
    <div class="converter-middle">
      <div class="settings-panel">
        <!-- 预设选项 -->
        <div class="panel-title">
          <i class="fa-solid fa-wand-magic-sparkles"></i> 快速预设
        </div>
        <div class="preset-buttons">
          <button class="preset-btn" :class="{ active: currentPreset === 'small' }" @click="applyPreset('small')">
            <i class="fa-solid fa-compress"></i>
            <span>小文件</span>
            <small>10fps · 320px</small>
          </button>
          <button class="preset-btn" :class="{ active: currentPreset === 'balanced' }" @click="applyPreset('balanced')">
            <i class="fa-solid fa-scale-balanced"></i>
            <span>平衡</span>
            <small>15fps · 480px</small>
          </button>
          <button class="preset-btn" :class="{ active: currentPreset === 'quality' }" @click="applyPreset('quality')">
            <i class="fa-solid fa-gem"></i>
            <span>高质量</span>
            <small>20fps · 640px</small>
          </button>
        </div>

        <!-- GIF 设置 -->
        <div class="panel-title">
          <i class="fa-solid fa-gear"></i> GIF 设置
        </div>

        <div class="setting-item">
          <label class="form-label">颜色数</label>
          <div class="seg-control">
            <button v-for="c in colorOptions" :key="c.value" class="seg-btn"
              :class="{ active: colors === c.value }"
              @click="colors = c.value">{{ c.label }}</button>
          </div>
        </div>

        <div class="setting-item">
          <label class="form-label">抖动算法</label>
          <select v-model="dither" class="form-select">
            <option value="none">无抖动</option>
            <option value="FloydSteinberg-serpentine">Floyd-Steinberg</option>
            <option value="FalseFloydSteinberg">False Floyd-Steinberg</option>
            <option value="Stucki">Stucki</option>
            <option value="Atkinson">Atkinson</option>
          </select>
        </div>

        <div class="setting-item">
          <label class="form-label">压缩级别</label>
          <SliderInput :model-value="compressionLevel" label="" unit="" :min="1" :max="20"
            @update:model-value="val => compressionLevel = val" step="1" />
        </div>

        <div class="setting-item">
          <label class="form-label">
            <input type="checkbox" v-model="loop" class="checkbox-input" />
            循环播放
          </label>
        </div>

        <!-- 生成按钮 -->
        <div class="action-row">
          <button class="btn btn-danger" :disabled="!isGenerating" @click="cancelGenerate">
            <i class="fa-solid fa-stop"></i>
            取消
          </button>
          <button class="btn btn-primary btn-block generate-btn" 
            :class="{ generating: isGenerating }"
            :disabled="!canGenerate && !isGenerating" 
            @click="generateGif">
            <div class="btn-progress" :style="{ width: progressInfo.percent + '%' }"></div>
            <span class="btn-content">
              <i class="fa-solid" :class="isGenerating ? 'fa-spinner fa-spin' : 'fa-film'"></i>
              {{ isGenerating ? statusMsg : '生成 GIF' }}
            </span>
          </button>
        </div>

        <!-- 进度条 -->
        <div v-if="isGenerating && progressInfo.total > 0" class="progress-container">
          <div class="progress-header">
            <span class="progress-text">
              <i class="fa-solid fa-layer-group"></i>
              处理进度：{{ progressInfo.current }} / {{ progressInfo.total }} 帧
            </span>
            <span class="progress-percent">{{ progressInfo.percent }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressInfo.percent + '%' }"></div>
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

    <!-- ==================== 右栏：GIF 预览 ==================== -->
    <div class="converter-right" v-if="gifBlob">
      <div class="result-section">
        <div class="result-header">
          <i class="fa-solid fa-check-circle" style="color:var(--accent)"></i>
          GIF 生成完成 · {{ gifInfo.width }} × {{ gifInfo.height }} · {{ (gifBlob.size / 1024).toFixed(1) }} KB
        </div>

        <div class="gif-preview-container">
          <img :src="gifPreviewUrl" class="gif-preview" alt="GIF 预览" />
        </div>

        <div class="result-actions">
          <button class="btn btn-primary" @click="downloadGif">
            <i class="fa-solid fa-download"></i>
            下载 GIF
          </button>
          <button class="btn" @click="regenerateGif">
            <i class="fa-solid fa-rotate-right"></i>
            重新生成
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import SliderInput from '../components/SliderInput.vue'
import { useToast } from '../composables/useToast.js'
import GIF from 'gif.js'

const { showToast } = useToast()

// ==================== DOM 引用 ====================
const fileInput = ref(null)
const videoEl = ref(null)
const videoWrapper = ref(null)
const timelineTrack = ref(null)

// ==================== 视频状态 ====================
const videoUrl = ref(null)
const isDragOver = ref(false)
const videoInfo = ref(null)
const currentTime = ref(0)
const isPlaying = ref(false) // 整个视频的播放状态
const isPlayingSegment = ref(false) // 是否正在播放片段

// ==================== 裁剪时间 ====================
const trimStart = ref(0)
const trimEnd = ref(0)
const isDragging = ref(false)
const dragHandle = ref(null) // 'start' or 'end'

// ==================== GIF 设置 ====================
const fps = ref(15)
const quality = ref(10) // 1-20, 越小质量越高（保留用于预设）
const loop = ref(true)
const colors = ref(256)
const dither = ref('FloydSteinberg-serpentine')
const compressionLevel = ref(10)

// 预设
const currentPreset = ref('balanced')

const colorOptions = [
  { label: '64色', value: 64 },
  { label: '128色', value: 128 },
  { label: '256色', value: 256 }
]

// ==================== 生成状态 ====================
const isGenerating = ref(false)
const isCancelled = ref(false) // 是否取消生成
const statusMsg = ref('就绪')
const gifBlob = ref(null)
const gifPreviewUrl = ref(null)
const gifInfo = ref({ width: 0, height: 0 })
const currentGifInstance = ref(null) // 当前 GIF 实例，用于取消

// ==================== 进度状态 ====================
const progressInfo = ref({
  current: 0,
  total: 0,
  percent: 0,
  startTime: null,
  estimatedTime: 0
})

// ==================== 工具函数 ====================
const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return '00:00.000'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return String(m).padStart(2, '0') + ':' +
    String(s).padStart(2, '0') + '.' +
    String(ms).padStart(3, '0')
}

const formatBytes = (bytes) => {
  if (!bytes) return '-'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

const formatRemainingTime = (seconds) => {
  if (seconds < 60) return `约 ${seconds} 秒`
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `约 ${minutes} 分 ${secs} 秒`
}

// ==================== 计算属性 ====================
const canGenerate = computed(() => {
  return videoUrl.value && trimEnd.value > trimStart.value && !isGenerating.value
})

const selectionStyle = computed(() => {
  if (!videoInfo.value || !videoInfo.value.duration) return {}
  const duration = videoInfo.value.duration
  const startPercent = (trimStart.value / duration) * 100
  const endPercent = (trimEnd.value / duration) * 100
  return {
    left: startPercent + '%',
    width: (endPercent - startPercent) + '%'
  }
})

const handleStartStyle = computed(() => {
  if (!videoInfo.value || !videoInfo.value.duration) return { left: '0%' }
  const duration = videoInfo.value.duration
  const percent = (trimStart.value / duration) * 100
  return { left: percent + '%' }
})

const handleEndStyle = computed(() => {
  if (!videoInfo.value || !videoInfo.value.duration) return { left: '100%' }
  const duration = videoInfo.value.duration
  const percent = (trimEnd.value / duration) * 100
  return { left: percent + '%' }
})

const playheadStyle = computed(() => {
  if (!videoInfo.value || !videoInfo.value.duration) return { left: '0%' }
  const duration = videoInfo.value.duration
  const percent = duration > 0 ? (currentTime.value / duration) * 100 : 0
  return { left: percent + '%' }
})

// ==================== 预设应用 ====================
const applyPreset = (preset) => {
  currentPreset.value = preset
  switch (preset) {
    case 'small':
      fps.value = 10
      quality.value = 20
      colors.value = 128
      break
    case 'balanced':
      fps.value = 15
      quality.value = 10
      colors.value = 256
      break
    case 'quality':
      fps.value = 20
      quality.value = 5
      colors.value = 256
      break
  }
  showToast(`已应用预设: ${preset === 'small' ? '小文件' : preset === 'balanced' ? '平衡' : '高质量'}`, 'success')
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
  if (!file.type.startsWith('video/')) {
    showToast('请选择有效的视频文件', 'error')
    return
  }

  const maxSize = 2 * 1024 * 1024 * 1024
  if (file.size > maxSize) {
    showToast('视频文件过大，请选择小于 2GB 的文件', 'error')
    return
  }

  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  videoUrl.value = URL.createObjectURL(file)

  videoInfo.value = {
    name: file.name,
    duration: 0,
    size: formatBytes(file.size)
  }

  gifBlob.value = null
  if (gifPreviewUrl.value) {
    URL.revokeObjectURL(gifPreviewUrl.value)
    gifPreviewUrl.value = null
  }

  statusMsg.value = '视频加载中...'
}

const removeVideo = () => {
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  videoUrl.value = null
  videoInfo.value = null
  trimStart.value = 0
  trimEnd.value = 0
  currentTime.value = 0
  gifBlob.value = null
  if (gifPreviewUrl.value) {
    URL.revokeObjectURL(gifPreviewUrl.value)
    gifPreviewUrl.value = null
  }
  statusMsg.value = '就绪'
  showToast('视频已移除', 'success')
}

const onVideoError = (e) => {
  console.error('视频加载错误:', e)
  showToast('视频加载失败，请检查文件格式', 'error')
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
    videoUrl.value = null
  }
  videoInfo.value = null
}

const onVideoLoaded = () => {
  const video = videoEl.value
  if (!video) return

  video.muted = true
  videoInfo.value.duration = video.duration
  trimStart.value = 0
  trimEnd.value = video.duration

  statusMsg.value = '视频就绪'
  showToast('视频加载成功', 'success')
}

const onTimeUpdate = () => {
  const video = videoEl.value
  if (video) {
    currentTime.value = video.currentTime
    isPlaying.value = !video.paused
  }
}

// ==================== 播放/暂停整个视频 ====================
const togglePlayPause = () => {
  const video = videoEl.value
  if (!video) return
  
  if (video.paused) {
    video.play()
    isPlaying.value = true
  } else {
    video.pause()
    isPlaying.value = false
  }
}

// ==================== 时间轴交互 ====================
const getTimeFromEvent = (e) => {
  if (!timelineTrack.value || !videoInfo.value) return null
  const rect = timelineTrack.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const percent = Math.max(0, Math.min(1, x / rect.width))
  return percent * videoInfo.value.duration
}

const onTimelineMouseDown = (e) => {
  if (!videoInfo.value) return
  const time = getTimeFromEvent(e)
  if (time === null) return

  // 判断点击位置靠近哪个手柄
  const distToStart = Math.abs(time - trimStart.value)
  const distToEnd = Math.abs(time - trimEnd.value)

  if (distToStart < distToEnd) {
    dragHandle.value = 'start'
    trimStart.value = Math.min(time, trimEnd.value - 0.1)
  } else {
    dragHandle.value = 'end'
    trimEnd.value = Math.max(time, trimStart.value + 0.1)
  }

  isDragging.value = true
  updateVideoTime()
}

const onHandleMouseDown = (e, handle) => {
  e.stopPropagation()
  dragHandle.value = handle
  isDragging.value = true
}

const onTimelineMouseMove = (e) => {
  if (!isDragging.value || !videoInfo.value) return
  const time = getTimeFromEvent(e)
  if (time === null) return

  if (dragHandle.value === 'start') {
    trimStart.value = Math.max(0, Math.min(time, trimEnd.value - 0.1))
  } else if (dragHandle.value === 'end') {
    trimEnd.value = Math.min(videoInfo.value.duration, Math.max(time, trimStart.value + 0.1))
  }

  updateVideoTime()
}

const onTimelineMouseUp = () => {
  isDragging.value = false
  dragHandle.value = null
}

const setTrimStart = () => {
  const video = videoEl.value
  if (!video) return
  trimStart.value = Math.min(video.currentTime, trimEnd.value - 0.1)
  showToast('起点已设置: ' + formatTime(trimStart.value), 'success')
}

const setTrimEnd = () => {
  const video = videoEl.value
  if (!video) return
  trimEnd.value = Math.max(video.currentTime, trimStart.value + 0.1)
  showToast('终点已设置: ' + formatTime(trimEnd.value), 'success')
}

const resetTrim = () => {
  if (!videoInfo.value) return
  trimStart.value = 0
  trimEnd.value = videoInfo.value.duration
  showToast('时间范围已重置', 'success')
}

// 播放/暂停片段
const playSegment = async () => {
  const video = videoEl.value
  if (!video || !videoInfo.value) return
  
  // 如果正在播放片段，则暂停
  if (isPlayingSegment.value) {
    video.pause()
    isPlayingSegment.value = false
    return
  }
  
  // 开始播放片段
  isPlayingSegment.value = true
  video.currentTime = trimStart.value
  
  // 等待视频跳转完成
  await new Promise(resolve => {
    video.addEventListener('seeked', resolve, { once: true })
  })
  
  await video.play()
  
  // 监听播放进度，到达终点时停止
  const checkProgress = () => {
    if (video.currentTime >= trimEnd.value || video.ended) {
      video.pause()
      video.removeEventListener('timeupdate', checkProgress)
      isPlayingSegment.value = false
    }
  }
  
  video.addEventListener('timeupdate', checkProgress)
  
  // 如果用户手动暂停，也要更新状态
  const handlePause = () => {
    isPlayingSegment.value = false
    video.removeEventListener('pause', handlePause)
  }
  video.addEventListener('pause', handlePause)
}

const updateVideoTime = () => {
  const video = videoEl.value
  if (!video) return
  
  // 拖动起点或终点时都更新视频时间
  if (dragHandle.value === 'start') {
    video.currentTime = trimStart.value
  } else if (dragHandle.value === 'end') {
    video.currentTime = trimEnd.value
  }
}

// ==================== 更新进度 ====================
const updateProgress = (current, total) => {
  progressInfo.value.current = current
  progressInfo.value.total = total
  progressInfo.value.percent = Math.floor((current / total) * 100)

  if (progressInfo.value.startTime && current > 0) {
    const elapsed = (Date.now() - progressInfo.value.startTime) / 1000
    const avgTimePerFrame = elapsed / current
    const remaining = (total - current) * avgTimePerFrame
    progressInfo.value.estimatedTime = Math.ceil(remaining)
  }
}

const resetProgress = () => {
  progressInfo.value = {
    current: 0,
    total: 0,
    percent: 0,
    startTime: null,
    estimatedTime: 0
  }
}

// ==================== 取消生成 ====================
const cancelGenerate = () => {
  if (!isGenerating.value) return
  
  isCancelled.value = true
  
  // 中止当前 GIF 实例
  if (currentGifInstance.value) {
    try {
      currentGifInstance.value.abort()
    } catch (err) {
      console.error('中止 GIF 生成失败:', err)
    }
    currentGifInstance.value = null
  }
  
  isGenerating.value = false
  resetProgress()
  showToast('已取消生成', 'success')
  statusMsg.value = '就绪'
}

// ==================== GIF 生成 ====================
const generateGif = async () => {
  const video = videoEl.value
  if (!video || !canGenerate.value) return

  isGenerating.value = true
  isCancelled.value = false
  gifBlob.value = null
  if (gifPreviewUrl.value) {
    URL.revokeObjectURL(gifPreviewUrl.value)
    gifPreviewUrl.value = null
  }

  resetProgress()
  progressInfo.value.startTime = Date.now()

  try {
    const duration = trimEnd.value - trimStart.value
    const totalFrames = Math.floor(duration * fps.value)

    if (totalFrames <= 0) {
      throw new Error('时间范围无效')
    }

    if (totalFrames > 300) {
      const confirmed = confirm(`将生成 ${totalFrames} 帧，可能需要较长时间且占用较多内存。\n\n是否继续？`)
      if (!confirmed) {
        isGenerating.value = false
        return
      }
    }

    statusMsg.value = '准备中...'

    // 计算 GIF 尺寸（使用视频原始尺寸，最大限制为 640px 宽）
    const maxWidth = 640
    let gifWidth = video.videoWidth
    let gifHeight = video.videoHeight
    
    if (gifWidth > maxWidth) {
      const ratio = maxWidth / gifWidth
      gifWidth = maxWidth
      gifHeight = Math.round(video.videoHeight * ratio)
    }

    // 创建 GIF 编码器
    const gif = new GIF({
      workers: 2,
      quality: quality.value,
      width: gifWidth,
      height: gifHeight,
      workerScript: '/subtitle_extractor/node_modules/gif.js/dist/gif.worker.js',
      background: '#000000',
      repeat: loop.value ? 0 : -1,
      transparent: null,
      dither: dither.value === 'none' ? false : dither.value,
      maxColors: colors.value
    })
    
    // 保存当前 GIF 实例
    currentGifInstance.value = gif

    // 临时 Canvas
    const canvas = document.createElement('canvas')
    canvas.width = gifWidth
    canvas.height = gifHeight
    const ctx = canvas.getContext('2d')

    // 逐帧捕获
    for (let i = 0; i < totalFrames; i++) {
      // 检查是否取消
      if (isCancelled.value) {
        throw new Error('用户取消')
      }
      
      const frameTime = trimStart.value + (i / fps.value)

      // 跳转到指定时间
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          video.removeEventListener('seeked', onSeeked)
          reject(new Error('Seek 超时 @ ' + formatTime(frameTime)))
        }, 5000)

        function onSeeked() {
          clearTimeout(timeout)
          video.removeEventListener('seeked', onSeeked)

          // 绘制到 Canvas
          ctx.fillStyle = '#000000'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          // 添加到 GIF
          gif.addFrame(ctx, { copy: true, delay: 1000 / fps.value })
          resolve()
        }

        video.addEventListener('seeked', onSeeked)
        video.currentTime = Math.min(frameTime, trimEnd.value - 0.001)
      })

      // 更新进度
      updateProgress(i + 1, totalFrames)
      statusMsg.value = `处理中... ${i + 1}/${totalFrames}`
      
      // 让出主线程，避免卡死
      await new Promise(resolve => setTimeout(resolve, 0))
    }

    // 渲染 GIF
    statusMsg.value = '渲染 GIF...'

    // 设置事件监听器（在 render 之前）
    gif.on('finished', (blob) => {
      if (isCancelled.value) return
      
      gifBlob.value = blob
      gifPreviewUrl.value = URL.createObjectURL(blob)
      gifInfo.value = { width: gifWidth, height: gifHeight }

      isGenerating.value = false
      isCancelled.value = false
      currentGifInstance.value = null
      resetProgress()

      showToast('GIF 生成完成！', 'success')
      statusMsg.value = '完成'
    })

    gif.on('progress', (p) => {
      statusMsg.value = `渲染中... ${Math.round(p * 100)}%`
    })
    
    gif.on('abort', () => {
      console.log('GIF 渲染被中止')
      isGenerating.value = false
      isCancelled.value = false
      currentGifInstance.value = null
      resetProgress()
    })

    // 开始渲染
    gif.render()

  } catch (err) {
    if (err.message === '用户取消') {
      console.log('用户取消了 GIF 生成')
    } else {
      console.error('GIF 生成失败:', err)
      showToast('GIF 生成失败: ' + err.message, 'error')
    }
    isGenerating.value = false
    isCancelled.value = false
    currentGifInstance.value = null
    resetProgress()
  }
}

const regenerateGif = () => {
  gifBlob.value = null
  if (gifPreviewUrl.value) {
    URL.revokeObjectURL(gifPreviewUrl.value)
    gifPreviewUrl.value = null
  }
  generateGif()
}

const downloadGif = () => {
  if (!gifBlob.value) return

  const url = URL.createObjectURL(gifBlob.value)
  const a = document.createElement('a')
  a.href = url
  a.download = `video_${Date.now()}.gif`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  showToast('GIF 已下载', 'success')
}

// ==================== 生命周期 ====================
onMounted(() => {
  // 添加全局鼠标释放监听
  document.addEventListener('mouseup', onTimelineMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', onTimelineMouseUp)
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (gifPreviewUrl.value) URL.revokeObjectURL(gifPreviewUrl.value)
})
</script>

<style scoped>
/* ===== 主布局 ===== */
.gif-converter {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  overflow-x: auto;
  min-height: 0;
}

.converter-left {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  width: 700px;
}

.converter-middle {
  width: 335px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.converter-right {
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

.upload-zone.has-video .upload-icon,
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

/* ===== 时间轴 ===== */
.timeline-container {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-label {
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.timeline-label i {
  color: var(--accent);
}

.timeline-time {
  font-size: 0.75rem;
  color: var(--muted);
  font-family: monospace;
}

.timeline-track {
  position: relative;
  height: 50px;
  background: var(--card);
  border-radius: var(--radius-sm);
  cursor: pointer;
  user-select: none;
}

.timeline-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 10% 100%;
  border-radius: var(--radius-sm);
  opacity: 0.3;
}

.timeline-selection {
  position: absolute;
  top: 0;
  bottom: 0;
  background: var(--accent-dim);
  border-radius: var(--radius-sm);
  pointer-events: none;
}

.timeline-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 12px;
  cursor: ew-resize;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transform: translateX(-50%);
}

.handle-line {
  width: 3px;
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
}

.handle-label {
  position: absolute;
  top: -22px;
  font-size: 0.7rem;
  color: var(--accent);
  font-family: monospace;
  white-space: nowrap;
  background: var(--bg);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--accent);
}

.timeline-playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #fff;
  z-index: 1;
  transform: translateX(-50%);
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
}

.timeline-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
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

/* ===== 预设按钮 ===== */
.preset-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.75rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--fg);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.preset-btn i {
  font-size: 1.2rem;
  color: var(--muted);
}

.preset-btn span {
  font-size: 0.8rem;
  font-weight: 600;
}

.preset-btn small {
  font-size: 0.65rem;
  color: var(--muted);
}

.preset-btn:hover {
  border-color: var(--accent);
  background: var(--accent-dim);
}

.preset-btn.active {
  border-color: var(--accent);
  background: var(--accent-dim);
  color: var(--accent);
}

.preset-btn.active i {
  color: var(--accent);
}

/* ===== 表单元素 ===== */
.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.form-select {
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--card);
  color: var(--fg);
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: var(--accent);
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

/* ===== 高级设置 ===== */
.advanced-settings {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 300px;
  }
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

/* ===== 生成按钮（带进度填充）===== */
.generate-btn {
  position: relative;
  overflow: hidden;
}

.generate-btn .btn-progress {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: linear-gradient(90deg, var(--accent), #00ffaa);
  transition: width 0.3s ease;
  z-index: 0;
}

.generate-btn .btn-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.generate-btn.generating {
  border-color: var(--accent);
}

/* ===== 进度条样式 ===== */
.progress-container {
  margin-top: 0.5rem;
  padding: 0.75rem;
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
  margin-bottom: 0.5rem;
}

.progress-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--fg);
}

.progress-percent {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--accent);
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.4rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #00ffaa);
  border-radius: 3px;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px var(--accent-dim);
}

.progress-footer {
  display: flex;
  justify-content: center;
}

.progress-time {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  color: var(--muted);
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
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.gif-preview-container {
  overflow: auto;
  max-height: 500px;
  background: var(--card);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.gif-preview {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
  display: block;
}

.result-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: center;
}
</style>
