# 3D 柱状图

<ClientOnly>
  <BarChartDemo />
</ClientOnly>

## 基础用法

```javascript
const chart = new BarChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  data: [
    { label: '1月', value: 120 },
    { label: '2月', value: 200 },
    { label: '3月', value: 150 },
    { label: '4月', value: 280 },
    { label: '5月', value: 220 },
    { label: '6月', value: 310 },
  ],
  xAxis: { label: '月份' },
  yAxis: { label: '销售额', formatter: (v) => `${v.toFixed(0)}万` },
  unit: '万',
  showValues: true,
  autoRotate: true,
  rotateSpeed: 0.003,
})
```

## 维度信息（X / Y 轴标题）

通过 `xAxis.label` 和 `yAxis.label` 告知用户图表统计的维度：

```javascript
const chart = new BarChart3D(el, {
  data: salesData,
  xAxis: { label: '月份' },
  yAxis: { label: '销售额' },
  unit: '万',
})
```

效果：
- X 轴下方显示「月份」
- Y 轴左侧垂直显示「销售额」
- Tooltip 自动用维度名命名字段（"月份: 一月 / 销售额: 120万"）

## 数据标签

每根柱子顶部默认显示数值。通过 `showValues: false` 关闭：

```javascript
const chart = new BarChart3D(el, {
  data,
  showValues: true,
  unit: '万',
})
```

自定义格式：

```javascript
const chart = new BarChart3D(el, {
  data,
  valueFormatter: (item) => `${item.label}: ${item.value.toFixed(2)} 万元`,
})
```

## Y 轴刻度自定义

```javascript
const chart = new BarChart3D(el, {
  data,
  yAxis: {
    label: '销售额',
    max: 500,                // 固定 Y 轴最大值
    ticks: 5,                // 5 等分
    formatter: (v) => `¥${v.toLocaleString()}`,
  },
})
```

## 图例 / 空态

数据带 `group` 字段时自动生成分组图例。空数据自动显示占位文案：

```javascript
const chart = new BarChart3D(el, {
  data: [],
  emptyText: '加载中...',
  legend: { position: 'top-left' },
})
chart.setData(salesData) // 自动隐藏空态、推导图例
```

> 通用图例 / 空态 / 响应式能力详见[快速开始 - 通用能力](/guide/getting-started#通用能力)

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| barWidth | number | 0.6 | 柱体宽度 |
| barGap | number | 0.3 | 柱体间距 |
| mode | 'grouped' \| 'stacked' | 'grouped' | 分组 / 堆叠模式 |
| colors | string[] | 主题色板 | 自定义柱体颜色数组 |
| textColor | string | 主题文字色 | 自定义文字颜色（轴标题、刻度、数值标签） |
| xAxis.label | string | — | X 轴标题（统计维度名） |
| xAxis.showTicks | boolean | true | 是否显示 X 轴类别标签 |
| yAxis.label | string | — | Y 轴标题（数值维度名） |
| yAxis.max | number | 自动 | Y 轴最大值 |
| yAxis.ticks | number | 4 | Y 轴刻度数 |
| yAxis.showTicks | boolean | true | 是否显示 Y 轴刻度值 |
| yAxis.formatter | (v) => string | — | Y 轴刻度格式化 |
| showValues | boolean | true | 是否在柱顶显示数值 |
| valueFormatter | (item) => string | — | 自定义柱顶数值格式化 |
| unit | string | '' | 数值单位（拼接到默认 formatter 后） |
| markLine | MarkLineItem[] | — | 水平标注线（均值线、目标线等） |
| onDrillDown | (item) => void | — | 点击柱体触发的下钻回调 |
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
| on(event, handler) | 监听 hover/click |

## 数据格式

```typescript
interface BarChartData {
  label: string    // 类别标签（X 轴）
  value: number    // 数值（Y 轴）
  group?: string   // 可选分组（用于 grouped/stacked 模式）
}
```
