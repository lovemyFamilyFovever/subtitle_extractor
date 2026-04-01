<template>
  <div class="vsub-layout">

    <!-- ==================== 左栏：视频播放器 ==================== -->
    <div class="vsub-left">

      <!-- 视频文件上传区 -->
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

      <!--
        视频播放器 + 覆盖层 Canvas 容器
        使用浏览器原生 <video controls> 保留所有播放控制功能
        覆盖层 Canvas 只负责绘制框选矩形，不拦截视频控制栏的事件
      -->
      <div v-if="videoUrl" class="video-wrapper" ref="videoWrapper">

        <!-- 原生视频播放器 -->
        <video
          ref="videoEl"
          :src="videoUrl"
          controls
          class="video-player"
          @loadedmetadata="onVideoLoaded"
        ></video>

        <!--
          覆盖层 Canvas：仅用于绘制框选矩形
          pointer-events: none 时鼠标事件穿透到视频（允许播放控制）
          pointer-events: auto 时才拦截（框选模式开启时）
          高度比视频矮一些，避免遮住底部控制栏
        -->
        <canvas
          ref="overlayCanvas"
          class="overlay-canvas"
          :style="{ pointerEvents: selectMode ? 'auto' : 'none', cursor: selectMode ? 'crosshair' : 'default' }"
          @mousedown="onSelectStart"
          @mousemove="onSelectMove"
          @mouseup="onSelectEnd"
          @mouseleave="onSelectCancel"
        ></canvas>
      </div>

      <!-- 框选工具栏 -->
      <div v-if="videoUrl" class="toolbar">
        <!-- 框选模式开关 -->
        <button
          class="btn"
          :class="{ 'btn-primary': selectMode }"
          @click="toggleSelectMode"
          :title="selectMode ? '点击退出框选模式' : '点击进入框选模式，在视频上拖拽选定字幕区域'"
        >
          <i class="fa-solid" :class="selectMode ? 'fa-xmark' : 'fa-crop-simple'"></i>
          {{ selectMode ? '退出框选' : '框选字幕区域' }}
        </button>

        <!-- 清除选区 -->
        <button
          v-if="cropRect"
          class="btn"
          @click="clearCropRect"
          title="清除当前选区"
        >
          <i class="fa-solid fa-eraser"></i> 清除选区
        </button>

        <!-- 设为封面帧按钮 -->
        <button
          class="btn"
          :class="{ 'cover-active': coverTimeSec !== null }"
          @click="setCoverFrame"
          title="将当前播放位置设为封面帧（拼接图的上半部分）"
        >
          <i class="fa-solid fa-image"></i>
          {{ coverTimeSec !== null ? `封面帧: ${formatTime(coverTimeSec)}` : '设为封面帧' }}
        </button>

        <!-- 清除封面帧 -->
        <button
          v-if="coverTimeSec !== null"
          class="btn"
          @click="coverTimeSec = null"
          title="清除手动设置的封面帧，改为自动使用第一个时间点"
        >
          <i class="fa-solid fa-rotate-left"></i> 自动封面
        </button>
      </div>

      <!-- 操作提示 -->
      <div v-if="videoUrl" class="op-hint">
        <template v-if="selectMode">
          <i class="fa-solid fa-crosshairs" style="color:var(--accent)"></i>
          框选模式已开启 · 在视频画面上拖拽选定字幕区域，完成后点击「退出框选」
        </template>
        <template v-else>
          <i class="fa-solid fa-circle-info"></i>
          点击「框选字幕区域」开始划定区域 · 空格 / Enter 快速标记时间点
        </template>
      </div>

      <!-- 结果预览区（提取完成后显示） -->
      <div v-if="resultCanvas" class="result-section">
        <div class="result-header">
          <i class="fa-solid fa-check-circle" style="color:var(--accent)"></i>
          提取完成 · {{ resultWidth }} × {{ resultHeight }} px · 共 {{ extractedCount }} 帧
        </div>
        <!-- 结果 Canvas：显示最终拼接图预览 -->
        <canvas ref="resultCanvasEl" class="result-canvas"></canvas>
        <div class="result-actions">
          <button class="btn btn-primary" @click="saveResult">
            <i class="fa-solid fa-download"></i>
            保存 {{ format.toUpperCase() }}
          </button>
        </div>
      </div>

    </div>

    <!-- ==================== 右栏：控制面板 ==================== -->
    <div class="vsub-right">

      <!-- 裁剪坐标 -->
      <div class="settings-panel">
        <div class="panel-title">
          <i class="fa-solid fa-crop"></i> 字幕裁剪坐标
          <span class="panel-hint">框选后自动填入</span>
        </div>

        <!-- 当前选区可视化说明 -->
        <div v-if="cropRect" class="crop-preview-info">
          <div class="crop-row">
            <span class="crop-label cover-label">封面帧区域</span>
            <span class="crop-value">
              ({{ cropRect.x1 }}, 0) → ({{ cropRect.x2 }}, {{ cropRect.y1 }})
              <span class="crop-size">{{ cropRect.x2 - cropRect.x1 }} × {{ cropRect.y1 }} px</span>
            </span>
          </div>
          <div class="crop-row">
            <span class="crop-label sub-label">字幕区域</span>
            <span class="crop-value">
              ({{ cropRect.x1 }}, {{ cropRect.y1 }}) → ({{ cropRect.x2 }}, {{ cropRect.y2 }})
              <span class="crop-size">{{ cropRect.x2 - cropRect.x1 }} × {{ cropRect.y2 - cropRect.y1 }} px</span>
            </span>
          </div>
        </div>

        <div class="coord-grid">
          <div class="coord-item">
            <label class="form-label">左 X1</label>
            <input type="number" v-model.number="coordX1" placeholder="x1" min="0" @change="applyCoord" />
          </div>
          <div class="coord-item">
            <label class="form-label">上 Y1（字幕上边界）</label>
            <input type="number" v-model.number="coordY1" placeholder="y1" min="0" @change="applyCoord" />
          </div>
          <div class="coord-item">
            <label class="form-label">右 X2</label>
            <input type="number" v-model.number="coordX2" placeholder="x2" min="0" @change="applyCoord" />
          </div>
          <div class="coord-item">
            <label class="form-label">下 Y2（字幕下边界）</label>
            <input type="number" v-model.number="coordY2" placeholder="y2" min="0" @change="applyCoord" />
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

        <textarea
          v-model="timePointsText"
          rows="5"
          placeholder="时间点列表（可手动编辑）&#10;格式: 1. 00:00:05.000 (帧:150)&#10;&#10;留空则按每秒均匀提取"
        ></textarea>

        <button class="btn btn-block" style="font-size:0.8rem" @click="parseTimePoints">
          <i class="fa-solid fa-code-merge"></i> 解析并应用文本
        </button>
      </div>

      <!-- 拼接设置 -->
      <div class="settings-panel">
        <div class="panel-title">
          <i class="fa-solid fa-sliders"></i> 拼接设置
        </div>

        <!-- 背景色 + 间距 -->
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

        <!-- 输出格式：新增 WebP -->
        <div>
          <label class="form-label">输出格式</label>
          <div class="seg-control">
            <button
              v-for="fmt in ['png', 'jpeg', 'webp']"
              :key="fmt"
              class="seg-btn"
              :class="{ active: format === fmt }"
              @click="format = fmt"
            >{{ fmt.toUpperCase() }}</button>
          </div>
        </div>

        <!-- 图片压缩（仅 JPEG / WebP 有效，PNG 无损不压缩） -->
        <div>
          <label class="form-label">
            图片压缩
            <span v-if="format === 'png'" style="color:var(--muted); font-weight:400">（PNG 无损，此项无效）</span>
          </label>
          <div class="seg-control">
            <button
              v-for="opt in compressionOptions"
              :key="opt.value"
              class="seg-btn"
              :class="{ active: compression === opt.value }"
              :disabled="format === 'png'"
              @click="compression = opt.value"
            >{{ opt.label }}</button>
          </div>
        </div>

        <!-- 封面帧说明 -->
        <div class="cover-hint">
          <i class="fa-solid fa-layer-group" style="color:var(--accent)"></i>
          <div>
            <div>封面帧：
              <strong>{{ coverTimeSec !== null ? `手动 · ${formatTime(coverTimeSec)}` : '自动（第一个时间点）' }}</strong>
            </div>
            <div style="font-size:0.72rem; color:var(--muted); margin-top:2px">
              封面帧区域 = 字幕框选区同宽，高度为视频顶部 → 字幕上边界
            </div>
          </div>
        </div>

        <!-- 提取按钮 -->
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
//
// 核心改动（相对上一版）：
// 1. 视频改用原生 <video controls>，覆盖层 Canvas 用 pointer-events 切换
//    避免遮住播放控制栏
// 2. 新增封面帧逻辑：封面帧区域 = 框选区同宽，高度 = 视频顶部 → 字幕上边界(y1)
// 3. 手动封面帧：播放中点「设为封面帧」记录时间，提取时 seek 那一帧
// 4. 输出格式新增 WebP
// 5. 新增压缩选项（不压缩 / 2x / 4x / 8x）
// 6. 保存按钮直接按当前格式保存，不再二次选择
// =============================================

import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useToast } from '../composables/useToast.js'

const { showToast } = useToast()

// ==================== DOM 引用 ====================
const fileInput      = ref(null)
const videoEl        = ref(null)      // <video> 元素
const overlayCanvas  = ref(null)      // 框选覆盖层 Canvas（不用来渲染视频）
const videoWrapper   = ref(null)
const resultCanvasEl = ref(null)

// ==================== 视频状态 ====================
const videoUrl   = ref(null)
const isDragOver = ref(false)
const videoInfo  = ref(null)    // { name, width, height, size }

// 视频原始分辨率（坐标换算用）
const videoNativeW = ref(0)
const videoNativeH = ref(0)

// ==================== 框选模式 ====================
/*
  selectMode: true  → 覆盖层 Canvas pointer-events:auto，鼠标变十字，可以拖拽框选
  selectMode: false → pointer-events:none，鼠标事件穿透到 <video>，播放器正常工作
*/
const selectMode     = ref(false)
const selecting      = ref(false)
const selectionStart = ref(null)   // Canvas 坐标 { x, y }
const selectionEnd   = ref(null)   // Canvas 坐标 { x, y }
const cropRect       = ref(null)   // 原始像素坐标 { x1, y1, x2, y2 }

// 坐标输入框（与 cropRect 联动）
const coordX1 = ref(0)
const coordY1 = ref(0)
const coordX2 = ref(0)
const coordY2 = ref(0)

// ==================== 封面帧 ====================
/*
  coverTimeSec:
    null  → 自动模式：使用时间点列表第一个（列表空则用 t=0）
    数值  → 手动模式：使用用户「设为封面帧」时记录的时间点
*/
const coverTimeSec = ref(null)

// ==================== 时间标记 ====================
const timePoints     = ref([])
const timePointsText = ref('')
const fps            = ref(30)

// ==================== 拼接设置 ====================
const bgColor  = ref('#ffffff')
const spacing  = ref(2)
const format   = ref('png')

/*
  compressionOptions：压缩倍数选项
  value 直接对应 toBlob 的 quality 参数（0~1）
  PNG 是无损格式，quality 参数对它无效
*/
const compressionOptions = [
  { label: '不压缩', value: 1.0  },
  { label: '2x 压缩', value: 0.5  },
  { label: '4x 压缩', value: 0.25 },
  { label: '8x 压缩', value: 0.125 },
]
const compression = ref(1.0)

// ==================== 结果状态 ====================
const resultCanvas    = ref(null)
const resultWidth     = ref(0)
const resultHeight    = ref(0)
const extractedCount  = ref(0)
const isExtracting    = ref(false)
const extractProgress = ref('')

// ==================== 状态提示 ====================
const statusMsg  = ref('就绪 · 上传视频后框选字幕区域')
const statusType = ref('')

const setStatus = (msg, type = '') => {
  statusMsg.value  = msg
  statusType.value = type
}

// ==================== 工具函数 ====================

const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined) return '--'
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
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  videoUrl.value = URL.createObjectURL(file)

  videoInfo.value = {
    name:   file.name,
    width:  '加载中...',
    height: '',
    size:   formatBytes(file.size)
  }

  // 重置所有状态
  cropRect.value        = null
  selectMode.value      = false
  coverTimeSec.value    = null
  timePoints.value      = []
  timePointsText.value  = ''
  resultCanvas.value    = null

  setStatus('视频加载中...', 'processing')
}

// ==================== 视频元素事件 ====================

const onVideoLoaded = async () => {
  const video = videoEl.value
  if (!video) return

  videoNativeW.value = video.videoWidth
  videoNativeH.value = video.videoHeight
  fps.value = 30  // 浏览器 API 无法直接获取帧率，默认 30

  videoInfo.value = {
    ...videoInfo.value,
    width:  video.videoWidth,
    height: video.videoHeight
  }

  setStatus(`视频就绪 · ${video.videoWidth}×${video.videoHeight} · 时长 ${formatTime(video.duration)}`)

  await nextTick()
  resizeOverlayCanvas()
  showToast('视频加载成功', 'success')
}

// ==================== 覆盖层 Canvas 尺寸同步 ====================

/**
 * 让覆盖层 Canvas 的尺寸与视频显示区域完全一致
 * 注意：视频控制栏在底部，高度约 40px
 * 为了不遮挡控制栏，覆盖层高度设为视频元素高度减去控制栏高度
 * 但由于无法精确获知控制栏高度，我们让覆盖层高度 = 视频自然内容区域
 * 具体做法：覆盖层 CSS 设置 bottom 留出空间（见 style scoped）
 */
const resizeOverlayCanvas = () => {
  const video  = videoEl.value
  const canvas = overlayCanvas.value
  if (!video || !canvas) return

  const rect    = video.getBoundingClientRect()
  // 控制栏高度估算为 44px，覆盖层只覆盖视频画面部分
  // 实际上浏览器原生控制栏高度因浏览器而异，40-50px 是常见值
  const controlBarH = 44
  const contentH    = Math.max(0, rect.height - controlBarH)

  canvas.width  = Math.round(rect.width)
  canvas.height = Math.round(contentH)
  canvas.style.width  = rect.width + 'px'
  canvas.style.height = contentH   + 'px'

  drawOverlay()
}

// ==================== 框选模式切换 ====================

const toggleSelectMode = () => {
  selectMode.value = !selectMode.value
  if (!selectMode.value) {
    // 退出框选时停止任何进行中的框选
    selecting.value = false
  }
}

const clearCropRect = () => {
  cropRect.value = null
  selecting.value = false
  selectionStart.value = null
  selectionEnd.value = null
  drawOverlay()
  setStatus('已清除选区')
}

// ==================== 框选交互 ====================

const getCanvasPos = (e) => {
  const canvas = overlayCanvas.value
  const rect   = canvas.getBoundingClientRect()
  return {
    x: Math.max(0, Math.min(e.clientX - rect.left, canvas.width)),
    y: Math.max(0, Math.min(e.clientY - rect.top,  canvas.height))
  }
}

/**
 * Canvas 坐标 → 视频原始像素坐标
 * 覆盖层 Canvas 的尺寸对应的是视频画面区域（不含控制栏）
 * 需要换算到视频原始分辨率
 */
const canvasToVideoCoord = (cx, cy) => {
  const canvas = overlayCanvas.value
  if (!canvas || !canvas.width || !canvas.height) return { x: 0, y: 0 }
  return {
    x: Math.round(cx / canvas.width  * videoNativeW.value),
    y: Math.round(cy / canvas.height * videoNativeH.value)
  }
}

const onSelectStart = (e) => {
  if (!videoUrl.value || !selectMode.value) return
  selecting.value      = true
  selectionStart.value = getCanvasPos(e)
  selectionEnd.value   = { ...selectionStart.value }
}

const onSelectMove = (e) => {
  if (!selecting.value) return
  selectionEnd.value = getCanvasPos(e)
  drawOverlay()
}

const onSelectEnd = (e) => {
  if (!selecting.value) return
  selecting.value = false

  const start = selectionStart.value
  const end   = selectionEnd.value
  if (!start || !end) return

  const minX = Math.min(start.x, end.x)
  const minY = Math.min(start.y, end.y)
  const maxX = Math.max(start.x, end.x)
  const maxY = Math.max(start.y, end.y)

  // 过滤误点
  if (maxX - minX < 5 || maxY - minY < 5) return

  const tl = canvasToVideoCoord(minX, minY)
  const br = canvasToVideoCoord(maxX, maxY)

  cropRect.value = { x1: tl.x, y1: tl.y, x2: br.x, y2: br.y }

  // 同步到坐标输入框
  coordX1.value = cropRect.value.x1
  coordY1.value = cropRect.value.y1
  coordX2.value = cropRect.value.x2
  coordY2.value = cropRect.value.y2

  drawOverlay()
  setStatus(`字幕区 (${tl.x},${tl.y})→(${br.x},${br.y}) · 封面帧区高度=${tl.y}px`)
}

// mouseleave 时：如果正在框选则取消（不保存），避免鼠标划出去导致卡住
const onSelectCancel = () => {
  if (selecting.value) {
    selecting.value = false
    drawOverlay()
  }
}

// ==================== 绘制覆盖层 ====================

const drawOverlay = () => {
  const canvas = overlayCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  let x, y, w, h

  if (selecting.value && selectionStart.value && selectionEnd.value) {
    // 正在框选中：实时绘制
    x = Math.min(selectionStart.value.x, selectionEnd.value.x)
    y = Math.min(selectionStart.value.y, selectionEnd.value.y)
    w = Math.abs(selectionEnd.value.x - selectionStart.value.x)
    h = Math.abs(selectionEnd.value.y - selectionStart.value.y)
  } else if (cropRect.value && canvas.width > 0 && videoNativeW.value > 0) {
    // 已保存选区：换算回 Canvas 坐标绘制
    const scaleX = canvas.width  / videoNativeW.value
    const scaleY = canvas.height / videoNativeH.value
    x = cropRect.value.x1 * scaleX
    y = cropRect.value.y1 * scaleY
    w = (cropRect.value.x2 - cropRect.value.x1) * scaleX
    h = (cropRect.value.y2 - cropRect.value.y1) * scaleY
  } else {
    return
  }

  // ---- 绘制封面帧区域（字幕选框上方到视频顶部） ----
  // 用不同颜色区分：橙色半透明
  ctx.fillStyle = 'rgba(251, 146, 60, 0.12)'
  ctx.fillRect(x, 0, w, y)

  ctx.save()
  ctx.strokeStyle = '#fb923c'
  ctx.lineWidth   = 1.5
  ctx.setLineDash([5, 4])
  ctx.strokeRect(x, 0, w, y)
  ctx.setLineDash([])
  // 封面帧标签
  ctx.fillStyle = '#fb923c'
  ctx.font      = 'bold 12px system-ui'
  ctx.fillText('封面帧区域', x + 4, Math.max(16, y / 2))
  ctx.restore()

  // ---- 绘制字幕框选区域（绿色） ----
  ctx.fillStyle = 'rgba(0, 224, 158, 0.15)'
  ctx.fillRect(x, y, w, h)

  ctx.save()
  ctx.strokeStyle = '#00e09e'
  ctx.lineWidth   = 2
  ctx.setLineDash([6, 4])
  ctx.strokeRect(x, y, w, h)
  ctx.setLineDash([])

  // 字幕区标签
  ctx.fillStyle = '#00e09e'
  ctx.font      = 'bold 12px system-ui'
  ctx.fillText('字幕区域', x + 4, y + 16)

  // 四角标记
  ctx.fillStyle = '#00e09e'
  const cs = 6
  ;[[x, y], [x+w, y], [x, y+h], [x+w, y+h]].forEach(([cx, cy]) => {
    ctx.fillRect(cx - cs/2, cy - cs/2, cs, cs)
  })
  ctx.restore()
}

// ==================== 坐标手动输入 ====================

const applyCoord = () => {
  const x1 = Math.max(0, Math.min(coordX1.value || 0, videoNativeW.value))
  const y1 = Math.max(0, Math.min(coordY1.value || 0, videoNativeH.value))
  const x2 = Math.max(0, Math.min(coordX2.value || 0, videoNativeW.value))
  const y2 = Math.max(0, Math.min(coordY2.value || 0, videoNativeH.value))

  if (x2 > x1 && y2 > y1) {
    cropRect.value = { x1, y1, x2, y2 }
    drawOverlay()
    setStatus(`已应用坐标 · (${x1},${y1})→(${x2},${y2})`)
  }
}

// ==================== 封面帧 ====================

/**
 * 记录当前播放位置作为封面帧时间点
 */
const setCoverFrame = () => {
  const video = videoEl.value
  if (!video) return
  coverTimeSec.value = video.currentTime
  showToast(`封面帧已设为 ${formatTime(video.currentTime)}`, 'success')
}

// ==================== 时间标记 ====================

const markCurrentTime = () => {
  const video = videoEl.value
  if (!video) return
  const timeSec  = video.currentTime
  const frameIdx = Math.round(timeSec * fps.value)
  timePoints.value.push({ timeSec, frameIdx })
  refreshTimeText()
  setStatus(`已标记 ${timePoints.value.length} 个时间点`)
}

const undoLastMark = () => {
  timePoints.value.pop()
  refreshTimeText()
}

const clearMarks = () => {
  timePoints.value     = []
  timePointsText.value = ''
}

const refreshTimeText = () => {
  timePointsText.value = timePoints.value
    .map((p, i) => `${i + 1}. ${formatTime(p.timeSec)} (帧:${p.frameIdx})`)
    .join('\n')
}

const parseTimePoints = () => {
  const lines   = timePointsText.value.trim().split('\n').filter(l => l.trim())
  const timeReg = /(\d{2}):(\d{2}):(\d{2})\.(\d{3})/
  const result  = []

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
  if (document.activeElement?.tagName === 'TEXTAREA') return
  if (document.activeElement?.tagName === 'INPUT')    return

  if ((e.code === 'Space' || e.code === 'Enter') && videoUrl.value) {
    e.preventDefault()
    markCurrentTime()
  }
}

// ==================== 逐帧截图 ====================

/**
 * Seek 到指定时间并截图
 * @param {HTMLVideoElement} video
 * @param {number} timeSec - 目标时间（秒）
 * @param {{ x1, y1, x2, y2 }} cropArea - 裁剪区域（原始像素坐标）
 * @returns {Promise<HTMLCanvasElement>}
 */
const captureFrame = (video, timeSec, cropArea) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      video.removeEventListener('seeked', onSeeked)
      reject(new Error(`Seek 超时 @ ${formatTime(timeSec)}`))
    }, 8000)

    const onSeeked = () => {
      clearTimeout(timeout)
      video.removeEventListener('seeked', onSeeked)

      try {
        const w = cropArea.x2 - cropArea.x1
        const h = cropArea.y2 - cropArea.y1
        const c = document.createElement('canvas')
        c.width  = w
        c.height = h
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

// ==================== 主提取流程 ====================

const extractAndStitch = async () => {
  const video = videoEl.value
  if (!video || !videoUrl.value) return

  if (!cropRect.value) {
    showToast('请先框选字幕区域', 'error')
    setStatus('请先框选字幕区域', 'error')
    return
  }

  const crop = cropRect.value

  // 验证封面帧区域：字幕上边界 y1 必须 > 0
  if (crop.y1 <= 0) {
    showToast('字幕上边界(Y1)需大于 0，否则封面帧区域为空', 'error')
    setStatus('Y1 须大于 0（封面帧区域高度 = Y1）', 'error')
    return
  }

  isExtracting.value  = true
  resultCanvas.value  = null
  setStatus('提取中...', 'processing')

  try {
    // ---- 1. 确定字幕时间点列表 ----
    let subtitlePoints = []

    if (timePoints.value.length > 0) {
      subtitlePoints = timePoints.value.map(p => p.timeSec)
    } else {
      // 留空：按每秒均匀提取
      const duration = video.duration
      if (!duration || !isFinite(duration)) throw new Error('无法获取视频时长')
      for (let t = 0; t <= duration; t += 1) {
        subtitlePoints.push(Math.min(t, duration - 0.001))
      }
    }

    // ---- 2. 确定封面帧时间点 ----
    let coverTime
    if (coverTimeSec.value !== null) {
      // 手动设置的封面帧
      coverTime = coverTimeSec.value
    } else {
      // 自动：使用字幕时间点列表中第一个
      coverTime = subtitlePoints.length > 0 ? subtitlePoints[0] : 0
    }

    // ---- 3. 定义封面帧裁剪区域 ----
    // 宽度与字幕区一致（x1 ~ x2），高度从视频顶部(0)到字幕上边界(y1)
    const coverCrop = {
      x1: crop.x1,
      y1: 0,
      x2: crop.x2,
      y2: crop.y1   // 字幕上边界
    }

    // ---- 4. 提取封面帧 ----
    extractProgress.value = '提取封面帧...'
    setStatus('提取封面帧...', 'processing')
    const coverFrame = await captureFrame(video, coverTime, coverCrop)

    // ---- 5. 逐帧提取字幕 ----
    // 字幕裁剪区域
    const subCrop = {
      x1: crop.x1,
      y1: crop.y1,
      x2: crop.x2,
      y2: crop.y2
    }

    const subtitleFrames = []
    for (let i = 0; i < subtitlePoints.length; i++) {
      extractProgress.value = `提取字幕帧 ${i + 1} / ${subtitlePoints.length}`
      setStatus(`提取字幕帧 ${i + 1} / ${subtitlePoints.length}`, 'processing')
      const frame = await captureFrame(video, subtitlePoints[i], subCrop)
      subtitleFrames.push(frame)
    }

    if (subtitleFrames.length === 0) throw new Error('没有成功提取到任何字幕帧')

    // ---- 6. 垂直拼接：封面帧 + 所有字幕帧 ----
    setStatus('拼接中...', 'processing')

    // 所有帧宽度应相同（都是 x2-x1），取最大值保险
    const allFrames = [coverFrame, ...subtitleFrames]
    const maxW      = Math.max(...allFrames.map(f => f.width))
    const totalH    = allFrames.reduce((sum, f) => sum + f.height, 0)
                      + spacing.value * (allFrames.length - 1)

    const result = document.createElement('canvas')
    result.width  = maxW
    result.height = totalH

    const ctx = result.getContext('2d')

    // 背景色
    const bg = bgColor.value.trim().toLowerCase()
    if (bg !== 'transparent') {
      ctx.fillStyle = (bg === 'white') ? '#ffffff' : bg
      ctx.fillRect(0, 0, maxW, totalH)
    }

    // 逐帧绘制，水平居中
    let y = 0
    allFrames.forEach((frame, i) => {
      const offsetX = Math.floor((maxW - frame.width) / 2)
      ctx.drawImage(frame, offsetX, y)
      y += frame.height
      if (i < allFrames.length - 1) y += spacing.value
    })

    // ---- 7. 显示结果 ----
    resultCanvas.value    = result
    resultWidth.value     = result.width
    resultHeight.value    = result.height
    // extractedCount 只统计字幕帧数量（不含封面帧）
    extractedCount.value  = subtitleFrames.length

    await nextTick()
    if (resultCanvasEl.value) {
      resultCanvasEl.value.width  = result.width
      resultCanvasEl.value.height = result.height
      resultCanvasEl.value.getContext('2d').drawImage(result, 0, 0)
      resultCanvasEl.value.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    setStatus(
      `完成！封面帧 1 张 + 字幕帧 ${subtitleFrames.length} 张 · ${result.width}×${result.height} px`,
      'success'
    )
    showToast(`提取完成，共 ${subtitleFrames.length + 1} 帧`, 'success')

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

/**
 * 直接按当前 format 保存，不再二次选择
 * 压缩 quality 仅对 jpeg / webp 有效，png 忽略
 */
const saveResult = () => {
  if (!resultCanvas.value) return

  // 确定 MIME type
  const mimeMap = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' }
  const mime    = mimeMap[format.value] || 'image/png'

  // 确定文件扩展名
  const extMap  = { png: 'png', jpeg: 'jpg', webp: 'webp' }
  const ext     = extMap[format.value] || 'png'

  // PNG 无损，quality 参数无意义；jpeg/webp 使用用户选择的压缩值
  const quality = (format.value === 'png') ? undefined : compression.value

  resultCanvas.value.toBlob((blob) => {
    if (!blob) { showToast('保存失败', 'error'); return }
    const url = URL.createObjectURL(blob)
    const a   = document.createElement('a')
    a.href     = url
    a.download = `subtitles_${Date.now()}.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast(`已保存 ${format.value.toUpperCase()}，${(blob.size / 1024).toFixed(0)} KB`, 'success')
  }, mime, quality)
}

// ==================== ResizeObserver ====================

let resizeObserver = null

// 监听 videoEl 挂载，绑定 ResizeObserver 响应弹窗尺寸变化
watch(videoEl, (el) => {
  if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null }
  if (!el) return

  resizeObserver = new ResizeObserver(() => {
    resizeOverlayCanvas()
  })
  resizeObserver.observe(el)
})

// ==================== 生命周期 ====================

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
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
  width: 335px;
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
.upload-zone:hover, .upload-zone.drag-over { border-color: var(--accent); }
.upload-zone:hover::before, .upload-zone.drag-over::before { opacity: 1; }
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
  height: 65vh;
  display: block;
  background: #000;
  /* 视频本身在最底层，pointer-events 保持默认，控制栏可点击 */
}

/*
  覆盖层 Canvas 叠在视频上方
  pointer-events 由 Vue 绑定动态控制：
    框选模式：auto（拦截鼠标，显示十字光标）
    普通模式：none（透传鼠标，视频控制栏可用）
  bottom: 44px 让覆盖层不盖住底部控制栏
*/
.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 44px;        /* 留出控制栏空间 */
  width: 100% !important;
  /* height 由 JS 动态设置 */
}

/* ===== 工具栏 ===== */
.toolbar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* 封面帧按钮激活状态 */
.cover-active {
  border-color: #fb923c !important;
  color: #fb923c !important;
  background: rgba(251, 146, 60, 0.1) !important;
}

/* ===== 操作提示 ===== */
.op-hint {
  font-size: 0.75rem;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.6rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 50px;
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

.result-canvas {
  width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
  display: block;
  border: 1px solid var(--border);
}

.result-actions { display: flex; gap: 0.6rem; }

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
}
.panel-title i { color: var(--accent); }
.panel-hint {
  font-size: 0.72rem;
  color: var(--muted);
  font-weight: 400;
  margin-left: auto;
}

/* 选区可视化说明 */
.crop-preview-info {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.crop-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.crop-label {
  font-weight: 700;
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  margin-top: 1px;
}

.cover-label { background: rgba(251,146,60,0.2); color: #fb923c; }
.sub-label   { background: var(--accent-dim);    color: var(--accent); }

.crop-value { color: var(--muted); line-height: 1.5; }
.crop-size  { color: var(--fg); font-weight: 600; margin-left: 0.3rem; }

/* 坐标输入网格 */
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

/* 封面帧说明框 */
.cover-hint {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  background: rgba(251, 146, 60, 0.07);
  border: 1px solid rgba(251, 146, 60, 0.25);
  border-radius: var(--radius-sm);
  padding: 0.65rem 0.75rem;
  font-size: 0.8rem;
  line-height: 1.5;
}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .vsub-layout { flex-direction: column; }
  .vsub-right  { width: 100%; }
}
</style>