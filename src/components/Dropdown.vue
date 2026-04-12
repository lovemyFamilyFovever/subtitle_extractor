<template>
  <div class="dropdown" ref="dropdownRef">
    <button class="dropdown-toggle" @click="toggleDropdown">
      <span class="selected-text">{{ selectedLabel }}</span>
      <span class="arrow" :class="{ rotated: isOpen }">▼</span>
    </button>

    <div class="dropdown-menu" :class="{ open: isOpen }">
      <ul>
        <li v-for="item in options" :key="item.value" :class="{ selected: selectedValue === item.value }"
          @click="selectOption(item)">
          <span v-if="item.svg" v-html="item.svg" class="option-icon"></span>
          <span class="option-label">{{ item.label }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// 定义选项数据
const props = defineProps({
  options: {
    type: Array,
    default: []
  },
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 响应式数据
const isOpen = ref(false)
const dropdownRef = ref(null)
const selectedValue = ref(props.modelValue)

// 计算当前选中的标签
const selectedLabel = computed(() => {
  const selected = props.options.find(item => item.value === selectedValue.value)
  return selected ? selected.label : '请选择'
})

// 方法
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (item) => {
  selectedValue.value = item.value
  emit('update:modelValue', item.value)
  emit('change', item)
  isOpen.value = false
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dropdown {
  position: relative;
}

.dropdown-toggle {
  width: 100%;
  font-size: 14px;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;

  height: 30px;
  border: 2px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
  padding: 0px 10px;
  flex-shrink: 0;
  transition: border-color 0.15s ease;

}

.dropdown-toggle:hover {
  background: #f9f9f9;
  border-color: #bbb;
}

.arrow {
  transition: transform 0.2s ease;
  display: inline-block;
}

.arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  /* 动画关键点 */
  transform-origin: top center;
  transform: scaleY(0);
  opacity: 0;
  visibility: hidden;
  transition: transform 0.2s ease, opacity 0.15s ease, visibility 0.2s;
}

.dropdown-menu.open {
  transform: scaleY(1);
  opacity: 1;
  visibility: visible;
}

.dropdown-menu ul {
  list-style: none;
  max-height: 240px;
  overflow-y: auto;
  margin: 0;
  padding: 0;
}

.dropdown-menu li {
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
  min-width: max-content;
  display: flex;
    align-items: center;
    justify-content: space-between;
}

.dropdown-menu li:hover {
  background: #f5f5f5;
}

.dropdown-menu li.selected {
  background: #e8f0fe;
  color: #1976d2;
  font-weight: 500;
}

.dropdown-menu li:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

.selected-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>