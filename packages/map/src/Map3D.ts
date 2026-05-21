import * as THREE from 'three'
import { SceneManager, ThemeEngine, InteractionManager, ResponsiveManager, AnimationManager } from '@holokit/core'
import { wgs84ToGcj02, gcj02ToWgs84, gcj02ToBd09, bd09ToGcj02 } from './coordinate/transform'
import { MarkerLayer, MarkerOptions } from './layers/marker'
import { FlyLineLayer, FlyLineOptions } from './layers/flyline'
import { RegionLayer, RegionOptions } from './layers/region'
import { TrackPlayer, TrackPoint, TrackPlayerOptions } from './track/TrackPlayer'

export interface Map3DOptions {
  center?: [number, number]
  zoom?: number
  tileProvider?: string
  coordinateSystem?: 'wgs84' | 'gcj02' | 'bd09'
  theme?: string
  autoRotate?: boolean
  enableControls?: boolean
}

type MapEvent = 'click' | 'markerClick' | 'regionClick'

export class Map3D {
  private sceneManager: SceneManager
  private themeEngine: ThemeEngine
  private interactionManager: InteractionManager
  private responsiveManager: ResponsiveManager
  private animationManager: AnimationManager
  private markerLayer: MarkerLayer
  private flyLineLayer: FlyLineLayer
  private regionLayer: RegionLayer
  private trackPlayer: TrackPlayer | null = null
  private trackUnsub: (() => void) | null = null
  private heatmapGroup: THREE.Group
  private options: Map3DOptions
  private container: HTMLElement
  private mapGroup: THREE.Group
  private handlers: Map<MapEvent, Set<(e: any) => void>> = new Map()
  private disposed = false

  constructor(container: HTMLElement, options: Map3DOptions = {}) {
    this.container = container
    this.options = {
      center: [116.397, 39.908],
      zoom: 5,
      coordinateSystem: 'gcj02',
      theme: 'cyberpunk',
      enableControls: true,
      ...options,
    }

    this.sceneManager = new SceneManager(container, {
      cameraPosition: [0, 8, 8],
      enableControls: this.options.enableControls !== false,
    })
    this.themeEngine = new ThemeEngine(this.sceneManager, this.options.theme!)
    this.interactionManager = new InteractionManager(this.sceneManager)
    this.responsiveManager = new ResponsiveManager(this.sceneManager, container)
    this.animationManager = new AnimationManager()

    this.mapGroup = new THREE.Group()
    this.sceneManager.scene.add(this.mapGroup)

    this.markerLayer = new MarkerLayer()
    this.flyLineLayer = new FlyLineLayer()
    this.regionLayer = new RegionLayer()
    this.heatmapGroup = new THREE.Group()
    this.mapGroup.add(this.markerLayer.getGroup())
    this.mapGroup.add(this.flyLineLayer.getGroup())
    this.mapGroup.add(this.regionLayer.getGroup())
    this.mapGroup.add(this.heatmapGroup)

    this.bindInteractionEvents()
    this.sceneManager.start()
  }

  private bindInteractionEvents(): void {
    this.interactionManager.on('click', (e) => {
      const ud: any = e.object.userData || {}
      if (ud.kind === 'marker') {
        this.emit('markerClick', { marker: ud.data, lng: ud.data?.lng, lat: ud.data?.lat })
      } else if (ud.kind === 'region') {
        this.emit('regionClick', { properties: ud.properties, adcode: ud.properties?.adcode })
      } else {
        this.emit('click', { lng: ud.lng, lat: ud.lat, point: e.point })
      }
    })
  }

  on(event: MapEvent, handler: (e: any) => void): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)!.add(handler)
    return () => this.handlers.get(event)?.delete(handler)
  }

  private emit(event: MapEvent, payload: any): void {
    this.handlers.get(event)?.forEach((h) => h(payload))
  }

  setCenter(center: [number, number]): void {
    this.options.center = center
  }

  setZoom(zoom: number): void {
    this.options.zoom = zoom
  }

  setTheme(theme: string): void {
    this.themeEngine.setTheme(theme)
  }

  addMarker(options: MarkerOptions): THREE.Mesh {
    const mesh = this.markerLayer.addMarker(options, (lat, lng) => this.latLngToPosition(lat, lng, options.coordinateSystem))
    mesh.userData = { ...mesh.userData, kind: 'marker', data: options }
    this.interactionManager.addInteractive(mesh)
    return mesh
  }

  addFlyLine(options: FlyLineOptions): THREE.Line {
    return this.flyLineLayer.addFlyLine(options, this.latLngToPosition.bind(this))
  }

  addRegion(options: RegionOptions): void {
    this.regionLayer.addRegion(options, this.projectCoord.bind(this))
  }

  setHeatmap(
    data: Array<{ lng: number; lat: number; value: number }>,
    options: { radius?: number; heightScale?: number; colorRange?: string[] } = {}
  ): void {
    this.clearHeatmap()
    if (!data.length) return
    const radius = options.radius ?? 0.05
    const heightScale = options.heightScale ?? 0.5
    const max = Math.max(...data.map((d) => d.value))
    const colors = options.colorRange?.map((c) => new THREE.Color(c))

    data.forEach((point) => {
      const pos = this.latLngToPosition(point.lat, point.lng)
      const h = (point.value / max) * heightScale * 4
      const geo = new THREE.BoxGeometry(radius, h, radius)
      geo.translate(0, h / 2, 0)
      const t = point.value / max
      let color: THREE.Color
      if (colors && colors.length) {
        const idx = Math.min(colors.length - 1, Math.floor(t * (colors.length - 1)))
        color = colors[idx]
      } else {
        color = new THREE.Color().setHSL(0.66 - t * 0.66, 0.9, 0.5)
      }
      const mat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.85 })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.copy(pos)
      this.heatmapGroup.add(mesh)
    })
  }

  private clearHeatmap(): void {
    while (this.heatmapGroup.children.length > 0) {
      const child = this.heatmapGroup.children[0] as THREE.Mesh
      this.heatmapGroup.remove(child)
      child.geometry?.dispose?.()
      const m = child.material as any
      if (Array.isArray(m)) m.forEach((mm: any) => mm.dispose?.())
      else m?.dispose?.()
    }
  }

  clearLayers(opts: { markers?: boolean; flyLines?: boolean; regions?: boolean; heatmap?: boolean } = {
    markers: true, flyLines: true, regions: true, heatmap: true,
  }): void {
    if (opts.markers !== false) this.markerLayer.clear()
    if (opts.flyLines !== false) this.flyLineLayer.clear()
    if (opts.regions !== false) this.regionLayer.clear()
    if (opts.heatmap !== false) this.clearHeatmap()
  }

  clearRegions(): void {
    this.regionLayer.clear()
  }

  clear(): void {
    this.clearLayers()
    this.stopTrack()
  }

  playTrack(points: TrackPoint[], options: TrackPlayerOptions = {}): TrackPlayer {
    this.stopTrack()
    this.trackPlayer = new TrackPlayer(options)
    const positions = points.map((p) => this.latLngToPosition(p.lat, p.lng))
    this.trackPlayer.setTrack(positions)
    this.mapGroup.add(this.trackPlayer.getGroup())
    this.trackUnsub = this.sceneManager.onRender((delta) => this.trackPlayer?.update(delta))
    this.trackPlayer.play()
    return this.trackPlayer
  }

  private stopTrack(): void {
    if (this.trackUnsub) { this.trackUnsub(); this.trackUnsub = null }
    if (this.trackPlayer) {
      this.mapGroup.remove(this.trackPlayer.getGroup())
      this.trackPlayer.dispose()
      this.trackPlayer = null
    }
  }

  private toMapCoord(lng: number, lat: number, sourceSystem?: 'wgs84' | 'gcj02' | 'bd09'): [number, number] {
    const target = this.options.coordinateSystem || 'gcj02'
    const source = sourceSystem || target
    if (source === target) return [lng, lat]
    if (source === 'wgs84' && target === 'gcj02') return wgs84ToGcj02(lng, lat)
    if (source === 'gcj02' && target === 'wgs84') return gcj02ToWgs84(lng, lat)
    if (source === 'gcj02' && target === 'bd09') return gcj02ToBd09(lng, lat)
    if (source === 'bd09' && target === 'gcj02') return bd09ToGcj02(lng, lat)
    if (source === 'wgs84' && target === 'bd09') {
      const gcj = wgs84ToGcj02(lng, lat); return gcj02ToBd09(gcj[0], gcj[1])
    }
    if (source === 'bd09' && target === 'wgs84') {
      const gcj = bd09ToGcj02(lng, lat); return gcj02ToWgs84(gcj[0], gcj[1])
    }
    return [lng, lat]
  }

  private latLngToPosition(lat: number, lng: number, sourceSystem?: 'wgs84' | 'gcj02' | 'bd09'): THREE.Vector3 {
    const center = this.options.center!
    const [tLng, tLat] = this.toMapCoord(lng, lat, sourceSystem)
    const scale = 0.05 * (this.options.zoom ? this.options.zoom / 5 : 1)
    return new THREE.Vector3((tLng - center[0]) * scale, 0, -(tLat - center[1]) * scale)
  }

  private projectCoord(lng: number, lat: number): [number, number] {
    const center = this.options.center!
    const [tLng, tLat] = this.toMapCoord(lng, lat)
    const scale = 0.05 * (this.options.zoom ? this.options.zoom / 5 : 1)
    return [(tLng - center[0]) * scale, (tLat - center[1]) * scale]
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.stopTrack()
    this.handlers.clear()
    this.markerLayer.dispose()
    this.flyLineLayer.dispose()
    this.regionLayer.dispose()
    this.clearHeatmap()
    this.animationManager.dispose()
    this.interactionManager.dispose()
    this.responsiveManager.dispose()
    this.sceneManager.dispose()
  }
}
