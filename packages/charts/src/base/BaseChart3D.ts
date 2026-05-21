import * as THREE from 'three'
import {
  SceneManager,
  SceneManagerOptions,
  ThemeEngine,
  AnimationManager,
  InteractionManager,
  ResponsiveManager,
  Tooltip,
  HoloKitTheme,
} from '@holokit/core'

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
}

export abstract class BaseChart3D<TData = any[]> {
  protected sceneManager: SceneManager
  protected themeEngine: ThemeEngine
  protected animationManager: AnimationManager
  protected interactionManager: InteractionManager
  protected responsiveManager: ResponsiveManager
  protected tooltip: Tooltip
  protected container: HTMLElement
  protected options: ChartOptions<TData>
  protected chartGroup: THREE.Group
  protected currentData: TData | null = null
  protected disposed = false
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

    this.chartGroup = new THREE.Group()
    this.sceneManager.scene.add(this.chartGroup)

    if (options.data) {
      this.currentData = options.data
      this.buildChart(options.data)
    }

    this.sceneManager.start()
  }

  setData(data: TData): void {
    if (this.disposed) return
    this.currentData = data
    this.clearChart()
    this.buildChart(data)
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
    this.responsiveManager.dispose()
    this.sceneManager.dispose()
  }

  on(event: 'hover' | 'unhover' | 'click', handler: (data: any) => void): () => void {
    return this.interactionManager.on(event, (e) => {
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
    if (this.currentData) this.buildChart(this.currentData)
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
      onUpdate: (progress) => {
        mesh.scale.y = targetScale * progress
      },
    })
  }
}
