<template>
  <div class="vsub-layout">

    <!-- ==================== 左栏：视频播放器 ==================== -->
    <div class="vsub-left">

      <!-- 视频文件上传 -->
      <div
        class="upload-zone"
        :class="{ 'drag-over': isDragOver }"
        @click="fileInput.click()"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="onDrop"
      >
        <i class="fa-solid fa-film"></i>
        <p class="upload-text">点击或拖拽视频到此处</p>
        <p class="upload-hint">支持 MP4 / WebM / MOV 等浏览器可播放格式</p>
        <input
          ref="fileInput"
          type="file"
          accept="video/*"
          style="display:none"
          @change="onFileChange"
        />
      </div>

      <!-- 视频信息栏（加载后显示） -->
      <div v-if="videoInfo" class="video-info-bar">
        <span><i class="fa-solid fa-file-video"></i> {{ videoInfo.name }}</span>
        <span><i class="fa-solid fa-expand"></i> {{ videoInfo.width }} × {{ videoInfo.height }}</span>
        <span><i class="fa-solid fa-weight-hanging"></i> {{ videoInfo.size }}</span>
      </div>

      <!-- 视频播放器 + 覆盖层 Canvas -->
      <div v-if="videoUrl" class="video-wrapper" ref="videoWrapper">
        <!--
          视频元素：controls 显示原生控制栏
          @loadedmetadata：视频元数据加载完成时触发（此时能拿到宽高、时长）
        -->
        <video
          ref="videoEl"
          :src="videoUrl"
          controls
          class="video-player"
          @loadedmetadata="onVideoLoaded"
          @resize="onVideoResize"
        ></video>

        <!--
          覆盖层 Canvas：绘制框选矩形
          position:absolute 叠在视频上方
          pointer-events:auto 让鼠标事件穿透到这里（不被视频拦截）
        -->
        <canvas
          ref="overlayCanvas"
          class="overlay-canvas"
          @mousedown="onSelectStart"
          @mousemove="onSelectMove"
          @mouseup="onSelectEnd"
          @mouseleave="onSelectEnd"
        ></canvas>
      </div>

      <!-- 操作提示 -->
      <div v-if="videoUrl" class="op-hint">
        <i class="fa-solid fa-hand-pointer"></i>
        拖拽框选字幕区域 · 坐标自动同步到右侧
      </div>

      <!-- 结果预览区 -->
      <div v-if="resultCanvas" class="result-section">
        <div class="result-header">
          <i class="fa-solid fa-check-circle" style="color:var(--accent)"></i>
          提取完成 · {{ resultWidth }} × {{ resultHeight }} px ·
          共 {{ extractedCount }} 帧
        </div>
        <canvas ref="resultCanvasEl" class="result-canvas"></canvas>
        <div class="result-actions">
          <button class="btn btn-primary" @click="saveResult('png')">
            <i class="fa-solid fa-download"></i> 保存 PNG
          </button>
          <button class="btn" @click="saveResult('jpeg')">
            <i class="fa-solid fa-download"></i> 保存 JPEG
          </button>
        </div>
      </div>

    </div>

    <!-- ==================== 右栏：控制面板 ==================== -->
    <div class="vsub-right">

      <!-- 裁剪坐标输入 -->
      <div class="settings-panel">
        <div class="panel-title">
          <i class="fa-solid fa-crop"></i> 裁剪区域坐标
        </div>
        <div class="coord-grid">
          <div class="coord-item">
            <label class="form-label">左 X1</label>
            <input type="number" v-model.number="coordX1" placeholder="x1" @change="applyCoord" />
          </div>
          <div class="coord-item">
            <label class="form-label">上 Y1</label>
            <input type="number" v-model.number="coordY1" placeholder="y1" @change="applyCoord" />
          </div>
          <div class="coord-item">
            <label class="form-label">右 X2</label>
            <input type="number" v-model.number="coordX2" placeholder="x2" @change="applyCoord" />
          </div>
          <div class="coord-item">
            <label class="form-label">下 Y2</label>
            <input type="number" v-model.number="coordY2" placeholder="y2" @change="applyCoord" />
          </div>
        </div>
        <button class="btn btn-block" style="font-size:0.8rem" @click="applyCoord">
          <i class="fa-solid fa-check"></i> 应用坐标
        </button>
      </div>

      <!-- 时间标记 -->
      <div class="settings-panel">
        <div class="panel-title">
          <i class="fa-solid fa-clock"></i> 时间标记
          <span class="panel-hint">空格 / Enter 快速标记</span>
        </div>

        <div class="action-row">
          <button class="btn" :disabled="!videoUrl" @click="markCurrentTime">
            <i class="fa-solid fa-circle-dot"></i> 标记当前帧
          </button>
          <button class="btn" :disabled="timePoints.length === 0" @click="undoLastMark">
            <i class="fa-solid fa-rotate-left"></i> 撤销
          </button>
          <button class="btn btn-danger" :disabled="timePoints.length === 0" @click="clearMarks">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>

        <!--
          时间点列表：可手动编辑
          v-model 双向绑定，用户可以直接修改文本内容
        -->
        <textarea
          v-model="timePointsText"
          rows="5"
          placeholder="时间点列表（可手动编辑）&#10;格式: 1. 00:00:05.000 (帧:150)&#10;&#10;留空则按每秒均匀提取"
        ></textarea>

        <button class="btn btn-block" style="font-size:0.8rem" @click="parseTimePoints">
          <i class="fa-solid fa-code-merge"></i> 解析并应用文本
        </button>
      </div>

      <!-- 拼接样式设置 -->
      <div class="settings-panel">
        <div class="panel-title">
          <i class="fa-solid fa-sliders"></i> 拼接设置
        </div>

        <div class="form-row" style="flex-wrap:wrap; gap:0.75rem">
          <div style="flex:1; min-width:80px">
            <label class="form-label">背景色</label>
            <input type="text" v-model="bgColor" placeholder="#ffffff" />
          </div>
          <div style="flex:1; min-width:80px">
            <label class="form-label">间距 px</label>
            <input type="number" v-model.number="spacing" min="0" />
          </div>
        </div>

        <div>
          <label class="form-label">输出格式</label>
          <div class="seg-control">
            <button
              v-for="fmt in ['png','jpeg']"
              :key="fmt"
              class="seg-btn"
              :class="{ active: format === fmt }"
              @click="format = fmt"
            >{{ fmt.toUpperCase() }}</button>
          </div>
        </div>

        <button
          class="btn btn-primary btn-block"
          :disabled="!videoUrl || isExtracting"
          @click="extractAndStitch"
        >
          <i class="fa-solid" :class="isExtracting ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'"></i>
          {{ isExtracting ? extractProgress : '智能提取并拼接' }}
        </button>

        <!-- 状态条 -->
        <div class="status-bar" :class="statusType">
          <span class="status-dot"></span>
          {{ statusMsg }}
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
// =============================================
// VideoSubtitle.vue —— 视频字幕提取
// 核心：视频覆盖层框选 + 逐帧 seek 截图 + 拼接
// =============================================

import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useToast } from '../composables/useToast.js'

const { showToast } = useToast()

// ==================== DOM 引用 ====================
const fileInput     = ref(null)
const videoEl       = ref(null)       // <video> 元素
const overlayCanvas = ref(null)       // 框选覆盖层 Canvas
const videoWrapper  = ref(null)       // 视频+Canvas 的容器
const resultCanvasEl = ref(null)

// ==================== 视频状态 ====================
const videoUrl    = ref(null)         // ObjectURL
const isDragOver  = ref(false)
const videoInfo   = ref(null)         // { name, width, height, size }

// 视频原始分辨率（用于坐标换算）
const videoNativeW = ref(0)
const videoNativeH = ref(0)

// ==================== 框选状态 ====================
const selecting      = ref(false)
const selectionStart = ref(null)      // { x, y } 鼠标按下时的 Canvas 坐标
const selectionEnd   = ref(null)      // { x, y } 鼠标当前位置的 Canvas 坐标
const cropRect       = ref(null)      // { x1, y1, x2, y2 } 原始像素坐标

// 坐标输入框的值（与 cropRect 同步）
const coordX1 = ref(0)
const coordY1 = ref(0)
const coordX2 = ref(0)
const coordY2 = ref(0)

// ==================== 时间标记 ====================
// 每个元素：{ timeSec: number, frameIdx: number }
const timePoints     = ref([])
const timePointsText = ref('')        // textarea 显示内容
const fps            = ref(30)        // 估算帧率

// ==================== 拼接设置 ====================
const bgColor  = ref('#ffffff')
const spacing  = ref(2)
const format   = ref('png')

// ==================== 结果状态 ====================
const resultCanvas   = ref(null)
const resultWidth    = ref(0)
const resultHeight   = ref(0)
const extractedCount = ref(0)
const isExtracting   = ref(false)
const extractProgress = ref('')

// ==================== 状态提示 ====================
const statusMsg  = ref('就绪 · 上传视频后框选字幕区域')
const statusType = ref('')

const setStatus = (msg, type = '') => {
  statusMsg.value  = msg
  statusType.value = type
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
  // 释放旧的 ObjectURL
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)

  videoUrl.value = URL.createObjectURL(file)

  videoInfo.value = {
    name: file.name,
    width: '加载中...',
    height: '',
    size: formatBytes(file.size)
  }

  // 重置状态
  cropRect.value   = null
  timePoints.value = []
  timePointsText.value = ''
  resultCanvas.value   = null

  setStatus('视频加载中...', 'processing')
}

// ==================== 视频元素事件 ====================

/**
 * 视频元数据加载完成
 * 此时可以拿到 videoWidth、videoHeight、duration
 */
const onVideoLoaded = async () => {
  const video = videoEl.value
  if (!video) return

  videoNativeW.value = video.videoWidth
  videoNativeH.value = video.videoHeight

  // 估算帧率（通过 duration 无法直接获取，默认 30）
  fps.value = 30

  videoInfo.value = {
    ...videoInfo.value,
    width:  video.videoWidth,
    height: video.videoHeight
  }

  setStatus(`视频就绪 · ${video.videoWidth}×${video.videoHeight} · 时长 ${formatTime(video.duration)}`)

  // 等 DOM 渲染完成后，初始化覆盖层 Canvas 尺寸
  await nextTick()
  resizeOverlayCanvas()
  showToast('视频加载成功', 'success')
}

/**
 * 视频窗口尺寸变化时，重新调整覆盖层 Canvas
 * （用户拖拽弹窗大小时会触发）
 */
const onVideoResize = () => { resizeOverlayCanvas() }

/**
 * 让覆盖层 Canvas 的像素尺寸 = 视频元素的显示尺寸
 * 这样鼠标坐标才能 1:1 对应 Canvas 像素
 */
const resizeOverlayCanvas = () => {
  const video  = videoEl.value
  const canvas = overlayCanvas.value
  if (!video || !canvas) return

  const rect    = video.getBoundingClientRect()
  canvas.width  = rect.width
  canvas.height = rect.height

  // 覆盖层用 CSS 绝对定位叠在视频上
  canvas.style.width  = rect.width  + 'px'
  canvas.style.height = rect.height + 'px'

  // 重绘已有的选区
  drawOverlay()
}

// ==================== 框选交互 ====================

/**
 * 把鼠标事件的客户端坐标转为 Canvas 内坐标
 */
const getCanvasPos = (e) => {
  const canvas = overlayCanvas.value
  const rect   = canvas.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

/**
 * Canvas 坐标 → 视频原始像素坐标
 * 因为 Canvas 的显示尺寸 ≠ 视频原始分辨率
 */
const canvasToVideoCoord = (canvasX, canvasY) => {
  const canvas = overlayCanvas.value
  if (!canvas) return { x: 0, y: 0 }

  return {
    x: Math.round(canvasX / canvas.width  * videoNativeW.value),
    y: Math.round(canvasY / canvas.height * videoNativeH.value)
  }
}

/** 鼠标按下：开始框选 */
const onSelectStart = (e) => {
  if (!videoUrl.value) return
  selecting.value      = true
  selectionStart.value = getCanvasPos(e)
  selectionEnd.value   = { ...selectionStart.value }
}

/** 鼠标移动：更新框选区域 */
const onSelectMove = (e) => {
  if (!selecting.value) return
  selectionEnd.value = getCanvasPos(e)
  drawOverlay()
}

/** 鼠标释放：完成框选，保存原始像素坐标 */
const onSelectEnd = (e) => {
  if (!selecting.value) return
  selecting.value = false

  const start = selectionStart.value
  const end   = selectionEnd.value

  if (!start || !end) return

  // 确保 x1 < x2、y1 < y2（鼠标可以从任意方向拖拽）
  const minX = Math.min(start.x, end.x)
  const minY = Math.min(start.y, end.y)
  const maxX = Math.max(start.x, end.x)
  const maxY = Math.max(start.y, end.y)

  // 过滤掉误点（框选区域太小）
  if (maxX - minX < 5 || maxY - minY < 5) return

  // 转换为视频原始像素坐标
  const topLeft     = canvasToVideoCoord(minX, minY)
  const bottomRight = canvasToVideoCoord(maxX, maxY)

  cropRect.value = {
    x1: topLeft.x,
    y1: topLeft.y,
    x2: bottomRight.x,
    y2: bottomRight.y
  }

  // 同步到坐标输入框
  coordX1.value = cropRect.value.x1
  coordY1.value = cropRect.value.y1
  coordX2.value = cropRect.value.x2
  coordY2.value = cropRect.value.y2

  drawOverlay()
  setStatus(`已选区域 · (${cropRect.value.x1}, ${cropRect.value.y1}) → (${cropRect.value.x2}, ${cropRect.value.y2})`)
}

/**
 * 在覆盖层 Canvas 上绘制框选矩形
 */
const drawOverlay = () => {
  const canvas = overlayCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  let x, y, w, h

  if (selecting.value && selectionStart.value && selectionEnd.value) {
    // 正在框选中：用实时坐标绘制
    x = Math.min(selectionStart.value.x, selectionEnd.value.x)
    y = Math.min(selectionStart.value.y, selectionEnd.value.y)
    w = Math.abs(selectionEnd.value.x - selectionStart.value.x)
    h = Math.abs(selectionEnd.value.y - selectionStart.value.y)
  } else if (cropRect.value) {
    // 已完成框选：把原始像素坐标换算回 Canvas 坐标来绘制
    const scaleX = canvas.width  / videoNativeW.value
    const scaleY = canvas.height / videoNativeH.value
    x = cropRect.value.x1 * scaleX
    y = cropRect.value.y1 * scaleY
    w = (cropRect.value.x2 - cropRect.value.x1) * scaleX
    h = (cropRect.value.y2 - cropRect.value.y1) * scaleY
  } else {
    return // 没有选区，不绘制
  }

  // 半透明填充
  ctx.fillStyle = 'rgba(0, 224, 158, 0.15)'
  ctx.fillRect(x, y, w, h)

  // 虚线边框
  ctx.strokeStyle = 'var(--accent, #00e09e)'
  ctx.lineWidth   = 2
  ctx.setLineDash([6, 4])
  ctx.strokeRect(x, y, w, h)

  // 四角标记（让用户知道可以调整）
  ctx.setLineDash([])
  ctx.fillStyle = '#00e09e'
  const cs = 6  // 角标大小
  ;[[x, y], [x+w, y], [x, y+h], [x+w, y+h]].forEach(([cx, cy]) => {
    ctx.fillRect(cx - cs/2, cy - cs/2, cs, cs)
  })
}

// ==================== 坐标手动输入 ====================

/** 用户手动修改坐标输入框后，更新 cropRect 并重绘 */
const applyCoord = () => {
  const x1 = Math.max(0, Math.min(coordX1.value, videoNativeW.value))
  const y1 = Math.max(0, Math.min(coordY1.value, videoNativeH.value))
  const x2 = Math.max(0, Math.min(coordX2.value, videoNativeW.value))
  const y2 = Math.max(0, Math.min(coordY2.value, videoNativeH.value))

  if (x2 > x1 && y2 > y1) {
    cropRect.value = { x1, y1, x2, y2 }
    drawOverlay()
    setStatus(`已应用坐标 · (${x1}, ${y1}) → (${x2}, ${y2})`)
  }
}

// ==================== 时间标记 ====================

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '--'
  const h  = Math.floor(seconds / 3600)
  const m  = Math.floor((seconds % 3600) / 60)
  const s  = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(3,'0')}`
}

const formatBytes = (bytes) => {
  if (!bytes) return '-'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

/** 标记当前播放时间点 */
const markCurrentTime = () => {
  const video = videoEl.value
  if (!video) return

  const timeSec  = video.currentTime
  const frameIdx = Math.round(timeSec * fps.value)

  timePoints.value.push({ timeSec, frameIdx })
  refreshTimeText()
  setStatus(`已标记 ${timePoints.value.length} 个时间点`)
}

/** 撤销最后一个标记 */
const undoLastMark = () => {
  timePoints.value.pop()
  refreshTimeText()
}

/** 清空所有标记 */
const clearMarks = () => {
  timePoints.value = []
  timePointsText.value = ''
}

/** 把 timePoints 数组刷新到 textarea 文本 */
const refreshTimeText = () => {
  timePointsText.value = timePoints.value
    .map((p, i) => `${i + 1}. ${formatTime(p.timeSec)} (帧:${p.frameIdx})`)
    .join('\n')
}

/**
 * 解析 textarea 里的文本 → 更新 timePoints 数组
 * 支持用户手动编辑时间点
 */
const parseTimePoints = () => {
  const lines = timePointsText.value.trim().split('\n').filter(l => l.trim())
  const result = []

  // 时间格式正则：匹配 HH:MM:SS.mmm
  const timeReg = /(\d{2}):(\d{2}):(\d{2})\.(\d{3})/

  lines.forEach(line => {
    const m = line.match(timeReg)
    if (!m) return
    const timeSec = parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseInt(m[3]) + parseInt(m[4]) / 1000
    result.push({ timeSec, frameIdx: Math.round(timeSec * fps.value) })
  })

  timePoints.value = result
  showToast(`已解析 ${result.length} 个时间点`, 'success')
}

// ==================== 键盘快捷键 ====================

const onKeydown = (e) => {
  // 空格/Enter 标记当前时间（避免在 textarea 输入时触发）
  if ((e.code === 'Space' || e.code === 'Enter') && videoUrl.value) {
    // 如果焦点在 textarea 上，不触发
    if (document.activeElement?.tagName === 'TEXTAREA') return
    e.preventDefault()
    markCurrentTime()
  }
}

// ==================== 逐帧截图核心 ====================

/**
 * 把视频 seek 到指定时间，等待 seeked 事件后截图
 * 必须用 Promise + 事件监听，不能用 setTimeout
 * 因为 seek 是异步的，时间不确定
 *
 * @param {HTMLVideoElement} video
 * @param {number} timeSec - 目标时间（秒）
 * @param {Object} crop - { x1, y1, x2, y2 } 原始像素坐标
 * @returns {HTMLCanvasElement} 裁剪后的帧
 */
const captureFrame = (video, timeSec, crop) => {
  return new Promise((resolve, reject) => {
    // 设置超时保护（5秒内没 seeked 就报错）
    const timeout = setTimeout(() => {
      reject(new Error(`时间点 ${formatTime(timeSec)} seek 超时`))
    }, 5000)

    const onSeeked = () => {
      clearTimeout(timeout)
      video.removeEventListener('seeked', onSeeked)

      try {
        // 把当前帧绘制到临时 Canvas
        const w = crop.x2 - crop.x1
        const h = crop.y2 - crop.y1

        const canvas     = document.createElement('canvas')
        canvas.width     = w
        canvas.height    = h
        const ctx = canvas.getContext('2d')

        // drawImage 的 9 参数版本：
        // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        // sx/sy: 从源图的哪里开始截
        // sWidth/sHeight: 截多大
        // dx/dy: 画到目标 Canvas 的哪里
        // dWidth/dHeight: 画多大
        ctx.drawImage(
          video,
          crop.x1, crop.y1, w, h,  // 源：视频上的裁剪区域
          0, 0, w, h                // 目标：铺满整个 Canvas
        )

        resolve(canvas)
      } catch (err) {
        reject(err)
      }
    }

    video.addEventListener('seeked', onSeeked)
    video.currentTime = timeSec  // 触发 seek
  })
}

// ==================== 主提取流程 ====================

const extractAndStitch = async () => {
  const video = videoEl.value
  if (!video || !videoUrl.value) return

  // 检查是否有裁剪区域
  if (!cropRect.value) {
    showToast('请先框选字幕区域', 'error')
    setStatus('请先在视频上框选字幕区域', 'error')
    return
  }

  isExtracting.value = true
  resultCanvas.value = null
  setStatus('提取中...', 'processing')

  try {
    // ---- 确定要提取的时间点列表 ----
    let points = []

    if (timePoints.value.length > 0) {
      // 用户手动标记的时间点
      points = timePoints.value.map(p => p.timeSec)
    } else {
      // 留空：按每秒均匀提取
      const duration = video.duration
      if (!duration || !isFinite(duration)) throw new Error('无法获取视频时长')

      for (let t = 0; t <= duration; t += 1) {
        points.push(Math.min(t, duration - 0.001))
      }
    }

    // ---- 逐帧截图 ----
    const frames = []
    const crop   = cropRect.value

    for (let i = 0; i < points.length; i++) {
      extractProgress.value = `提取中 ${i + 1} / ${points.length}`
      setStatus(`提取中... ${i + 1} / ${points.length}`, 'processing')

      const frame = await captureFrame(video, points[i], crop)
      frames.push(frame)
    }

    if (frames.length === 0) throw new Error('没有成功提取到任何帧')

    // ---- 垂直拼接 ----
    setStatus('拼接中...', 'processing')

    const maxW   = Math.max(...frames.map(f => f.width))
    const totalH = frames.reduce((sum, f) => sum + f.height, 0) + spacing.value * (frames.length - 1)

    const result = document.createElement('canvas')
    result.width  = maxW
    result.height = totalH

    const ctx = result.getContext('2d')

    // 解析背景色（支持 #fff, white, transparent）
    const bg = bgColor.value.trim().toLowerCase()
    if (bg !== 'transparent') {
      ctx.fillStyle = bg === 'white' ? '#ffffff' : bg
      ctx.fillRect(0, 0, maxW, totalH)
    }

    let y = 0
    frames.forEach((frame, i) => {
      const offsetX = Math.floor((maxW - frame.width) / 2) // 居中
      ctx.drawImage(frame, offsetX, y)
      y += frame.height
      if (i < frames.length - 1) y += spacing.value
    })

    // ---- 显示结果 ----
    resultCanvas.value   = result
    resultWidth.value    = result.width
    resultHeight.value   = result.height
    extractedCount.value = frames.length

    await nextTick()
    if (resultCanvasEl.value) {
      resultCanvasEl.value.width  = result.width
      resultCanvasEl.value.height = result.height
      resultCanvasEl.value.getContext('2d').drawImage(result, 0, 0)
      resultCanvasEl.value.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    setStatus(`提取完成！共 ${frames.length} 帧，${result.width} × ${result.height} px`, 'success')
    showToast(`提取完成，共 ${frames.length} 帧`, 'success')

  } catch (err) {
    console.error('提取失败:', err)
    setStatus('提取失败：' + err.message, 'error')
    showToast('提取失败：' + err.message, 'error')
  } finally {
    isExtracting.value    = false
    extractProgress.value = ''
  }
}

// ==================== 保存结果 ====================

const saveResult = (fmt) => {
  if (!resultCanvas.value) return
  const mime = fmt === 'jpeg' ? 'image/jpeg' : 'image/png'
  resultCanvas.value.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a   = document.createElement('a')
    a.href     = url
    a.download = `subtitles_${Date.now()}.${fmt === 'jpeg' ? 'jpg' : 'png'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, mime, 0.92)
}

// ==================== 窗口 resize 处理 ====================

// 当弹窗大小变化时，重新调整覆盖层 Canvas
// 用 ResizeObserver 监听视频元素的尺寸变化
let resizeObserver = null

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

// 监听 videoEl 出现（因为初始时 video 元素还不存在）
watch(videoEl, (el) => {
  if (!el) return

  // ResizeObserver：专门用来监听元素尺寸变化
  // 比 window resize 更精确，弹窗宽度变化也能捕获
  resizeObserver = new ResizeObserver(() => {
    resizeOverlayCanvas()
  })
  resizeObserver.observe(el)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (resizeObserver) resizeObserver.disconnect()
})
</script>

<style scoped>
/* ===== 两栏布局 ===== */
.vsub-layout {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.vsub-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.vsub-right {
  width: 290px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
.upload-zone.drag-over::before { opacity: 1; }

.upload-zone i {
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

.video-info-bar i { color: var(--accent); margin-right: 0.25rem; }

/* ===== 视频播放器容器 ===== */
.video-wrapper {
  position: relative;   /* 让子元素的 position:absolute 相对于它定位 */
  background: #000;
  border-radius: var(--radius);
  overflow: hidden;
  line-height: 0;       /* 消除 video 元素下方的空白 */
}

.video-player {
  /*
    视频高度：在弹窗（max-width:880px）内，
    用 max-height 限制不超过视口的 45%，
    宽度自适应
  */
  width: 100%;
  max-height: 45vh;
  display: block;
  background: #000;
}

/* 覆盖层 Canvas：绝对定位叠在视频上 */
.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  cursor: crosshair;    /* 十字光标，提示可以框选 */
  /* pointer-events 由 JS 控制，这里不设置 */
}

.op-hint {
  font-size: 0.75rem;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.op-hint i { color: var(--accent); }

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
}

/* ===== 右栏设置面板 ===== */
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
  color: var(--fg);
}

.panel-title i { color: var(--accent); }

.panel-hint {
  font-size: 0.72rem;
  color: var(--muted);
  font-weight: 400;
  margin-left: auto;
}

/* 坐标输入 2×2 网格 */
.coord-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

/* 操作按钮行 */
.action-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* 分段控制器 */
.seg-control {
  display: flex;
  gap: 0.3rem;
  margin-top: 0.25rem;
}

.seg-btn {
  flex: 1;
  padding: 0.35rem 0.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  font-size: 0.8rem;
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

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .vsub-layout { flex-direction: column; }
  .vsub-right  { width: 100%; }
}
</style>