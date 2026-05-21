# 3D 翻转卡片表

## 基础用法

```javascript
import { FlipCardTable3D } from 'holokit'

const chart = new FlipCardTable3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  columns: ['城市', '人口(万)', 'GDP(亿)', '增长率'],
  data: [
    { '城市': '北京', '人口(万)': 2189, 'GDP(亿)': 41610, '增长率': '4.7%' },
    { '城市': '上海', '人口(万)': 2487, 'GDP(亿)': 44652, '增长率': '5.1%' },
    { '城市': '深圳', '人口(万)': 1768, 'GDP(亿)': 32387, '增长率': '6.2%' },
    { '城市': '广州', '人口(万)': 1881, 'GDP(亿)': 28839, '增长率': '4.8%' },
  ]
})
```

## 自定义卡片尺寸

```javascript
const chart = new FlipCardTable3D(document.getElementById('container'), {
  theme: 'glass',
  cardWidth: 2,
  cardHeight: 1.2,
  columns: ['指标', '本月', '上月', '环比'],
  data: [
    { '指标': '销售额', '本月': '¥128万', '上月': '¥115万', '环比': '+11.3%' },
    { '指标': '订单数', '本月': '3,256', '上月': '2,980', '环比': '+9.3%' },
    { '指标': '客单价', '本月': '¥393', '上月': '¥386', '环比': '+1.8%' },
  ]
})
```

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| columns | string[] | auto | 列名数组（默认取第一行的 key） |
| cardWidth | number | 1.5 | 卡片宽度 |
| cardHeight | number | 1 | 卡片高度 |

## API

| 方法 | 说明 |
|------|------|
| setData(data) | 更新表格数据 |
| setTheme(theme) | 切换主题 |
| dispose() | 销毁实例 |
| on('hover', handler) | 悬停卡片，返回行/列/值 |

## 数据格式

```typescript
interface TableRow {
  [key: string]: string | number
}
```
