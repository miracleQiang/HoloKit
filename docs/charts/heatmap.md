# 3D 热力图


<ClientOnly>
  <HeatmapChartDemo />
</ClientOnly>
## 基础用法

```javascript
import { HeatmapChart3D } from 'holokit'

const data = []
for (let x = 0; x < 10; x++) {
  for (let z = 0; z < 10; z++) {
    data.push({ x, z, value: Math.random() * 100 })
  }
}

const chart = new HeatmapChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  data
})
```

## 柱状热力图

通过 `heightScale` 将数值映射为柱体高度：

```javascript
const chart = new HeatmapChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  heightScale: 2,
  gridSize: 0.8,
  data: [
    { x: 0, z: 0, value: 85 },
    { x: 1, z: 0, value: 62 },
    { x: 2, z: 0, value: 93 },
    { x: 0, z: 1, value: 45 },
    { x: 1, z: 1, value: 78 },
    { x: 2, z: 1, value: 56 },
    { x: 0, z: 2, value: 71 },
    { x: 1, z: 2, value: 88 },
    { x: 2, z: 2, value: 34 },
  ]
})
```

## 颜色范围

自定义颜色映射范围：

```javascript
const chart = new HeatmapChart3D(document.getElementById('container'), {
  theme: 'glass',
  colorRange: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#fee090', '#fdae61', '#f46d43', '#d73027'],
  heightScale: 1.5,
  data: temperatureData
})
```

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| gridSize | number | 1 | 网格单元大小 |
| heightScale | number | 1 | 高度缩放系数 |
| colorRange | string[] | 主题色板 | 颜色映射数组（低→高） |
| opacity | number | 0.9 | 透明度 |
| autoRotate | boolean | false | 是否自动旋转图表 |
| rotateSpeed | number | 0.005 | 旋转速率（rad/frame） |
| position | `{ x?, y?, z? }` | `{ 0, 0, 0 }` | 图形位置偏移，默认居中 |

## API

| 方法 | 说明 |
|------|------|
| setData(data) | 更新热力数据 |
| setTheme(theme) | 切换主题 |
| dispose() | 销毁实例 |
| setAutoRotate(enabled) | 切换自动旋转 |
| setRotateSpeed(speed) | 设置旋转速率 |
| setPosition(position) | 调整图形位置 |
| on('hover', handler) | 悬停单元格，返回 x/z/value |

## 数据格式

```typescript
interface HeatmapChartData {
  x: number      // X 网格坐标
  z: number      // Z 网格坐标
  value: number  // 热力值
}
```
