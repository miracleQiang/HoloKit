# 坐标转换

## 支持的坐标系

| 坐标系 | 说明 | 使用场景 |
|--------|------|----------|
| WGS84 | 国际标准，GPS 原始坐标 | 国际地图、Google Maps 海外 |
| GCJ02 | 国测局加密坐标（火星坐标） | 高德地图、腾讯地图 |
| BD09 | 百度坐标（在 GCJ02 基础上二次加密） | 百度地图 |

## WGS84 ↔ GCJ02

```javascript
import { wgs84ToGcj02, gcj02ToWgs84 } from 'holokit'

// GPS 坐标转高德坐标
const [gcjLng, gcjLat] = wgs84ToGcj02(116.397, 39.908)
console.log(gcjLng, gcjLat) // 116.4034, 39.9093

// 高德坐标转 GPS 坐标
const [wgsLng, wgsLat] = gcj02ToWgs84(116.4034, 39.9093)
console.log(wgsLng, wgsLat) // 116.397, 39.908
```

## GCJ02 ↔ BD09

```javascript
import { gcj02ToBd09, bd09ToGcj02 } from 'holokit'

// 高德坐标转百度坐标
const [bdLng, bdLat] = gcj02ToBd09(116.4034, 39.9093)

// 百度坐标转高德坐标
const [gcjLng, gcjLat] = bd09ToGcj02(bdLng, bdLat)
```

## WGS84 ↔ BD09

```javascript
import { wgs84ToBd09, bd09ToWgs84 } from 'holokit'

// GPS 坐标直接转百度坐标
const [bdLng, bdLat] = wgs84ToBd09(116.397, 39.908)

// 百度坐标直接转 GPS 坐标
const [wgsLng, wgsLat] = bd09ToWgs84(bdLng, bdLat)
```

## 在 Map3D 中使用

创建地图时指定坐标系，组件自动处理转换：

```javascript
import { Map3D } from 'holokit'

// 使用高德坐标系
const map = new Map3D(document.getElementById('map'), {
  center: [116.397, 39.908],  // 传入 WGS84 坐标
  coordinateSystem: 'gcj02',  // 指定底图坐标系
  tileProvider: 'amap',
})

// 添加 GPS 设备坐标，组件自动转换
map.addMarker({
  lng: 116.397,  // WGS84 坐标
  lat: 39.908,
  label: 'GPS 设备',
  coordinateSystem: 'wgs84',  // 标注点使用的坐标系
})
```

## 批量转换

```javascript
import { wgs84ToGcj02 } from 'holokit'

const gpsPoints = [
  [116.397, 39.908],
  [121.473, 31.230],
  [113.264, 23.129],
]

const gcjPoints = gpsPoints.map(([lng, lat]) => wgs84ToGcj02(lng, lat))
```

## API 一览

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| wgs84ToGcj02 | (lng, lat) | [lng, lat] | GPS → 高德 |
| gcj02ToWgs84 | (lng, lat) | [lng, lat] | 高德 → GPS |
| gcj02ToBd09 | (lng, lat) | [lng, lat] | 高德 → 百度 |
| bd09ToGcj02 | (lng, lat) | [lng, lat] | 百度 → 高德 |
| wgs84ToBd09 | (lng, lat) | [lng, lat] | GPS → 百度 |
| bd09ToWgs84 | (lng, lat) | [lng, lat] | 百度 → GPS |

::: tip 注意
中国境外坐标不做偏移处理，输入输出相同。
:::
