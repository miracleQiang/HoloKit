# GIS 空间分析

## 距离计算

计算两点之间的球面距离（米）：

```javascript
import { haversineDistance } from 'holokit'

// 北京到上海的距离
const distance = haversineDistance(39.90, 116.39, 31.23, 121.47)
console.log(distance) // 约 1067km
```

## 点在多边形内判断

判断一个经纬度点是否在指定区域内：

```javascript
import { pointInPolygon } from 'holokit'

// 定义区域边界（如北京五环）
const boundary = [
  [116.19, 40.07],
  [116.58, 40.07],
  [116.58, 39.75],
  [116.19, 39.75],
  [116.19, 40.07],
]

const isInside = pointInPolygon([116.39, 39.90], boundary)
console.log(isInside) // true
```

## 缓冲区生成

围绕某点生成指定半径的缓冲区多边形：

```javascript
import { bufferPoint } from 'holokit'

// 以天安门为中心，生成 5km 缓冲区
const buffer = bufferPoint(39.908, 116.397, 5000, 64)
// 返回 64 个点的多边形坐标数组

// 在地图上显示缓冲区
map.addRegion({
  geoJSON: {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [buffer] }
  },
  style: { fillColor: '#ff0000', fillOpacity: 0.2, strokeColor: '#ff0000' }
})
```

## 多边形面积

计算多边形区域面积：

```javascript
import { polygonArea } from 'holokit'

const polygon = [
  [116.19, 40.07],
  [116.58, 40.07],
  [116.58, 39.75],
  [116.19, 39.75],
]

const area = polygonArea(polygon)
```

## 线段相交判断

判断两条线段是否相交：

```javascript
import { lineIntersects } from 'holokit'

const crosses = lineIntersects(
  [116.39, 39.90], [121.47, 31.23],  // 线段 A
  [120.00, 36.00], [118.00, 33.00],  // 线段 B
)
console.log(crosses) // true or false
```

## 综合示例：电子围栏报警

```javascript
import { Map3D, pointInPolygon, bufferPoint } from 'holokit'

const map = new Map3D(document.getElementById('map'), {
  center: [116.397, 39.908],
  zoom: 12,
})

// 定义禁入区域
const restrictedArea = [
  [116.38, 39.92],
  [116.42, 39.92],
  [116.42, 39.89],
  [116.38, 39.89],
  [116.38, 39.92],
]

// 在地图上显示围栏
map.addRegion({
  geoJSON: {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [restrictedArea] }
  },
  style: { fillColor: '#ff0000', fillOpacity: 0.15, strokeColor: '#ff0000', strokeWidth: 2 }
})

// 实时判断设备位置是否越界
function checkPosition(lng, lat) {
  if (pointInPolygon([lng, lat], restrictedArea)) {
    console.warn('警告：设备进入禁入区域！')
  }
}
```

## API 一览

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| haversineDistance | (lat1, lng1, lat2, lng2) | number (米) | 球面距离 |
| pointInPolygon | (point, polygon) | boolean | 点在面内 |
| bufferPoint | (lat, lng, radius, segments?) | [lng, lat][] | 缓冲区多边形 |
| polygonArea | (polygon) | number | 多边形面积 |
| lineIntersects | (a1, a2, b1, b2) | boolean | 线段相交 |
