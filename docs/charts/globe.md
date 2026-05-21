# 3D 地球图

## 基础用法

```javascript
import { GlobeChart3D } from 'holokit'

const chart = new GlobeChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  autoRotate: true,
  data: [
    { lng: 116.39, lat: 39.90, label: '北京', value: 8 },
    { lng: 121.47, lat: 31.23, label: '上海', value: 6 },
    { lng: -73.98, lat: 40.75, label: '纽约', value: 7 },
    { lng: -0.12, lat: 51.50, label: '伦敦', value: 5 },
    { lng: 139.69, lat: 35.68, label: '东京', value: 9 },
  ]
})
```

## 全球分布图

```javascript
const chart = new GlobeChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  radius: 2.5,
  autoRotate: true,
  data: [
    { lng: 116.39, lat: 39.90, label: '北京总部', value: 10 },
    { lng: 121.47, lat: 31.23, label: '上海分部', value: 7 },
    { lng: 113.26, lat: 23.13, label: '广州分部', value: 6 },
    { lng: -122.41, lat: 37.77, label: '旧金山办公室', value: 5 },
    { lng: 2.35, lat: 48.85, label: '巴黎办公室', value: 4 },
    { lng: 55.27, lat: 25.20, label: '迪拜办公室', value: 3 },
    { lng: 151.20, lat: -33.86, label: '悉尼办公室', value: 3 },
  ]
})
```

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| radius | number | 2 | 地球半径 |
| autoRotate | boolean | true | 是否自动旋转 |
| markerSize | number | 0.05 | 标注点基础大小 |

## API

| 方法 | 说明 |
|------|------|
| setData(data) | 更新标注点数据 |
| setTheme(theme) | 切换主题 |
| dispose() | 销毁实例 |
| on('hover', handler) | 悬停标注点 |

## 数据格式

```typescript
interface GlobeMarker {
  lng: number     // 经度
  lat: number     // 纬度
  label?: string  // 标签
  value?: number  // 数值（影响标注点大小）
}
```
