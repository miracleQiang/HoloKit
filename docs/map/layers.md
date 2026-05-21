# 图层系统

## 标注点图层

```javascript
import { Map3D } from 'holokit'

const map = new Map3D(document.getElementById('map'), {
  center: [116.397, 39.908],
  zoom: 5,
  coordinateSystem: 'gcj02',
})

// 添加单个标注
map.addMarker({
  lng: 116.39,
  lat: 39.90,
  label: '北京',
  style: { color: '#ff0000', size: 0.1 }
})

// 批量添加标注
const cities = [
  { lng: 121.47, lat: 31.23, label: '上海' },
  { lng: 113.26, lat: 23.13, label: '广州' },
  { lng: 114.05, lat: 22.54, label: '深圳' },
  { lng: 104.06, lat: 30.57, label: '成都' },
  { lng: 106.55, lat: 29.56, label: '重庆' },
]
cities.forEach(city => map.addMarker(city))
```

## 飞线图层

```javascript
// 单条飞线
map.addFlyLine({
  from: [116.39, 39.90],
  to: [121.47, 31.23],
  color: '#00f5ff',
  height: 1.5,
  speed: 2,
})

// 多条飞线（从北京出发）
const targets = [
  [121.47, 31.23],  // 上海
  [113.26, 23.13],  // 广州
  [104.06, 30.57],  // 成都
  [114.05, 22.54],  // 深圳
  [120.15, 30.28],  // 杭州
]
targets.forEach(target => {
  map.addFlyLine({
    from: [116.39, 39.90],
    to: target,
    color: '#ff00ff',
    height: 2,
  })
})
```

## 区域图层

通过 GeoJSON 数据渲染区域：

```javascript
// 加载中国省级地图
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

// 区域下钻（点击省份加载市级数据）
map.on('regionClick', async (e) => {
  const provinceGeo = await fetch(`/geodata/province/${e.adcode}.json`).then(r => r.json())
  map.clearRegions()
  map.addRegion({ geoJSON: provinceGeo })
})
```

## 热力图层

```javascript
// 基于经纬度的热力数据
map.setHeatmap([
  { lng: 116.39, lat: 39.90, value: 95 },
  { lng: 116.42, lat: 39.92, value: 80 },
  { lng: 116.35, lat: 39.88, value: 65 },
  { lng: 116.45, lat: 39.95, value: 72 },
  { lng: 116.38, lat: 39.85, value: 88 },
], {
  radius: 0.5,
  heightScale: 2,
  colorRange: ['#313695', '#74add1', '#fee090', '#f46d43', '#a50026'],
})
```

## 自定义图层

继承 `CustomLayer` 基类创建自定义图层：

```javascript
import { Map3D, CustomLayer } from 'holokit'

class WeatherLayer extends CustomLayer {
  onAdd(scene, map) {
    // 在此添加自定义 Three.js 对象到场景
    this.mesh = new THREE.Mesh(geometry, material)
    scene.add(this.mesh)
  }

  onUpdate(delta) {
    // 每帧更新
    this.mesh.rotation.y += delta * 0.5
  }

  onRemove(scene) {
    scene.remove(this.mesh)
  }
}

map.addLayer(new WeatherLayer())
```
