import * as THREE from 'three'
import {
  SceneManager,
  SceneManagerOptions,
  ThemeEngine,
  AnimationManager,
  InteractionManager,
  ResponsiveManager,
  Tooltip,
  Legend,
  HoloKitTheme,
} from '@holokit/core'
import type { LegendItem, LegendOptions } from '@holokit/core'

export interface ChartOptions<TData = any[]> {
  theme?: string | HoloKitTheme
  data?: TData
  width?: number
  height?: number
  animation?: {
    duration?: number
    easing?: string
    enabled?: boolean
  }
  tooltip?: {
    enabled?: boolean
    formatter?: (data: any) => string
  }
  camera?: {
    position?: [number, number, number]
    enableControls?: boolean
  }
  autoRotate?: boolean
  rotateSpeed?: number
  position?: { x?: number; y?: number; z?: number }
  legend?: LegendOptions & { items?: LegendItem[] }
  emptyText?: string
  colors?: string[]
  textColor?: string
}

export abstract class BaseChart3D<TData = any[]> {
  protected sceneManager: SceneManager
  protected themeEngine: ThemeEngine
  protected animationManager: AnimationManager
  protected interactionManager: InteractionManager
  protected responsiveManager: ResponsiveManager
  protected tooltip: Tooltip
  protected legend: Legend
  protected container: HTMLElement
  protected options: ChartOptions<TData>
  protected chartGroup: THREE.Group
  protected currentData: TData | null = null
  protected disposed = false
  protected autoRotate = false
  protected rotateSpeed = 0.005
  protected emptyEl: HTMLDivElement | null = null
  private renderUnsubs: Array<() => void> = []

  constructor(container: HTMLElement, options: ChartOptions<TData> = {}) {
    this.container = container
    this.options = options

    const sceneOptions: SceneManagerOptions = {
      cameraPosition: options.camera?.position || [5, 5, 5],
      enableControls: options.camera?.enableControls !== false,
    }

    this.sceneManager = new SceneManager(container, sceneOptions)
    this.themeEngine = new ThemeEngine(this.sceneManager, options.theme || 'cyberpunk')
    this.animationManager = new AnimationManager()
    this.interactionManager = new InteractionManager(this.sceneManager)
    this.responsiveManager = new ResponsiveManager(this.sceneManager, container)
    this.tooltip = new Tooltip(container)
    const hasInitialLegendItems = !!options.legend?.items?.length
    this.legend = new Legend(container, { show: false, ...options.legend })
    if (hasInitialLegendItems) {
      this.legend.setItems(options.legend!.items!)
      if (options.legend?.show !== false) this.legend.show()
    }

    this.chartGroup = new THREE.Group()
    this.applyPosition(options.position)
    this.sceneManager.scene.add(this.chartGroup)

    if (options.data) {
      this.currentData = options.data
      this.buildOrEmpty(options.data)
    } else {
      this.showEmpty(options.emptyText)
    }

    this.autoRotate = options.autoRotate === true
    this.rotateSpeed = options.rotateSpeed ?? 0.005
    this.addRenderHook(() => {
      if (this.autoRotate && this.chartGroup) {
        this.chartGroup.rotation.y += this.rotateSpeed
      }
    })

    this.sceneManager.start()
  }

  setAutoRotate(enabled: boolean): void { this.autoRotate = enabled }
  setRotateSpeed(speed: number): void { this.rotateSpeed = speed }
  isAutoRotating(): boolean { return this.autoRotate }

  exportImage(type: 'png' | 'jpeg' = 'png', quality = 0.92): string {
    this.sceneManager.renderer.render(this.sceneManager.scene, this.sceneManager.camera)
    return this.sceneManager.renderer.domElement.toDataURL(`image/${type}`, quality)
  }

  downloadImage(filename = 'chart', type: 'png' | 'jpeg' = 'png'): void {
    const dataUrl = this.exportImage(type)
    const link = document.createElement('a')
    link.download = `${filename}.${type}`
    link.href = dataUrl
    link.click()
  }

  setCameraPreset(preset: 'default' | 'top' | 'front' | 'side'): void {
    const cam = this.sceneManager.camera
    const presets: Record<string, [number, number, number]> = {
      default: [5, 5, 5],
      top: [0, 8, 0.01],
      front: [0, 2, 8],
      side: [8, 2, 0],
    }
    const pos = presets[preset] || presets.default
    cam.position.set(...pos)
    cam.lookAt(0, 0, 0)
    if (this.sceneManager.controls) {
      this.sceneManager.controls.target.set(0, 0, 0)
      this.sceneManager.controls.update()
    }
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  setPosition(position: { x?: number; y?: number; z?: number }): void {
    this.applyPosition(position)
  }

  protected getColors(): string[] {
    return this.options.colors || this.themeEngine.getTheme().colors.primary
  }

  protected getTextColor(): string {
    return this.options.textColor || this.themeEngine.getTheme().colors.text
  }

  private applyPosition(position?: { x?: number; y?: number; z?: number }): void {
    if (!position) return
    if (position.x !== undefined) this.chartGroup.position.x = position.x
    if (position.y !== undefined) this.chartGroup.position.y = position.y
    if (position.z !== undefined) this.chartGroup.position.z = position.z
  }

  setData(data: TData): void {
    if (this.disposed) return
    this.currentData = data
    this.clearChart()
    this.buildOrEmpty(data)
  }

  setLegend(items: LegendItem[]): void {
    if (this.disposed) return
    this.legend.setItems(items)
    if (items.length) this.legend.show()
    else this.legend.hide()
  }

  protected buildOrEmpty(data: TData): void {
    this.legend.setItems([])
    this.legend.hide()
    if (this.isEmptyData(data)) {
      this.showEmpty()
      return
    }
    this.hideEmpty()
    this.buildChart(data)
  }

  protected isEmptyData(data: TData): boolean {
    if (data == null) return true
    if (Array.isArray(data)) return data.length === 0
    if (typeof data === 'object') {
      const obj = data as any
      if (Array.isArray(obj.nodes)) return obj.nodes.length === 0
    }
    return false
  }

  protected showEmpty(text?: string): void {
    const message = text || this.options.emptyText || '暂无数据'
    if (!this.emptyEl) {
      this.emptyEl = document.createElement('div')
      Object.assign(this.emptyEl.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#94a3b8',
        fontSize: '14px',
        pointerEvents: 'none',
        zIndex: '998',
      })
      if (getComputedStyle(this.container).position === 'static') this.container.style.position = 'relative'
      this.container.appendChild(this.emptyEl)
    }
    this.emptyEl.textContent = message
    this.emptyEl.style.display = 'block'
  }

  protected hideEmpty(): void {
    if (this.emptyEl) this.emptyEl.style.display = 'none'
  }

  setTheme(theme: string | HoloKitTheme): void {
    if (this.disposed) return
    this.themeEngine.setTheme(theme)
    this.rebuildWithCurrentData()
  }

  resize(): void {
    const { width, height } = this.container.getBoundingClientRect()
    this.sceneManager.resize(width, height)
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.sceneManager.stop()
    this.renderUnsubs.forEach((fn) => fn())
    this.renderUnsubs = []
    this.clearChart()
    this.animationManager.dispose()
    this.interactionManager.dispose()
    this.tooltip.dispose()
    this.legend.dispose()
    this.responsiveManager.dispose()
    this.sceneManager.dispose()
    if (this.emptyEl?.parentElement === this.container) this.container.removeChild(this.emptyEl)
    this.emptyEl = null
  }

  on(event: 'hover' | 'unhover' | 'click', handler: (data: any) => void): () => void {
    return this.interactionManager.on(event, (e: any) => {
      const chartData = e.object.userData?.chartData
      if (chartData) handler(chartData)
    })
  }

  protected addRenderHook(cb: (delta: number) => void): void {
    const unsub = this.sceneManager.onRender(cb)
    this.renderUnsubs.push(unsub)
  }

  protected abstract buildChart(data: TData): void

  protected rebuildWithCurrentData(): void {
    this.clearChart()
    if (this.currentData) this.buildOrEmpty(this.currentData)
  }

  protected clearChart(): void {
    this.interactionManager.clearInteractive()
    while (this.chartGroup.children.length > 0) {
      const child = this.chartGroup.children[0]
      this.chartGroup.remove(child)
      this.disposeObject(child)
    }
  }

  protected disposeObject(obj: THREE.Object3D): void {
    obj.traverse((node) => {
      if ((node as any).geometry) (node as any).geometry.dispose?.()
      const mat = (node as any).material
      if (mat) {
        if (Array.isArray(mat)) mat.forEach((m: any) => m.dispose?.())
        else mat.dispose?.()
      }
    })
  }

  protected animateEntrance(mesh: THREE.Object3D, targetScale: number, index: number): void {
    if (this.options.animation?.enabled === false) {
      mesh.scale.setScalar(targetScale)
      return
    }
    const duration = this.options.animation?.duration || this.themeEngine.getTheme().animation.duration
    const easing = this.options.animation?.easing || this.themeEngine.getTheme().animation.easing

    mesh.scale.set(targetScale, 0, targetScale)
    this.animationManager.animate({
      duration,
      easing,
      delay: index * 50,
      onUpdate: (progress: number) => {
        mesh.scale.y = targetScale * progress
      },
    })
  }
}
