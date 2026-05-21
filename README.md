# HoloKit

基于 Three.js 的 3D 数据可视化组件库。支持 Vue2 / Vue3 / React，一行代码创建沉浸式 3D 图表。

## 特性

- 12+ 3D 图表组件（柱状图、饼图、折线图、散点图、曲面图、热力图、雷达图、漏斗图、关系图、地球图）
- 2 种 3D 数据表格（翻转卡片式、悬浮面板式）
- 专业 GIS 模块（瓦片加载、坐标转换、飞线动画、区域下钻、轨迹回放、空间分析）
- 主题系统（内置 Cyberpunk / Glass 预设，支持完全自定义）
- 框架无关（纯 JS Class API + Vue2 / Vue3 / React 适配器）
- TypeScript 编写，完整类型支持

## 安装

```bash
npm install holokit
# 或
pnpm add holokit
```

## 快速开始

```javascript
import { BarChart3D } from 'holokit'

const chart = new BarChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  data: [
    { label: '一月', value: 120 },
    { label: '二月', value: 200 },
    { label: '三月', value: 150 },
    { label: '四月', value: 280 },
  ]
})
```

## Vue3

```vue
<script setup>
import { createChartComponent } from '@holokit/vue3'
import { BarChart3D } from 'holokit'

const HoloBar = createChartComponent('BarChart', BarChart3D)
</script>

<template>
  <HoloBar :data="data" theme="cyberpunk" />
</template>
```

## React

```tsx
import { HoloChart } from '@holokit/react'
import { BarChart3D } from 'holokit'

function App() {
  return <HoloChart chartClass={BarChart3D} data={data} theme="cyberpunk" />
}
```

## 地图

```javascript
import { Map3D } from 'holokit'

const map = new Map3D(document.getElementById('map'), {
  center: [116.397, 39.908],
  zoom: 5,
  coordinateSystem: 'gcj02',
})

map.addMarker({ lng: 121.47, lat: 31.23, label: '上海' })
map.addFlyLine({ from: [116.39, 39.90], to: [121.47, 31.23] })
```

## 主题

内置两套预设主题：

- **cyberpunk** — 深色背景、霓虹色板、自发光材质
- **glass** — 毛玻璃材质、柔和光影、半透明效果

```javascript
chart.setTheme('glass')

// 或自定义主题
chart.setTheme({
  name: 'custom',
  colors: { primary: ['#ff6b6b', '#feca57', '#48dbfb'], background: '#1a1a2e', ... },
  material: { type: 'physical', metalness: 0.5, roughness: 0.3, opacity: 1, emissive: false },
  lighting: { ambient: { color: '#fff', intensity: 0.5 }, directional: { ... } },
  animation: { duration: 800, easing: 'easeOutCubic' },
})
```

## 图表组件

| 组件 | 说明 |
|------|------|
| BarChart3D | 3D 柱状图 |
| PieChart3D | 3D 饼图 / 环形图 |
| LineChart3D | 3D 折线图 / 面积图 |
| ScatterChart3D | 3D 散点图 |
| SurfaceChart3D | 3D 曲面图 |
| HeatmapChart3D | 3D 热力图 |
| RadarChart3D | 3D 雷达图 |
| FunnelChart3D | 3D 漏斗图 |
| ForceGraph3D | 3D 力导向关系图 |
| GlobeChart3D | 3D 地球图 |
| FlipCardTable3D | 翻转卡片式数据表 |
| FloatPanelTable3D | 悬浮面板式表格 |

## 项目结构

```
packages/
├── core/           核心引擎（场景、主题、动画、交互、响应式）
├── charts/         3D 图表组件
├── map/            地图 & GIS 模块
├── holokit/        主包（聚合导出）
├── vue3-adapter/   Vue3 适配器
├── vue2-adapter/   Vue2 适配器
└── react-adapter/  React 适配器
```

## 开发

```bash
pnpm install
pnpm build
pnpm test
```

## 文档站

```bash
cd docs
pnpm dev
```

## License

MIT
