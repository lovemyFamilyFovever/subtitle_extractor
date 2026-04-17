<template>
    <div class="style-panel">
        <div class="panel-header">
            <span class="panel-title">📦 节点样式</span>
            <span class="panel-badge">{{ activeNodes.length }} 个节点</span>
        </div>

        <div class="panel-body customScrollbar">

            <!-- 字体 -->
            <div class="style-section">

                <label class="section-label-title">字体</label>

                <div class="section-group-row">

                    <div class="section-group-item">
                        <Dropdown v-model="currentFontFamily" :options="fontFamilies"
                            @change="(item) => { $emit('set-style', 'fontFamily', item.value) }" />
                    </div>

                    <div class="section-group-item">
                        <input type="color" class="color-input" :value="currentColor"
                            @input="(e) => $emit('set-style', 'color', e.target.value)" />

                        <SliderInput v-model="currentFontSize" label="" unit="" :min="10" :max="48" :showSlider=false
                            @update:model-value="(val) => $emit('set-style', 'fontSize', val)" />
                    </div>
                </div>

                <div class="section-group-row">

                    <div class="btn-group">

                        <button class="style-btn"
                            :class="{ active: currentFontWeight !== 'bold' && currentFontStyle !== 'italic' }"
                            title="正常" @click="handleNormalClick">
                            <span>A</span>
                        </button>

                        <button class="style-btn" :class="{ active: currentFontWeight === 'bold' }" title="粗体"
                            @click="$emit('set-style', 'fontWeight', currentFontWeight === 'bold' ? 'normal' : 'bold')">
                            <span style="font-weight: bold;">B</span>
                        </button>

                        <button class="style-btn" :class="{ active: currentFontStyle === 'italic' }" title="斜体"
                            @click="$emit('set-style', 'fontStyle', currentFontStyle === 'italic' ? 'normal' : 'italic')">
                            <span style="font-style: italic;">I</span>
                        </button>

                        <button class="style-btn"
                            :class="{ active: currentTextDecoration === 'none' || currentTextDecoration === 'unset' }"
                            title="无装饰" @click="$emit('set-style', 'textDecoration', 'none')">
                            <span>U</span>
                        </button>

                        <button class="style-btn" :class="{ active: currentTextDecoration === 'underline' }" title="下划线"
                            @click="$emit('set-style', 'textDecoration', currentTextDecoration === 'underline' ? 'none' : 'underline')">
                            <span style="text-decoration: underline;">U</span>
                        </button>

                        <button class="style-btn" :class="{ active: currentTextDecoration === 'line-through' }"
                            title="删除线"
                            @click="$emit('set-style', 'textDecoration', currentTextDecoration === 'line-through' ? 'none' : 'line-through')">
                            <span style="text-decoration: line-through;">U</span>
                        </button>

                        <button class="style-btn" :class="{ active: currentTextDecoration === 'overline' }" title="上划线"
                            @click="$emit('set-style', 'textDecoration', currentTextDecoration === 'overline' ? 'none' : 'overline')">
                            <span style="text-decoration: overline;">U</span>
                        </button>

                    </div>

                </div>

            </div>

            <div class="divider"></div>

            <!-- 背景颜色 -->
            <div class="style-section">

                <label class="section-label-title">背景</label>

                <div class="section-group-row">

                    <div class="section-group-item">

                        <input type="color" class="color-input" :value="currentBg"
                            @input="(e) => $emit('set-style', 'fillColor', e.target.value)" />
                        <div class="preset-bg-color" v-for="color in bgColors"
                            :style="{ background: color, borderColor: 'rgb(63 63 63 / 21%)' }"
                            @click="$emit('set-style', 'fillColor', color)"></div>
                    </div>
                </div>
            </div>

            <div class="divider"></div>

            <div class="style-section">
                <label class="section-label-title">边框</label>
                <div class="section-group-row">

                    <div class="section-group-item">
                        <label class="section-label">形状</label>
                        <Dropdown v-model="currentShape" :options="shapeOptions"
                            @change="(item) => $emit('set-style', 'shape', item.value)" />
                    </div>

                    <div class="section-group-item" :style="{
                        'opacity': currentShape === 'rectangle' ? 1 : 0,
                        'pointer-events': currentShape === 'rectangle' ? 'auto' : 'none',
                    }">
                        <label class="section-label">圆角</label>
                        <SliderInput v-model="currentBorderRadius" label="" unit="" :min="0" :max="20" :showSlider=false
                            @update:model-value="(val) => $emit('set-style', 'borderRadius', val)" />
                    </div>

                </div>

                <div class="section-group-row">

                    <div class="section-group-item">
                        <label class="section-label">颜色</label>
                        <div class="color-row">
                            <input type="color" class="color-input" :value="currentBorderColorForInput"
                                @input="(e) => $emit('set-style', 'borderColor', e.target.value)" />
                            <button class="transparent-btn" :class="{ active: currentBorderColor === 'transparent' }"
                                title="透明" @click="$emit('set-style', 'borderColor', 'transparent')">
                                <svg width="16" height="16" viewBox="0 0 16 16">
                                    <line x1="2" y1="2" x2="14" y2="14" stroke="#e74c3c" stroke-width="2" />
                                    <line x1="14" y1="2" x2="2" y2="14" stroke="#e74c3c" stroke-width="2" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="section-group-item">
                        <label class="section-label">宽度</label>
                        <SliderInput v-model="currentBorderWidth" label="" unit="" :min="1" :max="10" :showSlider=false
                            @update:model-value="(val) => $emit('set-style', 'borderWidth', val)" />
                    </div>
                </div>

                <div class="section-group-row">

                    <div class="section-group-item">
                        <label class="section-label">虚线</label>
                        <Dropdown v-model="currentBorderDasharray" :options="dasharrayOptions"
                            @change="(item) => $emit('set-style', 'borderDasharray', item.value)" />
                    </div>
                </div>
            </div>

            <div class="divider"></div>

            <div class="style-section">
                <label class="section-label-title">节点连线</label>
                <div class="section-group-row">

                    <div class="section-group-item">
                        <label class="section-label">类型</label>
                        <Dropdown v-model="currentLineDasharray" :options="dasharrayOptions"
                            @change="(item) => $emit('set-style', 'lineDasharray', item.value)" />
                    </div>
                </div>
            </div>

            <div class="divider"></div>

            <!-- 节点内边距 -->
            <div class="style-section">

                <label class="section-label-title">节点内边距</label>

                <div class="section-group-row">

                    <div class="section-group-item">
                        <label class="section-label">垂直</label>
                        <SliderInput v-model="currentPaddingY" label="" unit="" :min="10" :max="80" :showSlider=false
                            @update:model-value="(val) => $emit('set-style', 'paddingY', val)" />
                    </div>

                    <div class="section-group-item">
                        <label class="section-label">水平</label>
                        <SliderInput v-model="currentPaddingX" label="" unit="" :min="10" :max="80" :showSlider=false
                            @update:model-value="(val) => $emit('set-style', 'paddingX', val)" />
                    </div>
                </div>
            </div>

            <div class="divider"></div>

            <div class="style-section">

                <label class="section-label-title">预设主题风格</label>

                <div class="section-group-row">
                    <button class="preset-btn default" @click="handlePresetTheme('default')"><span>默认</span></button>
                    <button class="preset-btn blue" @click="handlePresetTheme('blue')"><span>蓝色系</span></button>
                    <button class="preset-btn red" @click="handlePresetTheme('red')"><span>红色系</span></button>
                </div>

                <div class="section-group-row">
                    <button class="preset-btn green" @click="handlePresetTheme('green')"><span>绿色系</span></button>
                    <button class="preset-btn light" @click="handlePresetTheme('light')"><span>浅色系</span></button>
                    <button class="preset-btn dark" @click="handlePresetTheme('dark')"><span>深色系</span></button>
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
})

const emit = defineEmits(['set-style', 'set-styles', 'set-theme-config'])


// ========================== 字体 ==========================
const currentFontFamily = computed(() => getNodeStyle('fontFamily', '微软雅黑, Microsoft YaHei'))
const fontFamilies = [
    { label: '微软雅黑', value: '微软雅黑, Microsoft YaHei' },
    { label: '宋体', value: '宋体, SimSun' },
    { label: '黑体', value: '黑体, SimHei' },
    { label: '楷体', value: '楷体, KaiTi' },
    { label: 'Arial', value: 'Arial' },
]

const currentColor = computed(() => getNodeStyle('color', '#1a1a2e'))

const currentFontSize = computed(() => getNodeStyle('fontSize', 16))

const currentFontWeight = computed(() => getNodeStyle('fontWeight', 'normal'))

const currentFontStyle = computed(() => getNodeStyle('fontStyle', 'normal'))

const currentTextDecoration = computed(() => getNodeStyle('textDecoration', 'none'))

function handleNormalClick() {
    emit('set-style', 'fontWeight', 'normal')
    emit('set-style', 'fontStyle', 'normal')
}

// ========================== 背景颜色 ==========================
const bgColors = ['#f5f5f5', '#fff3e0', '#e3f2fd', '#e8f5e9', '#fce4ec']
const currentBg = computed(() => getNodeStyle('fillColor', '#ffffff'))

// ========================== 边框 ==========================
const currentBorderRadius = computed(() => getNodeStyle('borderRadius', 5))
const currentBorderColor = computed(() => getNodeStyle('borderColor', 'transparent'))

const currentBorderColorForInput = computed(() => {
    const val = currentBorderColor.value
    if (val === 'transparent') return '#ffffff'
    return val
})

const currentBorderWidth = computed(() => getNodeStyle('borderWidth', 1))
const currentShape = computed(() => getNodeStyle('shape', 'rectangle'))
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

const currentBorderDasharray = computed(() => getNodeStyle('borderDasharray', 'none'))

// ========================== 节点连线 ==========================
const currentLineDasharray = computed(() => getNodeStyle('lineDasharray', 'none'))

const currentPaddingX = computed(() => getNodeStyle('paddingX', 10))
const currentPaddingY = computed(() => getNodeStyle('paddingY', 10))

// 修复：删除了错误的图片 section（emit 名称错误 + getTheme 函数错误）
// 图片宽高属于主题级配置，应在 BaseStylePanel 中设置

function getNodeStyle(key, defaultVal) {
    if (!props.activeNodes.length) return defaultVal
    const node = props.activeNodes[0]
    if (typeof node.getStyle === 'function') {
        try {
            const val = node.getStyle(key)
            if (val !== undefined && val !== null) return val
        } catch (e) { /* ignore */ }
    }
    const data = node?.nodeData?.data
    if (data && data[key] !== undefined) return data[key]
    return defaultVal
}

const dasharrayOptions = [
    { label: '无', value: 'none', svg: generateDashSvg('none') },
    { label: '虚线', value: '5,5', svg: generateDashSvg('5,5') },
    { label: '点划线', value: '10,5,2,5', svg: generateDashSvg('10,5,2,5') },
    { label: '点线', value: '3,5', svg: generateDashSvg('3,5') },
    { label: '实线', value: '0,0', svg: generateDashSvg('0,0') }
]

function generateDashSvg(dashArray, color = '#333', width = 60, height = 20) {
    const dashValue = dashArray === '0,0' || dashArray === 'none' ? 'none' : dashArray
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
                <rect width="${width}" height="${height}" fill="#f5f5f5" rx="3"/>
                <line x1="10" y1="${height / 2}" x2="${width - 10}" y2="${height / 2}"
                      stroke="${color}" stroke-width="2" stroke-dasharray="${dashValue}" />
            </svg>`
}

const presetThemes = {
    default: {
        fontFamily: '微软雅黑, Microsoft YaHei',
        color: '#1a1a2e',
        fontSize: 16,
        fillColor: '#ffffff',
        borderColor: 'transparent',
        borderWidth: 1,
        shape: 'rectangle',
        borderRadius: 5,
        borderDasharray: 'none',
        lineDasharray: 'none',
        paddingX: 10,
        paddingY: 10,
    },
    blue: {
        fillColor: '#e3f2fd',
        color: '#0d47a1',
    },
    red: {
        fillColor: '#ffebee',
        color: '#b71c1c',
    },
    green: {
        fillColor: '#e8f5e9',
        color: '#1b5e20',
    },
    light: {
        fillColor: '#fce4ec',
        color: '#880e4f',
    },
    dark: {
        fillColor: '#000',
        color: '#fff',
    }
}

function handlePresetTheme(themeName) {
    emit('set-styles', presetThemes[themeName])
    return

}





</script>

<style src="@/styles/mindmap.css" scoped></style>
