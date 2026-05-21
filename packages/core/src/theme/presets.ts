import { HoloKitTheme } from './types'

export const cyberpunkTheme: HoloKitTheme = {
  name: 'cyberpunk',
  colors: {
    primary: ['#00f5ff', '#a855f7', '#f43f5e', '#22d3ee', '#e879f9', '#fb7185'],
    background: '#0a0e1a',
    text: '#e2e8f0',
    grid: '#1e293b',
    tooltip: 'rgba(15, 23, 42, 0.9)',
  },
  material: {
    type: 'physical',
    metalness: 0.3,
    roughness: 0.4,
    opacity: 0.9,
    emissive: true,
  },
  lighting: {
    ambient: { color: '#1a1a2e', intensity: 0.4 },
    directional: { color: '#ffffff', intensity: 1.2, position: [5, 10, 7] },
  },
  animation: {
    duration: 1000,
    easing: 'easeOutCubic',
  },
}

export const glassTheme: HoloKitTheme = {
  name: 'glass',
  colors: {
    primary: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
    background: '#f8fafc',
    text: '#1e293b',
    grid: '#e2e8f0',
    tooltip: 'rgba(255, 255, 255, 0.85)',
  },
  material: {
    type: 'physical',
    metalness: 0.1,
    roughness: 0.2,
    opacity: 0.6,
    emissive: false,
  },
  lighting: {
    ambient: { color: '#ffffff', intensity: 0.6 },
    directional: { color: '#ffffff', intensity: 0.8, position: [3, 8, 5] },
  },
  animation: {
    duration: 800,
    easing: 'easeOutQuart',
  },
}

export const themePresets: Record<string, HoloKitTheme> = {
  cyberpunk: cyberpunkTheme,
  glass: glassTheme,
}
