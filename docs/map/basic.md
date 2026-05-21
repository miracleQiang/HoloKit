# 地图基础用法

## 创建地图

```javascript
import { Map3D } from 'holokit'

const map = new Map3D(document.getElementById('map'), {
  center: [116.397, 39.908],
  zoom: 5,
  tileProvider: 'amap',
  coordinateSystem: 'gcj02',
})
```

## 添加标注

```javascript
map.addMarker({ lng: 121.47, lat: 31.23, label: '上海' })
```

## 飞线

```javascript
map.addFlyLine({ from: [116.39, 39.90], to: [121.47, 31.23] })
```

## 轨迹回放

```javascript
map.playTrack(points, { speed: 2, loop: true })
```
