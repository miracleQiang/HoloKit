<template>
  <div class="demo-container" :class="`theme-${themeName}`">
    <div class="demo-header">
      <span class="demo-title">{{ title }}</span>
      <span class="demo-badge">Live Demo</span>
    </div>
    <div class="demo-canvas" :style="{ height: height + 'px' }">
      <slot></slot>
    </div>
    <div v-if="description" class="demo-desc">{{ description }}</div>
  </div>
</template>

<script setup lang="ts">
import { useDemoTheme } from './demo-theme'

defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  height: { type: Number, default: 400 },
})

const { themeName } = useDemoTheme()
</script>

<style scoped>
.demo-container {
  margin: 24px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: #0a0e1a;
  transition: background 0.3s ease, border-color 0.3s ease;
}
.theme-glass.demo-container { background: #e2e8f0; border-color: rgba(148,163,184,0.3); }
.demo-header {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06);
  transition: border-color 0.3s ease;
}
.theme-glass .demo-header { border-bottom-color: rgba(148,163,184,0.25); }
.demo-title { color: #e2e8f0; font-size: 14px; font-weight: 500; transition: color 0.3s ease; }
.theme-glass .demo-title { color: #1e293b; }
.demo-badge {
  font-size: 11px; padding: 2px 8px; border-radius: 10px;
  background: rgba(0,245,255,0.15); color: #00f5ff;
  transition: background 0.3s ease, color 0.3s ease;
}
.theme-glass .demo-badge { background: rgba(2,132,199,0.12); color: #0369a1; }
.demo-canvas { width: 100%; position: relative; overflow: hidden; }
.demo-canvas :deep(canvas) { display: block; }
.demo-desc {
  padding: 10px 16px; font-size: 13px; color: #94a3b8;
  border-top: 1px solid rgba(255,255,255,0.06);
  transition: color 0.3s ease, border-color 0.3s ease;
}
.theme-glass .demo-desc { color: #475569; border-top-color: rgba(148,163,184,0.25); }
</style>
