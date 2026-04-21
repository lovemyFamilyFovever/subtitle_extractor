<template>
  <div class="color-picker-dropdown" ref="pickerRef">
    <div class="color-picker-trigger" :class="{ active: isPanelOpen }" @click="toggleDropdown">
      <div class="color-preview" :style="{ background: selectedColor }"></div>
      <span class="color-value">{{ selectedColor.toUpperCase() }}</span>
      <span class="trigger-arrow">▼</span>
    </div>

    <Teleport to="body">

      <div class="color-dropdown-panel" :class="{ show: isPanelOpen }" :style="modalStyle" ref="modalRef">
        <!-- 历史记录 -->
        <div class="color-history">
          <div class="color-history-title">最近使用</div>
          <div class="color-history-list">
            <div v-for="(color, index) in colorHistory" :key="index" class="color-history-item"
              :style="{ background: color }" @click="selectColor(color)"></div>
          </div>
        </div>

        <!-- 预设颜色（改为下拉选择主题） -->
        <div class="color-preset">
          <div class="color-preset-header">
            <div class="color-preset-title">预设颜色</div>
            <div class="color-theme-selector" ref="themeSelectorRef">
              <div class="color-theme-trigger" @click.stop="toggleThemeList">
                <span class="theme-name">{{ activeTheme }}</span>
                <span class="theme-arrow" :class="{ open: isThemeListOpen }">▼</span>
              </div>
              <ul class="color-theme-dropdown" :class="{ show: isThemeListOpen }">
                <li v-for="(colors, themeName) in colorThemes" :key="themeName" class="color-theme-item"
                  :class="{ active: activeTheme === themeName }" @click.stop="selectTheme(themeName)">
                  {{ themeName }}
                </li>
              </ul>
            </div>
          </div>
          <div class="color-preset-grid">
            <div v-for="color in currentThemeColors" :key="color" class="color-preset-item"
              :style="{ background: color }" :title="color" @click="selectColor(color)"></div>
          </div>
        </div>

        <!-- 自定义颜色 -->
        <div class="color-custom">
          <div class="color-custom-title">自定义颜色</div>
          <div class="color-custom-input">
            <div class="color-canvas-wrapper" @click="handleCanvasClick">
              <div class="color-canvas-bg"></div>
              <canvas class="color-canvas" ref="colorCanvas" width="80" height="80"></canvas>
              <div class="color-cursor" :style="cursorStyle"></div>
            </div>
            <div class="color-input-group">
              <div class="color-input-row">
                <div class="color-input-wrapper">
                  <span class="color-input-label">R</span>
                  <input type="text" class="color-input-field" v-model="rgbInput.r" @change="updateFromRgb">
                </div>
                <div class="color-input-wrapper">
                  <span class="color-input-label">G</span>
                  <input type="text" class="color-input-field" v-model="rgbInput.g" @change="updateFromRgb">
                </div>
                <div class="color-input-wrapper">
                  <span class="color-input-label">B</span>
                  <input type="text" class="color-input-field" v-model="rgbInput.b" @change="updateFromRgb">
                </div>
              </div>
              <div class="color-input-row">
                <div class="color-input-wrapper">
                  <span class="color-input-label">#</span>
                  <input type="text" class="color-input-field" v-model="hexInput" @change="updateFromHex"
                    style="flex: 1;">
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch,nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '#4A90E2'
  }
});



const emit = defineEmits(['update:modelValue']);

// 预设颜色主题数据（来源于参考内容）
const colorThemes = {
  '系统色': [
    '#EFECEB', '#F2F2F2', '#E7EBED', '#FADCDB', '#FBEADA', '#FCF9EA', '#E5F6DA', '#DBF5F5',
    '#D2D6F9', '#FADDED', '#DED9D7', '#D9D9D9', '#E0E0E0', '#F5B9B7', '#F8D5B5', '#F6EDC1',
    '#CAEDB4', '#B7EAEB', '#A6AEF3', '#F6BBDB', '#BEB3AF', '#BFBFBF', '#9E9E9E', '#F19594',
    '#F4C18F', '#F1E4A2', '#B0E38F', '#94E0E1', '#7985EC', '#F199C8', '#9D8C88', '#A6A6A6',
    '#616161', '#EC7270', '#F1AC6A', '#E9D66F', '#95DA69', '#70D5D7', '#5B79E8', '#ED77B6',
    '#5C4038', '#7F7F7F', '#262626', '#A23735', '#A66A30', '#A7932C', '#569230', '#358E90',
    '#314AA4', '#A23C73'
  ],
  '莫兰迪': [
    '#F1F1E8', '#ECECED', '#F3FAF9', '#F4F0EA', '#F9FAEE', '#F8F9F5', '#F5E9ED', '#FCE7EB',
    '#F9EEE1', '#FEF5EF', '#E3E2D1', '#D9DADB', '#E8F5F4', '#E9E1D5', '#F3F6DD', '#F0F3EC',
    '#EBD2DC', '#F9CFD7', '#F3DDC3', '#FDEBDF', '#D6D4BA', '#C5C7CA', '#DCEFEE', '#DDD1C1',
    '#EEF1CB', '#E9ECE2', '#E0BCCA', '#F6B6C4', '#EDCCA5', '#FCE2CF', '#C8C5A3', '#B2B5B8',
    '#D1EAE9', '#D2C2AC', '#E8EDBA', '#E1E6D9', '#D6A5B9', '#F39EB0', '#E7BB87', '#FBD8BF',
    '#959270', '#7F8285', '#9EB7B6', '#9F8F79', '#B5BA87', '#AEB3A6', '#A37286', '#C06B7D',
    '#B48854', '#C8A58C'
  ],
  '中国风': [
    '#866B50', '#705138', '#5A5645', '#5C3719', '#775550', '#5A1216', '#B0913E', '#964D22',
    '#E28342', '#C37940', '#2C2305', '#645822', '#6B5E4C', '#556980', '#70887D', '#5B8483',
    '#975F42', '#A2825E', '#DDAB4C', '#91A45A', '#4D5255', '#587D8C', '#737C7B', '#B1AD94',
    '#ADB4A9', '#467E7D', '#94B68E', '#894276', '#C36077', '#D59482', '#144A74', '#495C69',
    '#314656', '#134857', '#7E8489', '#8F927F', '#B2BBBE', '#67907C', '#539271', '#D2B116',
    '#322F3B', '#525288', '#8076A3', '#1A94BC', '#5D3131', '#314A43', '#C1651A', '#DE9E44',
    '#D2B116', '#D2D97A'
  ],
  '潘通色': [
    '#E3F0E1', '#EEE7F1', '#E4D5D8', '#FDF8DC', '#DFE3F5', '#FFF1D5', '#DFE5DB', '#E2EFF5',
    '#DEE6E6', '#F9DDD6', '#C7E1C3', '#DED0E4', '#CAAAB1', '#FBF1B8', '#BFC7EA', '#FEE2AB',
    '#BFCAB6', '#C6DFEA', '#BDCECD', '#F3BBAD', '#ABD1A6', '#CDB8D6', '#AF808A', '#F8EB95',
    '#9EAAE0', '#FED480', '#A0B092', '#A9CEE0', '#9DB5B5', '#ED9984', '#8FC288', '#BDA1C9',
    '#955563', '#F6E471', '#7E8ED5', '#FDC556', '#80956D', '#8DBED5', '#7C9D9C', '#E7775B',
    '#5C8F55', '#8A6E96', '#622230', '#C3B13E', '#4B5BA2', '#CA9223', '#4D623A', '#5A8BA2',
    '#496A69', '#B44428'
  ]
};

// 响应式状态
const pickerRef = ref(null);
const themeSelectorRef = ref(null);
const colorCanvas = ref(null);
const isPanelOpen = ref(false);
const isThemeListOpen = ref(false);
const selectedColor = ref(props.modelValue || '#4A90E2');
const colorHistory = ref(['#4A90E2', '#FF6B6B', '#2ECC71', '#F39C12']);
const activeTheme = ref('系统色');

const modalStyle = ref({});
const modalRef = ref(null);

// 当前主题的颜色列表
const currentThemeColors = computed(() => {
  return colorThemes[activeTheme.value] || [];
});

// 输入框绑定
const rgbInput = reactive({ r: 74, g: 144, b: 226 });
const hexInput = ref('4A90E2');

// 光标位置
const cursorStyle = computed(() => ({
  left: '25px',
  top: '25px'
}));

// 转换函数
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, parseInt(x) || 0)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// 更新输入框
function updateInputs(color) {
  const rgb = hexToRgb(color);
  if (rgb) {
    rgbInput.r = rgb.r;
    rgbInput.g = rgb.g;
    rgbInput.b = rgb.b;
    hexInput.value = color.replace('#', '');
  }
  confirmColor();
}

// 选择颜色
function selectColor(color) {
  selectedColor.value = color;
  updateInputs(color);
}

// 切换主题列表
function toggleThemeList() {
  isThemeListOpen.value = !isThemeListOpen.value;
}

// 选择主题
function selectTheme(themeName) {
  activeTheme.value = themeName;
  isThemeListOpen.value = false;
}

// 从RGB输入更新
function updateFromRgb() {
  const hex = rgbToHex(rgbInput.r, rgbInput.g, rgbInput.b);
  selectedColor.value = hex;
  hexInput.value = hex.replace('#', '');
}

// 从Hex输入更新
function updateFromHex() {
  let hex = hexInput.value.replace('#', '');
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const color = '#' + hex;
    selectedColor.value = color;
    const rgb = hexToRgb(color);
    if (rgb) {
      rgbInput.r = rgb.r;
      rgbInput.g = rgb.g;
      rgbInput.b = rgb.b;
    }
  }
}

// 画布点击处理
function handleCanvasClick(e) {
  const canvas = colorCanvas.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const imageData = ctx.getImageData(x, y, 1, 1).data;
  const color = '#' + [imageData[0], imageData[1], imageData[2]]
    .map(v => v.toString(16).padStart(2, '0'))
    .join('');

  selectColor(color);
}

// 初始化画布
function initCanvas() {
  const canvas = colorCanvas.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  const gradientH = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradientH.addColorStop(0, '#ff0000');
  gradientH.addColorStop(1 / 6, '#ffff00');
  gradientH.addColorStop(2 / 6, '#00ff00');
  gradientH.addColorStop(3 / 6, '#00ffff');
  gradientH.addColorStop(4 / 6, '#0000ff');
  gradientH.addColorStop(5 / 6, '#ff00ff');
  gradientH.addColorStop(1, '#ff0000');

  ctx.fillStyle = gradientH;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradientV = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradientV.addColorStop(0, 'rgba(255,255,255,0)');
  gradientV.addColorStop(1, 'rgba(255,255,255,1)');

  ctx.fillStyle = gradientV;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 下拉面板控制
async function toggleDropdown(event) {
  isPanelOpen.value = !isPanelOpen.value;

  await nextTick()

  // 获取点击位置
  const clickX = event.clientX
  const clickY = event.clientY

  if (isPanelOpen.value) {
    setTimeout(initCanvas, 0);

    const modalRect = modalRef.value.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;


    const top = clickY + modalRect.height > viewportHeight ? clickY - modalRect.height : clickY;
    const left = clickX + modalRect.width > viewportWidth ? viewportWidth - modalRect.width : clickX;
    modalStyle.value = {
      top: top + 'px',
      left: left + 'px',
      position: 'fixed',
      zIndex: 9999
    };

  }
}

function closeDropdown() {
  isPanelOpen.value = false;
  isThemeListOpen.value = false;
}

// 确认选择
function confirmColor() {
  if (!colorHistory.value.includes(selectedColor.value)) {
    colorHistory.value.unshift(selectedColor.value);
    if (colorHistory.value.length > 8) {
      colorHistory.value.pop();
    }
  }
  emit('update:modelValue', selectedColor.value);
  closeDropdown();
}

// 点击外部关闭
function handleClickOutside(e) {
  if (pickerRef.value && !pickerRef.value.contains(e.target)) {
    closeDropdown();
  }
  if (themeSelectorRef.value && !themeSelectorRef.value.contains(e.target)) {
    isThemeListOpen.value = false;
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  selectedColor.value = props.modelValue || selectedColor.value;
  updateInputs(selectedColor.value);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue !== selectedColor.value) {
      selectedColor.value = newValue;
    }
  }
);

watch(selectedColor, (newColor) => {
  updateInputs(newColor);
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.color-picker-dropdown {
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.color-picker-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 30px;
  padding: 0 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: border-color 0.2s;
}

.color-picker-trigger:hover {
  border-color: #999;
}

.color-preview {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.color-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trigger-arrow {
  font-size: 10px;
  color: #666;
  transition: transform 0.2s;
}

.color-picker-trigger.active .trigger-arrow {
  transform: rotate(180deg);
}

/* 展开面板 */
.color-dropdown-panel {
  position: absolute;
  width: 320px;
  top: 100%;
  left: -100px;
  right: 0;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: none;
  overflow: hidden;
}

.color-dropdown-panel.show {
  display: block;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 历史记录区域 */
.color-history {
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
}

.color-history-title {
  font-size: 11px;
  color: #999;
  margin-bottom: 8px;
}

.color-history-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.color-history-item {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.15s;
}

.color-history-item:hover {
  transform: scale(1.1);
}

/* 预设颜色区域 */
.color-preset {
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
}

.color-preset-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.color-preset-title {
  font-size: 11px;
  color: #999;
}

/* 主题选择器 */
.color-theme-selector {
  position: relative;
}

.color-theme-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  color: #333;
  transition: all 0.15s;
}

.color-theme-trigger:hover {
  border-color: #999;
  background: #eee;
}

.theme-name {
  min-width: 48px;
  text-align: center;
}

.theme-arrow {
  font-size: 8px;
  color: #999;
  transition: transform 0.2s;
}

.theme-arrow.open {
  transform: rotate(180deg);
}

/* 主题下拉列表 */
.color-theme-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 80px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  list-style: none;
  z-index: 10;
  display: none;
  overflow: hidden;
}

.color-theme-dropdown.show {
  display: block;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.color-theme-item {
  padding: 6px 12px;
  font-size: 11px;
  color: #333;
  cursor: pointer;
  transition: background 0.1s;
  white-space: nowrap;
}

.color-theme-item:hover {
  background: #f5f5f5;
}

.color-theme-item.active {
  background: #e8f0fe;
  color: #1a73e8;
}

/* 预设颜色网格 */
.color-preset-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
  max-height: 150px;
}

.color-preset-item {
  aspect-ratio: 1;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.color-preset-item:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

/* 自定义颜色区域 */
.color-custom {
  padding: 10px 12px;
}

.color-custom-title {
  font-size: 11px;
  color: #999;
  margin-bottom: 8px;
}

.color-custom-input {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-canvas-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  border: 1px solid #ddd;
  overflow: hidden;
  cursor: crosshair;
  flex-shrink: 0;
}

.color-canvas-bg {
  position: absolute;
  inset: 0;
  background: repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 8px 8px;
}

.color-canvas {
  position: absolute;
  inset: 0;
}

.color-cursor {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.color-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.color-input-row {
  display: flex;
  gap: 10px;
}

.color-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-input-label {
  font-size: 14px;
  color: #999;
  width: 10px;
  flex-shrink: 0;
}

.color-input-field {
  width: 100%;
  height: 33px;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 0 4px;
  font-size: 14px;
  font-family: monospace;
}

.color-input-field:focus {
  outline: none;
  border-color: #007bff;
}

/* 操作按钮 */
.color-actions {
  padding: 10px 12px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.color-btn {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.color-btn-secondary {
  background: #f5f5f5;
  border: 1px solid #ddd;
  color: #666;
}

.color-btn-secondary:hover {
  background: #eee;
}

.color-btn-primary {
  background: #007bff;
  border: 1px solid #007bff;
  color: #fff;
}

.color-btn-primary:hover {
  background: #0056b3;
}

/* 滚动条样式 */
.color-preset-grid::-webkit-scrollbar {
  width: 4px;
}

.color-preset-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.color-preset-grid::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

.color-preset-grid::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>
