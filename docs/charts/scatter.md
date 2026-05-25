# 3D 散点图


<ClientOnly>
  <ScatterChartDemo />
</ClientOnly>
## 基础用法

```javascript
import { ScatterChart3D } from 'holokit'

const chart = new ScatterChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  pointSize: 0.12,
  data: [
    { x: 1.0, y: 8.04, z: 0.5 },
    { x: 2.0, y: 6.95, z: 1.2 },
    { x: 3.0, y: 7.58, z: 0.8 },
    { x: 4.0, y: 8.81, z: 1.5 },
    { x: 5.0, y: 8.33, z: 2.0 },
    { x: 6.0, y: 9.96, z: 1.8 },
    { x: 7.0, y: 7.24, z: 2.5 },
    { x: 8.0, y: 4.26, z: 3.0 },
    { x: 9.0, y: 10.84, z: 2.2 },
    { x: 10.0, y: 4.82, z: 3.5 },
  ]
})
```

## 分组散点

通过 `group` 字段区分不同系列：

```javascript
const chart = new ScatterChart3D(document.getElementById('container'), {
  theme: 'glass',
  pointSize: 0.1,
  data: [
    { x: 1.2, y: 2.5, z: 0.8, group: '类别A' },
    { x: 2.4, y: 3.1, z: 1.2, group: '类别A' },
    { x: 3.5, y: 1.8, z: 2.0, group: '类别A' },
    { x: 1.8, y: 4.2, z: 1.5, group: '类别B' },
    { x: 3.2, y: 5.0, z: 0.5, group: '类别B' },
    { x: 4.1, y: 3.8, z: 2.5, group: '类别B' },
    { x: 2.0, y: 1.5, z: 3.0, group: '类别C' },
    { x: 4.5, y: 2.8, z: 1.0, group: '类别C' },
  ]
})
```

## 气泡图（大小映射）

通过 `size` 字段控制点的大小：

```javascript
const chart = new ScatterChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  pointSize: 0.08,
  data: [
    { x: 1, y: 5, z: 2, size: 3, group: '北京' },
    { x: 3, y: 8, z: 1, size: 5, group: '上海' },
    { x: 5, y: 3, z: 4, size: 2, group: '广州' },
    { x: 7, y: 6, z: 3, size: 4, group: '深圳' },
  ]
})
```

## 维度信息（X / Y / Z 轴标题）

通过 `xAxis.label`、`yAxis.label`、`zAxis.label` 标注统计维度：

```javascript
const chart = new ScatterChart3D(el, {
  data: scatterData,
  xAxis: { label: '温度 (°C)' },
  yAxis: { label: '湿度 (%)', ticks: 5, formatter: (v) => `${v}%` },
  zAxis: { label: '气压 (hPa)' },
  unit: '',
})
```

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| pointSize | number | 0.1 | 基础点大小 |
| sizeField | string | 'size' | 大小映射字段 |
| colorField | string | 'group' | 颜色映射字段 |
| xAxis.label | string | — | X 轴标题 |
| xAxis.max | number | 自动 | X 轴最大值 |
| yAxis.label | string | — | Y 轴标题 |
| yAxis.max | number | 自动 | Y 轴最大值 |
| yAxis.ticks | number | 4 | Y 轴刻度数 |
| yAxis.showTicks | boolean | true | 是否显示 Y 轴刻度值 |
| yAxis.formatter | (v) => string | — | Y 轴刻度格式化 |
| zAxis.label | string | — | Z 轴标题 |
| zAxis.max | number | 自动 | Z 轴最大值 |
| unit | string | '' | 数值单位 |
| showValues | boolean | false | 是否显示数值标签 |
| autoRotate | boolean | false | 是否自动旋转图表 |
| rotateSpeed | number | 0.005 | 旋转速率（rad/frame） |
| position | `{ x?, y?, z? }` | `{ 0, 0, 0 }` | 图形位置偏移，默认居中 |

## API

| 方法 | 说明 |
|------|------|
| setData(data) | 更新数据 |
| setTheme(theme) | 切换主题 |
| dispose() | 销毁实例 |
| setAutoRotate(enabled) | 切换自动旋转 |
| setRotateSpeed(speed) | 设置旋转速率 |
| setPosition(position) | 调整图形位置 |
| on('hover', handler) | 悬停数据点，返回 x/y/z 坐标 |

## 数据格式

```typescript
interface ScatterChartData {
  x: number
  y: number
  z?: number      // 可选 Z 轴坐标
  size?: number   // 可选大小映射
  group?: string  // 可选分组
}
```
