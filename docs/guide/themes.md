# 主题配置

HoloKit 提供可配置的主题系统，内置两套预设主题。

## 预设主题

### Cyberpunk（默认）

深色背景、霓虹色板、自发光材质、高对比度。适合大屏监控场景。

### Glass

毛玻璃材质、柔和光影、半透明效果。适合通用商业场景。

## 自定义主题

```typescript
import { HoloKitTheme } from 'holokit'

const myTheme: HoloKitTheme = {
  name: 'custom',
  colors: {
    primary: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'],
    background: '#1a1a2e',
    text: '#eaeaea',
    grid: '#333',
    tooltip: 'rgba(0,0,0,0.8)',
  },
  material: {
    type: 'physical',
    metalness: 0.5,
    roughness: 0.3,
    opacity: 1,
    emissive: false,
  },
  lighting: {
    ambient: { color: '#ffffff', intensity: 0.5 },
    directional: { color: '#ffffff', intensity: 1, position: [5, 10, 5] },
  },
  animation: { duration: 800, easing: 'easeOutCubic' },
}

chart.setTheme(myTheme)
```

## 通用图表配置项

所有继承自 `BaseChart3D` 的图表组件都支持以下统一配置：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| theme | string \| HoloKitTheme | 'cyberpunk' | 主题名称或自定义主题对象 |
| data | any[] | — | 数据 |
| animation.duration | number | 800 | 动画时长（ms） |
| animation.easing | string | 'easeOutCubic' | 缓动函数 |
| animation.enabled | boolean | true | 是否启用入场动画 |
| tooltip.enabled | boolean | true | 是否启用 tooltip |
| tooltip.formatter | (data) => string | — | 自定义 tooltip 内容 |
| camera.position | [x, y, z] | [5, 5, 5] | 相机位置 |
| camera.enableControls | boolean | true | 是否启用鼠标控制 |
| autoRotate | boolean | false | 是否自动旋转图表 |
| rotateSpeed | number | 0.005 | 旋转速率（rad/frame） |
| position.x | number | 0 | 图形 X 轴偏移（默认 0 = 居中） |
| position.y | number | 0 | 图形 Y 轴偏移（默认 0 = 居中） |
| position.z | number | 0 | 图形 Z 轴偏移（默认 0 = 居中） |

## 通用 API

```javascript
// 自动旋转控制
chart.setAutoRotate(true)        // 开启
chart.setAutoRotate(false)       // 关闭
chart.setRotateSpeed(0.003)      // 调整速率
chart.setPosition({ x: 1, y: 0 }) // 调整图形位置（默认 {0,0,0} = 居中）
chart.isAutoRotating()           // 查询状态

// 数据 / 主题
chart.setData(newData)
chart.setTheme('glass')

// 生命周期
chart.resize()
chart.dispose()

// 事件
const off = chart.on('hover', (data) => console.log(data))
off()  // 取消订阅
```

## 自动旋转用例

```javascript
// 大屏展示场景：默认开启旋转，慢速观感
const chart = new BarChart3D(el, {
  data: salesData,
  theme: 'cyberpunk',
  autoRotate: true,
  rotateSpeed: 0.003,
})

// 用户交互场景：默认关闭，按钮控制
const chart = new PieChart3D(el, { data, autoRotate: false })
document.querySelector('#toggle').addEventListener('click', () => {
  chart.setAutoRotate(!chart.isAutoRotating())
})
```


## 图形位置偏移

默认所有图表内容居中显示在容器中心。通过 `position` 配置项可调整图形偏移：

```javascript
const chart = new BarChart3D(el, {
  data,
  position: { x: 1.5, y: 0 },   // 整体向右偏移 1.5 个世界单位
})

// 运行时调整
chart.setPosition({ x: 0, y: -0.5 })
```

`position` 偏移作用于图表的整体场景组（chartGroup），所有柱体/标签/网格会同步移动。常用于：

- 在同一画布中并排放置多个图表，避免遮挡
- 给标题、图例预留空间
- 配合 `camera.position` 自定义视角时微调画面构图
