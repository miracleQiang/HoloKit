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
}

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
  private options: Map3DOptions
  private container: HTMLElement
  private mapGroup: THREE.Group

  constructor(container: HTMLElement, options: Map3DOptions = {}) {
    this.container = container
    this.options = { center: [116.397, 39.908], zoom: 5, coordinateSystem: 'gcj02', theme: 'cyberpunk', ...options }

    this.sceneManager = new SceneManager(container, { cameraPosition: [0, 8, 8], enableControls: true })
    this.themeEngine = new ThemeEngine(this.sceneManager, this.options.theme)
    this.interactionManager = new InteractionManager(this.sceneManager)
    this.responsiveManager = new ResponsiveManager(this.sceneManager, container)
    this.animationManager = new AnimationManager()

    this.mapGroup = new THREE.Group()
    this.sceneManager.scene.add(this.mapGroup)

    this.markerLayer = new MarkerLayer()
    this.flyLineLayer = new FlyLineLayer()
    this.regionLayer = new RegionLayer()
    this.mapGroup.add(this.markerLayer.getGroup())
    this.mapGroup.add(this.flyLineLayer.getGroup())
    this.mapGroup.add(this.regionLayer.getGroup())

    this.sceneManager.start()
  }

  addMarker(options: MarkerOptions): THREE.Mesh {
    const mesh = this.markerLayer.addMarker(options, this.latLngToPosition.bind(this))
    this.interactionManager.addInteractive(mesh)
    return mesh
  }

  addFlyLine(options: FlyLineOptions): THREE.Line {
    return this.flyLineLayer.addFlyLine(options, this.latLngToPosition.bind(this))
  }

  addRegion(options: RegionOptions): void {
    this.regionLayer.addRegion(options, this.projectCoord.bind(this))
  }

  setHeatmap(data: Array<{ lng: number; lat: number; value: number }>): void {
    data.forEach((point) => {
      const pos = this.latLngToPosition(point.lat, point.lng)
      const height = point.value * 0.5
      const geo = new THREE.BoxGeometry(0.05, height, 0.05)
      geo.translate(0, height / 2, 0)
      const t = point.value / Math.max(...data.map((d) => d.value))
      const color = new THREE.Color().setHSL(0.66 - t * 0.66, 0.9, 0.5)
      const mat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.8 })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.copy(pos)
      this.mapGroup.add(mesh)
    })
  }

  playTrack(points: TrackPoint[], options: TrackPlayerOptions = {}): TrackPlayer {
    this.trackPlayer = new TrackPlayer(options)
    const positions = points.map((p) => this.latLngToPosition(p.lat, p.lng))
    this.trackPlayer.setTrack(positions)
    this.mapGroup.add(this.trackPlayer.getGroup())
    this.sceneManager.onRender((delta) => this.trackPlayer?.update(delta))
    this.trackPlayer.play()
    return this.trackPlayer
  }

  private latLngToPosition(lat: number, lng: number): THREE.Vector3 {
    const center = this.options.center!
    const scale = 0.05
    const x = (lng - center[0]) * scale
    const z = -(lat - center[1]) * scale
    return new THREE.Vector3(x, 0, z)
  }

  private projectCoord(lng: number, lat: number): [number, number] {
    const center = this.options.center!
    const scale = 0.05
    return [(lng - center[0]) * scale, (lat - center[1]) * scale]
  }

  dispose(): void {
    this.markerLayer.dispose()
    this.flyLineLayer.dispose()
    this.regionLayer.dispose()
    this.trackPlayer?.dispose()
    this.animationManager.dispose()
    this.responsiveManager.dispose()
    this.sceneManager.dispose()
  }
}
