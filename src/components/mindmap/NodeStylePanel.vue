<template>
    <div class="style-panel">
        <div class="panel-header">
            <span class="panel-title">节点样式</span>
            <span class="panel-badge">{{ activeNodes.length }} 个节点</span>
        </div>

        <div class="panel-body">

            <!-- 字体 -->

            <div class="style-section">

                <div class="section-group-item">

                    <label class="section-label">字体</label>
                    <div class="btn-group">
                        <Dropdown v-model="currentFontFamily" :options="fontFamilies"
                            @change="(item) => { $emit('set-style', 'fontFamily', item.value) }" />
                    </div>
                </div>

                <div class="section-group-item">
                    <label class="section-label">文字颜色</label>
                    <div class="color-row">
                        <input type="color" class="color-input" :value="currentColor"
                            @input="(e) => $emit('set-style', 'color', e.target.value)" />
                    </div>
                </div>
            </div>

            <div class="style-section">

                <div class="section-group-item">
                    <label class="section-label">字号</label>
                    <SliderInput v-model="currentFontSize" label="" unit="" :min="10" :max="48" :showSlider=false
                        @update:model-value="(val) => $emit('set-style', 'fontSize', val)" />
                </div>
                <div class="section-group-item">

                    <label class="section-label">字型</label>
                    <div class="btn-group font-weight-group">
                        <button v-for="w in fontWeights" :key="w.value" class="style-btn"
                            :class="{ active: currentFontWeight === w.value }"
                            @click="$emit('set-style', 'fontWeight', w.value)">
                            <i :class="w.icon" />
                        </button>
                    </div>
                </div>

            </div>

            <div class="divider"></div>

            <!-- 背景颜色 -->
            <div class="style-section">
                <div class="section-group-item">

                    <label class="section-label">背景颜色</label>
                    <div class="color-row">
                        <input type="color" class="color-input" :value="currentBg"
                            @input="(e) => $emit('set-style', 'fillColor', e.target.value)" />
                        <div class="preset-bg-color" v-for="color in bgColors"
                            :style="{ background: color, borderColor: color }"
                            @click="$emit('set-style', 'fillColor', color)"></div>
                    </div>
                </div>
            </div>

            <div class="divider"></div>

            <!-- 形状 -->
            <div class="style-section">
                <div class="section-group-item">
                    <label class="section-label">形状</label>
                    <div class="btn-group">
                        <Dropdown v-model="currentShape" :options="shapeOptions"
                            @change="(item) => $emit('set-style', 'shape', item.value)" />
                    </div>
                </div>

                <!-- 圆角 -->
                <div class="section-group-item" :style="{ opacity: currentShape === 'rectangle' ? 1 : 0 }">
                    <label class="section-label">圆角 </label>
                    <SliderInput v-model="currentBorderRadius" label="" unit="" :min="10" :max="30" :showSlider=false
                        @update:model-value="(val) => $emit('set-style', 'borderRadius', val)" />

                </div>
            </div>

            <div class="style-section">

                <div class="section-group-item">
                    <label class="section-label">颜色</label>
                    <input type="color" class="color-input" :value="currentBorderColor"
                        @input="(e) => $emit('set-style', 'borderColor', e.target.value)" />
                </div>

                <div class="section-group-item">
                    <label class="section-label">宽度</label>
                    <SliderInput v-model="currentBorderWidth" label="" unit="" :min="10" :max="30" :showSlider=false
                        @update:model-value="(val) => $emit('set-style', 'borderWidth', val)" />
                </div>
            </div>
            <div class="divider"></div>
            <div class="style-section">

                <div class="section-group-item">

                    <label class="section-label">节点内边距-垂直 </label>
                    <SliderInput v-model="currentPaddingY" label="" unit="" :min="10" :max="30" :showSlider=false
                        @update:model-value="(val) => $emit('set-style', 'paddingY', val)" />
                </div>

                <div class="section-group-item">

                    <label class="section-label">节点内边距-水平 </label>
                    <SliderInput v-model="currentPaddingX" label="" unit="" :min="10" :max="30" :showSlider=false
                        @update:model-value="(val) => $emit('set-style', 'paddingX', val)" />
                </div>

            </div>

            <div class="style-section">

                <div class="section-group-item">
                    <label class="section-label">节点外边距-垂直 </label>
                    <SliderInput v-model="currentMarginY" label="" unit="" :min="0" :max="80" :showSlider=false
                        @update:model-value="(val) => $emit('set-theme-config', { marginY: Number(val) })" />
                </div>

                <div class="section-group-item">
                    <label class="section-label">节点外边距-水平 </label>
                    <SliderInput v-model="currentMarginX" label="" unit="" :min="0" :max="80" :showSlider=false
                        @update:model-value="(val) => $emit('set-theme-config', { marginX: Number(val) })" />
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import SliderInput from '../SliderInput.vue'
import Dropdown from '../Dropdown.vue'

const props = defineProps({
    activeNodes: {
        type: Array,
        default: () => [],
    },
    themeConfig: {
        type: Object,
        default: () => ({})
    }
})

defineEmits(['set-style', 'set-theme-config'])

const currentColor = computed(() => getStyle('color', '#1a1a2e'))
const currentFontWeight = computed(() => getStyle('fontWeight', 'normal'))

const currentFontFamily = computed(() => getStyle('fontFamily', '微软雅黑, Microsoft YaHei'))
const fontFamilies = [
    { label: '微软雅黑', value: '微软雅黑, Microsoft YaHei' },
    { label: '宋体', value: '宋体, SimSun' },
    { label: '黑体', value: '黑体, SimHei' },
    { label: '楷体', value: '楷体, KaiTi' },
    { label: 'Arial', value: 'Arial' },
]
const currentFontSize = computed(() => getStyle('fontSize', 16))
const fontWeights = [
    { label: '常规', value: 'normal', icon: 'fas fa-font' },
    { label: '加粗', value: 'bold', icon: 'fas fa-bold' },
    { label: '斜体', value: 'italic', icon: 'fas fa-italic' },
    { label: '斜体加粗', value: 'bold italic', icon: 'fas fa-bold fa-italic' },
]

const currentBg = computed(() => getStyle('background', '#ffffff'))
const bgColors = ['#f5f5f5', '#fff3e0', '#e3f2fd', '#e8f5e9', '#fce4ec']

const currentShape = computed(() => getStyle('shape', 'rectangle'))
const shapeOptions = [
    { label: '矩形', value: 'rectangle', svg: '<svg width="60" height="26" style="margin-top: 5px;"><path d="M 4 12 L 4 3 L 56 3 L 56 21 L 4 21 L 4 12 Z" fill="none" stroke="#409eff" stroke-width="2"></path></svg>' },
    { label: '平行四边形', value: 'parallelogram', svg: '<svg width="60" height="26" style="margin-top: 5px;"><path d="M 4 12 L 30 3 L 56 12 L 30 21 L 4 12 Z" fill="none" stroke="#000" stroke-width="2"></path></svg>' },
    { label: '圆角矩形', value: 'roundedRectangle', svg: '<svg width="60" height="26" style="margin-top: 5px;"><path d="M 13 3 L 47 3 A 9 9 0, 0 1 47 21 L 13 21 A 9 9 0, 0 1 13 3 Z" fill="none" stroke="#000" stroke-width="2"></path></svg>' },
    { label: '八角矩形', value: 'octagonalRectangle', svg: '<svg width="60" height="26" style="margin-top: 5px;"><path d="M 4 12 L 4 9 L 10 3 L 50 3 L 56 9 L 56 15 L 50 21 L 10 21 L 4 15 L 4 12 Z" fill="none" stroke="#000" stroke-width="2"></path></svg>' },
    { label: '外三角矩形', value: 'outerTriangularRectangle', svg: '<svg width="60" height="26" style="margin-top: 5px;"><path d="M 4 12 L 10 3 L 50 3 L 56 12 L 50 21 L 10 21 L 4 12 Z" fill="none" stroke="#000" stroke-width="2"></path></svg>' },
    { label: '内三角矩形', value: 'innerTriangularRectangle', svg: '<svg width="60" height="26" style="margin-top: 5px;"><path d="M 10 12 L 4 3 L 56 3 L 50 12 L 56 21 L 4 21 L 10 12 Z" fill="none" stroke="#000" stroke-width="2"></path></svg>' },
    { label: '椭圆', value: 'ellipse', svg: '<svg width="60" height="26" style="margin-top: 5px;"><path d="M 4 12 A 26 9 0, 1, 0 30 3 A 26 9 0, 0, 0 4 12 Z" fill="none" stroke="#000" stroke-width="2"></path></svg>' },
    { label: '圆', value: 'circle', svg: '<svg width="60" height="26" style="margin-top: 5px;"><path d="M 21 12 A 9 9 0, 1, 0 30 3 A 9 9 0, 0, 0 21 12 Z" fill="none" stroke="#000" stroke-width="2"></path></svg>' }
]

const currentBorderRadius = computed(() => getStyle('borderRadius', 5))

const currentBorderColor = computed(() => getStyle('borderColor', '#000'))
const currentBorderWidth = computed(() => getStyle('borderWidth', 1))

const currentPaddingX = computed(() => getStyle('paddingX', 10))
const currentPaddingY = computed(() => getStyle('paddingY', 10))

const currentMarginX = computed(() => {
    const level = getNodeLevel()
    const configKey = level <= 2 ? 'second' : 'node'
    return props.themeConfig?.[configKey]?.marginX ?? 10
})

const currentMarginY = computed(() => {
    const level = getNodeLevel()
    const configKey = level <= 2 ? 'second' : 'node'
    return props.themeConfig?.[configKey]?.marginY ?? 10
})

function getNodeLevel() {
    if (!props.activeNodes.length) return 0
    const node = props.activeNodes[0]
    return node.getLevel ? node.getLevel() : 0
}

function getStyle(key, defaultVal) {
    if (!props.activeNodes.length) return defaultVal
    const node = props.activeNodes[0]
    if (typeof node.getData === 'function') {
        try {
            const val = node.getData(key)
            if (val !== undefined && val !== null) return val
        } catch (e) { /* ignore */ }
    }
    const data = node?.nodeData?.data
    if (data && data[key] !== undefined) return data[key]
    return defaultVal
}

function getThemeConfig(key) {
    if (!props.activeNodes.length) return
    const node = props.activeNodes[0]
    if (typeof node.getData === 'function') {
        try {
            const val = node.getData(key)
            if (val !== undefined && val !== null) return val
        } catch (e) { /* ignore */ }
    }
    const data = node?.nodeData?.data
    if (data && data[key] !== undefined) return data[key]
}



</script>

<style scoped>
.style-panel {
    position: absolute;
    top: 50px;
    right: 0px;
    width: 300px;
    background: rgba(255, 255, 255, 0);
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
    padding: 14px 16px 50px 16px;
    display: flex;
    flex-direction: column;
    gap: 18px;
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

.label-value {
    color: #666;
    font-weight: 600;
    font-size: 13px;
}

/* 颜色行 */
.color-row {
    display: flex;
    align-items: center;
    gap: 10px;
}

.color-input {
    /* width: 100%; */
    height: 30px;
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

/* 滑块 */
.range-input {
    -webkit-appearance: none;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.08);
    outline: none;
    cursor: pointer;
}

.range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    border: 2px solid #4a90d9;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
    transition: box-shadow 0.15s ease;
}

.range-input::-webkit-slider-thumb:hover {
    box-shadow: 0 2px 8px rgba(74, 144, 217, 0.3);
}

.range-input::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    border: 2px solid #4a90d9;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

/* 按钮组 */
.btn-group {
    display: flex;
    gap: 4px;
    flex-direction: column;
}

.btn-group.font-weight-group {
    flex-direction: row;
}

.style-btn {
    flex: 1;
    padding: 6px 0;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 8px;
    background: transparent;
    color: #888;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s ease;
    font-weight: 500;
}

.style-btn:hover {
    background: rgba(0, 0, 0, 0.03);
    color: #555;
    border-color: rgba(0, 0, 0, 0.1);
}

.style-btn.active {
    background: rgba(74, 144, 217, 0.08);
    border-color: rgba(74, 144, 217, 0.25);
    color: #4a90d9;
    font-weight: 600;
}

.font-select {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    background: #fff;
    color: #555;
    font-size: 12px;
    outline: none;
    cursor: pointer;
    transition: border-color 0.15s ease;
}

.font-select:focus {
    border-color: #4a90d9;
}

.section-group {
    display: flex;
    padding: 10px 0;
    gap: 10px;
}

.section-group-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 50%;
}

.divider {
    width: 100%;
    height: 1px;
    background: rgb(0 0 0 / 5%);
    margin: 0 4px;
    flex-shrink: 0;
}

.preset-bg-color {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border-style: dashed;
    border-width: 1px;
    cursor: pointer;
}

.preset-bg-color:hover {
    border-color: rgb(0, 0, 0) !important;
}
</style>
