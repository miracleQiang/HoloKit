# HoloKit 3D UI 组件库 — 设计规格

## 概述

HoloKit 是一个基于 Three.js 的 3D 数据可视化组件库，提供统计图表、统计表格、地图 & GIS 模块。打包为单个 JS 文件，通过纯 JS Class API + 框架适配层的方式兼容 Vue2、Vue3、React。配套一个沉浸式 3D 展示首页 + VitePress 文档站。

## 技术选型

| 层级 | 技术 |
|------|------|
| 3D 渲染 | Three.js |
| 核心语言 | TypeScript |
| 构建工具 | Rollup（库打包）+ Vite（开发/文档站） |
| 包管理 | pnpm workspace（Monorepo） |
| 文档站 | VitePress + 自定义 3D 首页 |
| 测试 | Vitest（单元）+ Playwright（E2E） |
| 代码规范 | ESLint + Prettier |

## 项目结构

```
holokit/
├── packages/
│   ├── core/          # 核心渲染引擎
│   ├── charts/        # 3D 统计图表组件
│   ├── table/         # 3D 统计表格组件
│   ├── map/           # 地图 & GIS 模块
│   ├── vue2-adapter/  # Vue2 适配层
│   ├── vue3-adapter/  # Vue3 适配层
│   ├── react-adapter/ # React 适配层
│   └── holokit/       # 主包（聚合导出）
├── docs/              # VitePress 文档站
└── examples/          # 各框架使用示例
```

## Core 引擎模块

```
packages/core/
├── scene/        # Three.js 场景管理（场景、相机、渲染器、自适应容器）
├── theme/        # 主题引擎（颜色、材质、光照、预设切换）
├── animation/    # 动画系统（入场动画、过渡动画、交互动画）
├── interaction/  # 交互系统（鼠标悬停、点击、tooltip、相机控制）
├── responsive/   # 响应式适配（容器尺寸监听、自动缩放）
└── utils/        # 工具函数（坐标转换、颜色处理、数学计算）
```

## API 设计

### 统一使用方式

```javascript
import HoloKit from 'holokit'

const chart = new HoloKit.BarChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  data: [...],
  xAxis: { label: '月份' },
  yAxis: { label: '销售额' },
  animation: { duration: 1000, easing: 'easeOutCubic' }
})

chart.setData(newData)
chart.dispose()
```

### 地图模块 API

```javascript
const map = new HoloKit.Map3D(el, {
  center: [116.397, 39.908],
  zoom: 5,
  tileProvider: 'amap',
  coordinateSystem: 'gcj02',
})

map.addMarker({ lng: 121.47, lat: 31.23, label: '上海' })
map.addFlyLine({ from: [116.39, 39.90], to: [121.47, 31.23] })
map.setHeatmap(geoData, valueField)
map.playTrack(trackPoints, { speed: 2 })
```

## 地图 GIS 模块

### 架构分层

```
packages/map/
├── tile/              # 瓦片加载引擎
│   ├── providers/     # 各底图源适配器（amap、tianditu、mapbox、xyz）
│   ├── cache/         # 瓦片缓存策略
│   └── loader.ts      # 瓦片加载调度器
├── coordinate/        # 坐标系统
│   ├── transform.ts   # WGS84 ↔ GCJ02 ↔ BD09 坐标转换
│   ├── projection.ts  # 投影变换（墨卡托、等距圆柱等）
│   └── utils.ts       # 距离计算、面积计算
├── layers/            # 图层系统
│   ├── marker.ts      # 标注点图层
│   ├── bindline.ts    # 飞线 / 轨迹图层
│   ├── region.ts      # 区域图层（GeoJSON 渲染）
│   ├── heatmap.ts     # 热力图层
│   └── custom.ts      # 自定义图层基类
├── analysis/          # 空间分析
│   ├── buffer.ts      # 缓冲区分析
│   ├── distance.ts    # 距离计算
│   ├── intersect.ts   # 相交判断
│   └── bindwithin.ts  # 围栏判断（点在多边形内）
├── terrain/           # 地形渲染
│   ├── dem.ts         # DEM 高程数据加载
│   └── renderer.ts    # 地形网格渲染
├── track/             # 轨迹回放
│   ├── player.ts      # 播放控制器
│   └── interpolator.ts # 轨迹插值
└── globe/             # 3D 地球
    ├── globe.ts       # 地球体渲染
    └── sphere.ts      # 球面坐标映射
```

### GIS 关键能力

| 功能 | 说明 |
|------|------|
| 瓦片加载 | 支持 XYZ/TMS/WMTS 协议，内置高德、天地图适配器 |
| 坐标转换 | WGS84、GCJ02、BD09 三种坐标系互转 |
| 区域下钻 | 中国地图 → 省 → 市，点击下钻，支持自定义 GeoJSON |
| 飞线动画 | 贝塞尔曲线飞线，支持多条并发、颜色/粗细/速度可配 |
| 热力图 | 基于经纬度的 3D 柱状热力 / 颜色热力 |
| 空间分析 | 缓冲区生成、距离计算、多边形相交、点在面内判断 |
| 轨迹回放 | 轨迹点插值、速度控制、视角跟随 |
| 地形渲染 | DEM 数据加载，3D 地形网格 |
| 3D 地球 | 可旋转地球，支持贴图、标注、飞线 |

### GeoJSON 数据策略

- 中国省级行政区 GeoJSON 内置（压缩后约 200KB）
- 世界国家 GeoJSON 内置（简化版，约 300KB）
- 市级数据按需加载（用户提供 CDN 地址或本地文件）

## 主题系统

### 主题配置结构

```typescript
interface HoloKitTheme {
  name: string
  colors: {
    primary: string[]      // 数据系列色板
    background: string     // 场景背景色
    text: string           // 文字颜色
    grid: string           // 网格线颜色
    tooltip: string        // 提示框背景
  }
  material: {
    type: 'standard' | 'physical' | 'toon'
    metalness: number
    roughness: number
    opacity: number
    emissive: boolean
  }
  lighting: {
    ambient: { color: string, intensity: number }
    directional: { color: string, intensity: number, position: [number,number,number] }
  }
  animation: {
    duration: number
    easing: string
  }
}
```

### 预设主题

- **cyberpunk** — 深色背景 `#0a0e1a`，霓虹色板（青、紫、粉），自发光材质，高对比度
- **glass** — 半透明背景，毛玻璃材质（高透明度 + 模糊），柔和光照，浅色/深色双模式

## 图表组件清单

### 基础图表

| 组件 | 特有配置 |
|------|----------|
| BarChart3D | barWidth, barGap, grouped/stacked 模式 |
| PieChart3D | innerRadius（环形）, explode（分离） |
| LineChart3D | lineWidth, areaFill, smooth |
| ScatterChart3D | pointSize, sizeField, colorField |

### 进阶图表

| 组件 | 特有配置 |
|------|----------|
| SurfaceChart3D | resolution, wireframe, colorMap |
| HeatmapChart3D | gridSize, heightScale, colorRange |
| RadarChart3D | axisCount, fillOpacity |
| FunnelChart3D | direction, gap, sortOrder |
| ForceGraph3D | nodeSize, linkDistance, gravity |
| GlobeChart3D | 复用 Map3D 地球能力 + 数据图层 |

### 统计表格

| 组件 | 说明 |
|------|------|
| FlipCardTable3D | 3D 翻转卡片式数据表 |
| FloatPanelTable3D | 3D 悬浮面板式表格 |

## 框架适配层

每个适配器都是薄包装，核心逻辑全在 core/charts/map 中。

- **Vue3 适配器**：Composition API，watch props 驱动更新
- **Vue2 适配器**：Options API，$watch 驱动更新
- **React 适配器**：useRef + useEffect 管理生命周期

## 打包输出

```
dist/
├── holokit.min.js          # UMD 全量包（含 Three.js）
├── holokit.esm.js          # ESM 格式（支持 tree-shaking）
├── holokit.css             # 基础样式（tooltip、容器）
├── adapters/
│   ├── vue3/               # Vue3 组件包
│   ├── vue2/               # Vue2 组件包
│   └── react/              # React 组件包
└── geodata/
    ├── china.json          # 中国省级 GeoJSON
    └── world.json          # 世界国家 GeoJSON
```

## 文档站设计

### 技术栈

VitePress + 自定义 Vue 组件（3D 首页）

### 首页滚动流程

1. Hero 区域 — 3D 地球旋转 + 粒子背景 + 标题
2. 滚动触发 → 3D 柱状图从地球中"生长"出来，展示图表能力
3. 继续滚动 → 切换为中国地图 + 飞线动画，展示 GIS 能力
4. 继续滚动 → 主题切换演示（cyberpunk ↔ glass）
5. 继续滚动 → 代码示例 + 框架 Logo，展示 3 行代码即可使用
6. Footer — GitHub / npm / 文档入口

### 文档内页结构

- 快速开始（安装、引入、第一个图表）
- 主题配置
- 各图表组件（每个一页：说明 + Demo + API）
- 地图模块（基础用法、图层、GIS 分析）
- 框架适配器用法
- 完整 API 参考
