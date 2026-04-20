<template>
  <div class="color-picker-dropdown" ref="pickerRef">
    <div class="color-picker-trigger" :class="{ active: isPanelOpen }" @click="toggleDropdown">
      <div class="color-preview" :style="{ background: selectedColor }"></div>
      <span class="color-value">{{ selectedColor.toUpperCase() }}</span>
      <span class="trigger-arrow">▼</span>
    </div>

    <div class="color-dropdown-panel" :class="{ show: isPanelOpen }">
      <!-- 历史记录 -->
      <div class="color-history">
        <div class="color-history-title">最近使用</div>
        <div class="color-history-list">
          <div
            v-for="(color, index) in colorHistory"
            :key="index"
            class="color-history-item"
            :style="{ background: color }"
            @click="selectColor(color)"
          ></div>
        </div>
      </div>

      <!-- 预设颜色 -->
      <div class="color-preset">
        <div class="color-preset-title">预设颜色</div>
        <div class="color-preset-grid">
          <div
            v-for="color in presetColors"
            :key="color"
            class="color-preset-item"
            :style="{ background: color }"
            @click="selectColor(color)"
          ></div>
        </div>
      </div>

      <!-- 自定义颜色 -->
      <div class="color-custom">
        <div class="color-custom-title">自定义颜色</div>
        <div class="color-custom-input">
          <div class="color-canvas-wrapper" @click="handleCanvasClick">
            <div class="color-canvas-bg"></div>
            <canvas class="color-canvas" ref="colorCanvas" width="50" height="50"></canvas>
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
                <input type="text" class="color-input-field" v-model="hexInput" @change="updateFromHex" style="flex: 1;">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="color-actions">
        <button class="color-btn color-btn-secondary" @click="closeDropdown">取消</button>
        <button class="color-btn color-btn-primary" @click="confirmColor">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '#4A90E2'
  }
});

const emit = defineEmits(['update:modelValue']);

// 预设颜色
const presetColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#FF8C00',
  '#E74C3C', '#9B59B6', '#3498DB', '#2ECC71',
  '#1ABC9C', '#16A085', '#27AE60', '#229954',
  '#F39C12', '#E67E22', '#D35400', '#C0392B',
  '#2980B9', '#8E44AD', '#2C3E50', '#34495E',
  '#ECF0F1', '#BDC3C7', '#95A5A6', '#7F8C8D'
];

// 响应式状态
const pickerRef = ref(null);
const colorCanvas = ref(null);
const isPanelOpen = ref(false);
const selectedColor = ref(props.modelValue || '#4A90E2');
const colorHistory = ref(['#4A90E2', '#FF6B6B', '#2ECC71', '#F39C12']);

// 输入框绑定
const rgbInput = reactive({ r: 74, g: 144, b: 226 });
const hexInput = ref('4A90E2');

// 光标位置（简化处理，点击画布时更新）
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
}

// 选择颜色
function selectColor(color) {
  selectedColor.value = color;
  updateInputs(color);
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

  // 创建渐变
  const gradientH = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradientH.addColorStop(0, '#ff0000');
  gradientH.addColorStop(1/6, '#ffff00');
  gradientH.addColorStop(2/6, '#00ff00');
  gradientH.addColorStop(3/6, '#00ffff');
  gradientH.addColorStop(4/6, '#0000ff');
  gradientH.addColorStop(5/6, '#ff00ff');
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
function toggleDropdown() {
  isPanelOpen.value = !isPanelOpen.value;
  if (isPanelOpen.value) {
    // 在下一个tick初始化画布，确保DOM已更新
    setTimeout(initCanvas, 0);
  }
}

function closeDropdown() {
  isPanelOpen.value = false;
}

// 确认选择
function confirmColor() {
  // 添加到历史记录
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

// 监听props.modelValue变化，保持外部绑定同步
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue !== selectedColor.value) {
      selectedColor.value = newValue;
    }
  }
);

// 监听selectedColor变化，同步输入框
watch(selectedColor, (newColor) => {
  updateInputs(newColor);
});
</script>

<style scoped>
/* 复制原HTML中的所有CSS样式，添加scoped避免污染 */
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
  border: 1px solid rgba(0,0,0,0.1);
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
  width: 237px;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
  border: 1px solid rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.15s;
}

.color-history-item:hover {
  transform: scale(1.1);
}

/* 预设颜色网格 */
.color-preset {
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
}

.color-preset-title {
  font-size: 11px;
  color: #999;
  margin-bottom: 8px;
}

.color-preset-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
}

.color-preset-item {
  aspect-ratio: 1;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.15s;
}

.color-preset-item:hover {
  transform: scale(1.1);
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
  width: 50px;
  height: 50px;
  border-radius: 4px;
  border: 1px solid #ddd;
  overflow: hidden;
  cursor: crosshair;
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
  box-shadow: 0 0 0 1px rgba(0,0,0,0.3);
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
  gap: 6px;
}

.color-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 2px;
}

.color-input-label {
  font-size: 10px;
  color: #999;
  width: 10px;
  flex-shrink: 0;
}

.color-input-field {
  width: 100%;
  height: 22px;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 0 4px;
  font-size: 11px;
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
</style>
