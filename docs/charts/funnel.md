# 3D 漏斗图

## 基础用法

```javascript
import { FunnelChart3D } from 'holokit'

const chart = new FunnelChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  data: [
    { label: '访问', value: 8000 },
    { label: '注册', value: 5000 },
    { label: '活跃', value: 3000 },
    { label: '付费', value: 1200 },
    { label: '续费', value: 800 },
  ]
})
```

## 倒置漏斗

```javascript
const chart = new FunnelChart3D(document.getElementById('container'), {
  theme: 'glass',
  direction: 'ascending',
  data: [
    { label: '初级', value: 200 },
    { label: '中级', value: 500 },
    { label: '高级', value: 1200 },
    { label: '专家', value: 2000 },
  ]
})
```

## 带间距漏斗

```javascript
const chart = new FunnelChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  gap: 0.15,
  data: [
    { label: '展示', value: 100000 },
    { label: '点击', value: 25000 },
    { label: '咨询', value: 8000 },
    { label: '成交', value: 2000 },
  ]
})
```

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| direction | string | 'descending' | 'descending'（正常）/ 'ascending'（倒置） |
| gap | number | 0.05 | 层间距 |
| sortOrder | string | 'none' | 'none' / 'ascending' / 'descending' |
| height | number | 0.4 | 每层高度 |

## API

| 方法 | 说明 |
|------|------|
| setData(data) | 更新数据 |
| setTheme(theme) | 切换主题 |
| dispose() | 销毁实例 |
| on('hover', handler) | 悬停层，返回 label/value/转化率 |

## 数据格式

```typescript
interface FunnelChartData {
  label: string
  value: number
}
```
