<template>
  <AppModal v-model="visible" title="插入图片" icon="fa-solid fa-image" size="medium">
    <div class="image-compressor">
      <!-- 图片来源选择 -->
      <div class="source-tabs">
        <button
          class="tab-btn"
          :class="{ active: sourceType === 'local' }"
          @click="sourceType = 'local'"
        >
          <i class="fa-solid fa-upload"></i>
          本地上传
        </button>
        <button
          class="tab-btn"
          :class="{ active: sourceType === 'url' }"
          @click="sourceType = 'url'"
        >
          <i class="fa-solid fa-link"></i>
          URL 链接
        </button>
      </div>

      <!-- 本地上传 -->
      <div v-if="sourceType === 'local'" class="upload-area">
        <div
          class="drop-zone"
          :class="{ 'has-file': previewUrl, 'drag-over': isDragOver }"
          @click="fileInput.click()"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="onDrop"
        >
          <img v-if="previewUrl" :src="previewUrl" class="preview-img" alt="预览" />
          <div v-else class="upload-placeholder">
            <i class="fa-solid fa-cloud-arrow-up"></i>
            <p>点击或拖拽图片到此处</p>
            <span class="hint">支持 JPG、PNG、WebP 格式</span>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden-input"
            @change="onFileChange"
          />
        </div>

        <!-- 文件信息 -->
        <div v-if="selectedFile" class="file-info">
          <span class="file-name">{{ selectedFile.name }}</span>
          <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
        </div>
      </div>

      <!-- URL 输入 -->
      <div v-else class="url-input-area">
        <div class="input-group">
          <input
            v-model="imageUrl"
            type="text"
            placeholder="请输入图片 URL（http:// 或 https://）"
            class="url-input"
            @keyup.enter="loadImageUrl"
          />
          <button class="btn btn-primary" :disabled="!imageUrl || isLoading" @click="loadImageUrl">
            <i v-if="isLoading" class="fa-solid fa-spinner fa-spin"></i>
            <i v-else class="fa-solid fa-download"></i>
            {{ isLoading ? '加载中...' : '加载' }}
          </button>
        </div>

        <!-- URL 预览 -->
        <div v-if="previewUrl" class="url-preview">
          <img :src="previewUrl" class="preview-img" alt="预览" />
        </div>
      </div>

      <!-- 压缩选项 -->
      <div v-if="previewUrl" class="compression-options">
        <h4 class="section-title">
          <i class="fa-solid fa-sliders"></i>
          压缩设置
        </h4>

        <div class="compression-modes">
          <label class="mode-option">
            <input
              v-model="compressionMode"
              type="radio"
              value="original"
              name="compression"
            />
            <div class="mode-content">
              <span class="mode-label">保持原图</span>
              <span class="mode-desc">不压缩，直接使用原始图片</span>
            </div>
          </label>

          <label class="mode-option">
            <input
              v-model="compressionMode"
              type="radio"
              value="auto"
              name="compression"
            />
            <div class="mode-content">
              <span class="mode-label">自动压缩</span>
              <span class="mode-desc">压缩到 500KB 以内（推荐）</span>
            </div>
          </label>

          <label class="mode-option">
            <input
              v-model="compressionMode"
              type="radio"
              value="custom"
              name="compression"
            />
            <div class="mode-content">
              <span class="mode-label">自定义质量</span>
              <div class="custom-controls">
                <input
                  v-model.number="customQuality"
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  class="quality-slider"
                />
                <span class="quality-value">{{ customQuality }}%</span>
              </div>
            </div>
          </label>
        </div>

        <!-- 压缩结果预览 -->
        <div v-if="compressedSize" class="size-comparison">
          <div class="size-item">
            <span class="size-label">原始大小：</span>
            <span class="size-value">{{ originalSize }}</span>
          </div>
          <div class="size-item">
            <span class="size-label">压缩后：</span>
            <span class="size-value highlight">{{ compressedSize }}</span>
          </div>
          <div class="size-item" v-if="savedPercent">
            <span class="size-label">节省：</span>
            <span class="size-value success">{{ savedPercent }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="modal-actions">
        <button class="btn" @click="handleCancel">取消</button>
        <button
          class="btn btn-primary"
          :disabled="!previewUrl || isProcessing"
          @click="handleConfirm"
        >
          <i v-if="isProcessing" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-check"></i>
          {{ isProcessing ? '处理中...' : '确认插入' }}
        </button>
      </div>
    </div>
  </AppModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import AppModal from './AppModal.vue'
import {
  fileToBase64,
  compressImage,
  compressToTargetSize,
  imageUrlToBase64,
  getBase64Size
} from '../utils/imageUtils.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 状态管理
const sourceType = ref('local') // 'local' | 'url'
const selectedFile = ref(null)
const previewUrl = ref(null)
const imageUrl = ref('')
const compressionMode = ref('auto') // 'original' | 'auto' | 'custom'
const customQuality = ref(80)
const isDragOver = ref(false)
const isLoading = ref(false)
const isProcessing = ref(false)
const fileInput = ref(null)

// 计算属性
const originalSize = computed(() => {
  if (!selectedFile.value) return '-'
  return formatFileSize(selectedFile.value.size)
})

const compressedSize = ref(null)
const savedPercent = computed(() => {
  if (!selectedFile.value || !compressedSize.value) return null

  const original = parseFloat(originalSize.value)
  const compressed = parseFloat(compressedSize.value)
  const percent = ((original - compressed) / original * 100).toFixed(1)

  return percent > 0 ? `${percent}%` : null
})

// 监听器
watch(visible, (newVal) => {
  if (!newVal) {
    resetState()
  }
})

watch([compressionMode, customQuality, previewUrl], async () => {
  if (previewUrl.value && selectedFile.value) {
    await processCompression()
  }
})

// 文件处理
const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) handleFileSelect(file)
  e.target.value = ''
}

const onDrop = (e) => {
  isDragOver.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    handleFileSelect(file)
  }
}

const handleFileSelect = async (file) => {
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

// URL 加载
const loadImageUrl = async () => {
  if (!imageUrl.value.trim()) return

  isLoading.value = true
  try {
    const url = imageUrl.value.trim()
    
    // 先设置预览（即使 fetch 失败也能看到URL）
    previewUrl.value = url

    // 尝试 fetch 图片（可能因 CORS 失败）
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      
      // 验证是否为图片
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL 返回的不是图片文件')
      }
      
      selectedFile.value = new File([blob], 'image.jpg', { type: blob.type })
      console.log('URL 图片加载成功:', blob.type, formatFileSize(blob.size))
    } catch (fetchError) {
      console.warn('Fetch 失败（可能是 CORS 限制）:', fetchError.message)
      // 即使 fetch 失败，也创建一个虚拟 File 对象
      // 后续会使用 imageUrlToBase64 处理
      selectedFile.value = null
      showToast('注意：由于浏览器安全限制，将直接使用URL加载图片', 'warning')
    }
  } catch (error) {
    console.error('URL 加载错误:', error)
    showToast('无法加载图片：' + error.message, 'error')
    previewUrl.value = null
  } finally {
    isLoading.value = false
  }
}

// 压缩处理
const processCompression = async () => {
  if (!selectedFile.value) return

  isProcessing.value = true
  try {
    let base64

    switch (compressionMode.value) {
      case 'original':
        base64 = await fileToBase64(selectedFile.value)
        break
      case 'auto':
        base64 = await compressToTargetSize(selectedFile.value, 500)
        break
      case 'custom':
        base64 = await compressImage(selectedFile.value, {
          quality: customQuality.value / 100,
          maxWidth: 1920,
          maxHeight: 1080
        })
        break
    }

    compressedSize.value = getBase64Size(base64).kb + ' KB'
  } catch (error) {
    console.error('压缩失败:', error)
    alert('图片处理失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

// 确认插入
const handleConfirm = async () => {
  if (!previewUrl.value) return

  isProcessing.value = true
  try {
    let base64

    // 根据压缩模式生成 Base64
    switch (compressionMode.value) {
      case 'original':
        if (sourceType.value === 'url') {
          base64 = await imageUrlToBase64(imageUrl.value, { quality: 1 })
        } else {
          base64 = await fileToBase64(selectedFile.value)
        }
        break
      case 'auto':
        if (sourceType.value === 'url') {
          base64 = await imageUrlToBase64(imageUrl.value, {})
        } else {
          base64 = await compressToTargetSize(selectedFile.value, 500)
        }
        break
      case 'custom':
        if (sourceType.value === 'url') {
          base64 = await imageUrlToBase64(imageUrl.value, {
            quality: customQuality.value / 100
          })
        } else {
          base64 = await compressImage(selectedFile.value, {
            quality: customQuality.value / 100,
            maxWidth: 1920,
            maxHeight: 1080
          })
        }
        break
    }

    // 触发确认事件
    emit('confirm', {
      base64,
      size: getBase64Size(base64),
      mode: compressionMode.value
    })

    // 关闭对话框
    visible.value = false
  } catch (error) {
    console.error('处理失败:', error)
    alert('图片处理失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

// 取消
const handleCancel = () => {
  visible.value = false
}

// 重置状态
const resetState = () => {
  sourceType.value = 'local'
  selectedFile.value = null
  previewUrl.value = null
  imageUrl.value = ''
  compressionMode.value = 'auto'
  customQuality.value = 80
  compressedSize.value = null
  isDragOver.value = false
}

// 工具函数
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(2) + ' MB'
}
</script>

<style scoped>
.image-compressor {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 来源标签 */
.source-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid var(--border);
}

.tab-btn {
  padding: 0.6rem 1.2rem;
  background: transparent;
  border: none;
  color: var(--muted);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.tab-btn:hover {
  color: var(--fg);
}

.tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.tab-btn i {
  margin-right: 0.4rem;
}

/* 上传区域 */
.upload-area {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.drop-zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: var(--accent);
  background: var(--accent-dim);
}

.drop-zone.has-file {
  padding: 0;
  border-style: solid;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-placeholder i {
  font-size: 3rem;
  color: var(--accent);
  opacity: 0.6;
}

.upload-placeholder p {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
}

.upload-placeholder .hint {
  font-size: 0.75rem;
  color: var(--muted);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-height: 300px;
}

.hidden-input {
  display: none;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.8rem;
  background: var(--card);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
}

.file-name {
  color: var(--fg);
  font-weight: 500;
}

.file-size {
  color: var(--muted);
}

/* URL 输入区域 */
.url-input-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.url-input {
  flex: 1;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--fg);
  font-size: 0.9rem;
  font-family: inherit;
}

.url-input:focus {
  outline: none;
  border-color: var(--accent);
}

.url-preview {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  max-height: 300px;
}

/* 压缩选项 */
.compression-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
}

.section-title i {
  color: var(--accent);
}

.compression-modes {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.mode-option {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.8rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.mode-option:hover {
  border-color: var(--accent);
  background: var(--accent-dim);
}

.mode-option input[type="radio"] {
  margin-top: 0.2rem;
  accent-color: var(--accent);
}

.mode-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.mode-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--fg);
}

.mode-desc {
  font-size: 0.75rem;
  color: var(--muted);
}

.custom-controls {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: 0.3rem;
}

.quality-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--border);
  border-radius: 2px;
  outline: none;
}

.quality-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
}

.quality-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.quality-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent);
  min-width: 45px;
  text-align: right;
}

/* 大小对比 */
.size-comparison {
  display: flex;
  gap: 1rem;
  padding: 0.8rem;
  background: var(--card);
  border-radius: var(--radius-sm);
  flex-wrap: wrap;
}

.size-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
}

.size-label {
  color: var(--muted);
}

.size-value {
  font-weight: 600;
  color: var(--fg);
}

.size-value.highlight {
  color: var(--accent);
}

.size-value.success {
  color: #10b981;
}

/* 操作按钮 */
.modal-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}
</style>
