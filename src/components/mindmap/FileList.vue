<template>
  <div class="style-panel" ref="panelRef">
    <div class="panel-header">
      <span class="panel-title">文件列表</span>
      <div class="panel-actions">
        <button class="panel-action-btn" @click="$emit('add-files')" title="增量添加文件">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </button>
        <button class="panel-close" @click="$emit('close')">&times;</button>
      </div>
    </div>

    <div class="panel-body customScrollbar">
      <div class="file-list">
        <div
          class="file-item"
          v-for="file in FileList"
          :key="file.id"
          :class="{ active: file.id === activeIndex }"
          @click="$emit('load-file', file)"
          style="cursor: pointer;"
        >
          <div class="file-icon">
            <i class="fa fa-file"></i>
          </div>
          <div class="file-name">{{ file.name }}</div>
          <div class="file-time">{{ file.time }}</div>
          <div class="file-size">{{ file.size }}</div>
          <button class="file-remove" @click.stop="$emit('remove-file', file.id)" title="移除">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div v-if="!FileList || FileList.length === 0" class="file-empty">
          暂无文件，请先点击「加载列表」打开文件
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  FileList: { type: Array, default: () => [] },
  activeIndex: { type: Number, default: -1 },
})

defineEmits(['close', 'load-file', 'remove-file', 'add-files'])
</script>

<style scoped>
.style-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 360px;
  max-height: calc(100vh - 100px);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  z-index: 50;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.25);
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.panel-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: transparent;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.panel-action-btn:hover {
  background: rgba(74, 144, 217, 0.08);
  border-color: rgba(74, 144, 217, 0.25);
  color: #4a90d9;
}

.panel-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #bbb;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.panel-close:hover {
  color: #666;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.customScrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.08) transparent;
}

.customScrollbar::-webkit-scrollbar {
  width: 4px;
}

.customScrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  transition: background 0.15s ease;
  position: relative;
}

.file-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.file-item.active {
  background: rgba(74, 144, 217, 0.08);
}

.file-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(74, 144, 217, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a90d9;
  font-size: 12px;
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  font-size: 13px;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-time {
  font-size: 11px;
  color: #aaa;
  white-space: nowrap;
}

.file-size {
  font-size: 11px;
  color: #aaa;
  white-space: nowrap;
  min-width: 50px;
  text-align: right;
}

.file-remove {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #ccc;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
  opacity: 0;
}

.file-item:hover .file-remove {
  opacity: 1;
}

.file-remove:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.file-empty {
  text-align: center;
  color: #bbb;
  font-size: 13px;
  padding: 40px 20px;
}
</style>
