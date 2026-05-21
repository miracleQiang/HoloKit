# 地图基础用法


<ClientOnly>
  <MapDemo />
</ClientOnly>
## 创建地图

```javascript
import { Map3D } from 'holokit'

const map = new Map3D(document.getElementById('map'), {
  center: [116.397, 39.908],  // 中心点 [经度, 纬度]
  zoom: 5,                    // 缩放级别
  tileProvider: 'amap',       // 底图源
  coordinateSystem: 'gcj02',  // 坐标系
  theme: 'cyberpunk',
})
```

## 底图源配置

```javascript
// 高德地图
const map = new Map3D(el, { tileProvider: 'amap' })

// 天地图
const map = new Map3D(el, { tileProvider: 'tianditu' })

// 自定义 XYZ 瓦片
const map = new Map3D(el, {
  tileProvider: {
    type: 'xyz',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 18,
  }
})

// Mapbox
const map = new Map3D(el, {
  tileProvider: {
    type: 'mapbox',
    accessToken: 'your_token',
    style: 'mapbox://styles/mapbox/dark-v11',
  }
})
```

## 添加标注

```javascript
// 单个标注
map.addMarker({
  lng: 121.47,
  lat: 31.23,
  label: '上海',
  style: { color: '#ff0000', size: 0.12 },
})

// 批量标注
const cities = [
  { lng: 116.39, lat: 39.90, label: '北京' },
  { lng: 121.47, lat: 31.23, label: '上海' },
  { lng: 113.26, lat: 23.13, label: '广州' },
  { lng: 114.05, lat: 22.54, label: '深圳' },
  { lng: 104.06, lat: 30.57, label: '成都' },
  { lng: 106.55, lat: 29.56, label: '重庆' },
  { lng: 120.15, lat: 30.28, label: '杭州' },
  { lng: 118.79, lat: 32.06, label: '南京' },
]
cities.forEach(city => map.addMarker(city))
```

## 飞线

```javascript
// 物流路线
map.addFlyLine({
  from: [116.39, 39.90],   // 北京
  to: [121.47, 31.23],     // 上海
  color: '#00f5ff',
  height: 2,
  speed: 3,
})

// 多条飞线
const routes = [
  { from: [116.39, 39.90], to: [121.47, 31.23] },
  { from: [116.39, 39.90], to: [113.26, 23.13] },
  { from: [116.39, 39.90], to: [104.06, 30.57] },
  { from: [116.39, 39.90], to: [114.05, 22.54] },
]
routes.forEach(r => map.addFlyLine({ ...r, color: '#ff00ff', height: 1.5 }))
```

## 区域渲染

```javascript
// 加载中国地图 GeoJSON
const chinaGeo = await fetch('/geodata/china.json').then(r => r.json())

map.addRegion({
  geoJSON: chinaGeo,
  style: {
    fillColor: '#1a237e',
    fillOpacity: 0.6,
    strokeColor: '#00f5ff',
    strokeWidth: 1,
  }
})
```

## 热力图

```javascript
map.setHeatmap([
  { lng: 116.39, lat: 39.90, value: 95 },
  { lng: 116.42, lat: 39.92, value: 80 },
  { lng: 116.35, lat: 39.88, value: 65 },
  { lng: 116.45, lat: 39.95, value: 72 },
], {
  radius: 0.5,
  heightScale: 2,
})
```

## 轨迹回放

```javascript
const trackPoints = [
  { lng: 116.39, lat: 39.90, time: 0 },
  { lng: 116.42, lat: 39.92, time: 1000 },
  { lng: 116.45, lat: 39.91, time: 2000 },
  { lng: 116.48, lat: 39.93, time: 3000 },
]

map.playTrack(trackPoints, { speed: 2, loop: true, followCamera: true })
```

## 地图操作

```javascript
// 设置中心点
map.setCenter([121.47, 31.23])

// 设置缩放
map.setZoom(8)

// 清除所有图层
map.clear()

// 销毁
map.dispose()
```

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| center | [number, number] | [116.397, 39.908] | 中心点 [经度, 纬度] |
| zoom | number | 5 | 缩放级别 |
| tileProvider | string / object | 'amap' | 底图源 |
| coordinateSystem | string | 'gcj02' | 坐标系 gcj02/wgs84/bd09 |
| theme | string / object | 'cyberpunk' | 主题 |
| enableControls | boolean | true | 是否启用鼠标控制 |

## 事件

```javascript
map.on('click', (e) => {
  console.log('点击坐标：', e.lng, e.lat)
})

map.on('markerClick', (e) => {
  console.log('点击标注：', e.marker.label)
})

map.on('regionClick', (e) => {
  console.log('点击区域：', e.properties.name)
})
```
