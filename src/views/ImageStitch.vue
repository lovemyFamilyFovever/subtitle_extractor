<template>
  <!-- 整体两栏布局：左侧设置区 + 右侧预览区 -->
  <div class="stitch-layout">

    <!-- ==================== 左栏：设置区 ==================== -->
    <div class="stitch-left">

      <!-- 1. 上传区 -->
      <div class="upload-zone" :class="{ 'drag-over': isDragOver }" @click="fileInput.click()"
        @dragover.prevent="isDragOver = true" @dragleave.prevent="isDragOver = false" @drop.prevent="onDrop">
        <i class="fa-solid fa-cloud-arrow-up"></i>
        <p class="upload-text">点击或拖拽图片到此处</p>
        <p class="upload-hint">支持 JPG / PNG / WebP · 可多选 · 可粘贴</p>
        <!-- 隐藏的文件 input，用 ref 引用后通过 .click() 触发 -->
        <input ref="fileInput" type="file" accept="image/*" multiple style="display:none" @change="onFileChange" />
      </div>

      <!-- 2. 图片列表（有图片时才显示） -->
      <div v-if="images.length > 0" class="image-list">
        <div v-for="(item, index) in images" :key="item.id" class="image-item" :class="{
          dragging: dragIndex === index,
          'drag-target': dragTargetIndex === index
        }" draggable="true" @dragstart="onDragStart(index)" @dragover.prevent="onDragOver(index)" @dragend="onDragEnd">
          <!-- 缩略图 -->
          <img :src="item.url" :alt="item.name" />

          <!-- 序号角标 -->
          <span class="item-index">{{ index + 1 }}</span>

          <!-- 旋转按钮 -->
          <button class="item-rotate" @click.stop="rotateImage(index)" title="旋转90°">
            <i class="fa-solid fa-rotate-right"></i>
          </button>

          <!-- 删除按钮 -->
          <button class="item-delete" @click.stop="removeImage(index)" title="删除">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- 有图片时显示清空按钮 -->
      <button v-if="images.length > 0" class="btn btn-danger btn-sm" @click="clearAll">
        <i class="fa-solid fa-trash"></i> 清空全部 ({{ images.length }})
      </button>

    </div>

    <!-- ==================== 中栏：设置区 ==================== -->
    <div class="stitch-middle">

      <!-- 布局设置区 -->
      <div class="settings-panel">

        <!-- 布局方式 -->
        <div class="setting-row">
          <span class="form-label">布局方式</span>
          <div class="seg-control">
            <button v-for="opt in layoutOptions" :key="opt.value" class="seg-btn"
              :class="{ active: layout === opt.value }" @click="layout = opt.value">
              <i :class="opt.icon"></i> {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- 网格列数（仅 grid 模式显示） -->
        <div v-if="layout === 'grid'" class="setting-row">
          <span class="form-label">网格列数</span>
          <div class="seg-control">
            <button v-for="n in [2, 3, 4, 5]" :key="n" class="seg-btn" :class="{ active: gridCols === n }"
              @click="gridCols = n">{{ n }}</button>
          </div>
        </div>

        <!-- 对齐方式 -->
        <div class="setting-row">
          <span class="form-label">对齐方式</span>
          <div class="seg-control">
            <button v-for="opt in alignOptions" :key="opt.value" class="seg-btn"
              :class="{ active: align === opt.value }" @click="align = opt.value">{{ opt.label }}</button>
          </div>
        </div>

        <div class="setting-row">
          <span class="form-label">间距滑块</span>
          <SliderInput v-model="gap" label="" unit="px" :min="0" :max="100" />
        </div>

        <div class="setting-row">
          <span class="form-label">圆角滑块</span>
          <SliderInput v-model="radius" label="" unit="px" :min="0" :max="80" />
        </div>

        <!-- 背景色 -->
        <div class="setting-row">
          <span class="form-label">背景色</span>
          <div class="color-swatches">
            <template v-for="color in bgColors" :key="color.value">
              <button v-if="!color.isPicker" class="color-swatch" :class="{ active: bgColor === color.value }" :style="color.value === 'transparent'
                ? { background: 'transparent', border: '1px dashed var(--border)' }
                : { background: color.value }" :title="color.label" @click="bgColor = color.value">
                <i v-if="color.value === 'transparent'" class="fa-solid fa-ban"
                  style="font-size:0.7rem; color:var(--muted)"></i>
              </button>
              <label v-else class="color-swatch" :class="{ active: bgColor === customBgColor }"
                :style="{ background: customBgColor, border: '1px solid var(--border)' }" :title="color.label">
                <i class="fa-solid fa-palette" style="font-size:0.85rem; color: rgba(255,255,255,0.85)"></i>
                <input type="color" class="palette-input" v-model="customBgColor" @input="applyCustomBgColor" />
              </label>
            </template>
          </div>

          <!-- 输出缩放 -->
          <div class="setting-row">
            <span class="form-label">输出缩放</span>
            <div class="seg-control">
              <button v-for="s in [0.5, 1, 1.5, 2]" :key="s" class="seg-btn" :class="{ active: scale === s }"
                @click="scale = s">{{ s }}x</button>
            </div>
          </div>

          <!-- 导出按钮 -->
          <button class="btn btn-primary btn-block" :disabled="images.length < 2" @click="exportImage">
            <i class="fa-solid fa-download"></i>
            {{ images.length < 2 ? '至少需要 2 张图片' : '导出拼接图' }} </button>

        </div>
      </div>
        </div>


      <!-- ==================== 右栏：预览区 ========== -->

      <div class="stitch-right">
        <!-- 预览区 -->
        <div class="preview-area">
          <!-- 预览信息（尺寸） -->
          <div v-if="previewInfo" class="preview-info">
            <i class="fa-solid fa-image"></i> 预览 · 输出尺寸 {{ previewInfo }}
          </div>

          <!-- 无图片时的空状态 -->
          <div v-if="images.length < 2" class="empty-state" style="min-height: 160px;">
            <span class="empty-icon">🖼️</span>
            <span>添加至少 2 张图片后预览</span>
          </div>

          <!-- 预览 Canvas（有图片才显示） -->
          <!--
          ref="previewCanvas" —— 让我们在 JS 里直接操作这个 DOM 元素
          这是 Vue 3 中访问 DOM 的方式，相当于 document.getElementById()
        -->
          <div class="result-canvas-container">
            <canvas v-show="images.length >= 2" ref="previewCanvas" class="preview-canvas"></canvas>
          </div>
        </div>
      </div>
    </div>

</template>

    <script setup>
    // =============================================
    // ImageStitch.vue —— 图片拼接功能
    // =============================================

    import { ref, reactive, watch, onMounted, onUnmounted, nextTick } from 'vue'
    import SliderInput from '../components/SliderInput.vue'
    import { useToast } from '../composables/useToast.js'

    const { showToast } = useToast()

    // ==================== 状态定义 ====================

    // 文件 input 的 DOM 引用（对应模板里的 ref="fileInput"）
    const fileInput = ref(null)
    // 预览 Canvas 的 DOM 引用
    const previewCanvas = ref(null)
    // 预览尺寸信息文字
    const previewInfo = ref('')

    // 图片列表：每个元素是 { id, name, url, img(HTMLImageElement), rotation }
    const images = ref([])

    // 拖拽排序状态
    const dragIndex = ref(-1)   // 正在被拖的图片索引
    const dragTargetIndex = ref(-1)   // 鼠标悬停的目标索引
    const isDragOver = ref(false) // 上传区的拖拽悬停状态

    // ===== 拼接参数（每次变化都触发预览更新） =====
    const layout = ref('horizontal') // 布局方式
    const gridCols = ref(2)            // 网格列数
    const gap = ref(8)            // 间距 px
    const radius = ref(0)            // 圆角 px
    const align = ref('center')     // 对齐方式
    const bgColor = ref('#ffffff')    // 背景色
    const scale = ref(1)            // 输出缩放倍数

    // ===== 静态配置数据（不需要响应式，所以不用 ref） =====
    const layoutOptions = [
      { value: 'horizontal', label: '水平', icon: 'fa-solid fa-arrows-left-right' },
      { value: 'vertical', label: '垂直', icon: 'fa-solid fa-arrows-up-down' },
      { value: 'grid', label: '网格', icon: 'fa-solid fa-border-all' },
    ]

    const alignOptions = [
      { value: 'start', label: '起点' },
      { value: 'center', label: '居中' },
      { value: 'end', label: '终点' },
      { value: 'stretch', label: '拉伸' },
    ]

    const customBgColor = ref('#a78bfa')
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

    const applyCustomBgColor = () => {
      bgColor.value = customBgColor.value
    }

    // ==================== watch：监听参数变化自动更新预览 ====================
    /*
      watch() 是 Vue 3 的响应式监听器
      第一个参数：要监听的数据（可以是数组，同时监听多个）
      第二个参数：回调函数
      { deep: true } 深度监听，数组内部变化也能触发
    */
    watch(
      [images, layout, gridCols, gap, radius, align, bgColor, scale],
      () => {
        // nextTick：等 DOM 更新完毕后再操作 Canvas
        // 因为 v-show 切换后 Canvas 需要一个渲染周期才可见
        nextTick(updatePreview)
      },
      { deep: true }
    )

    // ==================== 文件处理 ====================

    /** 用户通过 input 选择文件 */
    const onFileChange = (e) => {
      addFiles(Array.from(e.target.files))
      // 清空 input 值，让同一文件可以再次选择
      e.target.value = ''
    }

    /** 拖拽文件到上传区 */
    const onDrop = (e) => {
      isDragOver.value = false
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
      if (files.length) addFiles(files)
    }

    /** 粘贴图片（Ctrl+V） */
    const onPaste = (e) => {
      const files = [...(e.clipboardData?.items || [])]
        .filter(item => item.type.startsWith('image/'))
        .map(item => item.getAsFile())
        .filter(Boolean)
      if (files.length) addFiles(files)
    }

    /**
     * 核心：把 File 数组转为我们需要的图片对象
     * 使用 Promise.all 并发加载所有图片，提升速度
     */
    const addFiles = async (files) => {
      // 并发创建所有图片对象
      const newItems = await Promise.all(
        files.map(file => new Promise((resolve) => {
          const url = URL.createObjectURL(file)
          const img = new Image()
          img.onload = () => resolve({
            id: Date.now() + Math.random(), // 唯一 id（用于 :key）
            name: file.name,
            url,
            img,      // 保存 HTMLImageElement，拼接时直接用
            rotation: 0
          })
          img.src = url
        }))
      )

      images.value.push(...newItems)
      showToast(`已添加 ${newItems.length} 张图片`, 'success')
    }

    /** 删除指定图片 */
    const removeImage = (index) => {
      // 释放 ObjectURL，避免内存泄漏
      URL.revokeObjectURL(images.value[index].url)
      images.value.splice(index, 1)
    }

    /** 旋转指定图片 90° */
    const rotateImage = (index) => {
      images.value[index].rotation = (images.value[index].rotation + 90) % 360
    }

    /** 清空全部 */
    const clearAll = () => {
      images.value.forEach(item => URL.revokeObjectURL(item.url))
      images.value = []
      previewInfo.value = ''
    }

    // ==================== 拖拽排序 ====================

    const onDragStart = (index) => { dragIndex.value = index }
    const onDragOver = (index) => { dragTargetIndex.value = index }
    const onDragEnd = () => {
      // 执行移位：把 dragIndex 位置的元素移到 dragTargetIndex 位置
      if (dragIndex.value !== -1 && dragTargetIndex.value !== -1 && dragIndex.value !== dragTargetIndex.value) {
        const arr = [...images.value]
        const item = arr.splice(dragIndex.value, 1)[0]  // 取出
        arr.splice(dragTargetIndex.value, 0, item)        // 插入
        images.value = arr
      }
      dragIndex.value = -1
      dragTargetIndex.value = -1
    }

    // ==================== 核心拼接算法 ====================

    /**
     * 获取图片旋转后的显示尺寸
     * 旋转 90°/270° 时，宽高互换
     */
    const getRotatedSize = (img, rotation) => {
      const r = ((rotation % 360) + 360) % 360
      return (r === 90 || r === 270)
        ? { width: img.naturalHeight, height: img.naturalWidth }
        : { width: img.naturalWidth, height: img.naturalHeight }
    }

    /**
     * 圆角矩形路径（用于 Canvas clip）
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
     * 主拼接函数：根据当前所有设置，生成一个 Canvas
     * @param {number} renderScale - 渲染缩放比（预览用小值，导出用 scale.value）
     * @returns {HTMLCanvasElement|null}
     */
    const stitchImages = (renderScale) => {
      const imgs = images.value
      if (imgs.length < 2) return null

      const gapPx = gap.value
      const radiusPx = radius.value
      const alignMode = align.value
      const layoutMode = layout.value

      // 计算每张图片在当前旋转角度下的显示尺寸
      const sizes = imgs.map(item => getRotatedSize(item.img, item.rotation))

      let canvasW, canvasH, positions

      if (layoutMode === 'horizontal') {
        // ---- 水平拼接 ----
        const maxH = Math.max(...sizes.map(s => s.height))
        canvasW = sizes.reduce((sum, s) => sum + s.width, 0) + gapPx * (imgs.length - 1)
        canvasH = maxH

        positions = sizes.map((s, i) => {
          const x = sizes.slice(0, i).reduce((sum, ss) => sum + ss.width, 0) + gapPx * i
          let y = 0
          if (alignMode === 'center') y = (maxH - s.height) / 2
          if (alignMode === 'end') y = maxH - s.height
          const stretch = alignMode === 'stretch'
          return { x, y, w: s.width, h: stretch ? maxH : s.height, stretch }
        })

      } else if (layoutMode === 'vertical') {
        // ---- 垂直拼接 ----
        const maxW = Math.max(...sizes.map(s => s.width))
        canvasW = maxW
        canvasH = sizes.reduce((sum, s) => sum + s.height, 0) + gapPx * (imgs.length - 1)

        positions = sizes.map((s, i) => {
          const y = sizes.slice(0, i).reduce((sum, ss) => sum + ss.height, 0) + gapPx * i
          let x = 0
          if (alignMode === 'center') x = (maxW - s.width) / 2
          if (alignMode === 'end') x = maxW - s.width
          const stretch = alignMode === 'stretch'
          return { x, y, w: stretch ? maxW : s.width, h: s.height, stretch }
        })

      } else {
        // ---- 网格拼接 ----
        const cols = gridCols.value
        const rows = Math.ceil(imgs.length / cols)

        // 计算每列最大宽、每行最大高
        const colWidths = Array.from({ length: cols }, (_, c) =>
          Math.max(...Array.from({ length: rows }, (_, r) => sizes[r * cols + c]?.width ?? 0))
        )
        const rowHeights = Array.from({ length: rows }, (_, r) =>
          Math.max(...Array.from({ length: cols }, (_, c) => sizes[r * cols + c]?.height ?? 0))
        )

        canvasW = colWidths.reduce((a, b) => a + b, 0) + gapPx * (cols - 1)
        canvasH = rowHeights.reduce((a, b) => a + b, 0) + gapPx * (rows - 1)

        positions = sizes.map((s, i) => {
          const c = i % cols
          const r = Math.floor(i / cols)
          const bx = colWidths.slice(0, c).reduce((a, b) => a + b, 0) + gapPx * c
          const by = rowHeights.slice(0, r).reduce((a, b) => a + b, 0) + gapPx * r

          const stretch = alignMode === 'stretch'
          let x = bx, y = by
          let w = stretch ? colWidths[c] : s.width
          let h = stretch ? rowHeights[r] : s.height

          if (!stretch) {
            if (alignMode === 'center') { x = bx + (colWidths[c] - w) / 2; y = by + (rowHeights[r] - h) / 2 }
            if (alignMode === 'end') { x = bx + colWidths[c] - w; y = by + rowHeights[r] - h }
          }
          return { x, y, w, h, stretch }
        })
      }

      // ---- 创建 Canvas 并绘制 ----
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(canvasW * renderScale)
      canvas.height = Math.ceil(canvasH * renderScale)
      const ctx = canvas.getContext('2d')

      // 背景
      if (bgColor.value !== 'transparent') {
        ctx.fillStyle = bgColor.value
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // 逐张绘制
      positions.forEach((pos, i) => {
        const { img, rotation } = imgs[i]
        const sx = pos.x * renderScale
        const sy = pos.y * renderScale
        const sw = pos.w * renderScale
        const sh = pos.h * renderScale

        ctx.save()

        // 圆角裁剪
        if (radiusPx > 0) {
          roundRect(ctx, sx, sy, sw, sh, radiusPx * renderScale)
          ctx.clip()
        }

        // 平移到绘制中心，旋转后绘制
        ctx.translate(sx + sw / 2, sy + sh / 2)
        ctx.rotate((rotation * Math.PI) / 180)

        if (pos.stretch) {
          // 拉伸模式：直接填满区域
          ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh)
        } else {
          // 保持比例，缩放至适配
          const fitScale = Math.min(sw / img.naturalWidth, sh / img.naturalHeight)
          const dw = img.naturalWidth * fitScale
          const dh = img.naturalHeight * fitScale
          ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh)
        }

        ctx.restore()
      })

      return canvas
    }

    // ==================== 预览 & 导出 ====================

    /** 更新预览 Canvas */
    const updatePreview = () => {
      if (images.value.length < 2) {
        previewInfo.value = ''
        return
      }

      // 预览用 0.5 缩放，速度快
      const result = stitchImages(0.5)
      if (!result || !previewCanvas.value) return

      const canvas = previewCanvas.value
      canvas.width = result.width
      canvas.height = result.height
      canvas.getContext('2d').drawImage(result, 0, 0)

      // 显示实际输出尺寸（预览是 0.5，所以 ×2 再 ×scale 得到实际值）
      const actualW = Math.ceil(result.width / 0.5 * scale.value)
      const actualH = Math.ceil(result.height / 0.5 * scale.value)
      previewInfo.value = `${actualW} × ${actualH} px`
    }

    /** 导出图片 */
    const exportImage = () => {
      if (images.value.length < 2) return

      const result = stitchImages(scale.value)
      if (!result) return

      result.toBlob((blob) => {
        if (!blob) { showToast('导出失败', 'error'); return }

        // 创建临时 <a> 标签触发下载
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `stitch_${Date.now()}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showToast(`导出成功，${(blob.size / 1024 / 1024).toFixed(2)} MB`, 'success')
      }, 'image/png')
    }

    // ==================== 生命周期 ====================

    onMounted(() => {
      // 注册全局粘贴事件
      document.addEventListener('paste', onPaste)
    })

    onUnmounted(() => {
      // 组件卸载时清理：移除事件监听 + 释放所有 ObjectURL
      document.removeEventListener('paste', onPaste)
      images.value.forEach(item => URL.revokeObjectURL(item.url))
    })
</script>

    <style scoped>

    /* ===== 整体两栏布局 ===== */
    .stitch-layout {
      display: flex;
      gap: 1.25rem;
      min-height: 0;
      /* 允许 flex 子项收缩 */
    }

    /* 左栏：图片管理 */
    .stitch-left {
      flex: 1 1 auto;
      /* 关键：让左侧占据剩余空间，但不会被压缩 */
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 700px;
    }

    /* 中栏：设置 + 预览 */
    .stitch-middle {
      width: 335px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* 右栏：设置 + 预览 */
    .stitch-right {
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

    /* ===== 图片列表（网格缩略图） ===== */
    .image-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 0.6rem;
      max-height: 380px;
      overflow-y: auto;
      padding-right: 2px;
      /* 防止滚动条遮住内容 */
    }

    /* 单张图片 */
    .image-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 2px solid var(--border);
      cursor: grab;
      transition: all 0.2s;
      background: var(--bg);
    }

    .image-item:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }

    .image-item.dragging {
      opacity: 0.35;
      transform: scale(0.9);
    }

    .image-item.drag-target {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-dim);
    }

    .image-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      pointer-events: none;
    }

    /* 序号角标 */
    .item-index {
      position: absolute;
      top: 4px;
      left: 4px;
      background: rgba(0, 0, 0, 0.65);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 4px;
      pointer-events: none;
    }

    /* 旋转按钮 */
    .item-rotate {
      position: absolute;
      bottom: 4px;
      left: 4px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      opacity: 0;
      transition: opacity 0.2s;
    }

    /* 删除按钮 */
    .item-delete {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--danger);
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      opacity: 0;
      transition: opacity 0.2s;
    }

    /* hover 时才显示操作按钮 */
    .image-item:hover .item-rotate,
    .image-item:hover .item-delete {
      opacity: 1;
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

    /* 分段控制器 */
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

    .seg-btn:hover:not(.active) {
      border-color: var(--muted);
      color: var(--fg);
    }

    /* 背景色色块 */
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
      gap: 0.5rem;
      min-height: 120px;
    }

    .preview-info {
      font-size: 0.75rem;
      color: var(--muted);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }


    .result-canvas-container {
      overflow: hidden;
      overflow-y: scroll;
      height: 600px;
    }


    .preview-canvas {
      width: 100%;
      height: auto;
      border-radius: var(--radius-sm);
      display: block;
    }

    /* ===== 响应式：窄屏改为单栏 ===== */
    @media (max-width: 640px) {
      .stitch-layout {
        flex-direction: column;
      }

      .stitch-right {
        width: 100%;
      }
    }
  </style>