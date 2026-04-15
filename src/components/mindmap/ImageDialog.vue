<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click.self="close">
      <div class="dialog image-dialog">
        <div class="dialog-header">
          <span>插入图片</span>
          <button class="dialog-close" @click="close">&times;</button>
        </div>

        <div class="image-tabs">
          <div class="image-tab" :class="{ active: tab === 'local' }" @click="tab = 'local'">本地图片</div>
          <div class="image-tab" :class="{ active: tab === 'url' }" @click="tab = 'url'">在线URL</div>
        </div>

        <div class="dialog-body">
          <div v-show="tab === 'local'" class="tab-content">
            <div class="drop-zone" :class="{ 'drag-over': isDragOver, 'has-file': !!localFile }"
              @dragover.prevent="isDragOver = true" @dragleave.prevent="isDragOver = false" @drop.prevent="handleDrop"
              @click="triggerFileInput">
              <template v-if="localPreview">
                <img :src="localPreview" class="drop-preview" />
                <div class="drop-file-name">{{ localFile?.name }}</div>
                <div class="drop-file-size">{{ formatSize(localFile?.size) }}</div>
              </template>
              <template v-else>
                <svg class="drop-icon" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor"
                  stroke-width="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <div class="drop-text">拖拽图片到此处，或点击选择文件</div>
                <div class="drop-hint">支持 JPG、PNG、GIF、WebP 格式</div>
              </template>
            </div>
            <input ref="fileInputRef" type="file" accept="image/*" style="display: none" @change="handleFileSelect" />

            <div class="compress-section" v-if="localFile">
              <div class="compress-title">图片压缩</div>
              <div class="compress-options">
                <label class="radio-item">
                  <input type="radio" v-model="compressMode" value="none" />
                  <span>不压缩</span>
                </label>
                <label class="radio-item">
                  <input type="radio" v-model="compressMode" value="auto" />
                  <span>压缩至 500KB 以下</span>
                </label>
                <label class="radio-item">
                  <input type="radio" v-model="compressMode" value="custom" />
                  <span>自定义</span>
                </label>
              </div>
              <div v-if="compressMode === 'custom'" class="compress-slider-row">
                <span class="slider-label">质量</span>
                <input type="range" class="compress-slider" min="10" max="100" step="5"
                  v-model.number="compressQuality" />
                <span class="slider-value">{{ compressQuality }}%</span>
              </div>
              <div class="compress-estimate" v-if="compressMode !== 'none'">
                原始大小：{{ formatSize(localFile?.size) }}
                <template v-if="estimatedSize">
                  → 预估：<span class="estimate-value">{{ estimatedSize }}</span>
                </template>
              </div>
            </div>

            <div class="dialog-footer">
              <button class="btn btn--ghost" @click="close">取消</button>
              <button class="btn btn--primary" :disabled="!localPreview" @click="confirmLocal">确认</button>
            </div>
          </div>

          <div v-show="tab === 'url'" class="tab-content">
            <div class="url-input-row">
              <input v-model="imageUrl" class="form-input url-input" placeholder="输入图片地址" @keydown.enter="fetchUrl" />
              <button class="btn btn--primary btn--sm" @click="fetchUrl">获取</button>
            </div>
            <div v-if="urlPreview" class="url-preview-area">
              <img :src="urlPreview" class="url-preview-img" />
            </div>
            <div v-else-if="urlLoading" class="url-preview-area url-loading">加载中...</div>
            <div v-else-if="urlError" class="url-preview-area url-error">{{ urlError }}</div>
            <div class="dialog-footer">
              <button class="btn btn--ghost" @click="close">取消</button>
              <button class="btn btn--primary" :disabled="!urlPreview" @click="confirmUrl">确认</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>


<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'confirm'])

const tab = ref('local')
const fileInputRef = ref(null)
const localFile = ref(null)
const localPreview = ref('')
const isDragOver = ref(false)
const compressMode = ref('none')
const compressQuality = ref(80)
const imageUrl = ref('')
const urlPreview = ref('')
const urlLoading = ref(false)
const urlError = ref('')

const estimatedSize = computed(() => {
  if (!localFile.value || compressMode.value === 'none') return ''
  const quality = compressMode.value === 'auto' ? 0.7 : compressQuality.value / 100
  const estimated = Math.round(localFile.value.size * quality * 0.6)
  return formatSize(estimated)
})

watch(() => props.visible, (val) => {
  if (val) reset()
})

function reset() {
  tab.value = 'local'
  localFile.value = null
  localPreview.value = ''
  isDragOver.value = false
  compressMode.value = 'none'
  compressQuality.value = 80
  imageUrl.value = ''
  urlPreview.value = ''
  urlLoading.value = false
  urlError.value = ''
}

function close() {
  emit('update:visible', false)
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) loadFile(file)
  e.target.value = ''
}

function handleDrop(e) {
  isDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) loadFile(file)
}

function loadFile(file) {
  localFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => {
    localPreview.value = ev.target.result
  }
  reader.readAsDataURL(file)
}

function formatSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

async function confirmLocal() {
  if (!localPreview.value) return
  let finalUrl = localPreview.value
  if (compressMode.value !== 'none') {
    finalUrl = await compressImage(localPreview.value)
  }
  emit('confirm', { url: finalUrl, title: localFile.value?.name || '图片' })
  close()
}

function compressImage(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      let width = img.naturalWidth
      let height = img.naturalHeight

      if (compressMode.value === 'auto') {
        const maxPixels = (500 * 1024) / 3
        if (width * height > maxPixels) {
          const ratio = Math.sqrt(maxPixels / (width * height))
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      let quality = compressMode.value === 'auto' ? 0.7 : compressQuality.value / 100
      let result = canvas.toDataURL('image/jpeg', quality)

      if (compressMode.value === 'auto' && calcBase64Size(result) > 500 * 1024) {
        result = canvas.toDataURL('image/jpeg', 0.4)
      }

      resolve(result)
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

function calcBase64Size(dataUrl) {
  const base64 = dataUrl.split(',')[1]
  if (!base64) return 0
  let bytes = base64.length * 3 / 4
  if (base64.endsWith('==')) bytes -= 2
  else if (base64.endsWith('=')) bytes -= 1
  return Math.round(bytes)
}

async function fetchUrl() {
  const url = imageUrl.value.trim()
  if (!url) return
  urlLoading.value = true
  urlError.value = ''
  urlPreview.value = ''
  try {
    const img = new Image()
    img.onload = () => {
      urlPreview.value = url
      urlLoading.value = false
    }
    img.onerror = () => {
      urlError.value = '图片加载失败'
      urlLoading.value = false
    }
    img.src = url
  } catch (e) {
    urlError.value = '加载失败'
    urlLoading.value = false
  }
}

async function confirmUrl() {
  if (!urlPreview.value) return
  emit('confirm', { url: urlPreview.value, title: imageUrl.value })
  close()
}
</script>


<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(6px);
}

.image-dialog {
  width: 480px;
}

.dialog {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 12px 40px rgba(0, 0, 0, 0.1);
  animation: dialogIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

@keyframes dialogIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  color: #333;
  font-size: 15px;
  font-weight: 600;
}

.dialog-close {
  background: none;
  border: none;
  color: #bbb;
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.15s ease;
}

.dialog-close:hover {
  color: #666;
}

.image-tabs {
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0 20px;
}

.image-tab {
  padding: 10px 0;
  margin-right: 24px;
  font-size: 13px;
  color: #999;
  cursor: pointer;
  position: relative;
  transition: color 0.15s ease;
  font-weight: 500;
}

.image-tab:hover {
  color: #666;
}

.image-tab.active {
  color: #333;
  font-weight: 600;
}

.image-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #4a90d9;
  border-radius: 1px;
}

.tab-content {
  padding: 0;
}

.drop-zone {
  margin: 16px 20px;
  border: 2px dashed rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(0, 0, 0, 0.01);
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.drop-zone:hover {
  border-color: rgba(74, 144, 217, 0.3);
  background: rgba(74, 144, 217, 0.02);
}

.drop-zone.drag-over {
  border-color: #4a90d9;
  background: rgba(74, 144, 217, 0.05);
}

.drop-zone.has-file {
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.06);
  padding: 16px;
}

.drop-icon {
  color: #ccc;
}

.drop-text {
  font-size: 13px;
  color: #888;
  font-weight: 500;
}

.drop-hint {
  font-size: 11px;
  color: #bbb;
}

.drop-preview {
  max-width: 100%;
  max-height: 180px;
  border-radius: 8px;
  object-fit: contain;
}

.drop-file-name {
  font-size: 12px;
  color: #555;
  margin-top: 6px;
  font-weight: 500;
}

.drop-file-size {
  font-size: 11px;
  color: #aaa;
}

.compress-section {
  margin: 0 20px;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 10px;
}

.compress-title {
  font-size: 12px;
  color: #888;
  font-weight: 600;
  margin-bottom: 10px;
}

.compress-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
}

.radio-item input[type="radio"] {
  accent-color: #4a90d9;
  width: 15px;
  height: 15px;
}

.compress-slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.slider-label {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

.compress-slider {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.08);
  outline: none;
}

.compress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #4a90d9;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.slider-value {
  font-size: 12px;
  color: #555;
  font-weight: 600;
  min-width: 36px;
  text-align: right;
}

.compress-estimate {
  font-size: 11px;
  color: #aaa;
}

.estimate-value {
  color: #4a90d9;
  font-weight: 600;
}

.url-input-row {
  display: flex;
  gap: 8px;
  padding: 16px 20px 0;
}

.url-input {
  flex: 1;
}

.btn--sm {
  padding: 8px 16px;
  font-size: 13px;
  white-space: nowrap;
}

.url-preview-area {
  margin: 12px 20px 0;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.url-preview-img {
  max-width: 100%;
  max-height: 220px;
  object-fit: contain;
  border-radius: 8px;
}

.url-loading {
  color: #aaa;
  font-size: 13px;
}

.url-error {
  color: #e74c3c;
  font-size: 13px;
  padding: 20px;
  text-align: center;
}

.dialog-body {
  padding: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px 16px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  font-size: 13px;
  color: #333;
  background: rgba(0, 0, 0, 0.02);
  outline: none;
  transition: border-color 0.15s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #4a90d9;
  background: #fff;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 500;
}

.btn--ghost {
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #555;
}

.btn--ghost:hover {
  background: rgba(0, 0, 0, 0.03);
}

.btn--primary {
  background: #4a90d9;
  color: #fff;
  border: 1px solid #4a90d9;
}

.btn--primary:hover {
  background: #3a7bc8;
}

.btn--primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
