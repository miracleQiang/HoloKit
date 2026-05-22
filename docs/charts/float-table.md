# 3D 悬浮面板表


<ClientOnly>
  <FloatPanelTableDemo />
</ClientOnly>
## 基础用法

```javascript
import { FloatPanelTable3D } from 'holokit'

const chart = new FloatPanelTable3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  columns: ['服务', '状态', '响应时间', 'QPS'],
  data: [
    { '服务': 'API Gateway', '状态': '正常', '响应时间': '12ms', 'QPS': '15,230' },
    { '服务': 'User Service', '状态': '正常', '响应时间': '8ms', 'QPS': '8,450' },
    { '服务': 'Order Service', '状态': '告警', '响应时间': '156ms', 'QPS': '3,200' },
    { '服务': 'Payment Service', '状态': '正常', '响应时间': '23ms', 'QPS': '1,890' },
    { '服务': 'Notification', '状态': '正常', '响应时间': '5ms', 'QPS': '12,100' },
  ]
})
```

## 层叠深度效果

每行数据在 Z 轴上有不同深度，形成层叠悬浮效果：

```javascript
const chart = new FloatPanelTable3D(document.getElementById('container'), {
  theme: 'glass',
  panelWidth: 8,
  rowHeight: 0.6,
  columns: ['排名', '产品', '销量', '占比'],
  data: [
    { '排名': '1', '产品': 'HoloKit Pro', '销量': '12,580', '占比': '35.2%' },
    { '排名': '2', '产品': 'HoloKit Lite', '销量': '9,340', '占比': '26.1%' },
    { '排名': '3', '产品': 'HoloKit Mini', '销量': '7,120', '占比': '19.9%' },
    { '排名': '4', '产品': 'HoloKit Studio', '销量': '4,560', '占比': '12.8%' },
    { '排名': '5', '产品': '配件', '销量': '2,150', '占比': '6.0%' },
  ]
})
```

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| columns | string[] | auto | 列名数组 |
| panelWidth | number | auto | 面板总宽度 |
| rowHeight | number | 0.5 | 行高 |
| autoRotate | boolean | false | 是否自动旋转图表 |
| rotateSpeed | number | 0.005 | 旋转速率（rad/frame） |
| position | `{ x?, y?, z? }` | `{ 0, 0, 0 }` | 图形位置偏移，默认居中 |

## API

| 方法 | 说明 |
|------|------|
| setData(data) | 更新表格数据 |
| setTheme(theme) | 切换主题 |
| dispose() | 销毁实例 |
| setAutoRotate(enabled) | 切换自动旋转 |
| setRotateSpeed(speed) | 设置旋转速率 |
| setPosition(position) | 调整图形位置 |
| on('hover', handler) | 悬停单元格 |

## 数据格式

```typescript
interface TableRow {
  [key: string]: string | number
}
```
