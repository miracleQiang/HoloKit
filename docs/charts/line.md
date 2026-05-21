# 3D 折线图

## 基础用法

```javascript
import { LineChart3D } from 'holokit'

const chart = new LineChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  data: [
    { label: '1月', value: 820 },
    { label: '2月', value: 932 },
    { label: '3月', value: 901 },
    { label: '4月', value: 934 },
    { label: '5月', value: 1290 },
    { label: '6月', value: 1330 },
    { label: '7月', value: 1520 },
  ]
})
```

## 面积图

通过 `areaFill` 开启面积填充：

```javascript
const chart = new LineChart3D(document.getElementById('container'), {
  theme: 'glass',
  areaFill: true,
  smooth: true,
  data: [
    { label: '周一', value: 150 },
    { label: '周二', value: 230 },
    { label: '周三', value: 224 },
    { label: '周四', value: 218 },
    { label: '周五', value: 135 },
    { label: '周六', value: 147 },
    { label: '周日', value: 260 },
  ]
})
```

## 多系列折线

```javascript
const chart = new LineChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  smooth: true,
  series: [
    { name: '邮件', data: [120, 132, 101, 134, 90, 230, 210] },
    { name: '短信', data: [220, 182, 191, 234, 290, 330, 310] },
    { name: '广告', data: [150, 232, 201, 154, 190, 330, 410] },
  ],
  xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] }
})
```

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| lineWidth | number | 2 | 线条宽度 |
| areaFill | boolean | false | 是否填充面积 |
| smooth | boolean | false | 是否平滑曲线 |
| showPoints | boolean | true | 是否显示数据点 |
| pointSize | number | 0.08 | 数据点大小 |

## API

| 方法 | 说明 |
|------|------|
| setData(data) | 更新数据 |
| setTheme(theme) | 切换主题 |
| dispose() | 销毁实例 |
| on('hover', handler) | 悬停数据点 |

## 数据格式

```typescript
interface LineChartData {
  label: string
  value: number
}
```
