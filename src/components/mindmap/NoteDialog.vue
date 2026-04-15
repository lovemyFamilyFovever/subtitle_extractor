<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click.self="close">
      <div class="dialog">
        <div class="dialog-header">
          <span>{{ isEdit ? '编辑备注' : '插入备注' }}</span>
          <button class="dialog-close" @click="close">&times;</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>备注内容</label>
            <textarea v-model="content" class="form-textarea" rows="6" placeholder="输入备注文字..."></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button v-if="isEdit" class="btn btn--danger" @click="remove">移除</button>
          <div style="flex:1"></div>
          <button class="btn btn--ghost" @click="close">取消</button>
          <button class="btn btn--primary" @click="confirm">确认</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  defaultContent: { type: String, default: '' },
})

const emit = defineEmits(['update:visible', 'confirm', 'remove'])

const content = ref('')
const isEdit = ref(false)

watch(() => props.visible, (val) => {
  if (val) {
    content.value = props.defaultContent
    isEdit.value = !!props.defaultContent
  }
})

function close() {
  emit('update:visible', false)
}

function confirm() {
  const c = content.value.trim()
  if (!c) { alert('请输入备注内容'); return }
  emit('confirm', { content: c })
  close()
}

function remove() {
  emit('remove')
  close()
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(6px);
}

.dialog {
  width: 420px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid rgba(0, 0, 0, 0.25);
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

.dialog-close:hover { color: #666; }

.dialog-body { padding: 20px; }

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
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

.btn--ghost {
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #555;
}

.btn--ghost:hover { background: rgba(0, 0, 0, 0.03); }

.btn--primary {
  background: #4a90d9;
  color: #fff;
  border: 1px solid #4a90d9;
}

.btn--primary:hover { background: #3a7bc8; }

.btn--danger {
  background: transparent;
  border: 1px solid #e74c3c;
  color: #e74c3c;
}

.btn--danger:hover { background: rgba(231, 76, 60, 0.05); }
</style>
