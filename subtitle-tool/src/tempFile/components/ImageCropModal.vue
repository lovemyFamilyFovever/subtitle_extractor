<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <header class="modal-header">
        <h2><i class="fa-solid fa-crop-simple"></i> 图片字幕截取</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </header>

      <div class="modal-body">
        <!-- 上传按钮 -->
        <div class="upload-row">
          <button class="btn-accent" @click="triggerFileInput">
            <i class="fa-solid fa-plus"></i> 选择图片（可多选）
          </button>
          <button class="btn-sm" @click="clearAll">
            <i class="fa-solid fa-trash"></i> 清空
          </button>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            multiple
            style="display:none"
            @change="handleFileSelect"
          />
          <span class="file-info" v-if="images.length">
            共 {{ images.length }} 张 · 当前第 {{ currentIndex + 1 }} 张
          </span>
        </div>

        <!-- 图片预览 + 裁剪线 -->
        <div class="preview-container" ref="previewContainerRef">
          <canvas
            ref="cropCanvasRef"
            class="crop-canvas"
            @mousedown="onCropMouseDown"
          ></canvas>
          <div v-if="images.length === 0" class="empty-state">
            <i class="fa-regular fa-image"></i>
            <p>暂无图片，请先添加</p>
          </div>
        </div>

        <!-- 导航 + 信息 -->
        <div v-if="images.length > 0" class="nav-info-row">
          <button class="btn-sm" @click="prevImage">
            <i class="fa-solid fa-chevron-left"></i> 上一张
          </button>
          <div class="info-chips">
            <span>{{ currentImage?.name || '-' }}</span>
            <span>{{ currentImage?.width }}×{{ currentImage?.height }}</span>
          </div>
          <button class="btn-sm" @click="nextImage">
            下一张 <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        <!-- 裁剪说明 -->
        <div class="hint-box" v-if="images.length > 0">
          <strong>裁剪规则：</strong>
          第一张保留顶部到蓝线；后续图片保留红线到蓝线。拖动线条调整位置。
        </div>

        <!-- 拼接设置 -->
        <div class="settings-row" v-if="images.length > 0">
          <label>
            间距
            <input type="range" v-model.number="spacing" min="0" max="40" />
            <span class="range-value">{{ spacing }}px</span>
          </label>
          <label>
            格式
            <select v-model="outputFormat">
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </label>
        </div>

        <!-- 生成按钮 -->
        <button
          v-if="images.length >= 2"
          class="btn-primary"
          @click="generateStitched"
          :disabled="isProcessing"
        >
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          {{ isProcessing ? '处理中...' : '生成拼接长图' }}
        </button>

        <!-- 结果预览 -->
        <div v-if="resultDataUrl" class="result-section">
          <h3><i class="fa-solid fa-image"></i> 拼接结果</h3>
          <img :src="resultDataUrl" class="result-image" />
          <button class="btn-success" @click="saveResult">
            <i class="fa-solid fa-download"></i> 保存图片
          </button>
        </div>

        <!-- 状态栏 -->
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
 * 【功能】图片字幕截取
 *
 * 工作流程：
 * 1. 用户上传多张字幕截图
 * 2. 逐张预览，通过拖拽红线/蓝线设定裁剪区域
 * 3. 第一张：保留「顶部 → 蓝线」
 *    后续图片：保留「红线 → 蓝线」
 * 4. 将所有裁剪后的图片垂直拼接
 */

import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

const emit = defineEmits(['close'])

// ==================== 响应式状态 ====================

const fileInputRef = ref(null)
const cropCanvasRef = ref(null)
const previewContainerRef = ref(null)

// 图片列表
const images = ref([])       // [{ name, width, height, size, url, img }]
const currentIndex = ref(0)

// 裁剪线位置（比例值，0~1）
const topCutRatio = ref(0.80)     // 红线：后续图片的裁剪起点
const bottomCutRatio = ref(0.95)  // 蓝线：所有图片的裁剪终点

// 拖拽状态
const dragging = ref(null)   // null | 'top' | 'bottom'

// 拼接设置
const spacing = ref(0)
const outputFormat = ref('png')

// 处理状态
const isProcessing = ref(false)
const statusText = ref('就绪 · 添加图片后调整裁剪线')
const statusType = ref('')

// 结果
const resultDataUrl = ref(null)

// ==================== 计算属性 ====================

/**
 * 【知识点】computed — 计算属性
 * 自动追踪依赖，依赖变化时重新计算
 * 比 methods 更高效（有缓存）
 */
const currentImage = computed(() => {
  return images.value[currentIndex.value] || null
})

// ==================== 工具函数 ====================

const setStatus = (text, type = '') => {
  statusText.value = text
  statusType.value = type
}

const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

// ==================== 文件处理 ====================

const triggerFileInput = () => {
  fileInputRef.value.click()
}

/**
 * 处理文件选择（支持多选）
 *
 * 【知识点】FileReader + Image 对象
 * FileReader.readAsDataURL() — 将文件读取为 Base64 URL
 * new Image() + onload — 加载图片并获取宽高
 */
const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files)

  for (const file of files) {
    const url = URL.createObjectURL(file)

    // 【知识点】Promise 包装异步图片加载
    const img = await new Promise((resolve) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.src = url
    })

    images.value.push({
      name: file.name,
      width: img.naturalWidth,
      height: img.naturalHeight,
      size: file.size,
      url,
      img
    })
  }

  if (images.value.length > 0) {
    currentIndex.value = 0
    nextTick(renderCropPreview)
  }

  setStatus(`已加载 ${images.value.length} 张图片`, 'success')
  event.target.value = '' // 清空以便重复选择同一文件
}

const clearAll = () => {
  images.value.forEach(img => { if (img.url) URL.revokeObjectURL(img.url) })
  images.value = []
  currentIndex.value = 0
  resultDataUrl.value = null
  setStatus('已清空所有图片')
}

// ==================== 图片导航 ====================

const prevImage = () => {
  if (images.value.length === 0) return
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length
  nextTick(renderCropPreview)
}

const nextImage = () => {
  if (images.value.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % images.value.length
  nextTick(renderCropPreview)
}

// ==================== Canvas 渲染裁剪预览 ====================

/**
 * 在 Canvas 上绘制当前图片 + 裁剪线
 *
 * 绘制内容：
 * 1. 原始图片（等比缩放适应容器）
 * 2. 半透明遮罩（裁剪掉的区域）
 * 3. 红色上裁剪线 + 蓝色下裁剪线
 * 4. 文字标注
 */
const renderCropPreview = () => {
  const canvas = cropCanvasRef.value
  const container = previewContainerRef.value
  if (!canvas || !container || !currentImage.value) return

  const imgData = currentImage.value

  // 计算缩放比例（让图片适应容器）
  const maxW = Math.min(container.clientWidth - 20, 620)
  const maxH = 380
  const scale = Math.min(maxW / imgData.width, maxH / imgData.height, 1)

  const dw = Math.round(imgData.width * scale)
  const dh = Math.round(imgData.height * scale)

  canvas.width = dw
  canvas.height = dh
  canvas.style.display = 'block'

  const ctx = canvas.getContext('2d')

  // 绘制图片
  ctx.drawImage(imgData.img, 0, 0, dw, dh)

  // 计算裁剪线在显示坐标上的位置
  const topY = topCutRatio.value * dh
  const bottomY = bottomCutRatio.value * dh

  // 绘制遮罩（裁剪区域外的部分变暗）
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.fillRect(0, 0, dw, topY)           // 顶部遮罩
  ctx.fillRect(0, bottomY, dw, dh - bottomY)  // 底部遮罩

  // 绘制红色上裁剪线
  ctx.beginPath()
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 2.5
  ctx.setLineDash([6, 6])
  ctx.moveTo(0, topY)
  ctx.lineTo(dw, topY)
  ctx.stroke()

  // 绘制蓝色下裁剪线
  ctx.beginPath()
  ctx.strokeStyle = '#3b82f6'
  ctx.moveTo(0, bottomY)
  ctx.lineTo(dw, bottomY)
  ctx.stroke()
  ctx.setLineDash([])

  // 文字标注
  ctx.font = 'bold 11px "Noto Sans SC", sans-serif'
  ctx.fillStyle = '#ef4444'
  ctx.fillText('↑ 上边界（后续图片裁剪起点）', 8, topY - 6)
  ctx.fillStyle = '#3b82f6'
  ctx.fillText('↓ 下边界（所有图片裁剪终点）', 8, bottomY + 14)
}

// ==================== 裁剪线拖拽 ====================

/**
 * 鼠标按下 — 检测是否点击了裁剪线
 *
 * 【原理】
 * 将鼠标 Y 坐标转换为比例值（0~1）
 * 如果接近红线或蓝线的位置（±5%），则开始拖拽
 */
const onCropMouseDown = (event) => {
  if (images.value.length === 0) return

  const rect = cropCanvasRef.value.getBoundingClientRect()
  const ratio = (event.clientY - rect.top) / rect.height

  if (Math.abs(ratio - topCutRatio.value) < 0.05) {
    dragging.value = 'top'
  } else if (Math.abs(ratio - bottomCutRatio.value) < 0.05) {
    dragging.value = 'bottom'
  }

  if (dragging.value) {
    window.addEventListener('mousemove', onCropMouseMove)
    window.addEventListener('mouseup', onCropMouseUp)
  }
}

const onCropMouseMove = (event) => {
  if (!dragging.value || images.value.length === 0) return

  const rect = cropCanvasRef.value.getBoundingClientRect()
  let ratio = (event.clientY - rect.top) / rect.height
  ratio = Math.max(0.02, Math.min(0.98, ratio))

  if (dragging.value === 'top' && ratio < bottomCutRatio.value - 0.02) {
    topCutRatio.value = ratio
  }
  if (dragging.value === 'bottom' && ratio > topCutRatio.value + 0.02) {
    bottomCutRatio.value = ratio
  }

  renderCropPreview()
}

const onCropMouseUp = () => {
  dragging.value = null
  window.removeEventListener('mousemove', onCropMouseMove)
  window.removeEventListener('mouseup', onCropMouseUp)
}

// ==================== 裁剪 + 拼接 ====================

/**
 * 裁剪单张图片
 */
const cropSingleImage = (imgData, isFirst) => {
  const h = imgData.height

  if (isFirst) {
    // 第一张：从顶部到蓝线
    const cropH = Math.round(h * bottomCutRatio.value)
    return cropToCanvas(imgData.img, 0, 0, imgData.width, cropH)
  } else {
    // 后续：从红线到蓝线
    const cropY = Math.round(h * topCutRatio.value)
    const cropH = Math.round(h * bottomCutRatio.value) - cropY
    return cropToCanvas(imgData.img, 0, cropY, imgData.width, cropH)
  }
}

const cropToCanvas = (img, sx, sy, sw, sh) => {
  const canvas = document.createElement('canvas')
  canvas.width = sw
  canvas.height = sh
  canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
  return canvas
}

/**
 * 垂直拼接多张裁剪后的图片
 */
const stitchVertically = (canvases, gap) => {
  let maxW = 0, totalH = 0
  canvases.forEach((c, i) => {
    maxW = Math.max(maxW, c.width)
    totalH += c.height
    if (i < canvases.length - 1) totalH += gap
  })

  const result = document.createElement('canvas')
  result.width = maxW
  result.height = totalH
  const ctx = result.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, maxW, totalH)

  let y = 0
  canvases.forEach((c, i) => {
    const x = Math.floor((maxW - c.width) / 2)
    ctx.drawImage(c, x, y)
    y += c.height
    if (i < canvases.length - 1) y += gap
  })

  return result
}

const generateStitched = async () => {
  if (images.value.length < 2) {
    setStatus('至少需要 2 张图片', 'error')
    return
  }

  isProcessing.value = true

  try {
    const cropped = images.value.map((img, i) => cropSingleImage(img, i === 0))
    const result = stitchVertically(cropped, spacing.value)
    resultDataUrl.value = result.toDataURL('image/png')
    setStatus(`拼接完成！${result.width} × ${result.height} px`, 'success')
  } catch (err) {
    console.error(err)
    setStatus('拼接失败: ' + err.message, 'error')
  } finally {
    isProcessing.value = false
  }
}

const saveResult = () => {
  if (!resultDataUrl.value) return
  const link = document.createElement('a')
  link.href = resultDataUrl.value
  link.download = `crop_stitch_${Date.now()}.png`
  link.click()
}

// ==================== 生命周期 ====================

onUnmounted(() => {
  window.removeEventListener('mousemove', onCropMouseMove)
  window.removeEventListener('mouseup', onCropMouseUp)
  images.value.forEach(img => { if (img.url) URL.revokeObjectURL(img.url) })
})
</script>

<style scoped>
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

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal {
  width: 80vw;
  max-width: 880px;
  max-height: 92vh;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 60px rgba(0,0,0,0.5);
  animation: modalIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes modalIn {
  from { transform: scale(0.9) translateY(30px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

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

.modal-header h2 i { color: var(--accent); }

.close-btn {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--muted);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.close-btn:hover { background: var(--danger); border-color: var(--danger); color: #fff; }

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
.modal-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

.upload-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-accent {
  padding: 0.55rem 1.2rem;
  background: var(--accent);
  color: #0f1117;
  border: none;
  border-radius: 50px;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-accent:hover { box-shadow: 0 0 20px rgba(0,224,158,0.3); }

.btn-sm {
  padding: 0.4rem 0.8rem;
  background: var(--bg);
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

.btn-sm:hover { background: var(--card-hover); border-color: var(--muted); }

.file-info {
  font-size: 0.8rem;
  color: var(--muted);
}

.preview-container {
  width: 100%;
  min-height: 200px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 10px;
}

.crop-canvas {
  cursor: ns-resize;
  border-radius: 4px;
}

.empty-state {
  color: var(--muted);
  text-align: center;
  padding: 3rem;
}

.empty-state i {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
  opacity: 0.4;
}

.nav-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.info-chips {
  display: flex;
  gap: 0.75rem;
  font-size: 0.78rem;
  color: var(--muted);
}

.info-chips span {
  background: var(--bg);
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  border: 1px solid var(--border);
}

.hint-box {
  background: rgba(0, 224, 158, 0.06);
  border: 1px solid rgba(0, 224, 158, 0.2);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  font-size: 0.82rem;
  color: var(--muted);
  line-height: 1.6;
}

.hint-box strong { color: var(--accent); }

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
  width: 16px; height: 16px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
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

.range-value { font-weight: 600; color: var(--accent); font-size: 0.82rem; }

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
  box-shadow: 0 2px 15px rgba(0,224,158,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 25px rgba(0,224,158,0.4); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

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

.btn-success:hover { background: #0d9f6e; }

.result-section { display: flex; flex-direction: column; gap: 0.75rem; }
.result-section h3 {
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.result-section h3 i { color: var(--accent); }

.result-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  object-fit: contain;
  background: var(--bg);
}

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

.status-bar.success { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.3); color: #10b981; }
.status-bar.processing { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.3); color: #f59e0b; }
.status-bar.error { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: #ef4444; }

.dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.status-bar.processing .dot { animation: pulse 1.2s infinite; }
@keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.3); } }
</style>
