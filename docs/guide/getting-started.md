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
