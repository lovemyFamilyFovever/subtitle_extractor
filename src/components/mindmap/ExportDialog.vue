<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click.self="close">
      <div class="export-dialog">
        <div class="dialog-header">
          <span>导出</span>
          <button class="dialog-close" @click="close">&times;</button>
        </div>
        <div class="dialog-body">
          <div class="downloadTypeList customScrollbar">
            <div v-for="item in options" :key="item.type" class="downloadTypeItem" @click="select(item.type)">
              <div class="typeIcon" :class="item.type"></div>
              <div class="name">{{ item.name }}</div>
              <div class="checked-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  options: {
    type: Array,
    default: () => [
      { type: 'png', name: '图片' },
      { type: 'jpg', name: 'JPG' },
      { type: 'md', name: 'Markdown' },
      { type: 'txt', name: 'TXT' },
      { type: 'json', name: 'JSON' },
    ]
  }
})

const emit = defineEmits(['update:visible', 'select'])

function close() {
  emit('update:visible', false)
}

function select(type) {
  emit('select', type)
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

.export-dialog {
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
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
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

.typeIcon.jpg {
  background: linear-gradient(135deg, #f5b041, #e67e22);
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
</style>
