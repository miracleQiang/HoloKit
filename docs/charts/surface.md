# 3D 曲面图

## 基础用法

```javascript
import { SurfaceChart3D } from 'holokit'

// 生成曲面数据
const data = []
for (let x = -3; x <= 3; x += 0.3) {
  for (let z = -3; z <= 3; z += 0.3) {
    data.push({ x, z, y: Math.sin(x) * Math.cos(z) })
  }
}

const chart = new SurfaceChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  resolution: 20,
  data
})
```

## 线框模式

```javascript
const chart = new SurfaceChart3D(document.getElementById('container'), {
  theme: 'glass',
  wireframe: true,
  resolution: 30,
  data: generateSurfaceData()
})
```

## 颜色映射

通过 `colorMap` 设置高度颜色映射：

```javascript
const chart = new SurfaceChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  colorMap: ['#0000ff', '#00ff00', '#ffff00', '#ff0000'],
  resolution: 25,
  data: generateTerrainData()
})
```

## 数学函数可视化

```javascript
// 鞍面
const saddleData = []
for (let x = -2; x <= 2; x += 0.2) {
  for (let z = -2; z <= 2; z += 0.2) {
    saddleData.push({ x, z, y: x * x - z * z })
  }
}

const chart = new SurfaceChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  colorMap: ['#00f5ff', '#ff00ff'],
  data: saddleData
})
```

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| resolution | number | 20 | 网格分辨率 |
| wireframe | boolean | false | 是否显示线框 |
| colorMap | string[] | 主题色板 | 高度颜色映射数组 |
| opacity | number | 1 | 曲面透明度 |

## API

| 方法 | 说明 |
|------|------|
| setData(data) | 更新曲面数据 |
| setTheme(theme) | 切换主题 |
| dispose() | 销毁实例 |

## 数据格式

```typescript
interface SurfaceChartData {
  x: number   // X 坐标
  y: number   // 高度值
  z: number   // Z 坐标
}
```
