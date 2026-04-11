<template>
    <div class="toolbar">
        <div class="toolbar-inner">

            <!-- 第一组：编辑操作 -->
            <div class="toolbar-block">
                <div class="divider" />
                <div class="toolbar-btn" :class="{ disabled: !canUndo }" @click="canUndo && $emit('undo')">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <polyline points="1 4 1 10 7 10" />
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                        </svg>
                    </span>
                    <span class="text">回退</span>
                </div>

                <div class="toolbar-btn" :class="{ disabled: !canRedo }" @click="canRedo && $emit('redo')">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
                        </svg>
                    </span>
                    <span class="text">前进</span>
                </div>

                <div class="divider" />

                <div class="toolbar-btn" :class="{ disabled: !hasNode }" @click="hasNode && $emit('insert-sibling')">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <rect x="2" y="4" width="8" height="6" rx="1" />
                            <rect x="14" y="4" width="8" height="6" rx="1" />
                            <line x1="10" y1="7" x2="14" y2="7" />
                        </svg>
                    </span>
                    <span class="text">同级节点</span>
                </div>

                <div class="toolbar-btn" :class="{ disabled: !hasNode }" @click="hasNode && $emit('insert-child')">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <rect x="2" y="2" width="8" height="6" rx="1" />
                            <rect x="2" y="14" width="8" height="6" rx="1" />
                            <line x1="6" y1="8" x2="6" y2="14" />
                        </svg>
                    </span>
                    <span class="text">子节点</span>
                </div>

                <div class="toolbar-btn" :class="{ disabled: !hasNode }" @click="hasNode && $emit('remove')">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                        </svg>
                    </span>
                    <span class="text">删除节点</span>
                </div>

                <div class="divider" />

                <div class="toolbar-btn" :class="{ disabled: !hasNode }" @click="hasNode && $emit('insert-image')">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </span>
                    <span class="text">图片</span>
                </div>

                <div class="toolbar-btn" :class="{ disabled: !hasNode }" @click="hasNode && $emit('insert-hyperlink')">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                    </span>
                    <span class="text">超链接</span>
                </div>
            </div>


            <!-- 第二组：主题/样式/视图 -->
            <div class="toolbar-block">
                <div class="divider" />
                <div class="dropdown" ref="themeDropRef">
                    <div class="toolbar-btn" :class="{ active: showThemeDropdown }"
                        @click="showThemeDropdown = !showThemeDropdown">
                        <span class="icon">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                            </svg>
                        </span>
                        <span class="text">主题</span>
                    </div>
                    <div v-if="showThemeDropdown" class="theme-dropdown">
                        <div class="theme-section">
                            <div class="theme-section-title">亮色主题</div>
                            <div v-for="item in lightThemeList" :key="item.value" class="theme-item"
                                :class="{ active: currentTheme === item.value }" @click="handleThemeSelect(item.value)">
                                <img v-if="getPreview(item.value)" class="theme-thumb" :src="getPreview(item.value)"
                                    :alt="item.name" />
                                <div v-else class="theme-thumb fallback" />
                                <span class="theme-label">{{ item.name }}</span>
                                <svg v-if="currentTheme === item.value" class="theme-check" viewBox="0 0 24 24"
                                    width="14" height="14" fill="none" stroke="currentColor" stroke-width="3">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                        </div>
                        <div class="theme-section">
                            <div class="theme-section-title">暗色主题</div>
                            <div v-for="item in darkThemeList" :key="item.value" class="theme-item"
                                :class="{ active: currentTheme === item.value }" @click="handleThemeSelect(item.value)">
                                <img v-if="getPreview(item.value)" class="theme-thumb" :src="getPreview(item.value)"
                                    :alt="item.name" />
                                <div v-else class="theme-thumb fallback dark" />
                                <span class="theme-label">{{ item.name }}</span>
                                <svg v-if="currentTheme === item.value" class="theme-check" viewBox="0 0 24 24"
                                    width="14" height="14" fill="none" stroke="currentColor" stroke-width="3">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="toolbar-btn" @click="$emit('toggle-outline')">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <line x1="8" y1="6" x2="21" y2="6" />
                            <line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" />
                            <line x1="3" y1="12" x2="3.01" y2="12" />
                            <line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                    </span>
                    <span class="text">大纲</span>
                </div>

                <div class="toolbar-btn" :class="{ active: isAssociativeLineMode }"
                    @click="$emit('toggle-associative-line')">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                    </span>
                    <span class="text">关联线</span>
                </div>
            </div>






        </div>

        <div class="toolbar-inner">
            <!-- 第三组：文件/新建 -->
            <div class="toolbar-block">
                <div class="toolbar-btn" @click="$emit('new-file')">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                    </span>
                    <span class="text">新建</span>
                </div>

                <div class="toolbar-btn" @click="$emit('open')">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                    </span>
                    <span class="text">打开</span>
                </div>

                <div class="toolbar-btn" @click="$emit('save-as')">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                        </svg>
                    </span>
                    <span class="text">另存为</span>
                </div>

                <div class="divider" />

                <div class="toolbar-btn" @click="$emit('import')">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </span>
                    <span class="text">导入</span>
                </div>

                <div class="toolbar-btn" @click="$emit('export')">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </span>
                    <span class="text">导出</span>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    canUndo: { type: Boolean, default: false },
    canRedo: { type: Boolean, default: false },
    hasNode: { type: Boolean, default: false },
    currentTheme: { type: String, default: 'default' },
    lightThemeList: { type: Array, default: () => [] },
    darkThemeList: { type: Array, default: () => [] },
    themePreviewMap: { type: Object, default: () => ({}) },
    isAssociativeLineMode: { type: Boolean, default: false },
})

const emit = defineEmits([
    'new-file', 'open', 'save-as', 'import', 'export',
    'undo', 'redo',
    'insert-sibling', 'insert-child', 'remove',
    'insert-image', 'insert-hyperlink',
    'set-theme', 'toggle-outline',
    'toggle-associative-line',
])

const showThemeDropdown = ref(false)
const themeDropRef = ref(null)

function getPreview(value) {
    return props.themePreviewMap[value] || ''
}

function handleThemeSelect(value) {
    emit('set-theme', value)
    showThemeDropdown.value = false
}

function handleClickOutside(e) {
    if (themeDropRef.value && !themeDropRef.value.contains(e.target)) {
        showThemeDropdown.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.toolbar {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    pointer-events: none;
    display: flex;
    gap: 20px;
    backdrop-filter: blur(20px) saturate(1.8);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    background: rgba(255, 255, 255, 0);
}

.toolbar-inner {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 8px;
    pointer-events: auto;
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(20px) saturate(1.8);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.08);
}

.toolbar-block {
    display: flex;
    align-items: center;
    gap: 2px;
    position: relative;
}

.divider {
    width: 1px;
    height: 24px;
    background: rgba(0, 0, 0, 0.08);
    margin: 0 4px;
    flex-shrink: 0;
}

.toolbar-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
    padding: 6px 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
    min-width: 50px;
}

.toolbar-btn:hover {
    background: rgba(0, 0, 0, 0.05);
}

.toolbar-btn:active {
    transform: scale(0.94);
    background: rgba(0, 0, 0, 0.08);
}

.toolbar-btn.active {
    background: rgba(0, 0, 0, 0.06);
}

.toolbar-btn.disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.toolbar-btn.disabled:hover {
    background: transparent;
}

.toolbar-btn.disabled:active {
    transform: none;
}

.toolbar-btn .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000000;
    transition: color 0.2s ease;
}

.toolbar-btn:hover .icon {
    color: #222;
}

.toolbar-btn.disabled .icon {
    color: #bbb;
}

.toolbar-btn .text {
    font-size: 12px;
    color: #000000;
    white-space: nowrap;
    transition: color 0.2s ease;
    font-weight: 500;
}

.toolbar-btn:hover .text {
    color: #444;
}

.toolbar-btn.disabled .text {
    color: #ccc;
}

.dropdown {
    position: relative;
}

.theme-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    max-height: 520px;
    overflow-y: auto;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(24px) saturate(1.8);
    -webkit-backdrop-filter: blur(24px) saturate(1.8);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06), 0 16px 48px rgba(0, 0, 0, 0.12);
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

.theme-section-title {
    font-size: 10px;
    color: #aaa;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 8px 10px 4px;
}

.theme-item {
    display: flex;
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
    width: 72px;
    height: 44px;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.06);
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
