# HoloKit Phase 1: 项目脚手架 + Core 引擎 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建 HoloKit Monorepo 项目结构，实现 Core 引擎（场景管理、主题系统、动画系统、交互系统），为后续图表和地图模块提供基础能力。

**Architecture:** pnpm workspace Monorepo，TypeScript 编写，Rollup 打包输出 UMD + ESM。Core 引擎封装 Three.js 的场景、相机、渲染器、光照管理，提供主题切换和动画能力。

**Tech Stack:** TypeScript, Three.js, pnpm workspace, Rollup, Vite, Vitest, ESLint, Prettier

---

## 文件结构

```
holokit/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── tsconfig.base.json
├── .eslintrc.cjs
├── .prettierrc
├── packages/
│   └── core/
│       ├── package.json
│       ├── tsconfig.json
│       ├── rollup.config.mjs
│       ├── src/
│       │   ├── index.ts
│       │   ├── scene/SceneManager.ts
│       │   ├── scene/index.ts
│       │   ├── theme/ThemeEngine.ts
│       │   ├── theme/presets.ts
│       │   ├── theme/types.ts
│       │   ├── theme/index.ts
│       │   ├── animation/AnimationManager.ts
│       │   ├── animation/easings.ts
│       │   ├── animation/index.ts
│       │   ├── interaction/InteractionManager.ts
│       │   ├── interaction/Tooltip.ts
│       │   ├── interaction/index.ts
│       │   ├── responsive/ResizeObserver.ts
│       │   └── responsive/index.ts
│       └── __tests__/
│           ├── SceneManager.test.ts
│           ├── ThemeEngine.test.ts
│           ├── AnimationManager.test.ts
│           └── InteractionManager.test.ts
```

---

### Task 1: 初始化 Monorepo 项目结构

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `tsconfig.json`
- Create: `.eslintrc.cjs`
- Create: `.prettierrc`
- Create: `.gitignore`
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`

- [ ] **Step 1: 初始化根 package.json**

```json
{
  "name": "holokit-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel run dev",
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "lint": "eslint packages --ext .ts,.tsx"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: 创建 pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
  - 'docs'
```

- [ ] **Step 4: 创建 tsconfig.json（根）**

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@holokit/core": ["packages/core/src"]
    }
  },
  "references": [
    { "path": "packages/core" }
  ]
}
```

- [ ] **Step 5: 创建 .eslintrc.cjs**

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  env: { browser: true, node: true, es2020: true },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off'
  }
}
```

- [ ] **Step 6: 创建 .prettierrc**

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

- [ ] **Step 7: 创建 .gitignore**

```
node_modules/
dist/
.DS_Store
*.log
coverage/
.vite/
```

- [ ] **Step 8: 创建 packages/core/package.json**

```json
{
  "name": "@holokit/core",
  "version": "0.1.0",
  "description": "HoloKit 3D UI 组件库核心引擎",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "dev": "vite",
    "build": "rollup -c",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "three": "^0.164.0"
  },
  "devDependencies": {
    "@types/three": "^0.164.0",
    "rollup": "^4.14.0",
    "@rollup/plugin-typescript": "^11.1.0",
    "@rollup/plugin-node-resolve": "^15.2.0",
    "rollup-plugin-dts": "^6.1.0",
    "tslib": "^2.6.0"
  }
}
```

- [ ] **Step 9: 创建 packages/core/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
```

- [ ] **Step 10: 安装依赖**

Run: `pnpm install`
Expected: 依赖安装成功，生成 pnpm-lock.yaml

- [ ] **Step 11: 验证项目结构**

Run: `pnpm ls -r`
Expected: 显示 @holokit/core 包及其依赖

---

### Task 2: Core 场景管理器（SceneManager）

**Files:**
- Create: `packages/core/src/scene/SceneManager.ts`
- Create: `packages/core/src/scene/index.ts`
- Create: `packages/core/src/index.ts`
- Test: `packages/core/__tests__/SceneManager.test.ts`

- [ ] **Step 1: 创建 SceneManager**

```typescript
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export interface SceneManagerOptions {
  antialias?: boolean
  alpha?: boolean
  backgroundColor?: string
  cameraPosition?: [number, number, number]
  enableControls?: boolean
}

const DEFAULT_OPTIONS: Required<SceneManagerOptions> = {
  antialias: true,
  alpha: false,
  backgroundColor: '#0a0e1a',
  cameraPosition: [5, 5, 5],
  enableControls: true,
}

export class SceneManager {
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  public renderer: THREE.WebGLRenderer
  public controls: OrbitControls | null = null

  private container: HTMLElement
  private animationId: number | null = null
  private renderCallbacks: Set<(delta: number) => void> = new Set()
  private clock: THREE.Clock

  constructor(container: HTMLElement, options: SceneManagerOptions = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    this.container = container
    this.clock = new THREE.Clock()

    const { width, height } = container.getBoundingClientRect()

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(opts.backgroundColor)

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    this.camera.position.set(...opts.cameraPosition)
    this.camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer({
      antialias: opts.antialias,
      alpha: opts.alpha,
    })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(this.renderer.domElement)

    if (opts.enableControls) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.enableDamping = true
    }
  }

  onRender(callback: (delta: number) => void): () => void {
    this.renderCallbacks.add(callback)
    return () => this.renderCallbacks.delete(callback)
  }

  start(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate)
      const delta = this.clock.getDelta()
      this.controls?.update()
      this.renderCallbacks.forEach((cb) => cb(delta))
      this.renderer.render(this.scene, this.camera)
    }
    animate()
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  dispose(): void {
    this.stop()
    this.renderCallbacks.clear()
    this.controls?.dispose()
    this.renderer.dispose()
    this.container.removeChild(this.renderer.domElement)
  }
}
```
