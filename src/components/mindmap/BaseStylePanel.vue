<template>
    <div class="style-panel" ref="panelRef">
        <div class="panel-header">
            <span class="panel-title">基础样式</span>
        </div>

        <div class="panel-body customScrollbar">

            <div class="style-section">
                <div class="section-group-item">
                    <label class="section-label">线条颜色</label>
                    <div class="color-row">
                        <input type="color" class="color-input" :value="currentLineColor"
                            @input="(e) => emitSetConfig('lineColor', e.target.value)" />
                    </div>
                </div>
                <div class="section-group-item">
                    <label class="section-label">线条粗细</label>
                    <SliderInput v-model="currentLineWidth" label="" unit="px" :min="1" :max="10" :showInput="false"
                        @update:model-value="(val) => emitSetConfig('lineWidth', val)" />
                </div>
            </div>

            <div class="style-section">
                <div class="section-group-item">
                    <label class="section-label">连线风格</label>
                    <div class="btn-group">
                        <Dropdown v-model="currentLineStyle" :options="lineStyleOptions"
                            @change="(item) => emitSetConfig('lineStyle', item.value)" />
                    </div>
                </div>
                <div class="section-group-item">
                    <label class="section-label">显示箭头标记</label>
                    <div class="toggle-row">
                        <label class="toggle-switch">
                            <input type="checkbox" :checked="currentShowLineMarker"
                                @change="(e) => emitSetConfig('showLineMarker', e.target.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                        <span class="toggle-hint">{{ currentShowLineMarker ? '开启' : '关闭' }}</span>
                    </div>
                </div>
            </div>

            <div class="divider"></div>

            <!-- ====== 节点外边距 ====== -->
            <div class="section-title">
                二级节点外边距
            </div>
            <div class="style-section">
                <div class="section-group-item">
                    <label class="section-label">水平间距</label>
                    <SliderInput v-model="secondMarginX" label="" unit="px" :min="20" :max="200" :showInput="false"
                        @update:model-value="(val) => emitSetNestedConfig('second', 'marginX', val)" />
                </div>
                <div class="section-group-item">
                    <label class="section-label">垂直间距</label>
                    <SliderInput v-model="secondMarginY" label="" unit="px" :min="5" :max="100" :showInput="false"
                        @update:model-value="(val) => emitSetNestedConfig('second', 'marginY', val)" />
                </div>
            </div>

            <div class="section-title">
                三级及以下节点外边距
            </div>
            <div class="style-section">
                <div class="section-group-item">
                    <label class="section-label">水平间距</label>
                    <SliderInput v-model="nodeMarginX" label="" unit="px" :min="20" :max="200" :showInput="false"
                        @update:model-value="(val) => emitSetNestedConfig('node', 'marginX', val)" />
                </div>
                <div class="section-group-item">
                    <label class="section-label">垂直间距</label>
                    <SliderInput v-model="nodeMarginY" label="" unit="px" :min="0" :max="100" :showInput="false"
                        @update:model-value="(val) => emitSetNestedConfig('node', 'marginY', val)" />
                </div>
            </div>

            <div class="divider"></div>

            <!-- ====== 关联线设置 ====== -->
            <div class="section-title">
                <span class="section-title-icon assoc-icon">⇔</span>
                关联线设置
            </div>
            <div class="style-section">
                <div class="section-group-item">
                    <label class="section-label">线条颜色</label>
                    <div class="color-row">
                        <input type="color" class="color-input" :value="currentAssocLineColor"
                            @input="(e) => emitSetConfig('associativeLineColor', e.target.value)" />
                    </div>
                </div>
                <div class="section-group-item">
                    <label class="section-label">线条粗细</label>
                    <SliderInput v-model="currentAssocLineWidth" label="" unit="px" :min="1" :max="10"
                        :showInput="false" @update:model-value="(val) => emitSetConfig('associativeLineWidth', val)" />
                </div>
            </div>


            <div class="style-section">

                <div class="section-group-item">
                    <label class="section-label">字号</label>
                    <SliderInput v-model="currentAssocTextFontSize" label="" unit="px" :min="10" :max="32"
                        :showInput="false"
                        @update:model-value="(val) => emitSetConfig('associativeLineTextFontSize', val)" />
                </div>

                <div class="section-group-item full-width">
                    <label class="section-label">字体类型</label>
                    <Dropdown v-model="currentAssocTextFontFamily" :options="fontFamilyOptions"
                        @change="(item) => emitSetConfig('associativeLineTextFontFamily', item.value)" />
                </div>
            </div>

            <div class="style-section">


                <div class="section-group-item">
                    <label class="section-label">文字颜色</label>
                    <div class="color-row">
                        <input type="color" class="color-input" :value="currentAssocTextColor"
                            @input="(e) => emitSetConfig('associativeLineTextColor', e.target.value)" />
                    </div>
                </div>

            </div>

        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
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

// ===== 核心：正确获取主题配置对象 =====
const themeConfig = computed(() => {
    try {
        return props.getThemeConfig() || {}
    } catch (e) {
        return {}
    }
})

// 统一emit方法 - 顶层配置
function emitSetConfig(key, value) {
    emit('set-theme-config', key, value)
}

// 嵌套配置 - 针对 second / node 下的子属性
function emitSetNestedConfig(parentKey, childKey, value) {
    const parent = themeConfig.value[parentKey] || {}
    emit('set-theme-config', parentKey, {
        ...parent,
        [childKey]: value
    })
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
    { label: '直线', value: 'straight',svg:'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="60" height="26"><path d="M18,14L30,14L30,5L42,5" fill="none" stroke="#000" stroke-width="2"></path><path d="M18,14L30,14L30,23L42,23" fill="none" stroke="#000" stroke-width="2"></path></svg>' },
    { label: '曲线', value: 'curve',svg:'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="60" height="26"><path d="M18,14L30,14A12,-9 0 0 1 42,5" fill="none" stroke="#000" stroke-width="2"></path><path d="M18,14L30,14A12,9 0 0 0 42,23" fill="none" stroke="#000" stroke-width="2"></path></svg>' },
    { label: '直连', value: 'direct',svg:'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="60" height="26"><path d="M18,14L30,14L42,5" fill="none" stroke="#000" stroke-width="2"></path><path d="M18,14L30,14L42,23" fill="none" stroke="#000" stroke-width="2"></path></svg>' }
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

// ==================== 关联线 - 线条 ====================
// default.js: associativeLineColor: 'rgb(51, 51, 51)', associativeLineWidth: 2
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

// ==================== 关联线 - 文字 ====================
// default.js: associativeLineTextColor: 'rgb(51, 51, 51)', associativeLineTextFontSize: 14, associativeLineTextFontFamily: '微软雅黑, Microsoft YaHei'
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

// ==================== 图片显示尺寸 ====================
// default.js: imgMaxWidth: 200, imgMaxHeight: 100
const imgMaxWidthLocal = ref(200)
const imgMaxHeightLocal = ref(100)

watch(() => themeConfig.value.imgMaxWidth, (val) => {
    if (typeof val === 'number') imgMaxWidthLocal.value = val
}, { immediate: true })

watch(() => themeConfig.value.imgMaxHeight, (val) => {
    if (typeof val === 'number') imgMaxHeightLocal.value = val
}, { immediate: true })

const currentImgMaxWidth = computed({
    get: () => imgMaxWidthLocal.value,
    set: (val) => { imgMaxWidthLocal.value = val }
})

const currentImgMaxHeight = computed({
    get: () => imgMaxHeightLocal.value,
    set: (val) => { imgMaxHeightLocal.value = val }
})
</script>

<style scoped>
.style-panel {
    position: absolute;
    top: 50px;
    right: 0px;
    width: 300px;
    height: calc(100vh - 250px);
    overflow-y: auto;
    background: rgba(255, 255, 255);
    backdrop-filter: blur(20px) saturate(1.8);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.04),
        0 8px 24px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    z-index: 100;
    animation: slideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 自定义滚动条 */
.style-panel::-webkit-scrollbar {
    width: 4px;
}

.style-panel::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
}

.style-panel::-webkit-scrollbar-track {
    background: transparent;
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
    flex-shrink: 0;
}

.panel-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    letter-spacing: 0.02em;
}

.panel-body {
    padding: 14px 16px 30px 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.style-section {
    display: flex;
    gap: 12px;
}

.section-label {
    font-size: 13px;
    color: #0e0202;
    font-weight: 500;
}

/* 分组小标题 */
.section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #555;
    letter-spacing: 0.02em;
}

.section-title-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
}

.section-title-icon:not(.line-icon):not(.assoc-icon):not(.text-icon):not(.img-icon) {
    background: rgba(74, 144, 217, 0.1);
    color: #4a90d9;
}

.line-icon {
    background: rgba(84, 150, 136, 0.12);
    color: #549688;
    font-size: 14px;
    letter-spacing: -1px;
}

.assoc-icon {
    background: rgba(155, 89, 182, 0.1);
    color: #9b59b6;
    font-size: 12px;
}

.text-icon {
    background: rgba(243, 156, 18, 0.1);
    color: #f39c12;
    font-size: 13px;
    font-weight: 800;
    font-style: italic;
}

.img-icon {
    background: rgba(46, 204, 113, 0.1);
    color: #2ecc71;
    font-size: 13px;
}

/* 颜色行 */
.color-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.color-input {
    height: 30px;
    width: 40px;
    border: 2px solid rgba(0, 0, 0, 0.06);
    border-radius: 8px;
    cursor: pointer;
    background: transparent;
    padding: 0;
    flex-shrink: 0;
    transition: border-color 0.15s ease;
}

.color-input:hover {
    border-color: rgba(0, 0, 0, 0.15);
}

.color-input::-webkit-color-swatch-wrapper {
    padding: 2px;
}

.color-input::-webkit-color-swatch {
    border-radius: 5px;
    border: none;
}

/* 预设颜色 */
.preset-color {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid;
    cursor: pointer;
    transition: transform 0.15s ease;
}

.preset-color:hover {
    transform: scale(1.15);
}

.section-group-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 50%;
}

.section-group-item.full-width {
    width: 100%;
}

.divider {
    width: 100%;
    height: 1px;
    background: rgb(0 0 0 / 5%);
    margin: 2px 4px;
    flex-shrink: 0;
}

/* 开关样式 */
.toggle-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.toggle-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .3s;
    border-radius: 24px;
}

.toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .3s;
    border-radius: 50%;
}

.toggle-switch input:checked+.toggle-slider {
    background-color: #4a90d9;
}

.toggle-switch input:checked+.toggle-slider:before {
    transform: translateX(20px);
}

.toggle-hint {
    font-size: 12px;
    color: #666;
    font-weight: 500;
}

.slider {
    width: 100%;
}
</style>
