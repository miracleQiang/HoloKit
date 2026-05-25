<template>
  <div class="demo-toolbar" :style="barStyle">
    <button v-for="btn in buttons" :key="btn.label" :style="btnStyle"
      @mouseenter="e => e.target.style.background = hoverBg"
      @mouseleave="e => e.target.style.background = 'transparent'"
      @click="btn.action">
      <span class="btn-icon">{{ btn.icon }}</span>
      <span class="btn-label">{{ btn.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDemoTheme } from '../demo-theme'

const emit = defineEmits<{
  camera: [preset: string]
  export: []
  fullscreen: []
}>()

const { current } = useDemoTheme()

const buttons = [
  { icon: '◎', label: '默认', action: () => emit('camera', 'default') },
  { icon: '⬇', label: '俯视', action: () => emit('camera', 'top') },
  { icon: '▣', label: '正面', action: () => emit('camera', 'front') },
  { icon: '⤓', label: '导出', action: () => emit('export') },
  { icon: '⛶', label: '全屏', action: () => emit('fullscreen') },
]

const barStyle = computed(() => ({
  background: `${current.value.background}99`,
  borderColor: `${current.value.colors[0]}33`,
  backdropFilter: 'blur(8px)',
}))

const btnStyle = computed(() => ({
  color: current.value.text,
  borderColor: `${current.value.colors[0]}44`,
}))

const hoverBg = computed(() => `${current.value.colors[0]}22`)
</script>

<style scoped>
.demo-toolbar {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid;
  transition: all 0.3s ease;
}
.demo-toolbar button {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 8px;
  font-size: 11px;
  border: 1px solid;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;
}
.btn-icon { font-size: 12px; }
.btn-label { font-size: 11px; }
</style>
