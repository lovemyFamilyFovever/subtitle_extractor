<template>
    <Teleport to="body">
        <div v-if="visible" class="dialog-overlay" @click.self="close">
            <div class="dialog">
                <div class="dialog-header">
                    <span>{{ isEdit ? '编辑超链接' : '插入超链接' }}</span>
                    <button class="dialog-close" @click="close">&times;</button>
                </div>
                <div class="dialog-body">
                    <div class="form-group">
                        <label>链接地址</label>
                        <input v-model="url" class="form-input" placeholder="https://example.com"
                            @keydown.enter="confirm" />
                    </div>
                    <div class="form-group">
                        <label>显示名称</label>
                        <input v-model="title" class="form-input" placeholder="链接名称（可选）" @keydown.enter="confirm" />
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
    defaultUrl: { type: String, default: '' },
    defaultTitle: { type: String, default: '' },
})

const emit = defineEmits(['update:visible', 'confirm', 'remove'])

const url = ref('')
const title = ref('')
const isEdit = ref(false)

watch(() => props.visible, (val) => {
    if (val) {
        url.value = props.defaultUrl
        title.value = props.defaultTitle
        isEdit.value = !!props.defaultUrl
    }
})

function close() {
    emit('update:visible', false)
}

function confirm() {
    const u = url.value.trim()
    if (!u) { alert('请输入链接地址'); return }
    emit('confirm', { url: u, title: title.value.trim() || '链接' })
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
    border: 1px solid rgba(0, 0, 0,0.06);
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

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;
}

.form-group:last-child {
    margin-bottom: 0;
}

.form-group label {
    font-size: 12px;
    color: #999;
    font-weight: 500;
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

.btn--danger {
    background: transparent;
    border: 1px solid #e74c3c;
    color: #e74c3c;
}

.btn--danger:hover {
    background: rgba(231, 76, 60, 0.05);
}
</style>
