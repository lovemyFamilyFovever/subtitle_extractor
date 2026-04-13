<!-- 这个组件在三个功能里都会用到（间距、圆角、缩放等参数），单独抽出来复用。 -->

<template>
  <!-- 整体容器 -->
  <div class="slider-input">

    <!-- 滑块 -->
    <!--
      :value="modelValue"  —— 单向绑定，显示当前值
      @input="onInput"     —— 用户拖动时触发
      注意：这里不用 v-model，因为我们要手动控制值的传递
    -->
    <input type="range" :min="min" :max="max" :step="step" :value="modelValue" :style="{ '--pct': pct }"
      @input="onInput" class="slider" v-show="showSlider" />

    <!-- 顶部：标签 + 当前值显示 -->
    <div class="slider-header" v-show="showInput">
      <span class="form-label">{{ label }}</span>
      <input class="form-input" type="text" :value="modelValue" @input="onTextChange" @focus="onTextFocus" />{{ unit }}
    </div>
  </div>
</template>

<script setup>
// =============================================
// SliderInput.vue —— 带数值显示的滑块组件
// 支持 v-model 双向绑定
// =============================================


import { computed } from 'vue'

// 接收父组件传入的属性
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

// 计算滑块已滑过的百分比，用于轨道渐变色
const pct = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min) * 100).toFixed(1) + '%'
})


// 处理文本输入框的变化，允许用户直接输入数值
const onTextChange = (e) => {
  let val = Number(e.target.value)
  if (isNaN(val)) return
  // 限制在 min-max 范围内
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
    // 限制在 min-max 范围内
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
    // 限制在 min-max 范围内
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
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-input {
  font-size: 0.8rem;
  height: 30px;
  border: 2px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
  padding: 0px 10px;
}

/* 覆盖 global.css 里 form-label 的 margin-bottom */
.slider-header .form-label {
  margin-bottom: 0;
}

.slider-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
  min-width: 40px;
  text-align: right;
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
  /* 覆盖 global.css 里 input 的通用样式 */
  box-shadow: none !important;
  flex-shrink: 0;
}


/* 已滑过的轨道颜色 */
.slider::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 10px;
  background: linear-gradient(to right,
      var(--accent) 0%,
      var(--accent) calc(var(--pct, 50%)),
      var(--border) calc(var(--pct, 50%)));
}

/* 滑块圆点 */
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
  /* 垂直居中 */
  transition: transform 0.15s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

/* Firefox 兼容 */
.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid var(--card);
  cursor: pointer;
}
</style>