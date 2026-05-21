# 3D 力导向关系图

## 基础用法

```javascript
import { ForceGraph3D } from 'holokit'

const chart = new ForceGraph3D(document.getElementById('container'), {
  theme: 'cyberpunk',
  data: {
    nodes: [
      { id: '1', label: '用户A', group: 'user' },
      { id: '2', label: '用户B', group: 'user' },
      { id: '3', label: '用户C', group: 'user' },
      { id: '4', label: '服务器', group: 'server' },
      { id: '5', label: '数据库', group: 'db' },
    ],
    links: [
      { source: '1', target: '4' },
      { source: '2', target: '4' },
      { source: '3', target: '4' },
      { source: '4', target: '5' },
    ]
  }
})
```

## 社交网络

```javascript
const chart = new ForceGraph3D(document.getElementById('container'), {
  theme: 'glass',
  nodeSize: 0.3,
  linkDistance: 3,
  gravity: 0.1,
  data: {
    nodes: [
      { id: 'alice', label: 'Alice', group: 'core', size: 5 },
      { id: 'bob', label: 'Bob', group: 'core', size: 4 },
      { id: 'carol', label: 'Carol', group: 'dev', size: 3 },
      { id: 'dave', label: 'Dave', group: 'dev', size: 3 },
      { id: 'eve', label: 'Eve', group: 'design', size: 2 },
      { id: 'frank', label: 'Frank', group: 'design', size: 2 },
    ],
    links: [
      { source: 'alice', target: 'bob', weight: 5 },
      { source: 'alice', target: 'carol', weight: 3 },
      { source: 'bob', target: 'dave', weight: 4 },
      { source: 'carol', target: 'dave', weight: 2 },
      { source: 'eve', target: 'alice', weight: 1 },
      { source: 'frank', target: 'eve', weight: 3 },
    ]
  }
})
```

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| nodeSize | number | 0.2 | 节点基础大小 |
| linkDistance | number | 2 | 连线理想长度 |
| gravity | number | 0.05 | 引力强度 |
| iterations | number | 100 | 力模拟迭代次数 |

## API

| 方法 | 说明 |
|------|------|
| setData(data) | 更新图数据 |
| setTheme(theme) | 切换主题 |
| dispose() | 销毁实例 |
| on('hover', handler) | 悬停节点 |
| on('click', handler) | 点击节点 |

## 数据格式

```typescript
interface ForceNode { id: string; label?: string; group?: string; size?: number }
interface ForceLink { source: string; target: string; weight?: number }
interface ForceGraphData { nodes: ForceNode[]; links: ForceLink[] }
```
