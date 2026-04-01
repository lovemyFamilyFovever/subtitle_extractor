<template>
  <!--
    【知识点】弹窗遮罩层
    点击遮罩层（非弹窗区域）关闭弹窗
    @click.self — 仅当点击元素自身时触发（不包括子元素）
  -->
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <!-- ===== 弹窗头部 ===== -->
      <header class="modal-header">
        <h2><i class="fa-solid fa-video"></i> 视频字幕提取</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </header>

      <!-- ===== 弹窗主体（可滚动） ===== -->
      <div class="modal-body">
        <!-- 视频上传 -->
        <div class="upload-row">
          <input type="file" accept="video/*" @change="handleVideoUpload" />
          <span v-if="videoFileName" class="file-info">{{ videoFileName }}</span>
        </div>

        <!-- 视频播放器 + Canvas 覆盖层 -->
        <div class="video-wrapper" ref="videoWrapperRef">
          <video
            ref="videoRef"
            controls
            @loadedmetadata="onVideoLoaded"
          ></video>
          <!--
            【知识点】Canvas 覆盖层
            绝对定位在 video 上方，用于绘制框选区域
            鼠标事件绑定在 canvas 上
          -->
          <canvas
            ref="canvasRef"
            class="canvas-overlay"
            @mousedown="onCanvasMouseDown"
          ></canvas>
        </div>

        <!-- 坐标微调 + 时间标记 -->
        <div class="controls-grid">
          <!-- 坐标输入 -->
          <div class="control-card">
            <h3><i class="fa-solid fa-crop-simple"></i> 裁剪区域</h3>
            <div class="coord-grid">
              <label>上 Y1 <input type="number" v-model.number="cropY1" /></label>
              <label>下 Y2 <input type="number" v-model.number="cropY2" /></label>
              <label>左 X1 <input type="number" v-model.number="cropX1" /></label>
              <label>右 X2 <input type="number" v-model.number="cropX2" /></label>
            </div>
          </div>

          <!-- 时间标记 -->
          <div class="control-card">
            <h3><i class="fa-solid fa-clock"></i> 时间标记</h3>
            <div class="btn-row">
              <button class="btn-sm" @click="markCurrentTime">
                <i class="fa-solid fa-circle"></i> 标记
              </button>
              <button class="btn-sm" @click="undoLastMark">
                <i class="fa-solid fa-rotate-left"></i> 撤销
              </button>
              <button class="btn-sm" @click="clearAllMarks">
                <i class="fa-solid fa-trash"></i> 清空
              </button>
            </div>
            <textarea
              v-model="timeListText"
              rows="3"
              placeholder="时间点列表（可手动编辑）&#10;格式: 00:00:05.000 (帧:150)"
            ></textarea>
            <button class="btn-sm btn-outline" @click="parseTimeText">
              解析文本
            </button>
          </div>
        </div>

        <!-- 拼接设置 -->
        <div class="control-card">
          <h3><i class="fa-solid fa-sliders"></i> 拼接设置</h3>
          <div class="settings-row">
            <label>
              间距
              <!--
                【知识点】滑块 input[type="range"]
                v-model 绑定数值，实时响应
              -->
              <input type="range" v-model.number="spacing" min="0" max="40" />
              <span class="range-value">{{ spacing }}px</span>
            </label>
            <label>
              背景色
              <input type="color" v-model="bgColor" />
            </label>
            <label>
              格式
              <select v-model="outputFormat">
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
              </select>
            </label>
          </div>
          <button class="btn-primary" @click="extractAndStitch" :disabled="isProcessing">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            {{ isProcessing ? '处理中...' : '智能提取并拼接' }}
          </button>
        </div>

        <!-- 拼接结果预览 -->
        <div v-if="resultDataUrl" class="result-section">
          <h3><i class="fa-solid fa-image"></i> 拼接结果</h3>
          <img :src="resultDataUrl" class="result-image" />
          <button class="btn-success" @click="saveResult">
            <i class="fa-solid fa-download"></i> 保存图片
          </button>
        </div>

        <!-- 状态提示 -->
        <div class="status-bar" :class="statusType">
          <span class="dot"></span>
          {{ statusText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 【核心逻辑】视频字幕提取
 *
 * 工作流程：
 * 1. 用户上传视频文件
 * 2. 在视频上拖拽鼠标框选字幕区域
 * 3. 播放视频，在需要的位置标记时间点
 * 4. 点击"提取"，程序逐帧截取字幕区域并拼接
 * 5. 导出拼接后的长图
 */

// ==================== 导入 ====================
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

/**
 * 【知识点】emit — 子组件向父组件发送事件
 * defineEmits() 声明组件可以触发的事件
 * 使用时：emit('close') → 父组件通过 @close="handler" 监听
 */
const emit = defineEmits(['close'])

// ==================== 响应式状态 ====================

// 视频相关
const videoRef = ref(null)           // 【知识点】ref 绑定 DOM 元素 — 通过 ref 属性关联
const canvasRef = ref(null)
const videoWrapperRef = ref(null)
const videoUrl = ref(null)           // 视频的 Object URL
const videoFileName = ref('')        // 文件名
const videoWidth = ref(0)            // 视频原始宽度
const videoHeight = ref(0)           // 视频原始高度
const videoDuration = ref(0)         // 视频时长（秒）

// 裁剪区域（视频原始坐标）
const cropX1 = ref(0)
const cropY1 = ref(0)
const cropX2 = ref(0)
const cropY2 = ref(0)

// 框选状态
const isSelecting = ref(false)       // 是否正在拖拽框选
const selStartX = ref(0)             // 框选起始点（显示坐标）
const selStartY = ref(0)
const selEndX = ref(0)               // 框选当前点
const selEndY = ref(0)
const hasSavedCrop = ref(false)      // 是否已保存裁剪区域

// 时间标记
const timePoints = ref([])           // [{ timeSec, frameIdx }]
const timeListText = ref('')         // 时间列表的文本表示

// 拼接设置
const spacing = ref(2)               // 图片间距
const bgColor = ref('#ffffff')       // 背景色
const outputFormat = ref('png')      // 输出格式

// 处理状态
const isProcessing = ref(false)
const statusText = ref('就绪 · 上传视频后框选字幕区域')
const statusType = ref('')           // '', 'success', 'processing', 'error'

// 拼接结果
const resultDataUrl = ref(null)

// ==================== 工具函数 ====================

/**
 * 将秒数格式化为 SRT 时间格式
 * @param {number} seconds
 * @returns {string} "HH:MM:SS.mmm"
 */
const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
}

/**
 * 更新状态栏
 */
const setStatus = (text, type = '') => {
  statusText.value = text
  statusType.value = type
}

/**
 * 刷新时间列表文本
 */
const refreshTimeListText = () => {
  timeListText.value = timePoints.value
    .map((p, i) => `${i + 1}. ${formatTime(p.timeSec)} (帧:${p.frameIdx})`)
    .join('\n')
}

// ==================== 视频上传 ====================

/**
 * 处理视频文件上传
 * 【知识点】File API + Object URL
 * URL.createObjectURL(file) — 将文件转为可播放的 URL
 * 用完后需要 URL.revokeObjectURL() 释放内存
 */
const handleVideoUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 释放旧的 URL
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }

  videoUrl.value = URL.createObjectURL(file)
  videoFileName.value = `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`

  // 设置 video 元素的 src，触发加载
  videoRef.value.src = videoUrl.value

  // 重置状态
  timePoints.value = []
  timeListText.value = ''
  hasSavedCrop.value = false
  resultDataUrl.value = null
  setStatus('加载视频中...', 'processing')
}

// ==================== 视频加载完成 ====================

/**
 * 视频元数据加载完成后的处理
 * 此时可以获取视频的宽高和时长
 */
const onVideoLoaded = () => {
  const video = videoRef.value
  videoWidth.value = video.videoWidth
  videoHeight.value = video.videoHeight
  videoDuration.value = video.duration

  // 初始化裁剪区域为整个视频
  cropX1.value = 0
  cropY1.value = 0
  cropX2.value = video.videoWidth
  cropY2.value = video.videoHeight

  // 调整 Canvas 尺寸以匹配视频显示尺寸
  nextTick(() => {
    resizeCanvas()
    setStatus(`就绪 ${video.videoWidth}x${video.videoHeight} · 拖动框选字幕区`, 'success')
  })
}

// ==================== Canvas 尺寸管理 ====================

/**
 * 调整覆盖层 Canvas 的尺寸
 *
 * 【核心概念】坐标系统
 * 视频有两套坐标：
 * 1. 视频原始坐标：video.videoWidth x video.videoHeight（如 1920x1080）
 * 2. 显示坐标：video 元素在页面上的实际显示尺寸（如 700x394）
 *
 * 用户在显示坐标上操作，需要转换为视频原始坐标
 */
const resizeCanvas = () => {
  const video = videoRef.value
  const canvas = canvasRef.value
  if (!video || !canvas) return

  // 获取 video 元素的实际显示尺寸
  const rect = video.getBoundingClientRect()

  // 设置 canvas 尺寸与 video 显示尺寸一致
  canvas.width = rect.width
  canvas.height = rect.height

  // 重绘
  drawCanvas()
}

// ==================== 鼠标框选 ====================

/**
 * 鼠标按下 — 开始框选
 *
 * 【知识点】getBoundingClientRect()
 * 获取元素相对于视口的位置和尺寸
 * 用 clientX - rect.left 将屏幕坐标转换为元素内坐标
 */
const onCanvasMouseDown = (event) => {
  if (!videoRef.value || !videoRef.value.src) return

  const rect = canvasRef.value.getBoundingClientRect()
  isSelecting.value = true
  selStartX.value = event.clientX - rect.left
  selStartY.value = event.clientY - rect.top
  selEndX.value = selStartX.value
  selEndY.value = selStartY.value

  // 【知识点】在 window 上监听鼠标移动和释放
  // 这样即使鼠标移出 canvas 也能正常跟踪
  window.addEventListener('mousemove', onCanvasMouseMove)
  window.addEventListener('mouseup', onCanvasMouseUp)
}

/**
 * 鼠标移动 — 更新框选区域
 */
const onCanvasMouseMove = (event) => {
  if (!isSelecting.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  // 限制在 canvas 范围内
  selEndX.value = Math.max(0, Math.min(rect.width, event.clientX - rect.left))
  selEndY.value = Math.max(0, Math.min(rect.height, event.clientY - rect.top))

  drawCanvas()
}

/**
 * 鼠标释放 — 完成框选
 *
 * 【坐标转换】
 * scaleX = 视频原始宽度 / 显示宽度
 * 视频原始X = 显示X x scaleX
 */
const onCanvasMouseUp = () => {
  isSelecting.value = false
  window.removeEventListener('mousemove', onCanvasMouseMove)
  window.removeEventListener('mouseup', onCanvasMouseUp)

  const video = videoRef.value
  const rect = canvasRef.value.getBoundingClientRect()

  // 计算缩放比例
  const scaleX = video.videoWidth / rect.width
  const scaleY = video.videoHeight / rect.height

  // 转换为视频原始坐标
  const x1 = Math.min(selStartX.value, selEndX.value) * scaleX
  const y1 = Math.min(selStartY.value, selEndY.value) * scaleY
  const x2 = Math.max(selStartX.value, selEndX.value) * scaleX
  const y2 = Math.max(selStartY.value, selEndY.value) * scaleY

  // 只有足够大的选区才保存
  if (x2 - x1 > 5 && y2 - y1 > 5) {
    cropX1.value = Math.floor(x1)
    cropY1.value = Math.floor(y1)
    cropX2.value = Math.ceil(x2)
    cropY2.value = Math.ceil(y2)
    hasSavedCrop.value = true
    setStatus('字幕区域已设定', 'success')
  }

  drawCanvas()
}

// ==================== Canvas 绘制 ====================

/**
 * 在 Canvas 上绘制框选区域
 *
 * 绘制两种状态：
 * 1. 正在框选（半透明蓝色填充 + 虚线边框）
 * 2. 已保存的裁剪区域（同样的样式）
 */
const drawCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas || !canvas.width) return

  const ctx = canvas.getContext('2d')
  const video = videoRef.value
  const rect = video.getBoundingClientRect()

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 计算视频原始 → 显示 的缩放比例
  const scaleX = rect.width / video.videoWidth
  const scaleY = rect.height / video.videoHeight

  let x, y, w, h

  if (isSelecting.value) {
    // 正在框选：使用鼠标坐标
    x = Math.min(selStartX.value, selEndX.value)
    y = Math.min(selStartY.value, selEndY.value)
    w = Math.abs(selEndX.value - selStartX.value)
    h = Math.abs(selEndY.value - selStartY.value)
  } else if (hasSavedCrop.value) {
    // 已保存区域：将视频坐标转换为显示坐标
    x = cropX1.value * scaleX
    y = cropY1.value * scaleY
    w = (cropX2.value - cropX1.value) * scaleX
    h = (cropY2.value - cropY1.value) * scaleY
  } else {
    return
  }

  // 绘制半透明填充
  ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'
  ctx.fillRect(x, y, w, h)

  // 绘制虚线边框
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2.5
  ctx.setLineDash([6, 8])
  ctx.strokeRect(x, y, w, h)
  ctx.setLineDash([])
}

// ==================== 时间标记 ====================

const markCurrentTime = () => {
  if (!videoRef.value || !videoRef.value.src) return
  const t = videoRef.value.currentTime
  timePoints.value.push({ timeSec: t, frameIdx: Math.round(t * 30) })
  refreshTimeListText()
  setStatus(`已标记 ${timePoints.value.length} 个时间点`, 'success')
}

const undoLastMark = () => {
  timePoints.value.pop()
  refreshTimeListText()
}

const clearAllMarks = () => {
  timePoints.value = []
  refreshTimeListText()
  setStatus('时间点已清空')
}

/**
 * 解析手动编辑的时间文本
 * 格式: "00:00:05.000 (帧:150)"
 */
const parseTimeText = () => {
  if (!timeListText.value.trim()) {
    timePoints.value = []
    setStatus('已清空时间点')
    return
  }

  const regex = /(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?\s*$$帧:\s*(\d+)$$/
  const newPoints = []

  timeListText.value.split('\n').forEach(line => {
    const m = line.match(regex)
    if (m) {
      const timeSec = parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseInt(m[3]) + (m[4] ? parseInt(m[4]) : 0) / 1000
      newPoints.push({ timeSec, frameIdx: parseInt(m[5]) })
    }
  })

  if (newPoints.length > 0) timePoints.value = newPoints
  refreshTimeListText()
  setStatus(`已解析 ${timePoints.value.length} 个时间点`, 'success')
}

// ==================== 帧截取 ====================

/**
 * 从视频截取指定时间点的画面并裁剪
 *
 * 【核心原理】
 * 1. 创建一个隐藏的 video 元素
 * 2. 设置 currentTime 跳转到目标时间
 * 3. 等待 seeked 事件（视频解码完成）
 * 4. 用 ctx.drawImage() 将 video 绘制到 canvas 上
 * 5. 只绘制裁剪区域的部分
 *
 * @returns {Promise<HTMLCanvasElement|null>}
 */
const captureFrame = (timeSec) => {
  return new Promise((resolve) => {
    // 创建临时 video 元素
    const video = document.createElement('video')
    video.src = videoUrl.value
    video.muted = true
    video.preload = 'auto'

    let resolved = false

    // 超时保护（10秒）
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        resolve(null)
      }
    }, 10000)

    // 视频数据加载后，跳转到目标时间
    video.addEventListener('loadeddata', () => {
      video.currentTime = timeSec
    })

    // seek 完成后，截取画面
    video.addEventListener('seeked', () => {
      if (resolved) return

      // 计算裁剪区域的宽高
      const cw = cropX2.value - cropX1.value
      const ch = cropY2.value - cropY1.value

      // 创建 canvas 并绘制裁剪区域
      const canvas = document.createElement('canvas')
      canvas.width = cw
      canvas.height = ch
      const ctx = canvas.getContext('2d')

      // drawImage 的参数：源图, 源X, 源Y, 源宽, 源高, 目标X, 目标Y, 目标宽, 目标高
      ctx.drawImage(video, cropX1.value, cropY1.value, cw, ch, 0, 0, cw, ch)

      clearTimeout(timeout)
      resolved = true
      resolve(canvas)

      // 释放资源
      video.src = ''
    })
  })
}

// ==================== 垂直拼接 ====================

/**
 * 将多张图片垂直拼接为一张
 *
 * 【Canvas 绘图原理】
 * 1. 创建一个足够大的 canvas
 * 2. 填充背景色
 * 3. 逐张绘制图片（居中对齐）
 * 4. 图片之间留出间距
 */
const stitchVertically = (images, gap, bg) => {
  // 计算最大宽度和总高度
  let maxW = 0
  let totalH = 0
  images.forEach((img, i) => {
    maxW = Math.max(maxW, img.width)
    totalH += img.height
    if (i < images.length - 1) totalH += gap
  })

  // 创建画布
  const canvas = document.createElement('canvas')
  canvas.width = maxW
  canvas.height = totalH
  const ctx = canvas.getContext('2d')

  // 填充背景
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, maxW, totalH)

  // 逐张绘制（居中）
  let y = 0
  images.forEach((img, i) => {
    const x = Math.floor((maxW - img.width) / 2)
    ctx.drawImage(img, x, y)
    y += img.height
    if (i < images.length - 1) y += gap
  })

  return canvas
}

// ==================== 提取并拼接 ====================

const extractAndStitch = async () => {
  // 校验
  if (!videoUrl.value) {
    setStatus('请先上传视频文件', 'error')
    return
  }
  if (!hasSavedCrop.value) {
    setStatus('请先框选字幕区域', 'error')
    return
  }

  isProcessing.value = true

  try {
    // 确定时间点：有标记用标记，没有则每秒截取
    let points = timePoints.value
    if (points.length === 0) {
      points = []
      for (let i = 0; i <= Math.floor(videoDuration.value); i++) {
        points.push({ timeSec: i, frameIdx: Math.round(i * 30) })
      }
    }

    const frames = []

    // 逐帧截取
    for (let i = 0; i < points.length; i++) {
      setStatus(`正在截取 ${i + 1}/${points.length}...`, 'processing')
      const frame = await captureFrame(points[i].timeSec)
      if (frame) frames.push(frame)
      // 短暂延迟，避免浏览器卡顿
      await new Promise(r => setTimeout(r, 25))
    }

    if (frames.length === 0) {
      setStatus('未截取到有效帧', 'error')
      return
    }

    // 拼接
    setStatus('正在拼接...', 'processing')
    const result = stitchVertically(frames, spacing.value, bgColor.value)

    // 生成预览
    resultDataUrl.value = result.toDataURL('image/png')
    setStatus(`拼接成功！${result.width} x ${result.height} px`, 'success')
  } catch (error) {
    console.error('拼接失败:', error)
    setStatus('处理出错: ' + error.message, 'error')
  } finally {
    isProcessing.value = false
  }
}

// ==================== 保存结果 ====================

const saveResult = () => {
  if (!resultDataUrl.value) return
  const link = document.createElement('a')
  link.href = resultDataUrl.value
  link.download = `subtitle_${Date.now()}.png`
  link.click()
}

// ==================== 键盘快捷键 ====================

/**
 * 【知识点】全局事件监听
 * onMounted 中添加，onUnmounted 中移除
 * 避免内存泄漏和事件冲突
 */
const handleKeydown = (event) => {
  // 空格：播放/暂停
  if (event.key === ' ' && !event.target.matches('input, textarea, select')) {
    event.preventDefault()
    const v = videoRef.value
    if (v) {
      v.paused ? v.play() : v.pause()
    }
  }
  // Enter：标记时间
  if (event.key === 'Enter' && !event.target.matches('input, textarea, select')) {
    event.preventDefault()
    markCurrentTime()
  }
  // ESC：关闭弹窗
  if (event.key === 'Escape') {
    emit('close')
  }
}

// ==================== 生命周期 ====================

/**
 * 【知识点】onMounted — 组件挂载后执行
 * 类似 jQuery 的 $(document).ready()
 * 此时 DOM 元素已经可以访问
 */
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

/**
 * 【知识点】onUnmounted — 组件卸载前执行
 * 清理事件监听器、定时器等
 * 避免内存泄漏
 */
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('mousemove', onCanvasMouseMove)
  window.removeEventListener('mouseup', onCanvasMouseUp)
  // 释放视频 URL
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
})

/**
 * 【知识点】watch — 监听响应式数据变化
 * 当视频加载后，窗口大小改变时需要重新调整 Canvas
 */
watch(videoUrl, () => {
  nextTick(() => {
    if (videoRef.value) resizeCanvas()
  })
})
</script>

<style scoped>
/**
 * 【知识点】scoped 样式
 * 加了 scoped 后，这里的 CSS 只作用于当前组件
 * Vue 会在每个选择器上添加唯一属性（如 .modal[data-v-xxxxx]）
 * 避免样式污染其他组件
 */

/* ===== 遮罩层 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--overlay);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ===== 弹窗容器 ===== */
.modal {
  width: 80vw;
  max-width: 960px;
  max-height: 92vh;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5);
  animation: modalIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes modalIn {
  from { transform: scale(0.9) translateY(30px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

/* ===== 弹窗头部 ===== */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.modal-header h2 {
  font-size: 1.15rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-header h2 i {
  color: var(--accent);
  font-size: 1rem;
}

.close-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--muted);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--danger);
  border-color: var(--danger);
  color: #fff;
}

/* ===== 弹窗主体 ===== */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: 0;
}

.modal-body::-webkit-scrollbar { width: 5px; }
.modal-body::-webkit-scrollbar-track { background: transparent; }
.modal-body::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 10px;
}

/* ===== 视频上传行 ===== */
.upload-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.upload-row input[type="file"] {
  flex: 1;
  padding: 0.5rem;
  background: var(--bg);
  border: 1.5px dashed var(--border);
  border-radius: var(--radius-sm);
  color: var(--fg);
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}

.file-info {
  font-size: 0.8rem;
  color: var(--muted);
  white-space: nowrap;
}

/* ===== 视频播放器 ===== */
.video-wrapper {
  position: relative;
  background: #000;
  border-radius: var(--radius);
  overflow: hidden;
}

.video-wrapper video {
  width: 100%;
  height: 380px;
  display: block;
  object-fit: contain;
  background: #000;
}

.canvas-overlay {
  position: absolute;
  top: 0;
  left: 0;
}
.controls-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 640px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
}

/* ===== 控制卡片 ===== */
.control-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.control-card h3 {
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--fg);
}

.control-card h3 i {
  color: var(--accent);
  font-size: 0.8rem;
}

/* ===== 坐标输入 ===== */
.coord-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.coord-grid label {
  font-size: 0.75rem;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.coord-grid input {
  width: 100%;
  padding: 0.4rem 0.6rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--fg);
  font-family: inherit;
  font-size: 0.82rem;
  outline: none;
  transition: border-color 0.2s;
}

.coord-grid input:focus {
  border-color: var(--accent);
}

/* ===== 按钮 ===== */
.btn-row {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--fg);
  font-family: inherit;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.btn-sm:hover {
  background: var(--card-hover);
  border-color: var(--muted);
}

.btn-sm.btn-outline {
  background: transparent;
  margin-top: 0.25rem;
}

.btn-primary {
  padding: 0.7rem 1.5rem;
  background: var(--accent);
  border: none;
  border-radius: var(--radius-sm);
  color: #0f1117;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 2px 15px rgba(0, 224, 158, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 25px rgba(0, 224, 158, 0.4);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-success {
  padding: 0.6rem 1.2rem;
  background: #10b981;
  border: none;
  border-radius: var(--radius-sm);
  color: #fff;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-success:hover {
  background: #0d9f6e;
}

/* ===== 文本域 ===== */
textarea {
  width: 100%;
  padding: 0.5rem 0.7rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--fg);
  font-family: 'JetBrains Mono', 'Noto Sans SC', monospace;
  font-size: 0.7;
}

/* ===== 控制面板网格 =====5rem;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

textarea:focus {
  border-color: var(--accent);
}

/* ===== 设置行 ===== */
.settings-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.settings-row label {
  flex: 1;
  min-width: 120px;
  font-size: 0.75rem;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.settings-row input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background: var(--border);
  border-radius: 4px;
  outline: none;
}

.settings-row input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
}

.settings-row input[type="color"] {
  width: 40px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  cursor: pointer;
  padding: 2px;
}

.settings-row select {
  padding: 0.4rem 0.6rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--fg);
  font-family: inherit;
  font-size: 0.82rem;
  outline: none;
}

.range-value {
  font-weight: 600;
  color: var(--accent);
  font-size: 0.82rem;
}

/* ===== 结果预览 ===== */
.result-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-section h3 {
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.result-section h3 i {
  color: var(--accent);
}

.result-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  object-fit: contain;
  background: var(--bg);
}

/* ===== 状态栏 ===== */
.status-bar {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 50px;
  padding: 0.6rem 1rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--muted);
}

.status-bar.success {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.status-bar.processing {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

.status-bar.error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.status-bar.processing .dot {
  animation: pulse 1.2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}
</style>
