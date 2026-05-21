import * as THREE from 'three'

export interface TrackPoint {
  lng: number
  lat: number
  time?: number
  speed?: number
  altitude?: number
  [key: string]: any
}

export interface TrackPlayerOptions {
  speed?: number
  loop?: boolean
  followCamera?: boolean
  lineColor?: string
  lineWidth?: number
  trailColor?: string
  showTrail?: boolean
  markerStyle?: { color?: string; size?: number }
}

export class TrackPlayer {
  private points: THREE.Vector3[] = []
  private marker: THREE.Mesh | null = null
  private trail: THREE.Line | null = null
  private progress = 0
  private playing = false
  private speed: number
  private loop: boolean
  private group: THREE.Group = new THREE.Group()
  private onUpdate?: (progress: number) => void
  private opts: TrackPlayerOptions

  constructor(options: TrackPlayerOptions = {}) {
    this.opts = options
    this.speed = options.speed ?? 1
    this.loop = options.loop ?? false
  }

  getGroup(): THREE.Group { return this.group }

  setTrack(points: THREE.Vector3[]): void {
    this.points = points
    this.progress = 0
    this.createMarker()
    if (this.opts.showTrail !== false) this.createTrail()
  }

  play(onUpdate?: (progress: number) => void): void { this.playing = true; this.onUpdate = onUpdate }
  pause(): void { this.playing = false }
  resume(): void { this.playing = true }
  stop(): void { this.playing = false; this.progress = 0; this.updatePosition() }
  setSpeed(speed: number): void { this.speed = speed }
  seekTo(progressOrTime: number, totalDuration?: number): void {
    if (totalDuration && totalDuration > 0) {
      this.progress = Math.max(0, Math.min(1, progressOrTime / totalDuration))
    } else {
      this.progress = Math.max(0, Math.min(1, progressOrTime))
    }
    this.updatePosition()
  }
  isPlaying(): boolean { return this.playing }
  getProgress(): number { return this.progress }

  update(delta: number): void {
    if (!this.playing || this.points.length < 2) return
    this.progress += delta * this.speed * 0.1
    if (this.progress >= 1) {
      this.progress = this.loop ? 0 : 1
      if (!this.loop) this.playing = false
    }
    this.updatePosition()
    this.onUpdate?.(this.progress)
  }

  private createMarker(): void {
    if (this.marker) {
      this.group.remove(this.marker)
      this.marker.geometry.dispose()
      ;(this.marker.material as THREE.Material).dispose?.()
    }
    const color = this.opts.markerStyle?.color ?? '#ff4444'
    const size = this.opts.markerStyle?.size ?? 0.05
    const geo = new THREE.ConeGeometry(size, size * 3, 8)
    geo.rotateX(Math.PI / 2)
    const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 })
    this.marker = new THREE.Mesh(geo, mat)
    this.group.add(this.marker)
    this.updatePosition()
  }

  private createTrail(): void {
    if (this.trail) {
      this.group.remove(this.trail)
      this.trail.geometry.dispose()
      ;(this.trail.material as THREE.Material).dispose?.()
    }
    const color = this.opts.trailColor ?? this.opts.lineColor ?? '#00f5ff'
    const lineWidth = this.opts.lineWidth ?? 1
    const geo = new THREE.BufferGeometry().setFromPoints(this.points)
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6, linewidth: lineWidth })
    this.trail = new THREE.Line(geo, mat)
    this.group.add(this.trail)
  }

  private updatePosition(): void {
    if (!this.marker || this.points.length < 2) return
    const totalSegments = this.points.length - 1
    const segment = Math.min(Math.floor(this.progress * totalSegments), totalSegments - 1)
    const t = (this.progress * totalSegments) - segment
    const pos = new THREE.Vector3().lerpVectors(this.points[segment], this.points[segment + 1], t)
    this.marker.position.copy(pos)
  }

  dispose(): void {
    if (this.marker) { this.marker.geometry.dispose(); (this.marker.material as THREE.Material).dispose?.() }
    if (this.trail) { this.trail.geometry.dispose(); (this.trail.material as THREE.Material).dispose?.() }
    this.group.clear()
    this.marker = null
    this.trail = null
    this.points = []
  }
}
