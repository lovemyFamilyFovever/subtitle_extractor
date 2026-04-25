<template>
  <div class="style-panel" ref="panelRef">
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
            <ColorInput v-model="currentColor" />
          </div>
        </div>

        <div class="section-group-row">
          <div class="btn-group">
            <button class="style-btn" :class="{ active: currentFontWeight !== 'bold' && currentFontStyle !== 'italic' }"
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
              :class="{ active: currentTextDecoration === 'none' || currentTextDecoration === 'unset' }" title="无装饰"
              @click="$emit('set-style', 'textDecoration', 'none')">
              <span>U</span>
            </button>
            <button class="style-btn" :class="{ active: currentTextDecoration === 'underline' }" title="下划线"
              @click="$emit('set-style', 'textDecoration', currentTextDecoration === 'underline' ? 'none' : 'underline')">
              <span style="text-decoration: underline;">U</span>
            </button>
            <button class="style-btn" :class="{ active: currentTextDecoration === 'line-through' }" title="删除线"
              @click="$emit('set-style', 'textDecoration', currentTextDecoration === 'line-through' ? 'none' : 'line-through')">
              <span style="text-decoration: line-through;">U</span>
            </button>
            <button class="style-btn" :class="{ active: currentTextDecoration === 'overline' }" title="上划线"
              @click="$emit('set-style', 'textDecoration', currentTextDecoration === 'overline' ? 'none' : 'overline')">
              <span style="text-decoration: overline;">U</span>
            </button>
          </div>
        </div>

        <div class="section-group-row">
          <label class="section-label">字号</label>
          <SliderInput v-model="currentFontSize" label="" unit="" :min="10" :max="48" :showSlider=false
            @update:model-value="(val) => $emit('set-style', 'fontSize', val)" />

          <div class="btn-group">
            <button class="style-btn" :class="{ active: currentTextAlignment === 'left' }" title="左对齐"
              @click="$emit('set-style', 'textAlign', 'left')">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M3 5H17V6.5H3V5ZM3 9H11V10.5H3V9ZM13 13H3V14.5H13V13Z">
                </path>
              </svg>
            </button>
            <button class="style-btn" :class="{ active: currentTextAlignment === 'center' }" title="居中"
              @click="$emit('set-style', 'textAlign', 'center')">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M3 5H17V6.5H3V5ZM3 9H17V10.5H3V9ZM3 13H17V14.5H3V13Z">
                </path>
              </svg>
            </button>
            <button class="style-btn" :class="{ active: currentTextAlignment === 'right' }" title="右对齐"
              @click="$emit('set-style', 'textAlign', 'right')">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M3 5H17V6.5H3V5ZM3 9H11V10.5H3V9ZM13 13H3V14.5H13V13Z">
                </path>
              </svg>
            </button>
            <button class="style-btn" :class="{ active: currentTextAlignment === 'justify' }" title="两端对齐"
              @click="$emit('set-style', 'textAlign', 'justify')">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M3 5H17V6.5H3V5ZM3 9H17V10.5H3V9ZM3 13H17V14.5H3V13Z">
                </path>
              </svg>
            </button>
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
            <label class="section-label">虚线</label>
            <Dropdown v-model="currentBorderDasharray" :options="dasharrayOptions"
              @change="(item) => $emit('set-style', 'borderDasharray', item.value)" />
          </div>
          <div class="section-group-item">
            <label class="section-label">宽度</label>
            <SliderInput v-model="currentBorderWidth" label="" unit="" :min="1" :max="10" :showSlider=false
              @update:model-value="(val) => $emit('set-style', 'borderWidth', val)" />
          </div>
        </div>

        <div class="section-group-row">
          <div class="section-group-item">
            <label class="section-label">颜色</label>
            <ColorInput v-model="currentBorderColor" />
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="style-section">
        <label class="section-label-title">背景</label>
        <div class="section-group-row">
          <div class="section-group-item">
            <label class="section-label">高度</label>
            <SliderInput v-model="currentPaddingY" label="" unit="" :min="1" :max="500" :show-slider=false
              @update:model-value="(val) => $emit('set-style', 'paddingY', val)" />
          </div>
          <div class="section-group-item">
            <label class="section-label">长度</label>
            <SliderInput v-model="currentPaddingX" label="" unit="" :min="1" :max="500" :show-slider=false
              @update:model-value="(val) => $emit('set-style', 'paddingX', val)" />
          </div>
        </div>
        <div class="section-group-row">
          <div class="section-group-item">
            <label class="section-label">颜色</label>
            <ColorInput v-model="currentBg" />
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

          <div class="section-group-item">
            <label class="section-label">颜色</label>
            <ColorInput v-model="currentLineColor" />
          </div>
        </div>

        <div class="section-group-row">
          <div class="section-group-item">
            <label class="section-label">宽度</label>
            <SliderInput v-model="currentLineWidth" label="" unit="" :min="1" :max="50" :show-slider=false
              @update:model-value="(val) => $emit('set-style', 'lineWidth', val)" />
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="style-section">
        <label class="section-label-title">预设节点风格</label>
        <div class="preset-grid">
          <div v-for="(theme, key) in presetThemes" :key="key" class="preset-btn" @click="handlePresetTheme(key)">
            <span class="preset-swatch" :style="{
              background: theme.fillColor,
              borderColor: theme.borderColor,
              borderRadius: theme.borderRadius + 'px'
            }">
              <span class="preset-swatch-text" :style="{ color: theme.color }">A</span>
            </span>
            <span class="preset-label">{{ themeLabels[key] }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import SliderInput from '../SliderInput.vue'
import Dropdown from '../Dropdown.vue'
import ColorInput from '../ColorInput.vue'
import { useColorConverter } from '@/utils/colorConverter'

const toHexFormat = useColorConverter();

const props = defineProps({
  activeNodes: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['set-style', 'set-styles', 'close'])

// ============================================================
// ★ 核心修复：只提取一次节点样式数据，所有 computed 从中读取
// ============================================================

// 所有需要读取的样式 key 及其默认值
const STYLE_DEFAULTS = {
  fontFamily: '微软雅黑, Microsoft YaHei',
  color: '#333333',
  fontSize: 16,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  textAlign: 'left',
  fillColor: '#ffffff',
  borderRadius: 2,
  borderColor: 'transparent',
  borderWidth: 1,
  shape: 'rectangle',
  borderDasharray: 'none',
  lineDasharray: 'none',
  paddingX: 10,
  paddingY: 10,
  lineColor: '',
  lineWidth: 1,
}

/**
 * 单一数据源：从第一个激活节点中一次性提取所有样式值
 * Vue 的 computed 会自动缓存，只有 activeNodes 变化时才重新计算
 */
const nodeStyles = computed(() => {
  // 无选中节点时返回全部默认值
  if (!props.activeNodes.length) {
    return { ...STYLE_DEFAULTS }
  }

  const node = props.activeNodes[0]
  const result = { ...STYLE_DEFAULTS }

  // 尝试从 node.getStyle() 批量读取
  if (typeof node.getStyle === 'function') {
    for (const key of Object.keys(STYLE_DEFAULTS)) {
      try {
        const val = node.getStyle(key)
        if (val !== undefined && val !== null) {
          result[key] = val
        }
      } catch (e) { /* 该 key 读取失败，保留默认值 */ }
    }
  }

  // 从 nodeData.data 中补充（作为 fallback）
  const data = node?.nodeData?.data
  if (data) {
    for (const key of Object.keys(STYLE_DEFAULTS)) {
      if (data[key] !== undefined && result[key] === STYLE_DEFAULTS[key]) {
        // 仅当 getStyle 没有返回有效值时，才用 data 中的值覆盖
        result[key] = data[key]
      }
    }
  }

  return result
})

/**
 * 便捷取值函数：从已缓存的 nodeStyles 中读取单个值
 * 不再重复遍历节点，只是读取一个 plain object 的属性
 */
function getStyle(key) {
  return nodeStyles.value[key]
}

// ========================== 字体 ==========================

const currentFontFamily = computed({
  get() { return getStyle('fontFamily') },
  set(val) { emit('set-style', 'fontFamily', val) }
})

const fontFamilies = [
  { label: '微软雅黑', value: '微软雅黑, Microsoft YaHei' },
  { label: '宋体', value: '宋体, SimSun' },
  { label: '黑体', value: '黑体, SimHei' },
  { label: '楷体', value: '楷体, KaiTi' },
  { label: 'Arial', value: 'Arial' },
]

const currentColor = computed({
  get() { return toHexFormat(getStyle('color')) },
  set(val) { emit('set-style', 'color', val) }
})

const currentFontSize = computed({
  get() { return getStyle('fontSize') },
  set(val) { emit('set-style', 'fontSize', val) }
})

const currentFontWeight = computed(() => getStyle('fontWeight'))

const currentFontStyle = computed(() => getStyle('fontStyle'))

const currentTextDecoration = computed(() => getStyle('textDecoration'))

const currentTextAlignment = computed(() => getStyle('textAlign'))

function handleNormalClick() {
  emit('set-style', 'fontWeight', 'normal')
  emit('set-style', 'fontStyle', 'normal')
}

// ========================== 背景颜色 ==========================

const currentBg = computed({
  get() { return toHexFormat(getStyle('fillColor')) },
  set(val) { emit('set-style', 'fillColor', val) }
})

// ========================== 边框 ==========================

const currentBorderRadius = computed({
  get() { return getStyle('borderRadius') },
  set(val) { emit('set-style', 'borderRadius', val) }
})

const currentBorderColor = computed({
  get() {
    const val = getStyle('borderColor')
    return val === 'transparent' ? '#ffffff' : val
  },
  set(val) { emit('set-style', 'borderColor', val) }
})

const currentBorderWidth = computed({
  get() { return getStyle('borderWidth') },
  set(val) { emit('set-style', 'borderWidth', val) }
})

const currentShape = computed(() => getStyle('shape'))

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

const currentBorderDasharray = computed(() => getStyle('borderDasharray'))

// ========================== 节点连线 ==========================

const currentLineDasharray = computed(() => getStyle('lineDasharray'))
const currentLineWidth = computed({
  get() { return getStyle('lineWidth') },
  set(val) { emit('set-style', 'lineWidth', val) }
})
const currentLineColor = computed({
  get() {
    const val = getStyle('lineColor')
    return val ? toHexFormat(val) : ''
  },
  set(val) { emit('set-style', 'lineColor', val) }
})


// ========================== 宽高 ==========================

const currentPaddingX = computed({
  get() { return getStyle('paddingX') },
  set(val) { emit('set-style', 'paddingX', val) }
})

const currentPaddingY = computed({
  get() { return getStyle('paddingY') },
  set(val) { emit('set-style', 'paddingY', val) }
})

// ========================== 虚线选项 ==========================

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

// ========================== 预设风格 ==========================

const presetThemes = {
  default: {
    fontFamily: '微软雅黑, Microsoft YaHei', color: '#334155', fontSize: 14,
    fillColor: '#ffffff', borderColor: '#e2e8f0', borderWidth: 1,
    shape: 'rectangle', borderDasharray: 'none', lineDasharray: 'none', paddingX: 12, paddingY: 8,
  },
  blue: {
    fontFamily: '微软雅黑, Microsoft YaHei', color: '#1e3a5f', fontSize: 14,
    fillColor: '#eff6ff', borderColor: '#93c5fd', borderWidth: 1,
    shape: 'rectangle', borderDasharray: 'none', lineDasharray: 'none', paddingX: 14, paddingY: 10,
  },
  red: {
    fontFamily: '微软雅黑, Microsoft YaHei', color: '#881337', fontSize: 14,
    fillColor: '#fff1f2', borderColor: '#fda4af', borderWidth: 1,
    shape: 'rectangle', borderDasharray: 'none', lineDasharray: 'none', paddingX: 14, paddingY: 10,
  },
  green: {
    fontFamily: '微软雅黑, Microsoft YaHei', color: '#065f46', fontSize: 14,
    fillColor: '#ecfdf5', borderColor: '#6ee7b7', borderWidth: 1,
    shape: 'rectangle', borderDasharray: 'none', lineDasharray: 'none', paddingX: 14, paddingY: 10,
  },
  light: {
    fontFamily: '微软雅黑, Microsoft YaHei', color: '#581c87', fontSize: 14,
    fillColor: '#faf5ff', borderColor: '#d8b4fe', borderWidth: 1,
    shape: 'rectangle', borderDasharray: 'none', lineDasharray: 'none', paddingX: 16, paddingY: 12,
  },
  dark: {
    fontFamily: '微软雅黑, Microsoft YaHei', color: '#e2e8f0', fontSize: 14,
    fillColor: '#1e293b', borderColor: '#475569', borderWidth: 1,
    shape: 'roundedRectangle', borderRadius: 3,
    borderDasharray: 'none', lineDasharray: 'none', paddingX: 12, paddingY: 8,
  },
}

const themeLabels = {
  default: '经典白', blue: '靛蓝', red: '玫红',
  green: '翡翠', light: '梦幻紫', dark: '石墨灰',
}

function handlePresetTheme(themeName) {
  emit('set-styles', presetThemes[themeName])
}

// ========================== 点击外部关闭 ==========================

const panelRef = ref(null)

function handleOutsideClick(e) {
  if (panelRef.value && panelRef.value.contains(e.target)) return
  if (e.target.closest('.color-dropdown-panel')) return
  emit('close')
}

onMounted(() => {
  setTimeout(() => {
    document.addEventListener('mousedown', handleOutsideClick)
  }, 100)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
})
</script>

<style src="@/styles/mindmap.css" scoped></style>
