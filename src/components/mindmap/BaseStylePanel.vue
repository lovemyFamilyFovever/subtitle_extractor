<template>
    <div class="style-panel" ref="panelRef">
        <div class="panel-header">
            <span class="panel-title">🎨 基础样式</span>
        </div>

        <div class="panel-body customScrollbar">

            <div class="style-section">
                <label class="section-label-title">背景</label>

                <div class="preset-bg-types">
                    <div class="preset-select-bg" v-for="(bgType, index) in presetBG"
                        :class="{ active: currentBackgroundIndex == index }"
                        @click="handleChangeBackgroundTypeClick(index)">
                        <span v-html="bgType.svg"></span>
                        <span>{{ bgType.label }}</span>
                    </div>
                </div>

                <!-- 纯色 -->
                <div class="pure-color-section" v-if="currentBackgroundIndex === 1">
                    <ColorInput v-model="currentBackgroundColor" />
                </div>

                <!-- 渐变 -->
                <div class="section-group-row presetGradientBtns" v-if="currentBackgroundIndex === 2">
                    <button class="preset-btn" v-for="gradient in gradientArrays" :key="gradient"
                        :style="{ backgroundImage: gradient }" @click="handleGradientClick(gradient)"></button>
                </div>

                <!-- 图片 -->
                <div class="section-group-column" v-if="currentBackgroundIndex === 4">
                    <div class="upload-zone" :class="{ 'drag-over': isDragOver, 'has-images': sourceImage }"
                        @click="fileInput.click()" @dragover.prevent="isDragOver = true"
                        @dragleave.prevent="isDragOver = false" @drop.prevent="onDrop">
                        <i class="fa-solid fa-cloud-arrow-up upload-icon"></i>
                        <p class="upload-text">点击或拖拽图片到此处</p>
                        <p class="upload-hint">支持 JPG / PNG / WebP · 可粘贴</p>
                        <input ref="fileInput" type="file" accept="image/*" style="display:none"
                            @change="onFileChange" />
                    </div>

                    <div v-if="sourceImage" class="source-preview-wrap">
                        <span class="form-label">已上传图片</span>
                        <div class="source-preview">
                            <img :src="sourceImage.url" :alt="sourceImage.name" class="source-thumb" />
                        </div>
                    </div>

                    <div v-if="sourceImage" class="nav-bar">
                        <button class="btn btn-primary" @click="applySource" :disabled="!sourceImage">
                            <i class="fa fa-check-circle" />应用
                        </button>
                        <button class="btn btn-danger" @click="clearSource" :disabled="!sourceImage">
                            <i class="fa-solid fa-trash" /> 删除
                        </button>
                    </div>
                </div>

            </div>

            <div class="divider"></div>

            <div class="style-section">
                <label class="section-label-title">连线</label>

                <div class="section-group-row">
                    <div class="section-group-item">
                        <label class="section-label">颜色</label>
                        <ColorInput v-model="currentLineColor" />
                    </div>
                    <div class="section-group-item">
                        <label class="section-label">线宽</label>
                        <SliderInput v-model="currentLineWidth" label="" unit="px" :min="1" :max="10"
                            :showInput="false" />
                    </div>
                </div>

                <div class="section-group-row">
                    <div class="section-group-item">
                        <label class="section-label">风格</label>
                        <Dropdown v-model="currentLineStyle" :options="lineStyleOptions" />
                    </div>
                    <div class="section-group-item">
                        <label class="section-label">显示箭头</label>
                        <div class="toggle-row">
                            <label class="toggle-switch">
                                <input type="checkbox" v-model="currentShowLineMarker">
                                <span class="toggle-slider"></span>
                            </label>
                            <span class="toggle-hint">{{ currentShowLineMarker ? '开启' : '关闭' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="divider"></div>

            <div class="style-section">
                <label class="section-label-title">节点外边距</label>

                <div class="section-group-item">
                    <label class="section-label">二级水平间距</label>
                    <SliderInput v-model="secondMarginX" label="" unit="px" :min="20" :max="200" :showInput="false" />
                </div>

                <div class="section-group-item">
                    <label class="section-label">二级垂直间距</label>
                    <SliderInput v-model="secondMarginY" label="" unit="px" :min="20" :max="200" :showInput="false" />
                </div>

                <div class="section-group-item">
                    <label class="section-label">三级水平间距</label>
                    <SliderInput v-model="nodeMarginX" label="" unit="px" :min="20" :max="200" :showInput="false" />
                </div>

                <div class="section-group-item">
                    <label class="section-label">三级垂直间距</label>
                    <SliderInput v-model="nodeMarginY" label="" unit="px" :min="0" :max="200" :showInput="false" />
                </div>
            </div>

            <div class="divider"></div>

            <div class="style-section">
                <div class="section-label-title">关联线设置</div>

                <div class="section-group-row">
                    <div class="section-group-item">
                        <label class="section-label">线条</label>
                        <ColorInput v-model="currentAssocLineColor" />
                    </div>
                    <div class="section-group-item">
                        <label class="section-label">文字</label>
                        <ColorInput v-model="currentAssocTextColor" />
                    </div>
                </div>

                <div class="section-group-row">
                    <div class="section-group-item">
                        <label class="section-label">字号</label>
                        <SliderInput v-model="currentAssocTextFontSize" label="" unit="px" :min="10" :max="32"
                            :showInput="false" />
                    </div>
                    <div class="section-group-item">
                        <label class="section-label">字体</label>
                        <Dropdown v-model="currentAssocTextFontFamily" :options="fontFamilyOptions" />
                    </div>
                </div>

                <div class="section-group-item">
                    <label class="section-label">线宽</label>
                    <SliderInput v-model="currentAssocLineWidth" label="" unit="px" :min="1" :max="10"
                        :showInput="false" />
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import SliderInput from '../SliderInput.vue'
import Dropdown from '../Dropdown.vue'
import ColorInput from '../ColorInput.vue'

const emit = defineEmits([
    'close',
    'set-theme-config',
    'get-theme-config',
    'set-custom-background',
    'get-custom-background'
])

// ==================== 主题配置（本地缓存） ====================
const themeConfig = ref({})

onMounted(() => {
    const config = emit('get-theme-config')
    if (config && typeof config === 'object') {
        themeConfig.value = { ...config }
    }
    // 同步自定义背景
    const bg = emit('get-custom-background')
    if (bg) {
        syncBackgroundFromParent(bg)
    }
})

// ==================== 背景相关 ====================
const bgColor = ref('#ffffff')
const currentBackgroundIndex = ref(-1)

// 同步父组件的自定义背景到本地
function syncBackgroundFromParent(bg) {
    if (!bg || (typeof bg === 'object' && bg.type === 'none')) {
        currentBackgroundIndex.value = 0
    } else if (typeof bg === 'object') {
        if (bg.type === 'pure' && bg.value) {
            bgColor.value = bg.value
            currentBackgroundIndex.value = 1
        } else if (bg.type === 'gradient') {
            currentBackgroundIndex.value = 2
        } else if (bg.type === 'grid') {
            currentBackgroundIndex.value = 3
        } else if (bg.type === 'image') {
            currentBackgroundIndex.value = 4
        }
    } else if (typeof bg === 'string') {
        bgColor.value = bg
        currentBackgroundIndex.value = 1
    }
}

// 纯色背景：v-model 绑定到 ColorInput
// ColorInput 弹窗选中颜色后通过 emit('update:modelValue', hexColor) 回传
// computed setter 接收 hexColor 字符串，emit 给父组件
const currentBackgroundColor = computed({
    get() {
        return bgColor.value || '#ffffff'
    },
    set(value) {
        bgColor.value = value
        emit('set-custom-background', { type: 'pure', value })
    }
})

const presetBG = computed(() => [
    { label: '无背景', svg: '<svg width="16" height="16" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 1.5H13C13.1344 1.5 13.2646 1.51767 13.3885 1.55081L1.55081 13.3885C1.51767 13.2646 1.5 13.1344 1.5 13V3C1.5 2.17157 2.17157 1.5 3 1.5ZM2.61147 14.4492C2.73539 14.4823 2.86563 14.5 3 14.5H13C13.8284 14.5 14.5 13.8284 14.5 13V3C14.5 2.86563 14.4823 2.73539 14.4492 2.61147L2.61147 14.4492ZM0 3C0 1.34315 1.34315 0 3 0H13C14.6569 0 16 1.34315 16 3V13C16 14.6569 14.6569 16 13 16H3C1.34315 16 0 14.6569 0 13V3Z"></path></svg>' },
    { label: '纯色', svg: `<svg width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" fill="${bgColor.value || '#ccc'}"/></svg>` },
    { label: '渐变', svg: '<svg width="16" height="16" viewBox="0 0 16 16"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#ff9a9e;stop-opacity:1"/><stop offset="100%" style="stop-color:#fad0c4;stop-opacity:0.5"/></linearGradient></defs><rect width="16" height="16" fill="url(#grad1)"/></svg>' },
    { label: '网格', svg: '<svg width="16" height="16" viewBox="0 0 16 16"><defs><pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M4 0H0V1H4V0ZM0 2H4V3H0V2ZM0 4H1V0H0V4ZM2 4H3V0H2V4Z" fill="#000"/></pattern></defs><rect width="16" height="16" fill="url(#grid)"/></svg>' },
    { label: '图片', svg: '<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1.5" y="2.5" width="13" height="11" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="5" cy="5.5" r="1.2" fill="#f28c5d"/><path d="M2 12.5l3-3.5 2 2 3-4 4 5.5" fill="none" stroke="#02a7f0" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
])

const gradientArrays = [
    "linear-gradient(90deg,#ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)",
    "linear-gradient(90deg,#a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(90deg,#fad0c4 0%, #fad0c4 1%, #ffd1ff 100%)",
    "linear-gradient(90deg,#96fbc4 0%, #f9f586 100%)",
    "linear-gradient(90deg,#ebbba7 0%, #cfc7f8 100%)",
    "linear-gradient(90deg,#e0c3fc 0%, #8ec5fc 100%)",
    "linear-gradient(90deg,#d299c2 0%, #fef9d7 100%)",
    "linear-gradient(90deg,#ebc0fd 0%, #d9ded8 100%)",
    "linear-gradient(90deg,#667eea 0%, #764ba2 100%)",
    "linear-gradient(90deg,#9890e3 0%, #b1f4cf 100%)",
    "linear-gradient(90deg,#16d9e3 0%, #30c7ec 47%, #46aef7 100%)",
    "linear-gradient(90deg,#fff1eb 0%, #ace0f9 100%)",
]

function handleChangeBackgroundTypeClick(index) {
    currentBackgroundIndex.value = index

    switch (index) {
        case 0:
            emit('set-custom-background', { type: 'none' })
            break
        case 1:
            emit('set-custom-background', { type: 'pure', value: bgColor.value || '#ffffff' })
            break
        case 2:
            break
        case 3:
            emit('set-custom-background', {
                type: 'grid',
                value: {
                    backgroundImage: "linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                    backgroundRepeat: "repeat",
                    backgroundPosition: "0 0, 0 0",
                }
            })
            break
        case 4:
            break
    }
}

function handleGradientClick(gradient) {
    currentBackgroundIndex.value = 2
    emit('set-custom-background', { type: 'gradient', value: gradient })
}

// ==================== 上传图片 ====================
const sourceImage = ref(null)
const isDragOver = ref(false)
const fileInput = ref(null)

const onFileChange = (e) => {
    const file = e.target.files[0]
    if (file) loadFile(file)
    e.target.value = ''
}

const onDrop = (e) => {
    isDragOver.value = false
    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'))
    if (file) loadFile(file)
}

const loadFile = (file) => {
    if (sourceImage.value) URL.revokeObjectURL(sourceImage.value.url)
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
        currentBackgroundIndex.value = 4
        emit('set-custom-background', {
            type: 'image',
            value: {
                backgroundImage: `url(${url})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundSize: 'cover',
                backgroundColor: 'transparent'
            }
        })
        sourceImage.value = {
            id: Date.now(),
            name: file.name,
            size: file.size,
            url,
            img
        }
    }
    img.src = url
}

const applySource = () => {
    if (!sourceImage.value) return
    emit('set-custom-background', {
        type: 'image',
        value: {
            backgroundImage: `url(${sourceImage.value.url})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundColor: 'transparent'
        }
    })
}

const clearSource = () => {
    if (sourceImage.value) URL.revokeObjectURL(sourceImage.value.url)
    sourceImage.value = null
    currentBackgroundIndex.value = 0
    emit('set-custom-background', { type: 'none' })
}

// ==================== 连线颜色 ====================
const localLineColor = ref('#4A90E2')
onMounted(() => {
    if (themeConfig.value.lineColor) localLineColor.value = themeConfig.value.lineColor
})
const currentLineColor = computed({
    get: () => localLineColor.value,
    set: (val) => {
        localLineColor.value = val
        emit('set-theme-config', 'lineColor', val)
    }
})

// ==================== 连线粗细 ====================
const lineWidthLocal = ref(1)
watch(() => themeConfig.value.lineWidth, (val) => {
    if (typeof val === 'number') lineWidthLocal.value = val
}, { immediate: true })

const currentLineWidth = computed({
    get: () => lineWidthLocal.value,
    set: (val) => {
        lineWidthLocal.value = val
        emit('set-theme-config', 'lineWidth', val)
    }
})

// ==================== 连线风格 ====================
const lineStyleLocal = ref('straight')
watch(() => themeConfig.value.lineStyle, (val) => {
    if (val) lineStyleLocal.value = val
}, { immediate: true })

const currentLineStyle = computed({
    get: () => lineStyleLocal.value,
    set: (val) => {
        lineStyleLocal.value = val
        emit('set-theme-config', 'lineStyle', val)
    }
})

const lineStyleOptions = [
    { label: '直线', value: 'straight', svg: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="60" height="26"><path d="M18,14L30,14L30,5L42,5" fill="none" stroke="#000" stroke-width="2"></path><path d="M18,14L30,14L30,23L42,23" fill="none" stroke="#000" stroke-width="2"></path></svg>' },
    { label: '曲线', value: 'curve', svg: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="60" height="26"><path d="M18,14L30,14A12,-9 0 0 1 42,5" fill="none" stroke="#000" stroke-width="2"></path><path d="M18,14L30,14A12,9 0 0 0 42,23" fill="none" stroke="#000" stroke-width="2"></path></svg>' },
    { label: '直连', value: 'direct', svg: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="60" height="26"><path d="M18,14L30,14L42,5" fill="none" stroke="#000" stroke-width="2"></path><path d="M18,14L30,14L42,23" fill="none" stroke="#000" stroke-width="2"></path></svg>' }
]

// ==================== 显示箭头标记 ====================
const showLineMarkerLocal = ref(false)
watch(() => themeConfig.value.showLineMarker, (val) => {
    if (typeof val === 'boolean') showLineMarkerLocal.value = val
}, { immediate: true })

const currentShowLineMarker = computed({
    get: () => showLineMarkerLocal.value,
    set: (val) => {
        showLineMarkerLocal.value = val
        emit('set-theme-config', 'showLineMarker', val)
    }
})

// ==================== 二级节点外边距 ====================
const secondMarginXLocal = ref(100)
const secondMarginYLocal = ref(40)

watch(() => themeConfig.value.second, (val) => {
    if (val && typeof val.marginX === 'number') secondMarginXLocal.value = val.marginX
    if (val && typeof val.marginY === 'number') secondMarginYLocal.value = val.marginY
}, { immediate: true, deep: true })

const secondMarginX = computed({
    get: () => secondMarginXLocal.value,
    set: (val) => {
        secondMarginXLocal.value = val
        const parent = themeConfig.value.second || {}
        emit('set-theme-config', 'second', { ...parent, marginX: val })
    }
})

const secondMarginY = computed({
    get: () => secondMarginYLocal.value,
    set: (val) => {
        secondMarginYLocal.value = val
        const parent = themeConfig.value.second || {}
        emit('set-theme-config', 'second', { ...parent, marginY: val })
    }
})

// ==================== 三级及以下节点外边距 ====================
const nodeMarginXLocal = ref(50)
const nodeMarginYLocal = ref(0)

watch(() => themeConfig.value.node, (val) => {
    if (val && typeof val.marginX === 'number') nodeMarginXLocal.value = val.marginX
    if (val && typeof val.marginY === 'number') nodeMarginYLocal.value = val.marginY
}, { immediate: true, deep: true })

const nodeMarginX = computed({
    get: () => nodeMarginXLocal.value,
    set: (val) => {
        nodeMarginXLocal.value = val
        const parent = themeConfig.value.node || {}
        emit('set-theme-config', 'node', { ...parent, marginX: val })
    }
})

const nodeMarginY = computed({
    get: () => nodeMarginYLocal.value,
    set: (val) => {
        nodeMarginYLocal.value = val
        const parent = themeConfig.value.node || {}
        emit('set-theme-config', 'node', { ...parent, marginY: val })
    }
})

// ==================== 关联线 ====================
const assocLineColorLocal = ref('#333333')
const assocLineWidthLocal = ref(2)

onMounted(() => {
    if (themeConfig.value.associativeLineColor) assocLineColorLocal.value = themeConfig.value.associativeLineColor
})

const currentAssocLineColor = computed({
    get: () => assocLineColorLocal.value,
    set: (val) => {
        assocLineColorLocal.value = val
        emit('set-theme-config', 'associativeLineColor', val)
    }
})

watch(() => themeConfig.value.associativeLineWidth, (val) => {
    if (typeof val === 'number') assocLineWidthLocal.value = val
}, { immediate: true })

const currentAssocLineWidth = computed({
    get: () => assocLineWidthLocal.value,
    set: (val) => {
        assocLineWidthLocal.value = val
        emit('set-theme-config', 'associativeLineWidth', val)
    }
})

// ==================== 关联线文字 ====================
const assocTextColorLocal = ref('#333333')
const assocTextFontSizeLocal = ref(14)
const assocTextFontFamilyLocal = ref('微软雅黑, Microsoft YaHei')

onMounted(() => {
    if (themeConfig.value.associativeLineTextColor) assocTextColorLocal.value = themeConfig.value.associativeLineTextColor
})

const currentAssocTextColor = computed({
    get: () => assocTextColorLocal.value,
    set: (val) => {
        assocTextColorLocal.value = val
        emit('set-theme-config', 'associativeLineTextColor', val)
    }
})

watch(() => themeConfig.value.associativeLineTextFontSize, (val) => {
    if (typeof val === 'number') assocTextFontSizeLocal.value = val
}, { immediate: true })

watch(() => themeConfig.value.associativeLineTextFontFamily, (val) => {
    if (val) assocTextFontFamilyLocal.value = val
}, { immediate: true })

const currentAssocTextFontSize = computed({
    get: () => assocTextFontSizeLocal.value,
    set: (val) => {
        assocTextFontSizeLocal.value = val
        emit('set-theme-config', 'associativeLineTextFontSize', val)
    }
})

const currentAssocTextFontFamily = computed({
    get: () => assocTextFontFamilyLocal.value,
    set: (val) => {
        assocTextFontFamilyLocal.value = val
        emit('set-theme-config', 'associativeLineTextFontFamily', val)
    }
})

const fontFamilyOptions = [
    { label: '微软雅黑', value: '微软雅黑, Microsoft YaHei' },
    { label: '宋体', value: '宋体, SimSun' },
    { label: '黑体', value: '黑体, SimHei' },
    { label: '楷体', value: '楷体, KaiTi' },
    { label: 'Arial', value: 'Arial' },
]

// ==================== 面板关闭 ====================
const panelRef = ref(null)

function handleOutsideClick(e) {
    if (panelRef.value && !panelRef.value.contains(e.target)) {
        emit('close')
    }
}

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleOutsideClick)
})

onMounted(() => {
    setTimeout(() => {
        document.addEventListener('mousedown', handleOutsideClick)
    }, 100)
})
</script>

<style src="@/styles/mindmap.css" scoped></style>
