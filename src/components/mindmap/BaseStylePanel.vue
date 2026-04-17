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
                        :class="{ active: currentBackgroundIndex == index }" @click="currentBackgroundIndex = index">
                        <span v-html="bgType.svg"></span>
                        <span>{{ bgType.label }}</span>
                    </div>
                </div>
                <!-- 无背景 -->
                <div class="section-group-row" v-if="currentBackgroundIndex === '-1'"></div>

                <!-- 纯色 -->
                <div class="section-group-row" v-if="currentBackgroundIndex === '-1'">
                    <label class="section-label">纯色背景颜色</label>
                    <input type="color" class="color-input" :value="currentBackgroundColor"
                        @input="(e) => emitSetThemeConfig('backgroundColor', e.target.value)" />
                </div>

                <!-- 渐变 -->
                <div class="section-group-row" v-if="currentBackgroundIndex === '1'">

                </div>

                <!-- 网格 -->
                <div class="section-group-row" v-if="currentBackgroundIndex === '2'">
                    <label class="section-label">网格颜色</label>
                    <input type="color" class="color-input" :value="currentBackgroundColor"
                        @input="(e) => emitSetThemeConfig('backgroundColor', e.target.value)" />
                </div>

                <!-- 图片 -->
                <div class="section-group-row" v-if="currentBackgroundIndex === '3'">
                    <label class="section-label">背景图片</label>
                    <input type="file" accept="image/*" @change="handleBgImageChange" />
                </div>

            </div>

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

            <div class="style-section">


            </div>

            <div class="style-section">

            </div>

        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import SliderInput from '../SliderInput.vue';
import Dropdown from '../Dropdown.vue';

const props = defineProps({
    getThemeConfig: {
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

// ===== 核心：正确获取主题配置 =====
// getThemeConfig() 返回的是 mindMap.getThemeConfig() 的结果（引用）
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
const currentBackgroundIndex = ref('-1')
const presetBG = [
    { label: '无背景', indexe: -1, svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 1.5H13C13.1344 1.5 13.2646 1.51767 13.3885 1.55081L1.55081 13.3885C1.51767 13.2646 1.5 13.1344 1.5 13V3C1.5 2.17157 2.17157 1.5 3 1.5ZM2.61147 14.4492C2.73539 14.4823 2.86563 14.5 3 14.5H13C13.8284 14.5 14.5 13.8284 14.5 13V3C14.5 2.86563 14.4823 2.73539 14.4492 2.61147L2.61147 14.4492ZM0 3C0 1.34315 1.34315 0 3 0H13C14.6569 0 16 1.34315 16 3V13C16 14.6569 14.6569 16 13 16H3C1.34315 16 0 14.6569 0 13V3Z"></path></svg>' },
    { label: '纯色', indexe: 0, svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect width="16" height="16" fill="currentColor"/></svg>' },
    { label: '渐变', indexe: 1, svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:currentColor;stop-opacity:1"/><stop offset="100%" style="stop-color:currentColor;stop-opacity:0.5"/></linearGradient></defs><rect width="16" height="16" fill="url(#grad1)"/></svg>' },
    { label: '图片', indexe: 2, svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect width="16" height="16" fill="white" stroke="currentColor"/><path d="M2 2h12v12H2V2zm1 1v10h10V3H3zm2 2l2 2 3-3 3 5H4v-2z" fill="currentColor"/></svg>' },
    { label: '网格', indexe: 3, svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M4 0H0V1H4V0ZM0 2H4V3H0V2ZM0 4H1V0H0V4ZM2 4H3V0H2V4Z" fill="currentColor"/></pattern><rect width="16" height="16" fill="url(#grid)"/></svg>' },
]

// 添加处理背景图片的方法
const handleBgImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            emitSetThemeConfig('backgroundImage', e.target.result)
        }
        reader.readAsDataURL(file)
    }
}

// ==================== 连线颜色 ====================
const currentLineColor = computed(() => themeConfig.value.lineColor || '#549688')

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
const assocLineColorLocal = ref('rgb(51, 51, 51)')
const assocLineWidthLocal = ref(2)

watch(() => themeConfig.value.associativeLineColor, (val) => {
    if (val) assocLineColorLocal.value = val
}, { immediate: true })

watch(() => themeConfig.value.associativeLineWidth, (val) => {
    if (typeof val === 'number') assocLineWidthLocal.value = val
}, { immediate: true })

const currentAssocLineColor = computed({
    get: () => assocLineColorLocal.value,
    set: (val) => { assocLineColorLocal.value = val }
})

const currentAssocLineWidth = computed({
    get: () => assocLineWidthLocal.value,
    set: (val) => { assocLineWidthLocal.value = val }
})

// ==================== 关联线文字 ====================
const assocTextColorLocal = ref('rgb(51, 51, 51)')
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
    get: () => assocTextColorLocal.value,
    set: (val) => { assocTextColorLocal.value = val }
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