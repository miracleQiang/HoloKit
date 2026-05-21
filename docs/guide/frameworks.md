# 框架适配

HoloKit 提供纯 JS Class API，同时为主流框架提供薄包装组件。

## Vue 3

```bash
pnpm add holokit @holokit/vue3
```

```vue
<script setup>
import { createChartComponent } from '@holokit/vue3'
import { BarChart3D, PieChart3D, Map3D } from 'holokit'

const HoloBar = createChartComponent('BarChart', BarChart3D)
const HoloPie = createChartComponent('PieChart', PieChart3D)
</script>

<template>
  <HoloBar :data="barData" theme="cyberpunk" />
  <HoloPie :data="pieData" theme="glass" />
</template>
```

## Vue 2

```bash
pnpm add holokit @holokit/vue2
```

```javascript
import { createChartComponent } from '@holokit/vue2'
import { BarChart3D } from 'holokit'

export default {
  components: {
    HoloBar: createChartComponent('BarChart', BarChart3D)
  }
}
```

## React

```bash
pnpm add holokit @holokit/react
```

```tsx
import { HoloChart } from '@holokit/react'
import { BarChart3D, LineChart3D } from 'holokit'

function Dashboard() {
  return (
    <div>
      <HoloChart chartClass={BarChart3D} data={barData} theme="cyberpunk" />
      <HoloChart chartClass={LineChart3D} data={lineData} theme="glass" />
    </div>
  )
}
```

## 纯 JS（无框架）

```html
<div id="chart" style="width:600px;height:400px;"></div>
<script src="https://unpkg.com/holokit/dist/holokit.umd.js"></script>
<script>
  new HoloKit.BarChart3D(document.getElementById('chart'), {
    theme: 'cyberpunk',
    data: [{ label: 'A', value: 100 }, { label: 'B', value: 200 }]
  })
</script>
```
