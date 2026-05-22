# 3D 饼图


<ClientOnly>
  <PieChartDemo />
</ClientOnly>
## 基础用法

```javascript
import { PieChart3D } from 'holokit'

const chart = new PieChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  data: [
    { label: '直接访问', value: 335 },
    { label: '邮件营销', value: 310 },
    { label: '联盟广告', value: 234 },
    { label: '视频广告', value: 135 },
    { label: '搜索引擎', value: 1548 },
  ]
})
```

## 环形图

通过设置 `innerRadius` 实现环形图效果：

```javascript
const chart = new PieChart3D(document.getElementById('container'), {
  theme: 'glass',
  innerRadius: 0.8,
  data: [
    { label: '完成', value: 75 },
    { label: '未完成', value: 25 },
  ]
})
```

## 分离效果

通过 `explode` 参数让扇区分离：

```javascript
const chart = new PieChart3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  explode: 0.3,
  height: 0.8,
  data: [
    { label: '华东', value: 420 },
    { label: '华南', value: 380 },
    { label: '华北', value: 350 },
    { label: '西南', value: 200 },
    { label: '其他', value: 150 },
  ]
})
```

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| innerRadius | number | 0 | 内圆半径（0 为实心饼图，>0 为环形图） |
| explode | number | 0 | 扇区分离距离 |
| height | number | 0.5 | 饼图厚度 |
| theme | string / object | 'cyberpunk' | 主题名称或自定义主题对象 |
| autoRotate | boolean | false | 是否自动旋转图表 |
| rotateSpeed | number | 0.005 | 旋转速率（rad/frame） |
| position | `{ x?, y?, z? }` | `{ 0, 0, 0 }` | 图形位置偏移，默认居中 |

## API

| 方法 | 说明 |
|------|------|
| setData(data) | 更新数据，自动重新计算比例 |
| setTheme(theme) | 切换主题 |
| dispose() | 销毁实例 |
| setAutoRotate(enabled) | 切换自动旋转 |
| setRotateSpeed(speed) | 设置旋转速率 |
| setPosition(position) | 调整图形位置 |
| on('hover', handler) | 悬停事件，返回 label、value、percentage |
| on('click', handler) | 点击事件 |

## 数据格式

```typescript
interface PieChartData {
  label: string   // 扇区标签
  value: number   // 数值（自动计算百分比）
}
```
