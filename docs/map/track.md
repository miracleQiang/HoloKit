# 轨迹回放

## 基础用法

```javascript
import { Map3D } from 'holokit'

const map = new Map3D(document.getElementById('map'), {
  center: [116.397, 39.908],
  zoom: 12,
  coordinateSystem: 'gcj02',
})

// 轨迹数据
const trackPoints = [
  { lng: 116.39, lat: 39.90, time: 1000 },
  { lng: 116.40, lat: 39.91, time: 2000 },
  { lng: 116.41, lat: 39.91, time: 3000 },
  { lng: 116.42, lat: 39.92, time: 4000 },
  { lng: 116.43, lat: 39.91, time: 5000 },
  { lng: 116.44, lat: 39.90, time: 6000 },
]

map.playTrack(trackPoints, {
  speed: 2,
  loop: false,
  followCamera: true,
})
```

## 物流轨迹

```javascript
const deliveryTrack = [
  { lng: 116.39, lat: 39.90, time: 0, status: '揽收' },
  { lng: 116.80, lat: 39.50, time: 3600, status: '运输中' },
  { lng: 117.20, lat: 39.10, time: 7200, status: '运输中' },
  { lng: 117.70, lat: 38.80, time: 10800, status: '运输中' },
  { lng: 118.10, lat: 38.50, time: 14400, status: '派送中' },
  { lng: 118.30, lat: 38.40, time: 16200, status: '已签收' },
]

map.playTrack(deliveryTrack, {
  speed: 5,
  lineColor: '#00f5ff',
  lineWidth: 2,
  markerStyle: { color: '#ff00ff', size: 0.15 },
})
```

## 控制回放

```javascript
const player = map.playTrack(trackPoints, { speed: 2 })

// 暂停
player.pause()

// 继续
player.resume()

// 跳转到指定时间
player.seekTo(3000)

// 设置速度
player.setSpeed(5)

// 停止
player.stop()
```

## 历史轨迹叠加

同时显示历史轨迹线 + 动态回放：

```javascript
// 先画出完整轨迹线
map.addFlyLine({
  from: [trackPoints[0].lng, trackPoints[0].lat],
  to: [trackPoints[trackPoints.length - 1].lng, trackPoints[trackPoints.length - 1].lat],
  color: '#333',
  height: 0,
})

// 再播放动态轨迹
map.playTrack(trackPoints, {
  speed: 3,
  followCamera: true,
  showTrail: true,
  trailColor: '#00f5ff',
})
```

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| speed | number | 1 | 回放速度倍率 |
| loop | boolean | false | 是否循环播放 |
| followCamera | boolean | false | 相机是否跟随移动物体 |
| showTrail | boolean | true | 是否显示轨迹尾迹 |
| lineColor | string | '#00f5ff' | 轨迹线颜色 |
| lineWidth | number | 2 | 轨迹线宽度 |
| markerStyle | object | {} | 移动标记样式 |

## 数据格式

```typescript
interface TrackPoint {
  lng: number     // 经度
  lat: number     // 纬度
  time: number    // 时间戳（毫秒）
  altitude?: number  // 可选海拔
  speed?: number     // 可选速度
  [key: string]: any // 自定义属性
}
```
