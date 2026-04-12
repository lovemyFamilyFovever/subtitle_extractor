<template>
  <Teleport to="body">
    <Transition name="viewer-fade">
      <div v-if="visible" class="image-viewer">
        <!-- 遮罩层 -->
        <div class="viewer-overlay" @click.stop="close"></div>

        <!-- 关闭按钮 -->
        <button class="viewer-close" @click.stop="close" title="关闭 (Esc)">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <!-- 上一张按钮 -->
        <button v-if="images.length > 1" class="viewer-nav viewer-prev" @click.stop="prevImage"
          :disabled="localIndex === 0" title="上一张 (←)">
          <i class="fa-solid fa-chevron-left"></i>
        </button>

        <!-- 下一张按钮 -->
        <button v-if="images.length > 1" class="viewer-nav viewer-next" @click.stop="nextImage"
          :disabled="localIndex >= images.length - 1" title="下一张 (→)">
          <i class="fa-solid fa-chevron-right"></i>
        </button>

        <!-- 图片容器 -->
        <div class="viewer-content" @click.stop>
          <div class="image-wrapper" :style="transformStyle">
            <img :src="currentImage" class="viewer-image" @wheel.prevent="handleWheel" @mousedown="startDrag"
              @dragstart.prevent />
          </div>

          <div class="imageAttribution">
            <span v-if="imageTitle">{{ imageTitle }}</span>
            <span v-if="imgText">{{ imgText }}</span>
            <span v-if="imageSize && imageSize.width && imageSize.height">
              {{ imageSize.width }}x{{ imageSize.height }}
            </span>
            <span v-if="fileSizeText">{{ fileSizeText }}</span>
          </div>

        </div>

        <!-- 底部工具栏 -->
        <div class="viewer-toolbar" @click.stop>
          <div class="toolbar-left">
            <span class="image-counter">
              {{ localIndex + 1 }} / {{ images.length }}
            </span>
          </div>

          <div class="toolbar-center">
            <button class="tool-btn" @click="zoomOut" title="缩小 (-)">
              <i class="fa-solid fa-magnifying-glass-minus"></i>
            </button>

            <span class="zoom-level">{{ Math.round(scale * 100) }}%</span>

            <button class="tool-btn" @click="zoomIn" title="放大 (+)">
              <i class="fa-solid fa-magnifying-glass-plus"></i>
            </button>

            <button class="tool-btn" @click="resetZoom" title="重置大小 (0)">
              <i class="fa-solid fa-expand"></i>
            </button>

            <button class="tool-btn" @click="rotateLeft" title="向左旋转">
              <i class="fa-solid fa-rotate-left"></i>
            </button>

            <button class="tool-btn" @click="rotateRight" title="向右旋转">
              <i class="fa-solid fa-rotate-right"></i>
            </button>
          </div>

          <div class="toolbar-right">
            <button class="tool-btn primary" @click="downloadImage" title="下载 (D)">
              <i class="fa-solid fa-download"></i>
              <span>下载</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  images: {
    type: Array,
    default: () => []
  },
  viewerIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 本地索引，跟随外部 prop 变化
const localIndex = ref(props.viewerIndex)

// 外部 prop 变化时同步
watch(() => props.viewerIndex, (val) => {
  localIndex.value = val
})

// 打开时同步索引 + 重置状态
watch(visible, (isVisible) => {
  if (isVisible) {
    localIndex.value = props.viewerIndex
    resetZoom()
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// 安全读取当前图片数据
const currentImage = computed(() => props.images[localIndex.value]?.imgSrc || '')
const imageTitle = computed(() => props.images[localIndex.value]?.imgTitle || '')
const imgText = computed(() => props.images[localIndex.value]?.imgText || '')
const imageSize = computed(() => props.images[localIndex.value]?.imgSize || {})
const fileSizeText = computed(() => props.images[localIndex.value]?.fileSizeText || '')


// 缩放和旋转状态
const scale = ref(1)
const rotation = ref(0)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)

// 变换样式
const transformStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value}) rotate(${rotation.value}deg)`
}))

// 关闭
const close = () => {
  visible.value = false
}

// 上一张
const prevImage = () => {
  if (localIndex.value > 0) {
    localIndex.value--
    resetZoom()
  }
}

// 下一张
const nextImage = () => {
  if (localIndex.value < props.images.length - 1) {
    localIndex.value++
    resetZoom()
  }
}

// 缩放
const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.25, 5)
}

const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.25, 0.25)
}

const resetZoom = () => {
  scale.value = 1
  rotation.value = 0
  translateX.value = 0
  translateY.value = 0
}

// 滚轮缩放
const handleWheel = (e) => {
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// 旋转
const rotateLeft = () => {
  rotation.value -= 90
}

const rotateRight = () => {
  rotation.value += 90
}

// 拖拽
const startDrag = (e) => {
  if (scale.value > 1) {
    isDragging.value = true
    dragStartX.value = e.clientX - translateX.value
    dragStartY.value = e.clientY - translateY.value

    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', stopDrag)
  }
}

const onDrag = (e) => {
  if (isDragging.value) {
    translateX.value = e.clientX - dragStartX.value
    translateY.value = e.clientY - dragStartY.value
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 下载图片
const downloadImage = () => {
  if (!currentImage.value) return

  const link = document.createElement('a')
  link.href = currentImage.value
  link.download = `image_${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 键盘快捷键
const handleKeydown = (e) => {
  if (!visible.value) return

  switch (e.key) {
    case 'Escape':
      close()
      break
    case 'ArrowLeft':
      prevImage()
      break
    case 'ArrowRight':
      nextImage()
      break
    case '+':
    case '=':
      zoomIn()
      break
    case '-':
      zoomOut()
      break
    case '0':
      resetZoom()
      break
    case 'd':
    case 'D':
      downloadImage()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.image-viewer {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  flex-direction: column;
}

.viewer-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
}

/* 关闭按钮 */
.viewer-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.viewer-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* 导航按钮 */
.viewer-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.viewer-nav:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.viewer-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.viewer-prev {
  left: 20px;
}

.viewer-next {
  right: 20px;
}

/* 内容区域 */
.viewer-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  z-index: 1;
  flex-direction: column;
}

.image-wrapper {
  transition: transform 0.2s ease;
  cursor: grab;
}

.image-wrapper:active {
  cursor: grabbing;
}

.viewer-image {
  max-width: 90vw;
  max-height: 75vh;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

.imageAttribution {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  color: rgb(0, 0, 0);
  font-size: 13px;
  background: #ffffffc2;
  width: max-content;
  padding: 10px 100px;
  border-radius: 7px;
  font-weight: bold;
}

.viewer-toolbar {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.image-counter {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.tool-btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
}

.tool-btn.primary:hover {
  opacity: 0.9;
}

.zoom-level {
  color: white;
  font-size: 0.9rem;
  min-width: 60px;
  text-align: center;
}

/* 动画 */
.viewer-fade-enter-active,
.viewer-fade-leave-active {
  transition: opacity 0.3s ease;
}

.viewer-fade-enter-from,
.viewer-fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .viewer-toolbar {
    flex-wrap: wrap;
    gap: 0.8rem;
    padding: 0.8rem 1rem;
  }

  .toolbar-center {
    order: -1;
    width: 100%;
    justify-content: center;
  }

  .tool-btn span {
    display: none;
  }

  .viewer-nav {
    width: 40px;
    height: 40px;
  }

  .viewer-prev {
    left: 10px;
  }

  .viewer-next {
    right: 10px;
  }

  .viewer-close {
    top: 10px;
    right: 10px;
    width: 36px;
    height: 36px;
  }
}
</style>
