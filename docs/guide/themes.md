# 主题配置

HoloKit 提供可配置的主题系统，内置两套预设主题。

## 预设主题

### Cyberpunk（默认）

深色背景、霓虹色板、自发光材质、高对比度。适合大屏监控场景。

### Glass

毛玻璃材质、柔和光影、半透明效果。适合通用商业场景。

## 自定义主题

```typescript
import { HoloKitTheme } from 'holokit'

const myTheme: HoloKitTheme = {
  name: 'custom',
  colors: {
    primary: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'],
    background: '#1a1a2e',
    text: '#eaeaea',
    grid: '#333',
    tooltip: 'rgba(0,0,0,0.8)',
  },
  material: {
    type: 'physical',
    metalness: 0.5,
    roughness: 0.3,
    opacity: 1,
    emissive: false,
  },
  lighting: {
    ambient: { color: '#ffffff', intensity: 0.5 },
    directional: { color: '#ffffff', intensity: 1, position: [5, 10, 5] },
  },
  animation: { duration: 800, easing: 'easeOutCubic' },
}

chart.setTheme(myTheme)
```
