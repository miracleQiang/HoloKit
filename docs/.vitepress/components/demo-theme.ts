import { computed } from 'vue'
import { useData } from 'vitepress'

export type ThemeName = 'cyberpunk' | 'glass'
export const AUTO_ROTATE_SPEED = 0.002 // matches @holokit/charts default for surface/globe

const themes = {
  cyberpunk: {
    name: 'cyberpunk' as ThemeName,
    background: '#0a0e1a',
    colors: ['#00f5ff', '#bf5af2', '#ff375f', '#30d158', '#ffd60a', '#64d2ff', '#ff9f0a', '#ff2d55'],
    grid: '#1e293b',
    text: '#e2e8f0',
    emissiveIntensity: 0.4,
    metalness: 0.3,
    roughness: 0.4,
    opacity: 1,
    ambient: { color: '#ffffff', intensity: 0.4 },
    directional: { color: '#ffffff', intensity: 0.8 },
  },
  glass: {
    name: 'glass' as ThemeName,
    background: '#e2e8f0',
    colors: ['#0284c7', '#7c3aed', '#db2777', '#16a34a', '#ca8a04', '#0891b2', '#ea580c', '#be123c'],
    grid: '#94a3b8',
    text: '#1e293b',
    emissiveIntensity: 0,
    metalness: 0.15,
    roughness: 0.55,
    opacity: 0.95,
    ambient: { color: '#ffffff', intensity: 0.9 },
    directional: { color: '#ffffff', intensity: 0.7 },
  },
}

export function useDemoTheme() {
  const { isDark } = useData()
  const themeName = computed<ThemeName>(() => (isDark.value ? 'cyberpunk' : 'glass'))
  const current = computed(() => themes[themeName.value])
  return { themeName, current }
}
