<template>
  <button
    class="icon-btn"
    :class="{ 'icon-btn--active': active, 'icon-btn--danger': danger, 'icon-btn--disabled': disabled }"
    :disabled="disabled"
    :title="title"
    @click="!disabled && $emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  active: { type: Boolean, default: false },
  danger: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

defineEmits(['click'])
</script>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.icon-btn:active {
  transform: scale(0.94);
}

.icon-btn--active {
  background: rgba(232, 197, 71, 0.12);
  color: #e8c547;
}

.icon-btn--danger:hover {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}

.icon-btn--disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
