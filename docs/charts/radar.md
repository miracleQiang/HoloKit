# 3D 雷达图

## 基础用法

```javascript
import { RadarChart3D } from 'holokit'

const chart = new RadarChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  maxValue: 100,
  data: [[
    { axis: '销售', value: 85 },
    { axis: '管理', value: 72 },
    { axis: '技术', value: 90 },
    { axis: '客服', value: 68 },
    { axis: '研发', value: 95 },
    { axis: '市场', value: 78 },
  ]]
})
```

## 多系列对比

```javascript
const chart = new RadarChart3D(document.getElementById('container'), {
  theme: 'glass',
  maxValue: 100,
  fillOpacity: 0.2,
  data: [
    [
      { axis: '攻击', value: 90 },
      { axis: '防御', value: 60 },
      { axis: '速度', value: 85 },
      { axis: '体力', value: 70 },
      { axis: '智力', value: 95 },
    ],
    [
      { axis: '攻击', value: 70 },
      { axis: '防御', value: 90 },
      { axis: '速度', value: 55 },
      { axis: '体力', value: 95 },
      { axis: '智力', value: 60 },
    ],
  ]
})
```

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| maxValue | number | auto | 轴最大值 |
| fillOpacity | number | 0.3 | 填充区域透明度 |
| axisCount | number | auto | 轴数量（自动从数据推断） |
| showGrid | boolean | true | 是否显示网格环 |

## API

| 方法 | 说明 |
|------|------|
| setData(data) | 更新数据（二维数组，每个子数组为一个系列） |
| setTheme(theme) | 切换主题 |
| dispose() | 销毁实例 |

## 数据格式

```typescript
interface RadarChartData {
  axis: string   // 轴标签
  value: number  // 数值
}
// 传入 RadarChartData[][] 支持多系列
```
