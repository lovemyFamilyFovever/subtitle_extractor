<template>
    <div class="style-panel" ref="panelRef">
        <div class="panel-header">
            <span class="panel-title">🎨 基础样式</span>
        </div>
        <div class="panel-body customScrollbar">

            <div class="style-section">
                <label class="section-label-title">主题颜色</label>
                <Dropdown v-model="currentNodeColorList" :options="nodeColorList" />
            </div>

            <div class="divider"></div>

            <div class="style-section">
                <label class="section-label-title">背景</label>
                <div class="preset-bg-types">
                    <div class="preset-select-bg" v-for="(bgType, index) in presetBG"
                        :class="{ active: currentBackgroundIndex === index }" @click="handleBgTypeChange(index)">
                        <span v-html="bgType.svg"></span>
                        <span>{{ bgType.label }}</span>
                    </div>
                </div>
                <!-- 纯色 -->
                <div class="pure-color-section" v-if="currentBackgroundIndex === 0">
                    <div class="section-group-row">
                        <div class="section-group-item">
                            <label class="section-label">颜色</label>
                            <ColorInput v-model="localBackgroundColor" />
                        </div>
                    </div>
                </div>
                <!-- 渐变 -->
                <div class="section-group-row presetGradientBtns" v-if="currentBackgroundIndex === 1">
                    <button class="preset-btn" v-for="gradient in gradientArrays" :key="gradient"
                        :style="{ backgroundImage: gradient }" @click="handleGradientClick(gradient)"></button>
                </div>
                <!-- 网格 -->
                <div class="section-group-row" v-if="currentBackgroundIndex === 2">
                    <div class="section-group-item">
                        <label class="section-label">网格线宽</label>
                        <SliderInput v-model="currentGridSize" label="" unit="" :min="2" :max="80"
                            :showSlider="false" />
                    </div>
                    <div class="section-group-item">
                        <label class="section-label">网格颜色</label>
                        <ColorInput v-model="currentGridColor" />
                    </div>

                </div>
                <!-- 图片 -->
                <div class="section-group-column" v-if="currentBackgroundIndex === 3">
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
                        <ColorInput v-model="localLineColor" />
                    </div>
                    <div class="section-group-item">
                        <label class="section-label">线宽</label>
                        <SliderInput v-model="localLineWidth" label="" unit="" :min="1" :max="10" :showSlider="false" />
                    </div>
                </div>
                <div class="section-group-row">
                    <div class="section-group-item">
                        <label class="section-label">风格</label>
                        <Dropdown v-model="localLineStyle" :options="lineStyleOptions" />
                    </div>
                    <div class="section-group-item">
                        <label class="section-label">箭头</label>
                        <div class="toggle-row">
                            <label class="toggle-switch">
                                <input type="checkbox" v-model="localShowLineMarker">
                                <span class="toggle-slider">{{ localShowLineMarker ? '开启' : '关闭' }}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="divider"></div>

            <div class="style-section">
                <div class="section-label-title">关联线设置</div>
                <div class="section-group-row">
                    <div class="section-group-item">
                        <label class="section-label">线条</label>
                        <ColorInput v-model="assocLineColorLocal" />
                    </div>
                    <div class="section-group-item">
                        <label class="section-label">字号</label>
                        <SliderInput v-model="assocTextFontSizeLocal" label="" unit="" :min="10" :max="32"
                            :showSlider="false" />
                    </div>
                </div>
                <div class="section-group-row">
                    <div class="section-group-item">
                        <label class="section-label">文字</label>
                        <ColorInput v-model="assocTextColorLocal" />
                    </div>
                    <div class="section-group-item">

                        <label class="section-label">线宽</label>
                        <SliderInput v-model="assocLineWidthLocal" label="" unit="" :min="1" :max="10"
                            :showSlider="false" />
                    </div>
                </div>
                <div class="section-group-row">
                    <div class="section-group-item">
                        <label class="section-label">字体</label>
                        <Dropdown v-model="assocTextFontFamilyLocal" :options="fontFamilyOptions" />
                    </div>
                </div>

            </div>

            <div class="divider"></div>
            <div class="style-section">
                <label class="section-label-title">节点外边距</label>
                <div class="section-group-row">
                    <label class="section-label">二级水平间距</label>
                    <SliderInput v-model="secondMarginXLocal" label="" unit="" :min="20" :max="200" />
                </div>
                <div class="section-group-row">
                    <label class="section-label">二级垂直间距</label>
                    <SliderInput v-model="secondMarginYLocal" label="" unit="" :min="20" :max="200" />
                </div>
                <div class="section-group-row">
                    <label class="section-label">三级水平间距</label>
                    <SliderInput v-model="nodeMarginXLocal" label="" unit="" :min="20" :max="200" />
                </div>
                <div class="section-group-row">
                    <label class="section-label">三级垂直间距</label>
                    <SliderInput v-model="nodeMarginYLocal" label="" unit="" :min="0" :max="200" />
                </div>
            </div>


        </div>
    </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import SliderInput from '../SliderInput.vue'
import Dropdown from '../Dropdown.vue'
import ColorInput from '../ColorInput.vue'
import { useColorConverter } from '@/utils/colorConverter.js'
import nodeColorList from '@/utils/nodeColorList.js'

const toHexFormat = useColorConverter();

const emit = defineEmits([
    'close',
    'set-theme-config',
    'set-custom-background',
    'setCurrentNodeColorList'
])

const props = defineProps({
    getThemeConfig: {
        type: Function,
        required: true
    },
    getCustomBackground: {
        type: Function,
        required: true
    },
    getCurrentNodeColorList: {
        type: Function,
        required: true
    }
})

// ==================== 状态变量 ====================
// 背景
const currentBackgroundIndex = ref(0)
const localBackgroundColor = ref('#ffffff')

// 网格
const currentGridSize = ref(20)
const currentGridColor = ref('#e5e5e5')

// 图片
const sourceImage = ref(null)
const isDragOver = ref(false)
const fileInput = ref(null)

// 连线
const localLineColor = ref('#4A90E2')
const localLineWidth = ref(1)
const localLineStyle = ref('straight')
const localShowLineMarker = ref(false)

// 节点外边距
const secondMarginXLocal = ref(100)
const secondMarginYLocal = ref(40)
const nodeMarginXLocal = ref(50)
const nodeMarginYLocal = ref(0)

// 关联线
const assocLineColorLocal = ref('#333333')
const assocLineWidthLocal = ref(2)
const assocTextColorLocal = ref('#333333')
const assocTextFontSizeLocal = ref(14)
const assocTextFontFamilyLocal = ref('微软雅黑, Microsoft YaHei')

//颜色主题
const currentNodeColorList = ref('default')


// ==================== 工具函数 ====================
const generateGridBackground = (size, color) => {
    const safeColor = color.replace('#', '%23')
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'%3E%3Crect width='${size}' height='${size}' fill='none'/%3E%3Cpath d='M ${size} 0 L 0 0 0 ${size}' fill='none' stroke='${safeColor}' stroke-width='1'/%3E%3C/svg%3E")`
}

// ==================== 配置同步函数 ====================
const syncBackgroundConfig = () => {
    const bg = props.getCustomBackground()
    if (!bg) return

    switch (bg.type) {
        case 'pure':
            currentBackgroundIndex.value = 0
            localBackgroundColor.value = bg.backgroundColor || '#ffffff'
            break
        case 'gradient':
            currentBackgroundIndex.value = 1
            break
        case 'grid':
            currentBackgroundIndex.value = 2
            if (bg.backgroundSize) {
                const match = bg.backgroundSize.match(/(\d+)px/)
                if (match) currentGridSize.value = parseInt(match[1])
            }
            if (bg.backgroundImage) {
                // 从 SVG 数据中提取 stroke 颜色值
                const colorMatch = bg.backgroundImage.match(/stroke=["']([^"']+)["']/)
                if (colorMatch && colorMatch[1]) {
                    currentGridColor.value = decodeURIComponent(colorMatch[1])
                } else {
                    currentGridColor.value = '#e5e5e5'
                }
            }
            break
        case 'image':
            currentBackgroundIndex.value = 3
            if (bg.backgroundImage) {
                // 从backgroundImage中提取base64数据
                const match = bg.backgroundImage.match(/url(["']?(data:image\/.*?;base64,.*?)["']?)/)
                if (match && match[1]) {
                    const base64 = match[1]
                    sourceImage.value = {
                        url: base64,
                        name: '已设置背景图',
                        // 可以添加更多属性如果需要
                    }
                } else {
                    // 如果是旧的blob URL格式，可能无法恢复，需要提示用户重新上传
                    console.warn('无法恢复图片，可能是旧的blob URL格式')
                    sourceImage.value = null
                }
            }
            break
    }
}

const syncCurrentNodeColorList = () => {
    //节点颜色主题设置
    currentNodeColorList.value = props.getCurrentNodeColorList()
}

const syncThemeConfig = () => {
    // 修复：正确调用父组件的getThemeConfig函数
    const config = props.getThemeConfig() || {}

    // 连线配置
    // if (config.lineColor) localLineColor.value = config.lineColor
    if (config.lineColor) localLineColor.value = toHexFormat(config.lineColor)
    if (config.lineWidth) localLineWidth.value = config.lineWidth
    if (config.lineStyle) localLineStyle.value = config.lineStyle
    if (config.showLineMarker !== undefined) localShowLineMarker.value = config.showLineMarker

    // 节点间距配置
    if (config.second) {
        secondMarginXLocal.value = config.second.marginX !== undefined ? config.second.marginX : 100
        secondMarginYLocal.value = config.second.marginY !== undefined ? config.second.marginY : 40
    }
    if (config.node) {
        nodeMarginXLocal.value = config.node.marginX !== undefined ? config.node.marginX : 50
        nodeMarginYLocal.value = config.node.marginY !== undefined ? config.node.marginY : 0
    }

    // 关联线配置
    if (config.associativeLineColor) assocLineColorLocal.value = toHexFormat(config.associativeLineColor)
    if (config.associativeLineWidth) assocLineWidthLocal.value = config.associativeLineWidth
    if (config.associativeLineTextColor) assocTextColorLocal.value = toHexFormat(config.associativeLineTextColor)
    if (config.associativeLineTextFontSize) assocTextFontSizeLocal.value = config.associativeLineTextFontSize
    if (config.associativeLineTextFontFamily) assocTextFontFamilyLocal.value = config.associativeLineTextFontFamily


}

// ==================== 初始化 ====================
onMounted(() => {
    // 1. 同步配置
    syncBackgroundConfig()
    syncCurrentNodeColorList()
    syncThemeConfig()

    // 2. 设置监听（使用 flush: 'post' 避免初始化触发）
    setupWatchers()

    // 3. 绑定点击外部关闭事件
    setTimeout(() => {
        document.addEventListener('mousedown', handleOutsideClick)
    }, 100)
})

// ==================== 监听设置 ====================
const setupWatchers = () => {
    // 背景相关监听
    watch(localBackgroundColor, (newVal) => {
        if (currentBackgroundIndex.value === 0) {
            emit('set-custom-background', {
                type: 'pure',
                backgroundColor: newVal
            })
        }
    }, { flush: 'post' })

    watch(currentGridSize, (newVal) => {
        if (currentBackgroundIndex.value === 2) {
            applyGridBackground()
        }
    }, { flush: 'post' })

    watch(currentGridColor, (newVal) => {
        if (currentBackgroundIndex.value === 2) {
            applyGridBackground()
        }
    }, { flush: 'post' })

    // 连线配置监听
    watch(localLineColor, (newVal) => {
        emit('set-theme-config', 'lineColor', newVal)
    }, { flush: 'post' })

    watch(localLineWidth, (newVal) => {
        emit('set-theme-config', 'lineWidth', newVal)
    }, { flush: 'post' })

    watch(localLineStyle, (newVal) => {
        emit('set-theme-config', 'lineStyle', newVal)
    }, { flush: 'post' })

    watch(localShowLineMarker, (newVal) => {
        emit('set-theme-config', 'showLineMarker', newVal)
    }, { flush: 'post' })

    // 节点间距监听
    watch(secondMarginXLocal, (newVal) => {
        const parent = props.getThemeConfig()?.second || {}
        emit('set-theme-config', 'second', { ...parent, marginX: newVal })
    }, { flush: 'post' })

    watch(secondMarginYLocal, (newVal) => {
        const parent = props.getThemeConfig()?.second || {}
        emit('set-theme-config', 'second', { ...parent, marginY: newVal })
    }, { flush: 'post' })

    watch(nodeMarginXLocal, (newVal) => {
        const parent = props.getThemeConfig()?.node || {}
        emit('set-theme-config', 'node', { ...parent, marginX: newVal })
    }, { flush: 'post' })

    watch(nodeMarginYLocal, (newVal) => {
        const parent = props.getThemeConfig()?.node || {}
        emit('set-theme-config', 'node', { ...parent, marginY: newVal })
    }, { flush: 'post' })

    // 关联线配置监听
    watch(assocLineColorLocal, (newVal) => {
        emit('set-theme-config', 'associativeLineColor', newVal)
    }, { flush: 'post' })

    watch(assocLineWidthLocal, (newVal) => {
        emit('set-theme-config', 'associativeLineWidth', newVal)
    }, { flush: 'post' })

    watch(assocTextColorLocal, (newVal) => {
        emit('set-theme-config', 'associativeLineTextColor', newVal)
    }, { flush: 'post' })

    watch(assocTextFontSizeLocal, (newVal) => {
        emit('set-theme-config', 'associativeLineTextFontSize', newVal)
    }, { flush: 'post' })

    watch(assocTextFontFamilyLocal, (newVal) => {
        emit('set-theme-config', 'associativeLineTextFontFamily', newVal)
    }, { flush: 'post' })

    watch(currentNodeColorList, (newVal) => {
        emit('setCurrentNodeColorList', newVal)
    }, { flush: 'post' })

}

// ==================== 背景操作逻辑 ====================
const handleBgTypeChange = (index) => {
    if (currentBackgroundIndex.value === index) return
    currentBackgroundIndex.value = index

    // 只有网格类型立即应用背景，其他类型等待具体操作
    if (index === 2) {
        applyGridBackground()
    }
    // 纯色、渐变、图片类型只切换索引，不立即应用背景
}

// 渐变
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

const handleGradientClick = (gradient) => {
    currentBackgroundIndex.value = 1
    emit('set-custom-background', {
        type: 'gradient',
        backgroundColor: gradient
    })
}

// 网格
const applyGridBackground = () => {
    currentBackgroundIndex.value = 2
    const bgImage = generateGridBackground(currentGridSize.value, currentGridColor.value)
    emit('set-custom-background', {
        type: 'grid',
        backgroundImage: bgImage,
        backgroundSize: `${currentGridSize.value}px ${currentGridSize.value}px`,
        backgroundRepeat: 'repeat',
        backgroundPosition: '0 0'
    })
}

// 图片
const onFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
        // 检查文件大小（可选，防止过大图片）
        if (file.size > 5 * 1024 * 1024) { // 5MB限制
            // 使用全局提示框
            alert('图片大小不能超过5MB', 'warning')
            return
        }
        loadFile(file)
    }
    e.target.value = ''
}


const onDrop = (e) => {
    isDragOver.value = false
    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'))
    if (file) loadFile(file)
}

const loadFile = (file) => {
    const reader = new FileReader()

    reader.onload = (e) => {
        const base64 = e.target.result
        const img = new Image()

        img.onload = () => {
            sourceImage.value = {
                id: Date.now(),
                name: file.name,
                size: file.size,
                url: base64,  // 使用base64而不是blob URL
                img
            }
            applySource()
        }

        // 使用全局提示框
        img.onerror = () => {
            alert('图片加载失败，请选择有效的图片文件', 'error')
        }

        img.src = base64
    }

    // 使用全局提示框
    reader.onerror = () => {
        alert('读取文件失败', 'error')
    }

    reader.readAsDataURL(file)
}


const applySource = () => {
    if (!sourceImage.value) return
    currentBackgroundIndex.value = 3

    // 确保URL是base64格式
    let backgroundImage = `url(${sourceImage.value.url})`

    // 如果URL不是base64格式，尝试转换
    if (!sourceImage.value.url.startsWith('data:image')) {
        // 如果是blob URL，可能需要重新读取为base64
        console.warn('图片URL不是base64格式，可能无法持久化')
    }

    emit('set-custom-background', {
        type: 'image',
        backgroundImage: backgroundImage,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundColor: 'transparent'
    })
}


const clearSource = () => {
    sourceImage.value = null
    emit('set-custom-background', { type: 'none' })
}


// 预设图标
const presetBG = computed(() => [
    {
        label: '纯色',
        svg: `<svg width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" fill="${currentBackgroundIndex.value === 0 ? localBackgroundColor : '#ffffff'}"/></svg>`
    },
    {
        label: '渐变',
        svg: '<svg width="16" height="16" viewBox="0 0 16 16"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#ff9a9e;stop-opacity:1"/><stop offset="100%" style="stop-color:#fad0c4;stop-opacity:0.5"/></linearGradient></defs><rect width="16" height="16" fill="url(#grad1)"/></svg>'
    },
    {
        label: '网格',
        svg: '<svg width="16" height="16" viewBox="0 0 16 16"><defs><pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M4 0H0V1H4V0ZM0 2H4V3H0V2ZM0 4H1V0H0V4ZM2 4H3V0H2V4Z" fill="#000"/></pattern></defs><rect width="16" height="16" fill="url(#grid)"/></svg>'
    },
    {
        label: '图片',
        svg: sourceImage.value
            ? `<svg width="16" height="16" viewBox="0 0 16 16"><image href="${sourceImage.value.url}" width="16" height="16" preserveAspectRatio="xMidYMid slice"/></svg>`
            : '<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1.5" y="2.5" width="13" height="11" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="5" cy="5.5" r="1.2" fill="#f28c5d"/><path d="M2 12.5l3-3.5 2 2 3-4 4 5.5" fill="none" stroke="#02a7f0" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    },
])

// ==================== 通用配置 ====================
const lineStyleOptions = [
    { label: '直线', value: 'straight', svg: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="60" height="26"><path d="M18,14L30,14L30,5L42,5" fill="none" stroke="#000" stroke-width="2"></path><path d="M18,14L30,14L30,23L42,23" fill="none" stroke="#000" stroke-width="2"></path></svg>' },
    { label: '曲线', value: 'curve', svg: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="60" height="26"><path d="M18,14L30,14A12,-9 0 0 1 42,5" fill="none" stroke="#000" stroke-width="2"></path><path d="M18,14L30,14A12,9 0 0 0 42,23" fill="none" stroke="#000" stroke-width="2"></path></svg>' },
    { label: '直连', value: 'direct', svg: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="60" height="26"><path d="M18,14L30,14L42,5" fill="none" stroke="#000" stroke-width="2"></path><path d="M18,14L30,14L42,23" fill="none" stroke="#000" stroke-width="2"></path></svg>' }
]

const fontFamilyOptions = [
    { label: '微软雅黑', value: '微软雅黑, Microsoft YaHei' },
    { label: '宋体', value: '宋体, SimSun' },
    { label: '黑体', value: '黑体, SimHei' },
    { label: '楷体', value: '楷体, KaiTi' },
    { label: 'Arial', value: 'Arial' },
]




// ==================== 点击外部关闭 ====================
const panelRef = ref(null)
function handleOutsideClick(e) {
    if (panelRef.value && panelRef.value.contains(e.target)) return
    if (e.target.closest('.color-dropdown-panel')) return
    emit('close')
}

// ==================== 组件卸载 ====================
onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleOutsideClick)
    if (sourceImage.value && sourceImage.value.url?.startsWith('blob:')) {
        URL.revokeObjectURL(sourceImage.value.url)
    }
})
</script>



<style src="@/styles/mindmap.css" scoped></style>

