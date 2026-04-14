<template>
  <div class="mind-map-view">
    <MindMapToolbar :can-undo="canUndo" :can-redo="canRedo" :has-node="hasNode" :current-theme="currentTheme"
      :light-theme-list="lightThemeList" :dark-theme-list="darkThemeList" :theme-preview-map="themePreviewMap"
      :is-associative-line-mode="isAssociativeLineMode" @new-file="handleNewFile" @undo="undo" @redo="redo"
      @insert-sibling="insertSiblingNode" @insert-child="insertChildNode" @remove="removeNode"
      @insert-image="handleInsertImage" @insert-hyperlink="openHyperlinkDialog" @insert-note="openNoteDialog"
      @open="handleOpen" @save-as="saveAsJSON" @import="importFile" @export="showExportDlg = true"
      @set-theme="setTheme" @toggle-outline="handleToggleOutline" @toggle-basestyle="handleToggleBaseStyle"
      @toggle-associative-line="toggleAssociativeLineMode" />

    <div class="main-area">
      <MindMapCore />

      <MindMapOverlay ref="overlayRef" :hyperlinks="hyperlinkPositions" :notes="notePositions"
        @edit-hyperlink="openHyperlinkDialog" @edit-note="openNoteDialog" />

      <OutlinePanel v-if="showOutline" :tree="outlineTree" @close="closePanel" />

      <BaseStylePanel v-if="showBaseStyle" @close="closePanel" @set-theme-config="setThemeConfig"
        :get-theme-config="getThemeConfig" />

      <NodeStylePanel v-if="showNodeStyle" :active-nodes="activeNodes" @set-style="setNodeStyle" />

      <FileList v-if="showFileList" @close="closePanel" :FileList="fileList" :active-index="currentFileIndex"
        @load-file="handleLoadFile" @remove-file="handleRemoveFile" @add-files="handleAddFiles" />

    </div>

    <!-- ★ 四个弹窗组件 ★ -->
    <HyperlinkDialog v-model:visible="showHyperlinkDlg" :default-url="hyperlinkDefaultUrl"
      :default-title="hyperlinkDefaultTitle" @confirm="handleHyperlinkConfirm" @remove="handleHyperlinkRemove" />

    <NoteDialog v-model:visible="showNoteDlg" :default-content="noteDefaultContent" @confirm="handleNoteConfirm"
      @remove="handleNoteRemove" />

    <ImageDialog v-model:visible="showImageDlg" @confirm="handleImageConfirm" />

    <ExportDialog v-model:visible="showExportDlg" @select="exportFile" />

    <ImageViewer v-model="showImageViewer" :images="viewerImages" :viewer-index="viewerIndex" />


  </div>
</template>

<script setup>

import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

import { useMindMap } from '@/composables/useMindMap'
import MindMapToolbar from '@/components/mindmap/MindMapToolbar.vue'
import MindMapCore from '@/components/mindmap/MindMapCore.vue'
import NodeStylePanel from '@/components/mindmap/NodeStylePanel.vue'
import OutlinePanel from '@/components/mindmap/OutlinePanel.vue'
import BaseStylePanel from '@/components/mindmap/BaseStylePanel.vue'
import ImageViewer from '@/components/ImageViewer.vue'
import FileList from '@/components/mindmap/FileList.vue'
import MindMapOverlay from '@/components/mindmap/MindMapOverlay.vue'
import HyperlinkDialog from '@/components/mindmap/HyperlinkDialog.vue'
import NoteDialog from '@/components/mindmap/NoteDialog.vue'
import ImageDialog from '@/components/mindmap/ImageDialog.vue'
import ExportDialog from '@/components/mindmap/ExportDialog.vue'

const {
  canUndo, canRedo, activeNodes, isReadonly, currentTheme,
  lightThemeList, darkThemeList, themePreviewMap,
  undo, redo, insertChildNode, insertSiblingNode, removeNode,
  setNodeStyle, setThemeConfig, getThemeConfig, setTheme,
  insertImageToNode, openLocalFile, importFile, exportFile,
  hasUnsavedChanges, isAssociativeLineMode, newFile,
  toggleAssociativeLineMode, getOutlineTree, imageDblClickData,
  collectAllImages, setData, getData, render, saveToLocalFile
} = useMindMap()

const overlayRef = ref(null)

// ============================================================
// 面板
// ============================================================
const activePanel = ref(null)
const showOutline = computed(() => activePanel.value === 'outline')
const showBaseStyle = computed(() => activePanel.value === 'basestyle')
const showNodeStyle = computed(() => activePanel.value === 'node' && activeNodes.value.length > 0 && !isReadonly.value)
const showFileList = computed(() => activePanel.value === 'filelist')

function closePanel() { activePanel.value = null }
function togglePanel(panelName) { activePanel.value = activePanel.value === panelName ? null : panelName }
function handleToggleOutline() { togglePanel('outline') }
function handleToggleBaseStyle() { togglePanel('basestyle') }

let lastNodeCount = 0
watch(activeNodes, (nodes) => {
  const currentCount = nodes.length
  if (currentCount > 0 && lastNodeCount === 0) activePanel.value = 'node'
  else if (currentCount === 0 && lastNodeCount > 0 && activePanel.value === 'node') activePanel.value = null
  lastNodeCount = currentCount
})

// ============================================================
// 文件列表
// ============================================================
const fileList = ref([])
const currentFileIndex = ref(-1)

async function handleOpen() {
  const files = await openLocalFile()
  if (!files || files.length === 0) return
  fileList.value = files
  currentFileIndex.value = -1
  activePanel.value = 'filelist'
}

function handleLoadFile(file) {
  if (file._raw?.data) {
    setData(file._raw.data)
    currentFileIndex.value = file.id
  }
}

async function handleAddFiles() {
  const newFiles = await openLocalFile()
  if (!newFiles || newFiles.length === 0) return

  const existingNames = new Set(fileList.value.map(f => f.name))
  const duplicates = newFiles.filter(f => existingNames.has(f.name))

  if (duplicates.length > 0) {
    const names = duplicates.map(f => f.name).join('、')
    const confirmed = confirm(`以下文件已存在：\n${names}\n\n是否覆盖？\n\n点"确定"覆盖，点"取消"跳过重复文件。`)
    if (!confirmed) {
      const nonDuplicates = newFiles.filter(f => !existingNames.has(f.name))
      if (nonDuplicates.length === 0) return
      appendFiles(nonDuplicates)
      return
    }
    const newNames = new Set(newFiles.map(f => f.name))
    fileList.value = fileList.value.filter(f => !newNames.has(f.name))
  }

  appendFiles(newFiles)
}

function appendFiles(files) {
  const maxId = fileList.value.reduce((max, f) => Math.max(max, f.id), -1)
  const offset = maxId + 1
  const formatted = files.map((f, i) => ({
    id: offset + i,
    name: f.name,
    time: f.time,
    size: f.size,
    _raw: f._raw,
  }))
  fileList.value = [...fileList.value, ...formatted]
}

function handleRemoveFile(id) {
  fileList.value = fileList.value.filter(f => f.id !== id)
  if (currentFileIndex.value === id) currentFileIndex.value = -1
}

// ============================================================
// ★★★ Ctrl+S 自动保存 ★★★
// ============================================================

// 获取当前文件的 fileHandle
function getCurrentFileHandle() {
  if (currentFileIndex.value < 0) return null
  const file = fileList.value.find(f => f.id === currentFileIndex.value)
  return file?._raw?.fileHandle || null
}

// 保存当前画布
async function handleSave() {
  const fileHandle = getCurrentFileHandle()

  if (!fileHandle) {
    // 没有 fileHandle（传统模式或未选择文件），降级为导出 JSON
    const data = getData()
    if (!data) return
    const pureData = { data: data.data, children: data.children || [] }
    const json = JSON.stringify(pureData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const date = new Date()
    a.download = date.toLocaleString()+'.json'
    a.click()
    URL.revokeObjectURL(url)
    return
  }

  const success = await saveToLocalFile(fileHandle)
  if (success) {
    console.log('保存成功')
  }
}

// 键盘事件监听
function handleKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    handleSave()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})


// ============================================================
// Overlay 坐标
// ============================================================
const hyperlinkPositions = computed(() => {
  const items = []
  for (const node of activeNodes.value) {
    const data = node.nodeData?.data || {}
    if (!data.hyperlink) continue
    const left = node.left || 0
    const top = node.top || 0
    const w = node.width || 100
    const h = node.height || 40
    items.push({
      id: 'hl_' + (node.uid || ''),
      nodeId: node.uid || '',
      url: data.hyperlink,
      title: data.hyperlinkTitle || '',
      style: { left: (left + w - 18) + 'px', top: (top + h - 18) + 'px' }
    })
  }
  return items
})

const notePositions = computed(() => {
  const items = []
  for (const node of activeNodes.value) {
    const data = node.nodeData?.data || {}
    if (!data.note) continue
    const left = node.left || 0
    const top = node.top || 0
    const w = node.width || 100
    const h = node.height || 40
    items.push({
      id: 'note_' + (node.uid || ''),
      nodeId: node.uid || '',
      preview: String(data.note).slice(0, 30),
      style: { left: (left + w - 18) + 'px', top: (top + h - 18) + 'px' }
    })
  }
  return items
})

// ============================================================
// 超链接
// ============================================================
const showHyperlinkDlg = ref(false)
const hyperlinkDefaultUrl = ref('')
const hyperlinkDefaultTitle = ref('')

function openHyperlinkDialog() {
  if (!activeNodes.value.length) { alert('请先选中一个节点'); return }
  const node = activeNodes.value[0]
  hyperlinkDefaultUrl.value = node.getData?.('hyperlink') || ''
  hyperlinkDefaultTitle.value = node.getData?.('hyperlinkTitle') || ''
  showHyperlinkDlg.value = true
}

function handleHyperlinkConfirm({ url, title }) {
  activeNodes.value.forEach(node => {
    if (typeof node.setHyperlink === 'function') node.setHyperlink(url, title)
  })
  nextTick(() => overlayRef.value?.refresh())
}

function handleHyperlinkRemove() {
  activeNodes.value.forEach(node => {
    if (typeof node.setHyperlink === 'function') node.setHyperlink('', '')
  })
  nextTick(() => overlayRef.value?.refresh())
}

// ============================================================
// 备注
// ============================================================
const showNoteDlg = ref(false)
const noteDefaultContent = ref('')

function openNoteDialog() {
  if (!activeNodes.value.length) { alert('请先选中一个节点'); return }
  const node = activeNodes.value[0]
  noteDefaultContent.value = node.getData?.('note') || ''
  showNoteDlg.value = true
}

function handleNoteConfirm({ content }) {
  activeNodes.value.forEach(node => {
    if (typeof node.setNote === 'function') node.setNote(content)
  })
  nextTick(() => overlayRef.value?.refresh())
}

function handleNoteRemove() {
  activeNodes.value.forEach(node => {
    if (typeof node.setNote === 'function') node.setNote('')
  })
  nextTick(() => overlayRef.value?.refresh())
}

// ============================================================
// 图片
// ============================================================
const showImageDlg = ref(false)

function handleImageConfirm({ url, title }) {
  insertImageToNode(url, title)
}

// ★ 图片：新增 ★
function handleInsertImage() {
  if (!activeNodes.value.length) { alert('请先选中一个节点'); return }
  showImageDlg.value = true
}

// ============================================================
// 导出
// ============================================================
const showExportDlg = ref(false)

// ============================================================
// 图片查看器
// ============================================================
const showImageViewer = ref(false)
const viewerImages = ref([])
const viewerIndex = ref(0)

watch(imageDblClickData, (data) => {
  if (!data || !data.imgSrc) return
  const allImages = collectAllImages()
  if (!allImages.length) return
  viewerImages.value = allImages
  viewerIndex.value = allImages.findIndex(obj => obj.imgSrc === data.imgSrc)
  showImageViewer.value = true
})

// ============================================================
// 大纲、关联线、新建、导出
// ============================================================
const hasNode = computed(() => activeNodes.value.length > 0)
const outlineTree = computed(() => showOutline.value ? getOutlineTree() : null)

const lineTextRef = ref(null)
onMounted(() => {
  const timer = setInterval(() => {
    const { mindMap } = useMindMap()
    if (mindMap && mindMap.value) {
      clearInterval(timer)
      try { mindMap.value.on('line_text_edit', (data) => lineTextRef.value?.show(data)) } catch (e) { }
    }
  }, 200)
  setTimeout(() => clearInterval(timer), 5000)
})

function handleNewFile() {
  if (hasUnsavedChanges.value) {
    if (confirm('当前画布有未保存的修改，是否先保存？')) saveAsJSON()
  }
  newFile()
}

</script>


<style scoped>
.mind-map-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #f0f2f5;
}

.main-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* ========== 图片弹窗 ========== */
.image-dialog {
  width: 480px;
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

/* ========== 弹窗通用 ========== */
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

.dialog {
  width: 400px;
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

.dialog-body {
  padding: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px 16px;
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

.downloadTypeSelectBox {
  width: 100%;
}

.downloadTypeList {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customScrollbar {
  max-height: 320px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
}

.customScrollbar::-webkit-scrollbar {
  width: 4px;
}

.customScrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
}

.downloadTypeItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.downloadTypeItem:hover {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.04);
}

.downloadTypeItem:active {
  transform: scale(0.98);
}

.typeIcon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}

.typeIcon.png {
  background: linear-gradient(135deg, #5dade2, #2e86c1);
}

.typeIcon.md {
  background: linear-gradient(135deg, #58d68d, #28b463);
}

.typeIcon.txt {
  background: linear-gradient(135deg, #aab7b8, #839192);
}

.typeIcon.json {
  background: linear-gradient(135deg, #f4d03f, #d4ac0d);
}

.typeIcon.png::after {
  content: 'PNG';
}

.typeIcon.jpg::after {
  content: 'JPG';
}

.typeIcon.pdf::after {
  content: 'PDF';
}

.typeIcon.md::after {
  content: 'MD';
}

.typeIcon.txt::after {
  content: 'TXT';
}

.typeIcon.json::after {
  content: 'JSON';
}

.downloadTypeItem .name {
  flex: 1;
  font-size: 13px;
  color: #555;
  font-weight: 500;
}

.downloadTypeItem:hover .name {
  color: #333;
}

.checked-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a90d9;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.15s ease;
}

.downloadTypeItem:hover .checked-icon {
  opacity: 1;
  transform: scale(1);
}

form-input {
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

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  font-size: 13px;
  color: #333;
  background: rgba(0, 0, 0, 0.02);
  outline: none;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  transition: border-color 0.15s ease;
  box-sizing: border-box;
}

.form-textarea:focus {
  border-color: #4a90d9;
  background: #fff;
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

.btn--danger {
  background: transparent;
  border: 1px solid #e74c3c;
  color: #e74c3c;
}

.btn--danger:hover {
  background: rgba(231, 76, 60, 0.05);
}

/* ★ 图片弹窗多选预览网格 ★ */
.image-preview-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 16px 20px 0;
}

.image-preview-item {
  position: relative;
  width: 120px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #f9f9f9;
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.image-preview-remove:hover {
  background: rgba(231, 76, 60, 0.8);
}

.image-count-hint {
  font-size: 11px;
  color: #aaa;
  margin: 8px 20px 0;
}
</style>