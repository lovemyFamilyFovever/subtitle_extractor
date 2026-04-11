<template>
    <div class="style-panel">
        <div class="panel-header">
            <span class="panel-title">节点样式</span>
            <span class="panel-badge">{{ activeNodes.length }} 个节点</span>
        </div>

        <div class="panel-body">

            <!-- 字体 -->
            <div class="style-section">
                <label class="section-label">字体</label>
                <div class="btn-group font-group">
                    <select class="font-select" :value="currentFontFamily"
                        @change="$emit('set-style', 'fontFamily', $event.target.value)">
                        <option value="default">默认</option>
                        <option value="微软雅黑, Microsoft YaHei">微软雅黑</option>
                        <option value="宋体, SimSun">宋体</option>
                        <option value="黑体, SimHei">黑体</option>
                        <option value="楷体, KaiTi">楷体</option>
                        <option value="Arial">Arial</option>
                        <option value="PingFang SC">苹方</option>
                        <option value="Georgia">Georgia</option>
                    </select>
                </div>
            </div>

            <!-- 文字颜色 -->
            <div class="style-section">
                <label class="section-label">文字颜色</label>
                <div class="color-row">
                    <input type="color" class="color-input" :value="currentColor"
                        @input="(e) => $emit('set-style', 'color', e.target.value)" />
                    <div class="preset-colors">
                        <button v-for="c in textColors" :key="c" class="preset-dot"
                            :class="{ active: currentColor === c }" :style="{ background: c }"
                            @click="$emit('set-style', 'color', c)" />
                    </div>
                </div>
            </div>

            <!-- 背景颜色 -->
            <div class="style-section">
                <label class="section-label">背景颜色</label>
                <div class="color-row">
                    <input type="color" class="color-input" :value="currentBg"
                        @input="(e) => $emit('set-style', 'background', e.target.value)" />
                    <div class="preset-colors">
                        <button v-for="c in bgColors" :key="c" class="preset-dot" :class="{ active: currentBg === c }"
                            :style="{ background: c }" @click="$emit('set-style', 'background', c)" />
                        <button class="preset-dot preset-dot--none" title="透明"
                            @click="$emit('set-style', 'background', 'transparent')" />
                    </div>
                </div>
            </div>

            <!-- 字体大小 -->
            <div class="style-section">
                <label class="section-label">字号 <span class="label-value">{{ currentFontSize }}px</span></label>
                <input type="range" class="range-input" min="12" max="48" :value="currentFontSize"
                    @input="(e) => $emit('set-style', 'fontSize', parseInt(e.target.value))" />
            </div>

            <!-- 字重 -->
            <div class="style-section">
                <label class="section-label">字重</label>
                <div class="btn-group">
                    <button v-for="w in fontWeights" :key="w.value" class="style-btn"
                        :class="{ active: currentFontWeight === w.value }"
                        @click="$emit('set-style', 'fontWeight', w.value)">
                        {{ w.label }}
                    </button>
                </div>
            </div>

            <!-- 形状 -->
            <div class="style-section">
                <label class="section-label">形状</label>
                <div class="btn-group">
                    <button v-for="s in shapeOptions" :key="s.value" class="style-btn"
                        :class="{ active: currentShape === s.value }" @click="$emit('set-style', 'shape', s.value)">
                        {{ s.label }}
                    </button>
                </div>
            </div>

            <!-- 圆角 -->
            <div class="style-section">
                <label class="section-label">圆角 <span class="label-value">{{ currentBorderRadius }}px</span></label>
                <input type="range" class="range-input" min="0" max="30" :value="currentBorderRadius"
                    @input="(e) => $emit('set-style', 'borderRadius', parseInt(e.target.value))" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    activeNodes: {
        type: Array,
        default: () => [],
    },
})

defineEmits(['set-style'])

const textColors = ['#1a1a2e', '#333333', '#555555', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#e67e22']
const bgColors = ['#ffffff', '#f5f5f5', '#fff3e0', '#e3f2fd', '#e8f5e9', '#fce4ec', '#f3e5f5', '#fff8e1']

const fontWeights = [
    { label: '常规', value: 'normal' },
    { label: '加粗', value: 'bold' },
]

const shapeOptions = [
    { label: '矩形', value: '' },
    { label: '圆角', value: 'roundedRectangle' },
    { label: '椭圆', value: 'ellipse' },
]

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

const currentColor = computed(() => getStyle('color', '#1a1a2e'))
const currentBg = computed(() => getStyle('background', '#ffffff'))
const currentFontSize = computed(() => getStyle('fontSize', 16))
const currentFontWeight = computed(() => getStyle('fontWeight', 'normal'))
const currentShape = computed(() => getStyle('shape', ''))
const currentBorderRadius = computed(() => getStyle('borderRadius', 5))
const currentFontFamily = computed(() => getStyle('fontFamily', 'default'))
</script>

<style scoped>
.style-panel {
    position: absolute;
    top: 16px;
    right: 16px;
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
    overflow: hidden;
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
    gap: 30px;
}

.style-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.section-label {
    font-size: 13px;
    color: #0e0202;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
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
    width: 30px;
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

.preset-colors {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
}

.preset-dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: all 0.15s ease;
    padding: 0;
    position: relative;
}

.preset-dot:hover {
    transform: scale(1.2);
    border-color: rgba(0, 0, 0, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.preset-dot.active {
    border-color: #4a90d9;
    box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.2);
}

.preset-dot--none {
    background: #fff !important;
    position: relative;
}

.preset-dot--none::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 3px;
    right: 3px;
    height: 1.5px;
    background: #e74c3c;
    transform: rotate(-45deg);
    border-radius: 1px;
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

.font-group {
  flex-direction: column;
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


</style>
