<template>
    <div class="style-panel" ref="panelRef">
        <div class="panel-header">
            <span class="panel-title">🎨 主题设置</span>
        </div>

        <div class="panel-body customScrollbar">

            <div class="theme-section-title-group">
                <div class="theme-section-title" v-for="theme in themeConfig"
                    :class="{ active: currentTheme === theme.value }" @click="changeTheme(theme.value)">{{
                        theme.label }}</div>
            </div>


            <div class="theme-section" v-show="currentTheme == 'light'">
                <div v-for="item in lightThemeList" :key="item.value" class="theme-item" :data-value="item.value"
                    :class="{ active: props.currentTheme === item.value }" @click="handleThemeSelect(item.value)">
                    <img v-if="getPreview(item.value)" class="theme-thumb" :src="getPreview(item.value)"
                        :alt="item.name" />
                    <div v-else class="theme-thumb fallback" />
                    <span class="theme-label">{{ item.name }}</span>
                    <svg v-if="currentTheme === item.value" class="theme-check" viewBox="0 0 24 24" width="14"
                        height="14" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
            </div>
            <div class="theme-section" v-show="currentTheme == 'dark'">
                <div v-for="item in darkThemeList" :key="item.value" class="theme-item"
                    :class="{ active: props.currentTheme === item.value }" @click="handleThemeSelect(item.value)">
                    <img v-if="getPreview(item.value)" class="theme-thumb" :src="getPreview(item.value)"
                        :alt="item.name" />
                    <div v-else class="theme-thumb fallback dark" />
                    <span class="theme-label">{{ item.name }}</span>
                    <svg v-if="currentTheme === item.value" class="theme-check" viewBox="0 0 24 24" width="14"
                        height="14" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
            </div>


        </div>

    </div>


</template>

<script setup>

import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    currentTheme: { type: String, default: 'default' },
    lightThemeList: { type: Array, default: () => [] },
    darkThemeList: { type: Array, default: () => [] },
    themePreviewMap: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['close','set-theme', 'toggle-theme'])

const currentTheme = ref(props.currentTheme?.startsWith('dark') ? 'dark' : 'light')
const themeConfig = [
    { label: '浅色', value: 'light' },
    { label: '深色', value: 'dark' }
]

function changeTheme(value) { currentTheme.value = value }
function getPreview(value) { return props.themePreviewMap[value] || '' }
function handleThemeSelect(value) {
    emit('set-theme', value)
}


const panelRef = ref(null)

function handleOutsideClick(e) {
    if (panelRef.value && !panelRef.value.contains(e.target)) {
        emit('close')
    }
}

watch(
    () => props.currentTheme,
    (value) => {
        currentTheme.value = value?.startsWith('dark') ? 'dark' : 'light'
    }
)
onMounted(() => {
    setTimeout(() => {
        document.addEventListener('mousedown', handleOutsideClick)
    }, 100)
})

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleOutsideClick)
})

</script>
<style scoped>
/* 样式面板 */
.style-panel {
    position: absolute;
    top: 0px;
    right: 0px;
    width: 300px;
    background: rgb(255, 255, 255);
    backdrop-filter: blur(20px) saturate(1.8);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.25);
    box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.04),
        0 8px 24px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    z-index: 100;
    animation: slideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(12px) scale(0.97);
    }

    to {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.panel-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    letter-spacing: 0.02em;
}

.panel-badge {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 20px;
    background: rgba(0, 0, 0, 0.05);
    color: #888;
    font-weight: 500;
}

.panel-body {
    padding: 14px 16px 10px 16px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    max-height: calc(100vh - 150px);
    overflow-x: hidden;
    overflow-y: auto;
}


.theme-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    width: 280px;
    max-height: 520px;
    overflow-y: auto;
    background: rgba(255, 255, 255);
    backdrop-filter: blur(24px) saturate(1.8);
    -webkit-backdrop-filter: blur(24px) saturate(1.8);
    border: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25), 0 16px 48px rgba(0, 0, 0, 0.12);
    padding: 10px;
    z-index: 200;
    animation: themeDropIn 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.08) transparent;
}

.theme-dropdown::-webkit-scrollbar {
    width: 4px;
}

.theme-dropdown::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.08);
    border-radius: 2px;
}

@keyframes themeDropIn {
    from {
        opacity: 0;
        transform: translateX(-50%) translateY(-8px) scale(0.96);
    }

    to {
        opacity: 1;
        transform: translateX(-50%) translateY(0) scale(1);
    }
}

.theme-section {
    margin-bottom: 6px;
}

.theme-section:last-child {
    margin-bottom: 0;
}

.theme-section-title-group {
    display: flex;
    justify-content: space-around;
}

.theme-section-title {
    font-size: 12px;
    color: #000000;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
}

.theme-section-title.active {
    color: #005bea;
    font-size: 13px;
    border-bottom: 2px solid #005bea;
}

.theme-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
}

.theme-item:hover {
    background: rgba(0, 0, 0, 0.04);
}

.theme-item.active {
    background: rgba(74, 144, 217, 0.08);
}

.theme-label {
    flex: 1;
    font-size: 13px;
    color: #555;
    font-weight: 500;
}

.theme-item.active .theme-label {
    color: #333;
    font-weight: 600;
}

.theme-check {
    color: #4a90d9;
    flex-shrink: 0;
}

.theme-thumb {
    width: 230px;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.25);
    object-fit: cover;
    flex-shrink: 0;
    transition: box-shadow 0.15s ease;
}

.theme-item:hover .theme-thumb {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-item.active .theme-thumb {
    box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.3);
}

.theme-thumb.fallback {
    background: #f5f5f5;
}

.theme-thumb.fallback.dark {
    background: #1e1e30;
    border-color: rgba(255, 255, 255, 0.08);
}
</style>