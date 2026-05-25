# 快速开始

## 安装

```bash
npm install holokit
# 或
pnpm add holokit
```

## CDN 引入

```html
<script src="https://unpkg.com/holokit/dist/holokit.umd.js"></script>
```

## 基础用法

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

## Vue3 使用

```vue
<script setup>
import { createChartComponent } from '@holokit/vue3'
import { BarChart3D } from 'holokit'

const HoloBar = createChartComponent('BarChart', BarChart3D)
</script>

<template>
  <HoloBar :data="chartData" theme="cyberpunk" />
</template>
```

## React 使用

```tsx
import { HoloChart } from '@holokit/react'
import { BarChart3D } from 'holokit'

function App() {
  return <HoloChart chartClass={BarChart3D} data={data} theme="cyberpunk" />
}
```

## 更新数据

```javascript
chart.setData(newData)
```

## 切换主题

```javascript
chart.setTheme('glass')
```

## 销毁

```javascript
chart.dispose()
```

## 通用能力

所有图表组件继承 `BaseChart3D`，自动获得以下能力：

### 图例 (Legend)

通过 `legend` 配置展示颜色-标签映射。BarChart3D（多 group）、PieChart3D、ScatterChart3D（多 group）会自动生成图例：

```javascript
const chart = new BarChart3D(el, {
  data,
  legend: {
    show: true,
    position: 'top-right',  // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    direction: 'horizontal', // 'horizontal' | 'vertical'
  },
})

// 也可以手动设置图例项
chart.setLegend([
  { label: '系列 A', color: '#00f5ff' },
  { label: '系列 B', color: '#a855f7' },
])
```

### 空态 / 无数据占位

`data` 为空数组或 `null` 时自动展示占位文案，避免白屏：

```javascript
const chart = new BarChart3D(el, {
  data: [],
  emptyText: '本月无销售数据',  // 默认 '暂无数据'
})

// 后续 setData 非空数组会自动隐藏空态
chart.setData(realData)
```

### 响应式容器

容器尺寸变化时图表自动重新渲染，无需监听 window resize。基于 `ResizeObserver` 实现，开箱即用。

## 通用 API

所有图表组件支持以下通用配置项：

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| colors | string[] | 主题色板 | 自定义图形颜色数组，覆盖主题默认色 |
| textColor | string | 主题文字色 | 自定义文字颜色（轴标题、刻度、数值标签等） |
| theme | string / object | 'cyberpunk' | 主题名称或自定义主题对象 |
| emptyText | string | '暂无数据' | 空态占位文案 |
| legend | LegendOptions | — | 图例配置 |
| autoRotate | boolean | false | 是否自动旋转 |
| rotateSpeed | number | 0.005 | 旋转速率 |
| position | `{ x?, y?, z? }` | — | 图形位置偏移 |
| camera | CameraOptions | — | 相机位置和控制配置 |
| tooltip | TooltipOptions | — | 提示框配置 |

```javascript
// 自定义颜色示例
const chart = new BarChart3D(el, {
  data,
  colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'],
  textColor: '#ffffff',
})
```

所有图表组件支持以下通用方法：

| 方法 | 说明 |
|------|------|
| setData(data) | 更新数据；空数据自动展示空态 |
| setTheme(theme) | 切换主题 |
| setLegend(items) | 手动设置图例项（覆盖自动推导） |
| setAutoRotate(enabled) | 切换自动旋转 |
| setRotateSpeed(speed) | 设置旋转速率 |
| setPosition(position) | 调整图形位置 |
| exportImage(type?) | 导出为 DataURL（'png' \| 'jpeg'） |
| downloadImage(filename?, type?) | 直接下载图片文件 |
| setCameraPreset(preset) | 切换相机预设（'default' \| 'top' \| 'front' \| 'side'） |
| toggleFullscreen() | 进入/退出全屏模式 |
| dispose() | 销毁实例（清理 DOM、Three.js 资源、事件监听） |
| on(event, handler) | 监听 hover / unhover / click 事件 |

## 标注线 (markLine)

柱状图和折线图支持绘制水平参考线：

```javascript
const chart = new BarChart3D(el, {
  data: salesData,
  markLine: [
    { value: 200, label: '目标', color: '#f59e0b' },
    { value: 150, label: '均值', color: '#10b981' },
  ],
})
```

## 数据下钻

Pie/Bar 支持 `onDrillDown` 回调，点击数据项时触发：

```javascript
const chart = new PieChart3D(el, {
  data: regionData,
  onDrillDown: (item) => {
    chart.setData(getSubData(item.label))
  },
})
```

## 多图表联动

`ChartGroup` 将多个图表绑定在一起，统一控制：

```javascript
import { ChartGroup, BarChart3D, LineChart3D } from 'holokit'

const group = new ChartGroup()
group.add(barChart)
group.add(lineChart)

group.setTheme('glass')       // 所有图表同时切主题
group.setCameraPreset('top')  // 所有图表同时切视角
group.setAutoRotate(true)     // 所有图表同时旋转
```
