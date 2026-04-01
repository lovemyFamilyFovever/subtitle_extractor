<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <header class="modal-header">
        <h2><i class="fa-solid fa-layer-group"></i> 图片自由拼接</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </header>

      <div class="modal-body">
        <!-- 上传区域 -->
        <div
          class="upload-zone"
          :class="{ 'drag-over': isDragOver }"
          @click="triggerFileInput"
          @dragover.prevent="isDragOver = true"
          @dragleave="isDragOver = false"
          @drop.prevent="handleDrop"
        >
          <i class="fa-solid fa-cloud-arrow-up"></i>
          <div class="upload-text">点击或拖拽图片到此处</div>
          <div class="upload-hint">支持 JPG / PNG / WebP，可多选</div>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            multiple
            style="display:none"
            @change="handleFileSelect"
          />
        </div>

        <!--
          【知识点】拖拽排序的图片列表
          HTML5 Drag & Drop API:
          draggable="true" — 元素可拖拽
          @dragstart — 开始拖拽时记录源索引
          @dragover.prevent — 必须阻止默认行为才能触发 drop
          @drop — 放置时交换位置
        -->
        <div class="image-grid">
          <div
            v-for="(item, index) in images"
            :key="item.id"
            class="image-thumb"
            :class="{
              dragging: dragSrcIndex === index,
              'drag-target': dragTargetIndex === index
            }"
            draggable="true"
            @dragstart="onDragStart(index)"
            @dragend="onDragEnd"
            @dragover.prevent="onDragOver(index)"
            @dragleave="onDragLeave"
            @drop.prevent="onDrop(index)"
          >
            <img :src="item.thumbUrl" :alt="item.name" />
            <span class="thumb-index">{{ index + 1 }}</span>
            <div class="thumb-actions">
              <button @click.stop="rotateImage(index)" title="旋转90°">
                <i class="fa-solid fa-rotate-right"></i>
              </button>
              <button class="btn-remove" @click.stop="removeImage(index)" title="移除">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 设置面板 -->
        <div class="settings-grid" v-if="images.length > 0">
          <!-- 拼接方向 -->
          <div class="setting-item">
            <label>拼接方向</label>
            <select v-model="layout">
              <option value="horizontal">水平横向</option>
              <option value="vertical">垂直纵向</option>
              <option value="grid">网格拼接</option>
            </select>
          </div>

          <!-- 网格列数（仅网格模式） -->
          <div class="setting-item" v-if="layout === 'grid'">
            <label>网格列数</label>
            <select v-model.number="gridCols">
              <option :value="2">2 列</option>
              <option :value="3">3 列</option>
              <option :value="4">4 列</option>
            </select>
          </div>

          <!-- 图片间距 -->
          <div class="setting-item">
            <label>图片间距</label>
            <div class="range-row">
              <input type="range" v-model.number="gap" min="0" max="40" />
              <span class="range-value">{{ gap }}px</span>
            </div>
          </div>

          <!-- 圆角大小 -->
          <div class="setting-item">
            <label>圆角大小</label>
            <div class="range-row">
              <input type="range" v-model.number="radius" min="0" max="30" />
              <span class="range-value">{{ radius }}px</span>
            </div>
          </div>

          <!-- 对齐方式 -->
          <div class="setting-item">
            <label>对齐方式</label>
            <div class="align-group">
              <button
                v-for="a in alignOptions"
                :key="a.value"
                class="align-btn"
                :class="{ active: align === a.value }"
                @click="align = a.value"
                :title="a.label"
              >
                <i :class="a.icon"></i>
              </button>
            </div>
          </div>

          <!-- 背景颜色 -->
          <div class="setting-item">
            <label>背景颜色</label>
            <div class="color-group">
              <div
                v-for="c in colorOptions"
                :key="c.value"
                class="color-swatch"
                :class="{ active: bgColor === c.value, 'transparent-bg': c.value === 'transparent' }"
                :style="c.value !== 'transparent' ? { background: c.value } : {}"
                :title="c.label"
                @click="bgColor = c.value"
              ></div>
            </div>
          </div>

          <!-- 输出缩放 -->
          <div class="setting-item">
            <label>输出缩放</label>
            <select v-model.number="outputScale">
              <option :value="1">1x 原始尺寸</option>
              <option :value="2">2x 高清</option>
              <option :value="3">3x 超清</option>
            </select>
          </div>
        </div>

        <!-- 实时预览 -->
        <div class="preview-section" v-if="images.length >= 2">
          <div class="preview-label">实时预览</div>
          <div class="preview-container">
            <canvas ref="previewCanvasRef"></canvas>
            <div v-if="previewInfo" class="preview-info">{{ previewInfo }}</div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="footer-bar" v-if="images.length > 0">
          <span class="footer-info">已添加 <strong>{{ images.length }}</strong> 张图片</span>
          <div class="footer-actions">
            <button class="btn-sm" @click="clearAll">
              <i class="fa-solid fa-trash-can"></i> 清空
            </button>
            <button
              class="btn-primary"
              @click="exportImage"
              :disabled="images.length < 2"
            >
              <i class="fa-solid fa-download"></i> 导出图片
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 【功能】图片自由拼接
 *
 * 支持三种布局模式：
 * 1. 水平横向 — 所有图片横排
 * 2. 垂直纵向 — 所有图片竖排
 * 3. 网格拼接 — 按指定列数排列
 *
 * 支持的功能：
 * - 拖拽上传
 * - 拖拽排序
 * - 单张旋转
 * - 间距/圆角/对齐/背景色调节
 * - 实时预览
 * - 导出高清图片
 */

import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

const emit = defineEmits(['close'])

// ==================== 响应式状态 ====================

const fileInputRef = ref(null)
const previewCanvasRef = ref(null)

// 图片列表
let idCounter = 0
const images = ref([])  // [{ id, name, img, rotation, thumbUrl, url }]

// 拖拽排序状态
const dragSrcIndex = ref(null)
const dragTargetIndex = ref(null)

// 上传拖拽状态
const isDragOver = ref(false)

// 拼接设置
const layout = ref('horizontal')   // horizontal | vertical | grid
const gridCols = ref(3)
const gap = ref(4)
const radius = ref(0)
const align = ref('start')         // start | center | end | stretch
const bgColor = ref('#ffffff')
const outputScale = ref(2)

// 预览信息
const previewInfo = ref('')

// ==================== 选项数据 ====================

const alignOptions = [
  { value: 'start', label: '顶部/左侧对齐', icon: 'fa-solid fa-arrow-up' },
  { value: 'center', label: '居中对齐', icon: 'fa-solid fa-arrows-up-down' },
  { value: 'end', label: '底部/右侧对齐', icon: 'fa-solid fa-arrow-down' },
  { value: 'stretch', label: '拉伸填满', icon: 'fa-solid fa-expand' },
]

const colorOptions = [
  { value: '#ffffff', label: '白色' },
  { value: '#000000', label: '黑色' },
  { value: '#1a1d27', label: '深灰' },
  { value: '#f3f4f6', label: '浅灰' },
  { value: '#fef3c7', label: '暖黄' },
  { value: '#dcfce7', label: '浅绿' },
  { value: 'transparent', label: '透明' },
]

// ==================== 文件处理 ====================

const triggerFileInput = () => fileInputRef.value.click()

const handleFileSelect = (event) => {
  addFiles(Array.from(event.target.files))
  event.target.value = ''
}

const handleDrop = (event) => {
  isDragOver.value = false
  const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'))
  if (files.length) addFiles(files)
}

/**
 * 添加文件到图片列表
 *
 * 【知识点】为每张图片生成缩略图
 * 用 canvas 将大图缩小为 200×200 的缩略图
 * 这样列表渲染时不会因为加载大量大图而卡顿
 */
const addFiles = async (files) => {
  for (const file of files) {
    const url = URL.createObjectURL(file)

    const img = await new Promise((resolve) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.src = url
    })

    // 生成缩略图
    const thumbCanvas = document.createElement('canvas')
    const size = 200
    thumbCanvas.width = size
    thumbCanvas.height = size
    const tCtx = thumbCanvas.getContext('2d')
    // 等比缩放绘制
    const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight)
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    tCtx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)

    images.value.push({
      id: ++idCounter,
      name: file.name,
      img,
      rotation: 0,
      thumbUrl: thumbCanvas.toDataURL(),
      url
    })
  }

  updatePreview()
}

const removeImage = (index) => {
  const item = images.value[index]
  if (item.url) URL.revokeObjectURL(item.url)
  images.value.splice(index, 1)
  updatePreview()
}

const clearAll = () => {
  images.value.forEach(item => { if (item.url) URL.revokeObjectURL(item.url) })
  images.value = []
  previewInfo.value = ''
}

/**
 * 旋转图片 90°
 *
 * 【原理】
 * 记录旋转角度，实际绘制时通过 ctx.rotate() 旋转
 * 旋转 90° 或 270° 时，宽高需要交换
 */
const rotateImage = (index) => {
  images.value[index].rotation = (images.value[index].rotation + 90) % 360
  // 重新生成缩略图（带旋转）
  const item = images.value[index]
  const size = 200
  const tc = document.createElement('canvas')
  tc.width = size
  tc.height = size
  const tCtx = tc.getContext('2d')
  drawRotated(tCtx, item.img, item.rotation, size, size)
  item.thumbUrl = tc.toDataURL()
  updatePreview()
}

// ==================== 拖拽排序 ====================

const onDragStart = (index) => {
  dragSrcIndex.value = index
}

const onDragEnd = () => {
  dragSrcIndex.value = null
  dragTargetIndex.value = null
}

const onDragOver = (index) => {
  dragTargetIndex.value = index
}

const onDragLeave = () => {
  dragTargetIndex.value = null
}

/**
 * 【知识点】数组元素交换
 * splice() 从数组中删除/插入元素
 * const [moved] = arr.splice(from, 1) — 删除索引 from 的元素
 * arr.splice(to, 0, moved) — 在索引 to 处插入
 */
const onDrop = (targetIndex) => {
  const from = dragSrcIndex.value
  if (from !== null && from !== targetIndex) {
    const [moved] = images.value.splice(from, 1)
    images.value.splice(targetIndex, 0, moved)
    updatePreview()
  }
  dragSrcIndex.value = null
  dragTargetIndex.value = null
}

// ==================== 拼接核心 ====================

/**
 * 获取旋转后的实际尺寸
 * 旋转 90° 或 270° 时宽高交换
 */
const getRotatedSize = (img, rotation) => {
  const isRotated = rotation === 90 || rotation === 270
  return {
    width: isRotated ? img.naturalHeight : img.naturalWidth,
    height: isRotated ? img.naturalWidth : img.naturalHeight
  }
}

/**
 * 在 canvas 上绘制旋转后的图片
 */
const drawRotated = (ctx, img, rotation, maxW, maxH) => {
  const isRotated = rotation === 90 || rotation === 270
  const imgW = isRotated ? img.naturalHeight : img.naturalWidth
  const imgH = isRotated ? img.naturalWidth : img.naturalHeight
  const s = Math.min(maxW / imgW, maxH / imgH, 1)
  const w = imgW * s, h = imgH * s

  ctx.clearRect(0, 0, maxW, maxH)
  ctx.save()
  ctx.translate(maxW / 2, maxH / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.drawImage(img, -w / 2, -h / 2, w, h)
  ctx.restore()
}

/**
 * 绘制圆角矩形路径（用于裁剪）
 */
const roundRect = (ctx, x, y, w, h, r) => {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/**
 * 核心拼接函数
 *
 * 根据 layout 模式计算每张图片的位置，然后绘制到 canvas 上
 *
 * @param {number} scale - 缩放比例（预览用 0.5，导出用用户设置的值）
 * @returns {HTMLCanvasElement|null}
 */
const stitch = (scale = 1) => {
  if (images.value.length < 2) return null

  const g = gap.value * scale
  const r = radius.value * scale

  // 计算每张图片缩放后的尺寸
  const sizes = images.value.map(item => {
    const s = getRotatedSize(item.img, item.rotation)
    return { w: s.width * scale, h: s.height * scale }
  })

  let canvasW, canvasH, positions

  if (layout.value === 'horizontal') {
    // 水平拼接：所有图片横排
    const maxH = Math.max(...sizes.map(s => s.h))
    canvasW = sizes.reduce((sum, s) => sum + s.w, 0) + g * (images.value.length - 1)
    canvasH = maxH

    positions = sizes.map((s, i) => {
      const x = sizes.slice(0, i).reduce((sum, ss) => sum + ss.w, 0) + g * i
      let y = 0
      if (align.value === 'center') y = (maxH - s.h) / 2
      else if (align.value === 'end') y = maxH - s.h
      return { x, y, w: s.w, h: align.value === 'stretch' ? maxH : s.h, stretch: align.value === 'stretch' }
    })
  } else if (layout.value === 'vertical') {
    // 垂直拼接：所有图片竖排
    const maxW = Math.max(...sizes.map(s => s.w))
    canvasW = maxW
    canvasH = sizes.reduce((sum, s) => sum + s.h, 0) + g * (images.value.length - 1)

    positions = sizes.map((s, i) => {
      const y = sizes.slice(0, i).reduce((sum, ss) => sum + ss.h, 0) + g * i
      let x = 0
      if (align.value === 'center') x = (maxW - s.w) / 2
      else if (align.value === 'end') x = maxW - s.w
      return { x, y, w: align.value === 'stretch' ? maxW : s.w, h: s.h, stretch: align.value === 'stretch' }
    })
  } else {
    // 网格拼接
    const cols = gridCols.value
    const rows = Math.ceil(images.value.length / cols)

    // 计算每列最大宽度、每行最大高度
    const colWidths = Array(cols).fill(0)
    const rowHeights = Array(rows).fill(0)
    sizes.forEach((s, i) => {
      const c = i % cols, r2 = Math.floor(i / cols)
      colWidths[c] = Math.max(colWidths[c], s.w)
      rowHeights[r2] = Math.max(rowHeights[r2], s.h)
    })

    canvasW = colWidths.reduce((a, b) => a + b, 0) + g * (cols - 1)
    canvasH = rowHeights.reduce((a, b) => a + b, 0) + g * (rows - 1)

    positions = sizes.map((s, i) => {
      const c = i % cols, r2 = Math.floor(i / cols)
      const x = colWidths.slice(0, c).reduce((a, b) => a + b, 0) + g * c
      const y = rowHeights.slice(0, r2).reduce((a, b) => a + b, 0) + g * r2
      let px = x, py = y, pw = s.w, ph = s.h

      if (align.value === 'center') {
        px = x + (colWidths[c] - pw) / 2
        py = y + (rowHeights[r2] - ph) / 2
      } else if (align.value === 'end') {
        px = x + colWidths[c] - pw
        py = y + rowHeights[r2] - ph
      } else if (align.value === 'stretch') {
        pw = colWidths[c]
        ph = rowHeights[r2]
      }
      return { x: px, y: py, w: pw, h: ph, stretch: align.value === 'stretch' }
    })
  }

  // 创建 canvas 并绘制
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(canvasW)
  canvas.height = Math.ceil(canvasH)
  const ctx = canvas.getContext('2d')

  // 绘制背景
  if (bgColor.value !== 'transparent') {
    ctx.fillStyle = bgColor.value
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  // 绘制每张图片
  positions.forEach((pos, i) => {
    const item = images.value[i]
    ctx.save()

    // 圆角裁剪
    if (r > 0) {
      roundRect(ctx, pos.x, pos.y, pos.w, pos.h, r)
      ctx.clip()
    }

    if (pos.stretch) {
      // 拉伸模式
      const cx = pos.x + pos.w / 2, cy = pos.y + pos.h / 2
      ctx.translate(cx, cy)
      ctx.rotate((item.rotation * Math.PI) / 180)
      ctx.drawImage(item.img, -pos.w / 2, -pos.h / 2, pos.w, pos.h)
    } else {
      // 保持比例
      const rotSize = getRotatedSize(item.img, item.rotation)
      const fitScale = Math.min(pos.w / rotSize.width, pos.h / rotSize.height, 1)
      const dw = rotSize.width * fitScale * scale
      const dh = rotSize.height * fitScale * scale
      const ox = pos.x + (pos.w - dw) / 2
      const oy = pos.y + (pos.h - dh) / 2

      ctx.translate(ox + dw / 2, oy + dh / 2)
      ctx.rotate((item.rotation * Math.PI) / 180)
      const sw = item.img.naturalWidth * fitScale * scale
      const sh = item.img.naturalHeight * fitScale * scale
      ctx.drawImage(item.img, -sw / 2, -sh / 2, sw, sh)
    }

    ctx.restore()
  })

  return canvas
}

// ==================== 预览更新 ====================

/**
 * 【知识点】watch + 深度监听
 * watch(source, callback, { deep: true })
 * 当 images 数组内部元素变化时也触发回调
 *
 * 这里监听所有拼接设置的变化，实时更新预览
 */
const updatePreview = () => {
  if (images.value.length < 2 || !previewCanvasRef.value) return

  // 预览用较低缩放以保持流畅
  const result = stitch(0.5)
  if (!result) return

  const canvas = previewCanvasRef.value
  canvas.width = result.width
  canvas.height = result.height
  canvas.getContext('2d').drawImage(result, 0, 0)

  // 计算实际输出尺寸
  const actualW = Math.ceil(result.width / 0.5 * outputScale.value)
  const actualH = Math.ceil(result.height / 0.5 * outputScale.value)
  previewInfo.value = `${actualW} × ${actualH} px`
}

// 监听所有设置变化，更新预览
watch([images, layout, gridCols, gap, radius, align, bgColor, outputScale], () => {
  nextTick(updatePreview)
}, { deep: true })

// ==================== 导出 ====================

const exportImage = () => {
  if (images.value.length < 2) return

  const result = stitch(outputScale.value)
  if (!result) return

  const isTransparent = bgColor.value === 'transparent'
  const mimeType = isTransparent ? 'image/png' : 'image/png'

  result.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stitch_${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, mimeType)
}

// ==================== 生命周期 ====================

onUnmounted(() => {
  images.value.forEach(item => { if (item.url) URL.revokeObjectURL(item.url) })
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

/* ===== 上传区域 ===== */
.upload-zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 2rem 1.5rem;
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
  font-size: 2rem;
  color: var(--accent);
  margin-bottom: 0.75rem;
  display: block;
  position: relative;
}

.upload-text {
  position: relative;
  font-size: 0.95rem;
  font-weight: 500;
}

.upload-hint {
  position: relative;
  font-size: 0.8rem;
  color: var(--muted);
  margin-top: 0.35rem;
}

/* ===== 图片网格 ===== */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 0.75rem;
}

.image-thumb {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 2px solid var(--border);
  cursor: grab;
  transition: all 0.25s;
  background: var(--bg);
}

.image-thumb:active { cursor: grabbing; }

.image-thumb:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

.image-thumb.dragging { opacity: 0.4; transform: scale(0.92); }
.image-thumb.drag-target { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }

.image-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

.thumb-index {
  position: absolute;
  top: 6px; left: 6px;
  width: 22px; height: 22px;
  background: rgba(0,0,0,0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
  backdrop-filter: blur(4px);
}

.thumb-actions {
  position: absolute;
  top: 6px; right: 6px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-thumb:hover .thumb-actions { opacity: 1; }

.thumb-actions button {
  width: 26px; height: 26px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.2s;
  backdrop-filter: blur(6px);
  background: rgba(255,255,255,0.15);
  color: #fff;
}

.thumb-actions button:hover { background: rgba(255,255,255,0.3); }
.thumb-actions .btn-remove { background: rgba(255,77,106,0.7); }
.thumb-actions .btn-remove:hover { background: var(--danger); }

/* ===== 设置面板 ===== */
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 600px) {
  .settings-grid { grid-template-columns: 1fr; }
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.setting-item label {
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.setting-item select {
  width: 100%;
  padding: 0.5rem 0.7rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--fg);
  font-family: inherit;
  font-size: 0.85rem;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7280'%3E%3Cpath d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  padding-right: 2rem;
}

.setting-item select:focus { border-color: var(--accent); }

.range-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.range-row input[type="range"] {
  flex: 1;
  -webkit-appearance: none;
  height: 4px;
  background: var(--border);
  border-radius: 4px;
  outline: none;
}

.range-row input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px; height: 16px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(0,224,158,0.4);
}

.range-value {
  min-width: 36px;
  text-align: center;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-dim);
  padding: 2px 8px;
  border-radius: 6px;
}

/* 对齐按钮 */
.align-group {
  display: flex;
  gap: 0.4rem;
}

.align-btn {
  flex: 1;
  padding: 0.45rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--muted);
  cursor: pointer;
  font-size: 0.78rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.align-btn:hover { border-color: var(--muted); color: var(--fg); }
.align-btn.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }

/* 颜色选择 */
.color-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.color-swatch {
  width: 28px; height: 28px;
  border-radius: 7px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.color-swatch:hover { transform: scale(1.12); }
.color-swatch.active { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }

.color-swatch.active::after {
  content: '\f00c';
  font-family: 'Font Awesome 6 Free';
  font-weight: 900;
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

.color-swatch.transparent-bg {
  background: repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 10px 10px;
}

/* ===== 预览 ===== */
.preview-section { display: flex; flex-direction: column; gap: 0.6rem; }

.preview-label {
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preview-container {
  width: 100%;
  min-height: 120px;
  max-height: 360px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.preview-container canvas {
  max-width: 100%;
  max-height: 340px;
  object-fit: contain;
  border-radius: 4px;
}

.preview-info {
  position: absolute;
  bottom: 8px; right: 10px;
  font-size: 0.7rem;
  color: var(--muted);
  background: rgba(0,0,0,0.6);
  padding: 2px 8px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

/* ===== 底部操作栏 ===== */
.footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
  gap: 0.75rem;
}

.footer-info {
  font-size: 0.8rem;
  color: var(--muted);
}

.footer-info strong { color: var(--fg); }

.footer-actions {
  display: flex;
  gap: 0.6rem;
}

.btn-sm {
  padding: 0.45rem 0.9rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--fg);
  font-family: inherit;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-sm:hover { background: var(--card-hover); border-color: var(--muted); }

.btn-primary {
  padding: 0.55rem 1.3rem;
  background: var(--accent);
  border: none;
  border-radius: var(--radius-sm);
  color: #0f1117;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 2px 15px rgba(0,224,158,0.25);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 25px rgba(0,224,158,0.4); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
</style>
