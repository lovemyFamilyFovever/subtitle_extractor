<template>
  <!-- 整体容器 -->
  <div class="slider-input" :class="{ 'slider-only': !showInput, 'input-only': !showSlider }">

    <!-- 滑块 -->
    <input type="range" :min="min" :max="max" :step="step" :value="modelValue" :style="{ '--pct': pct }"
      @input="onInput" class="slider" v-show="showSlider" />

    <!-- 顶部：标签 + 当前值显示 -->
    <div class="slider-header" v-show="showInput">
      <span class="form-label" v-if="label">{{ label }}</span>
      <input class="form-input" type="text" :value="modelValue" @input="onTextChange" @focus="onTextFocus" />{{ unit }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, required: true },
  label: { type: String, default: '' },
  unit: { type: String, default: '' },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  showSlider: { type: Boolean, default: true },
  showInput: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue'])

const onInput = (e) => {
  emit('update:modelValue', Number(e.target.value))
}

const pct = computed(() => {
  const range = props.max - props.min
  if (range <= 0) return '0%'
  return ((props.modelValue - props.min) / range * 100).toFixed(1) + '%'
})

const onTextChange = (e) => {
  let val = Number(e.target.value)
  if (isNaN(val)) return
  val = Math.max(props.min, Math.min(props.max, val))
  emit('update:modelValue', val)
}

const onTextFocus = (e) => {
  const input = e.target

  const onWheel = (event) => {
    event.preventDefault()
    let val = Number(input.value)
    if (isNaN(val)) return
    val += (event.deltaY < 0 ? 1 : -1)
    val = Math.max(props.min, Math.min(props.max, val))
    emit('update:modelValue', val)
  }

  input.addEventListener('wheel', onWheel, { passive: false })

  const onKeyDown = (event) => {
    let val = Number(input.value)
    if (isNaN(val)) return
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      val += props.step
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      val -= props.step
    } else {
      return
    }
    val = Math.max(props.min, Math.min(props.max, val))
    emit('update:modelValue', val)
  }

  input.addEventListener('keydown', onKeyDown)

  const onBlur = () => {
    input.removeEventListener('wheel', onWheel)
    input.removeEventListener('keydown', onKeyDown)
    input.removeEventListener('blur', onBlur)
  }

  input.addEventListener('blur', onBlur)
}
</script>

<style scoped>
.slider-input {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  min-height: 30px;
}

/* ===== 关键：隐藏时的撑满逻辑 ===== */

/* input-only：只有输入框，没有滑块 → 输入框占满 */
.slider-input.input-only .slider-header {
  flex: 1;
  width: 100%;
}

.slider-input.input-only .slider-header .form-input {
  flex: 1;
  min-width: 0;
}

/* slider-only：只有滑块，没有输入框 → 滑块占满 */
.slider-input.slider-only .slider {
  flex: 1;
  width: 100%;
}

/* 两者都显示时的默认布局 */
.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.form-input {
  font-size: 0.8rem;
  height: 30px;
  width: 50px;
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
  padding: 0px 8px;
  text-align: center;
  -moz-appearance: textfield;
  color: rgba(0, 0, 0, 0.75);
}

.form-input::-webkit-outer-spin-button,
.form-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.form-input:focus {
  border-color: #4a90d9;
  outline: none;
}

.slider-header .form-label {
  margin-bottom: 0;
}

/* ===== 滑块样式 ===== */
.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 70%;
  height: 4px;
  background: var(--border);
  border-radius: 10px;
  outline: none;
  cursor: pointer;
  border: none;
  padding: 0;
  box-shadow: none !important;
  flex-shrink: 0;
}

.slider::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 10px;
  background: linear-gradient(to right,
      var(--accent) 0%,
      var(--accent) calc(var(--pct, 50%)),
      var(--border) calc(var(--pct, 50%)));
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid var(--card);
  box-shadow: 0 0 6px rgba(0, 224, 158, 0.4);
  cursor: pointer;
  margin-top: -6px;
  transition: transform 0.15s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid var(--card);
  cursor: pointer;
}
</style>
