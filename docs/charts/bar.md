# 3D 柱状图

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

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| barWidth | number | 0.6 | 柱体宽度 |
| barGap | number | 0.3 | 柱体间距 |
| mode | string | 'grouped' | grouped / stacked |
| yAxis.max | number | auto | Y 轴最大值 |

## API

| 方法 | 说明 |
|------|------|
| setData(data) | 更新数据 |
| setTheme(theme) | 切换主题 |
| dispose() | 销毁实例 |
| on(event, handler) | 监听 hover/click |
