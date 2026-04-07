<template>
    <!-- 整体三栏布局：左侧上传区 + 中间设置区 + 右侧预览区 -->
    <div class="seg-layout">

        <!-- ==================== 左栏：上传区 ==================== -->
        <div class="seg-left">

            <!-- 上传区 -->
            <div class="upload-zone" :class="{ 'drag-over': isDragOver }" @click="fileInput.click()"
                @dragover.prevent="isDragOver = true" @dragleave.prevent="isDragOver = false" @drop.prevent="onDrop">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <p class="upload-text">点击或拖拽图片到此处</p>
                <p class="upload-hint">支持 JPG / PNG / WebP · 可粘贴</p>
                <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
            </div>

            <!-- 已上传图片预览 -->
            <div v-if="sourceImage" class="source-preview-wrap">
                <span class="form-label">已上传图片</span>
                <div class="source-preview">
                    <img :src="sourceImage.url" :alt="sourceImage.name" class="source-thumb" />
                </div>
            </div>

            <!-- 删除图片按钮 -->
            <div v-if="sourceImage" class="nav-bar">
                <!-- 删除图片按钮 -->
                <button class="btn btn-danger" @click="clearSource" :disabled="!sourceImage">
                    <i class="fa-solid fa-trash"></i> 删除
                </button>
            </div>

            <!-- 图片信息栏 -->
            <div v-if="sourceImage" class="info-bar">
                <span class="nav-filename">{{ sourceImage.name }}</span>
                <span><i class="fa-solid fa-expand"></i> {{ sourceImage.img.naturalWidth }} × {{
                    sourceImage.img.naturalHeight }} px</span>
                <span><i class="fa-solid fa-weight-hanging"></i> {{ formatBytes(sourceImage.size) }}</span>
            </div>

        </div>

        <!-- ==================== 中栏：设置区 ==================== -->
        <div class="seg-middle">
            <div class="settings-panel">

                <!-- 切割方式 -->
                <div class="setting-row">
                    <span class="form-label">切割方式</span>
                    <div class="seg-control">
                        <button v-for="opt in presetOptions" :key="opt.value" class="seg-btn"
                            :class="{ active: cutMode === opt.value }" @click="selectPreset(opt.value)">
                            <i :class="opt.icon"></i> {{ opt.label }}
                        </button>
                        <button class="seg-btn" :class="{ active: cutMode === 'custom' }" @click="openCustomPicker"
                            ref="customBtnRef">
                            <i class="fa-solid fa-table-cells"></i> 自定义
                        </button>
                    </div>

                </div>

                <!-- ===== 自定义弹窗（Teleport 到 body） ===== -->
                <Teleport to="body">
                    <div v-if="showCustomPicker" class="picker-overlay" @click.self="showCustomPicker = false">
                        <div class="picker-popup" :style="pickerStyle">
                            <div class="picker-header">
                                <span class="picker-hint">
                                    <template v-if="hoverCol > 0 && hoverRow > 0">
                                        选择 <strong>{{ hoverCol }} × {{ hoverRow }}</strong>（{{ hoverCol * hoverRow }} 格）
                                    </template>
                                    <template v-else>移到格子选择切割方案</template>
                                </span>
                                <button class="picker-close" @click="showCustomPicker = false">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                            <div class="picker-grid">
                                <div v-for="row in 10" :key="row" class="picker-row">
                                    <div v-for="col in 10" :key="col" class="picker-cell"
                                        :class="{ highlighted: col <= hoverCol && row <= hoverRow }"
                                        @mouseenter="hoverCol = col; hoverRow = row"
                                        @mouseleave="hoverCol = 0; hoverRow = 0" @click="confirmCustom(col, row)"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Teleport>

                <!-- 间距 -->
                <div class="setting-row">
                    <span class="form-label">间距</span>
                    <SliderInput v-model="gap" label="" unit="px" :min="0" :max="100" />
                </div>

                <!-- 圆角 -->
                <div class="setting-row">
                    <span class="form-label">圆角</span>
                    <SliderInput v-model="radius" label="" unit="px" :min="0" :max="80" />
                </div>

                <!-- 背景色 -->
                <div class="setting-row">
                    <span class="form-label">背景色</span>
                    <div class="color-swatches">
                        <template v-for="color in bgColors" :key="color.value">
                            <button v-if="!color.isPicker" class="color-swatch"
                                :class="{ active: bgColor === color.value }" :style="color.value === 'transparent'
                                    ? { background: 'transparent', border: '1px dashed var(--border)' }
                                    : { background: color.value }" :title="color.label" @click="bgColor = color.value">
                                <i v-if="color.value === 'transparent'" class="fa-solid fa-ban"
                                    style="font-size:0.7rem;color:var(--muted)"></i>
                            </button>
                            <label v-else class="color-swatch" :class="{ active: bgColor === customBgColor }"
                                :style="{ background: customBgColor, border: '1px solid var(--border)' }"
                                :title="color.label">
                                <i class="fa-solid fa-palette"
                                    style="font-size:0.85rem;color:rgba(255,255,255,0.85)"></i>
                                <input type="color" class="palette-input" v-model="customBgColor"
                                    @input="applyCustomBgColor" />
                            </label>
                        </template>
                    </div>
                </div>

                <!-- 输出格式 -->
                <div class="setting-row">
                    <label class="form-label">输出格式</label>
                    <div class="seg-control">
                        <button v-for="fmt in ['png', 'jpeg', 'webp']" :key="fmt" class="seg-btn"
                            :class="{ active: format === fmt }" @click="format = fmt">{{ fmt.toUpperCase() }}</button>
                    </div>
                </div>

                <!-- 压缩选项 -->
                <div class="setting-row">
                    <label class="form-label">
                        图片压缩
                        <span v-if="format === 'png'" class="form-hint">（PNG 无损，此项无效）</span>
                    </label>
                    <div class="seg-control">
                        <button v-for="opt in compressionOptions" :key="opt.value" class="seg-btn"
                            :class="{ active: compression === opt.value }" :disabled="format === 'png'"
                            @click="compression = opt.value">{{ opt.label }}</button>
                    </div>
                </div>

            </div>
        </div>

        <!-- ==================== 右栏：预览区 ==================== -->
        <div class="seg-right">
            <div class="preview-area">

                <!-- 预览信息 -->
                <div v-if="previewInfo" class="preview-info">
                    <i class="fa-solid fa-scissors"></i> {{ previewInfo }}
                </div>

                <!-- 空状态 -->
                <div v-if="!sourceImage" class="empty-state">
                    <span class="empty-icon">✂️</span>
                    <span>上传图片后预览切割效果</span>
                </div>

                <!-- 九宫格预览 -->
                <div v-if="sourceImage" class="grid-preview" :style="{
                    gridTemplateColumns: `repeat(${cutCols}, 1fr)`,
                    gap: gap + 'px',
                    background: bgColor === 'transparent' ? 'transparent' : bgColor,
                    aspectRatio: `${sourceImage.img.naturalWidth} / ${sourceImage.img.naturalHeight}`
                }">
                    <div v-for="(_, idx) in previewCells" :key="idx" class="grid-cell"
                        :style="{ borderRadius: radius + 'px' }">
                        <canvas ref="cellCanvases" class="cell-canvas"></canvas>
                    </div>
                </div>

                <!-- 导出按钮 -->
                <button class="btn btn-primary btn-block" :disabled="!sourceImage" @click="exportZip">
                    <i class="fa-solid fa-file-zipper"></i>
                    {{ sourceImage ? `导出 ZIP（${cutCols} * ${cutRows} 张 ${format.toUpperCase()}）` : '请先上传图片' }}
                </button>

            </div>
        </div>

    </div>
</template>

<script setup>
// =============================================
// ImageSegmentation.vue —— 图片切割（九宫格）
// =============================================

import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import SliderInput from '../components/SliderInput.vue'
import { useToast } from '../composables/useToast.js'

const { showToast } = useToast()

// ==================== DOM Refs ====================
const fileInput = ref(null)
const customBtnRef = ref(null)
const cellCanvases = ref([])   // v-for 里的 canvas 列表

// ==================== 源图状态 ====================
const sourceImage = ref(null)   // { id, name, url, img: HTMLImageElement }
const isDragOver = ref(false)

// ==================== 切割参数 ====================
const cutMode = ref('3x3')   // '2x2' | '3x3' | 'custom'
const cutCols = ref(3)
const cutRows = ref(3)

// 自定义选择器
const showCustomPicker = ref(false)
const hoverCol = ref(0)
const hoverRow = ref(0)
const pickerStyle = ref({})

// ==================== 其他设置 ====================
const gap = ref(4)
const radius = ref(0)
const bgColor = ref('#ffffff')
const customBgColor = ref('#a78bfa')
const format = ref('jpeg')
const compression = ref(1.0)

const compressionOptions = [
    { label: '不压缩', value: 1.0 },
    { label: '2x 压缩', value: 0.5 },
    { label: '4x 压缩', value: 0.25 },
    { label: '8x 压缩', value: 0.125 },
]

const bgColors = [
    { value: '#ffffff', label: '白色' },
    { value: '#000000', label: '黑色' },
    { value: '#1a1d27', label: '深色' },
    { value: '#f8fafc', label: '亮灰' },
    { value: '#e0f2fe', label: '天蓝' },
    { value: '#fef3c7', label: '米黄' },
    { value: 'transparent', label: '透明' },
    { value: 'picker', label: '调色盘', isPicker: true },
]

const presetOptions = [
    { value: '2x2', label: '2×2', icon: 'fa-solid fa-border-all' },
    { value: '3x3', label: '3×3', icon: 'fa-solid fa-border-all' },
]

// ==================== 工具函数 ====================

const formatBytes = (bytes) => {
    if (!bytes) return '-'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
}



// ==================== 计算属性 ====================
const previewInfo = computed(() => {
    if (!sourceImage.value) return ''
    const { naturalWidth: w, naturalHeight: h } = sourceImage.value.img
    const cellW = Math.floor(w / cutCols.value)
    const cellH = Math.floor(h / cutRows.value)
    return `每格约 ${cellW} × ${cellH} px · 共 ${cutCols.value * cutRows.value} 张`
})

// 预览格子占位数组
const previewCells = computed(() =>
    Array.from({ length: cutCols.value * cutRows.value })
)

// ==================== 切割方式选择 ====================
const selectPreset = (value) => {
    cutMode.value = value
    if (value === '2x2') { cutCols.value = 2; cutRows.value = 2 }
    if (value === '3x3') { cutCols.value = 3; cutRows.value = 3 }
    showCustomPicker.value = false
}

const openCustomPicker = () => {
    if (customBtnRef.value) {
        const rect = customBtnRef.value.getBoundingClientRect()
        pickerStyle.value = {
            top: (rect.bottom + window.scrollY + 8) + 'px',
            left: (rect.left + window.scrollX) + 'px',
        }
    }
    // 打开时若已是自定义，显示当前已选中区域
    hoverCol.value = cutMode.value === 'custom' ? cutCols.value : 0
    hoverRow.value = cutMode.value === 'custom' ? cutRows.value : 0
    showCustomPicker.value = true
}

const confirmCustom = (col, row) => {
    cutMode.value = 'custom'
    cutCols.value = col
    cutRows.value = row
    showCustomPicker.value = false
}

const applyCustomBgColor = () => { bgColor.value = customBgColor.value }

// ==================== 文件处理 ====================
const onFileChange = (e) => {
    const file = e.target.files[0]
    if (file) loadFile(file)
    e.target.value = ''
}

const onDrop = (e) => {
    isDragOver.value = false
    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'))
    if (file) loadFile(file)
}

const onPaste = (e) => {
    const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'))
    if (item) loadFile(item.getAsFile())
}

const loadFile = (file) => {
    if (sourceImage.value) URL.revokeObjectURL(sourceImage.value.url)
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
        sourceImage.value = {
            id: Date.now(),
            size: file.size,
            name: file.name,
            url,
            img
        }
        showToast('图片已加载', 'success')
    }
    img.src = url
}

const clearSource = () => {
    if (sourceImage.value) URL.revokeObjectURL(sourceImage.value.url)
    sourceImage.value = null
}

// ==================== 圆角矩形工具 ====================
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

// ==================== 核心：切割单格 ====================
/**
 * 从源图中裁出第 (col, row) 格（0-indexed），返回 HTMLCanvasElement
 * @param {number} col       - 列索引（0-indexed）
 * @param {number} row       - 行索引（0-indexed）
 * @param {number} outScale  - 输出缩放（预览=1，导出可调）
 */
const sliceCell = (col, row, outScale = 1) => {
    const { img } = sourceImage.value
    const srcW = img.naturalWidth
    const srcH = img.naturalHeight

    // 源图每格像素范围（浮点，保留精度）
    const cellSrcW = srcW / cutCols.value
    const cellSrcH = srcH / cutRows.value
    const sx = col * cellSrcW
    const sy = row * cellSrcH

    // 输出尺寸
    const outW = Math.round(cellSrcW * outScale)
    const outH = Math.round(cellSrcH * outScale)

    const canvas = document.createElement('canvas')
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')

    // 背景
    if (bgColor.value !== 'transparent') {
        ctx.fillStyle = bgColor.value
        ctx.fillRect(0, 0, outW, outH)
    }

    // 圆角裁剪
    if (radius.value > 0) {
        roundRect(ctx, 0, 0, outW, outH, radius.value * outScale)
        ctx.clip()
    }

    // 绘制对应区域
    ctx.drawImage(img, sx, sy, cellSrcW, cellSrcH, 0, 0, outW, outH)

    return canvas
}

// ==================== 更新预览 ====================
const updatePreview = async () => {
    if (!sourceImage.value) return
    await nextTick()   // 等待 v-for 更新 cellCanvases

    const canvases = cellCanvases.value
    if (!canvases || canvases.length === 0) return

    const total = cutCols.value * cutRows.value
    for (let i = 0; i < total; i++) {
        const col = i % cutCols.value
        const row = Math.floor(i / cutCols.value)
        const cell = sliceCell(col, row, 1)

        const canvas = Array.isArray(canvases) ? canvases[i] : canvases
        if (!canvas) continue
        canvas.width = cell.width
        canvas.height = cell.height
        canvas.getContext('2d').drawImage(cell, 0, 0)
    }
}

// ==================== 导出 ZIP ====================
const exportZip = async () => {
    if (!sourceImage.value) return

    const fmt = format.value
    let mimeType = 'image/png'
    let fileExt = 'png'
    if (fmt === 'jpeg') { mimeType = 'image/jpeg'; fileExt = 'jpg' }
    else if (fmt === 'webp') { mimeType = 'image/webp'; fileExt = 'webp' }

    const quality = fmt === 'png' ? undefined : compression.value
    const total = cutCols.value * cutRows.value

    showToast('正在生成切片…', 'info')

    try {
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()

        // 并发生成所有格子 Blob
        const blobPromises = Array.from({ length: total }, (_, i) => {
            const col = i % cutCols.value
            const row = Math.floor(i / cutCols.value)
            const cell = sliceCell(col, row, 1)
            return new Promise((resolve) => {
                cell.toBlob(blob => resolve({ idx: i + 1, blob }), mimeType, quality)
            })
        })

        const results = await Promise.all(blobPromises)
        results.forEach(({ idx, blob }) => {
            zip.file(`${String(idx).padStart(2, '0')}.${fileExt}`, blob)
        })

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(zipBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `seg_${cutCols.value}x${cutRows.value}_${Date.now()}.zip`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showToast(`导出成功，共 ${total} 张，${(zipBlob.size / 1024 / 1024).toFixed(2)} MB`, 'success')
    } catch (err) {
        console.error(err)
        showToast('导出失败：' + err.message, 'error')
    }
}

// ==================== Watch ====================
watch(
    [sourceImage, cutCols, cutRows, gap, radius, bgColor],
    () => nextTick(updatePreview),
    { deep: true }
)

// ==================== 生命周期 ====================
onMounted(() => document.addEventListener('paste', onPaste))
onUnmounted(() => {
    document.removeEventListener('paste', onPaste)
    if (sourceImage.value) URL.revokeObjectURL(sourceImage.value.url)
})
</script>

<style scoped>
/* ===== 整体三栏布局 ===== */
.seg-layout {
    display: flex;
    gap: 1.25rem;
    min-height: 0;
}

/* 左栏 */
.seg-left {
    flex: 1 1 auto;
    min-width: 260px;
    width: 600px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* 中栏 */
.seg-middle {
    width: 335px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* 右栏 */
.seg-right {
    width: 435px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* ===== 上传区 ===== */
.upload-zone {
    border: 2px dashed var(--border);
    border-radius: var(--radius);
    padding: 1.5rem 1rem;
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

.upload-zone i {
    position: relative;
    font-size: 1.75rem;
    color: var(--accent);
    display: block;
    margin-bottom: 0.5rem;
}

.upload-text {
    position: relative;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--fg);
}

.upload-hint {
    position: relative;
    font-size: 0.75rem;
    color: var(--muted);
    margin-top: 0.25rem;
}

/* ===== 源图预览 ===== */
.source-preview-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.source-preview {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    background: var(--bg);
    display: flex;
    flex-direction: column;
}

.source-thumb {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
    background: var(--bg);
    display: block;
}

.nav-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
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


/* ===== 设置面板 ===== */
.settings-panel {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.setting-row {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.seg-control {
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
}

.seg-btn {
    flex: 1;
    min-width: 0;
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

/* ===== 自定义选择器弹窗 ===== */
.picker-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
}

.picker-popup {
    position: absolute;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.75rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    z-index: 10000;
}

.picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    min-height: 1.6rem;
}

.picker-hint {
    font-size: 0.8rem;
    color: var(--muted);
}

.picker-hint strong {
    color: var(--accent);
    font-weight: 700;
}

.picker-close {
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    padding: 0.1rem 0.3rem;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    line-height: 1;
    transition: color 0.2s;
    flex-shrink: 0;
}

.picker-close:hover {
    color: var(--fg);
}

.picker-grid {
    display: flex;
    flex-direction: column;
    gap: 3px;
    user-select: none;
}

.picker-row {
    display: flex;
    gap: 3px;
}

.picker-cell {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    border: 1px solid var(--border);
    background: var(--bg);
    cursor: pointer;
    transition: background 0.1s, border-color 0.1s;
    flex-shrink: 0;
}

.picker-cell.highlighted {
    background: var(--accent-dim);
    border-color: var(--accent);
}

/* ===== 背景色 ===== */
.color-swatches {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.color-swatch {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
}

.palette-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    border: none;
    padding: 0;
    margin: 0;
}

.color-swatch.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-dim);
    transform: scale(1.15);
}

.color-swatch:hover {
    transform: scale(1.1);
}

/* ===== 预览区 ===== */
.preview-area {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    height: 610px;
}

.preview-info {
    font-size: 0.75rem;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-shrink: 0;
}

/* 九宫格预览容器 */
.grid-preview {
    margin-left: auto;
    margin-top: auto;
    margin-bottom: auto;
    display: grid;
    overflow: hidden;
    border-radius: var(--radius-sm);
    /* 宽度自适应，高度由 aspect-ratio 控制 */
    width: 100%;
}

.grid-cell {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.cell-canvas {
    width: auto;
    height: 100%;
    display: block;

}


/* ===== 标签 ===== */


.form-hint {
    font-size: 0.72rem;
    color: var(--muted);
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
    margin-left: 0.25rem;
}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
    .seg-layout {
        flex-direction: column;
    }

    .seg-right {
        width: 100%;
    }
}
</style>