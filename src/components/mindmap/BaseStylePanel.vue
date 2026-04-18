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
                        @click="handleBgTypeClick(index)">
                        <span v-html="bgType.svg"></span>
                        <span>{{ bgType.label }}</span>
                    </div>
                </div>

                <!-- 纯色 -->
                <div class="pure-color-section" v-if="currentBackgroundIndex === 1">
                    <div class="section-group-row" v-for="item in colorArray" :key="item.label">
                        <label class="section-label">{{ item.label }}</label>
                        <div class="preset-bg-color" v-for="color in item.colors" :key="color"
                            :style="{ background: color }" @click="handlePureColorClick(color)"></div>
                    </div>
                </div>

                <!-- 渐变 -->
                <div class="section-group-row presetGradientBtns" v-if="currentBackgroundIndex === 2">
                    <button class="preset-btn" v-for="gradient in gradientArrays" :key="gradient"
                        :style="{ backgroundImage: gradient }"
                        @click="handleGradientClick(gradient)"></button>
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
                        <input type="color" class="color-input" :value="currentLineColor"
                            @input="(e) => emitSetThemeConfig('lineColor', e.target.value)" />
                    </div>
                    <div class="section-group-item">
                        <label class="section-label">线宽</label>
                        <SliderInput v-model="currentLineWidth" label="" unit="px" :min="1" :max="10" :showInput="false"
                            @update:model-value="(val) => emitSetThemeConfig('lineWidth', val)" />
                    </div>
                </div>

                <div class="section-group-row">
                    <div class="section-group-item">
                        <label class="section-label">风格</label>
                        <Dropdown v-model="currentLineStyle" :options="lineStyleOptions"
                            @change="(item) => emitSetThemeConfig('lineStyle', item.value)" />
                    </div>
                    <div class="section-group-item">
                        <label class="section-label">显示箭头</label>
                        <div class="toggle-row">
                            <label class="toggle-switch">
                                <input type="checkbox" :checked="currentShowLineMarker"
                                    @change="(e) => emitSetThemeConfig('showLineMarker', e.target.checked)">
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
                    <SliderInput v-model="secondMarginX" label="" unit="px" :min="20" :max="200" :showInput="false"
                        @update:model-value="(val) => emitSetNestedConfig('second', 'marginX', val)" />
                </div>

                <div class="section-group-item">
                    <label class="section-label">二级垂直间距</label>
                    <SliderInput v-model="secondMarginY" label="" unit="px" :min="20" :max="200" :showInput="false"
                        @update:model-value="(val) => emitSetNestedConfig('second', 'marginY', val)" />
                </div>

                <div class="section-group-item">
                    <label class="section-label">三级水平间距</label>
                    <SliderInput v-model="nodeMarginX" label="" unit="px" :min="20" :max="200" :showInput="false"
                        @update:model-value="(val) => emitSetNestedConfig('node', 'marginX', val)" />
                </div>

                <div class="section-group-item">
                    <label class="section-label">三级垂直间距</label>
                    <SliderInput v-model="nodeMarginY" label="" unit="px" :min="0" :max="200" :showInput="false"
                        @update:model-value="(val) => emitSetNestedConfig('node', 'marginY', val)" />
                </div>
            </div>

            <div class="divider"></div>

            <div class="style-section">
                <div class="section-label-title">关联线设置</div>

                <div class="section-group-row">
                    <div class="section-group-item">
                        <label class="section-label">线条颜色</label>
                        <input type="color" class="color-input" :value="currentAssocLineColor"
                            @input="(e) => emitSetThemeConfig('associativeLineColor', e.target.value)" />
                    </div>
                    <div class="section-group-item">
                        <label class="section-label">文字颜色</label>
                        <input type="color" class="color-input" :value="currentAssocTextColor"
                            @input="(e) => emitSetThemeConfig('associativeLineTextColor', e.target.value)" />
                    </div>
                </div>

                <div class="section-group-row">
                    <div class="section-group-item">
                        <label class="section-label">字号</label>
                        <SliderInput v-model="currentAssocTextFontSize" label="" unit="px" :min="10" :max="32"
                            :showInput="false"
                            @update:model-value="(val) => emitSetThemeConfig('associativeLineTextFontSize', val)" />
                    </div>
                    <div class="section-group-item">
                        <label class="section-label">字体</label>
                        <Dropdown v-model="currentAssocTextFontFamily" :options="fontFamilyOptions"
                            @change="(item) => emitSetThemeConfig('associativeLineTextFontFamily', item.value)" />
                    </div>
                </div>

                <div class="section-group-item">
                    <label class="section-label">线宽</label>
                    <SliderInput v-model="currentAssocLineWidth" label="" unit="px" :min="1" :max="10"
                        :showInput="false"
                        @update:model-value="(val) => emitSetThemeConfig('associativeLineWidth', val)" />
                </div>
            </div>

        </div>
    </div>
</template>
<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import SliderInput from '../SliderInput.vue';
import Dropdown from '../Dropdown.vue';

const props = defineProps({
    getThemeConfig: {
        type: Function,
        required: true
    },
    // ★★★ 新增：接收设置自定义背景的方法 ★★★
    setCustomBackground: {
        type: Function,
        required: true
    }
})

const emit = defineEmits(['close', 'set-theme-config'])

const panelRef = ref(null)

function handleOutsideClick(e) {
    if (panelRef.value && !panelRef.value.contains(e.target)) {
        emit('close')
    }
}

onMounted(() => {
    setTimeout(() => {
        document.addEventListener('mousedown', handleOutsideClick)
    }, 100)
})

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleOutsideClick)
})

const themeConfig = computed(() => {
    try {
        return props.getThemeConfig() || {}
    } catch (e) {
        return {}
    }
})

function emitSetThemeConfig(key, value) {
    emit('set-theme-config', key, value)
}

function emitSetNestedConfig(parentKey, childKey, value) {
    const parent = themeConfig.value[parentKey] || {}
    emit('set-theme-config', parentKey, {
        ...parent,
        [childKey]: value
    })
}

// ==================== 背景颜色 ====================
const currentBackgroundColor = computed(() => themeConfig.value.backgroundColor || '#fff')
const bgColor = ref(null)
const currentBackgroundIndex = ref(-1)

const presetBG = computed(() => [
    { label: '无背景', svg: '<svg width="16" height="16" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 1.5H13C13.1344 1.5 13.2646 1.51767 13.3885 1.55081L1.55081 13.3885C1.51767 13.2646 1.5 13.1344 1.5 13V3C1.5 2.17157 2.17157 1.5 3 1.5ZM2.61147 14.4492C2.73539 14.4823 2.86563 14.5 3 14.5H13C13.8284 14.5 14.5 13.8284 14.5 13V3C14.5 2.86563 14.4823 2.73539 14.4492 2.61147L2.61147 14.4492ZM0 3C0 1.34315 1.34315 0 3 0H13C14.6569 0 16 1.34315 16 3V13C16 14.6569 14.6569 16 13 16H3C1.34315 16 0 14.6569 0 13V3Z"></path></svg>' },
    { label: '纯色', svg: `<svg width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" fill="${bgColor.value || '#ccc'}"/></svg>` },
    { label: '渐变', svg: '<svg width="16" height="16" viewBox="0 0 16 16"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#ff9a9e;stop-opacity:1"/><stop offset="100%" style="stop-color:#fad0c4;stop-opacity:0.5"/></linearGradient></defs><rect width="16" height="16" fill="url(#grad1)"/></svg>' },
    { label: '网格', svg: '<svg width="16" height="16" viewBox="0 0 16 16"><pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M4 0H0V1H4V0ZM0 2H4V3H0V2ZM0 4H1V0H0V4ZM2 4H3V0H2V4Z" fill="#000"/></pattern><rect width="16" height="16" fill="url(#grid)"/></svg>' },
    { label: '图片', svg: '<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1.5" y="2.5" width="13" height="11" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="5" cy="5.5" r="1.2" fill="#f28c5d"/><path d="M2 12.5l3-3.5 2 2 3-4 4 5.5" fill="none" stroke="#02a7f0" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
])

const colorArray = [
    { label: '暖色系', colors: ['#FFF8E1', '#FFEDD5', '#FFCC99', '#FFAB6B', '#FF8A4D'] },
    { label: '冷色系', colors: ['#E0F7FA', '#B2EBF2', '#80DEEA', '#4DD0E1', '#26C6DA'] },
    { label: '蓝色系', colors: ['#E1F5FE', '#B3E5FC', '#81D4FA', '#4FC3F7', '#29B6F6'] },
]

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

// ★★★ 修改：背景类型点击处理 ★★★
function handleBgTypeClick(index) {
    currentBackgroundIndex.value = index

    if (index === 0) {
        // 无背景
        props.setCustomBackground({ type: 'none' })
    } else if (index === 3) {
        // ★★★ 网格背景 ★★★
        props.setCustomBackground({
            type: 'grid',
            value: {
                backgroundImage: "linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                backgroundRepeat: "repeat",
                backgroundPosition: "0 0, 0 0",
            }
        })
    }
    // index 1(纯色)、2(渐变)、4(图片) 由各自的点击函数处理
}


// ★★★ 修改：纯色背景点击处理 ★★★
function handlePureColorClick(color) {
    bgColor.value = color
    currentBackgroundIndex.value = 1
    props.setCustomBackground({ type: 'pure', value: color })
}

// ★★★ 修改：渐变背景点击处理 ★★★
function handleGradientClick(gradient) {
    currentBackgroundIndex.value = 2
    props.setCustomBackground({ type: 'gradient', value: gradient })
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

        // ★★★ 设置图片背景并保存 ★★★
        props.setCustomBackground({
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
    props.setCustomBackground({
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
    props.setCustomBackground({ type: 'none' })
}

// ==================== 连线颜色 ====================
const currentLineColor = computed(() => rgbToHex(themeConfig.value.lineColor) || '#549688')

// ==================== 连线粗细 ====================
const lineWidthLocal = ref(1)
watch(() => themeConfig.value.lineWidth, (val) => {
    if (typeof val === 'number') lineWidthLocal.value = val
}, { immediate: true })

const currentLineWidth = computed({
    get: () => lineWidthLocal.value,
    set: (val) => { lineWidthLocal.value = val }
})

// ==================== 连线风格 ====================
const lineStyleLocal = ref('straight')
watch(() => themeConfig.value.lineStyle, (val) => {
    if (val) lineStyleLocal.value = val
}, { immediate: true })

const currentLineStyle = computed({
    get: () => lineStyleLocal.value,
    set: (val) => { lineStyleLocal.value = val }
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
    set: (val) => { showLineMarkerLocal.value = val }
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
    set: (val) => { secondMarginXLocal.value = val }
})

const secondMarginY = computed({
    get: () => secondMarginYLocal.value,
    set: (val) => { secondMarginYLocal.value = val }
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
    set: (val) => { nodeMarginXLocal.value = val }
})

const nodeMarginY = computed({
    get: () => nodeMarginYLocal.value,
    set: (val) => { nodeMarginYLocal.value = val }
})

// ==================== 关联线 ====================
const assocLineColorLocal = ref('#333333')
const assocLineWidthLocal = ref(2)

watch(() => themeConfig.value.associativeLineColor, (val) => {
    if (val) assocLineColorLocal.value = val
}, { immediate: true })

watch(() => themeConfig.value.associativeLineWidth, (val) => {
    if (typeof val === 'number') assocLineWidthLocal.value = val
}, { immediate: true })

const currentAssocLineColor = computed({
    get: () => rgbToHex(assocLineColorLocal.value),
    set: (val) => { assocLineColorLocal.value = rgbToHex(val) }
})

const currentAssocLineWidth = computed({
    get: () => assocLineWidthLocal.value,
    set: (val) => { assocLineWidthLocal.value = val }
})

function rgbToHex(rgbString) {
    const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (!match) throw new Error('无效的 RGB 格式')
    
    const toHex = (n) => {
        const hex = parseInt(n).toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }
    
    return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`
}

// 使用
console.log(rgbToHex("rgb(152, 162, 171)"))  // "#98a2ab"

// ==================== 关联线文字 ====================
const assocTextColorLocal = ref('#333333')
const assocTextFontSizeLocal = ref(14)
const assocTextFontFamilyLocal = ref('微软雅黑, Microsoft YaHei')

watch(() => themeConfig.value.associativeLineTextColor, (val) => {
    if (val) assocTextColorLocal.value = val
}, { immediate: true })

watch(() => themeConfig.value.associativeLineTextFontSize, (val) => {
    if (typeof val === 'number') assocTextFontSizeLocal.value = val
}, { immediate: true })

watch(() => themeConfig.value.associativeLineTextFontFamily, (val) => {
    if (val) assocTextFontFamilyLocal.value = val
}, { immediate: true })

const currentAssocTextColor = computed({
    get: () => rgbToHex(assocTextColorLocal.value),
    set: (val) => { assocTextColorLocal.value = rgbToHex(val) }
})

const currentAssocTextFontSize = computed({
    get: () => assocTextFontSizeLocal.value,
    set: (val) => { assocTextFontSizeLocal.value = val }
})

const currentAssocTextFontFamily = computed({
    get: () => assocTextFontFamilyLocal.value,
    set: (val) => { assocTextFontFamilyLocal.value = val }
})

const fontFamilyOptions = [
    { label: '微软雅黑', value: '微软雅黑, Microsoft YaHei' },
    { label: '宋体', value: '宋体, SimSun' },
    { label: '黑体', value: '黑体, SimHei' },
    { label: '楷体', value: '楷体, KaiTi' },
    { label: 'Arial', value: 'Arial' },
]
</script>

<style src="@/styles/mindmap.css" scoped></style>
