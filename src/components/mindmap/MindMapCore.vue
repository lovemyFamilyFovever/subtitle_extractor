<template>
  <div class="mind-map-core">
    <div ref="containerRef" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useMindMap } from '@/composables/useMindMap'

const { init, destroy } = useMindMap()
const containerRef = ref(null)

onMounted(async () => {
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 50))

  if (!containerRef.value) return

  init(containerRef.value)
})

onBeforeUnmount(() => {
  // 关键：组件卸载时销毁实例
  destroy()
})
</script>

<style scoped>
.mind-map-core {
  height: 100%;
  flex: 1;
  position: relative;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
   background: #f0f2f5;
}

.map-container :deep(*) {
  margin: 0;
  padding: 0;
}



</style>
