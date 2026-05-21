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
  private disposed = false

  constructor(container: HTMLElement, options: SceneManagerOptions = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    this.container = container
    this.clock = new THREE.Clock()

    const rect = container.getBoundingClientRect()
    const width = rect.width || 1
    const height = rect.height || 1

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
    if (this.disposed) return
    if (this.animationId !== null) return
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
    if (!width || !height) return
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.stop()
    this.renderCallbacks.clear()
    this.controls?.dispose()
    this.renderer.dispose()
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement)
    }
  }
}
