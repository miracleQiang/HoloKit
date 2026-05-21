import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'

export interface GlobeMarker { lng: number; lat: number; label?: string; value?: number }
export interface GlobeChart3DOptions extends ChartOptions { radius?: number; autoRotate?: boolean }

export class GlobeChart3D extends BaseChart3D {
  private currentData: GlobeMarker[] = []
  private globeOptions: GlobeChart3DOptions
  private globe: THREE.Mesh | null = null

  constructor(container: HTMLElement, options: GlobeChart3DOptions = {}) {
    super(container, { ...options, camera: { position: [0, 0, 5], ...options.camera } })
    this.globeOptions = options
    this.createGlobe()
    if (options.autoRotate !== false) this.enableAutoRotate()
  }

  private createGlobe(): void {
    const radius = this.globeOptions.radius || 2
    const geometry = new THREE.SphereGeometry(radius, 64, 64)
    const material = new THREE.MeshStandardMaterial({
      color: this.themeEngine.getTheme().colors.background,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    })
    this.globe = new THREE.Mesh(geometry, material)
    this.chartGroup.add(this.globe)
  }

  private enableAutoRotate(): void {
    this.sceneManager.onRender(() => {
      if (this.globe) this.globe.rotation.y += 0.002
    })
  }

  private latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    return new THREE.Vector3(
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    )
  }

  protected buildChart(data: GlobeMarker[]): void {
    this.currentData = data
    const radius = this.globeOptions.radius || 2

    data.forEach((marker, index) => {
      const pos = this.latLngToVector3(marker.lat, marker.lng, radius * 1.02)
      const size = marker.value ? 0.03 + marker.value * 0.01 : 0.05
      const geometry = new THREE.SphereGeometry(size, 8, 8)
      const material = this.themeEngine.createMaterial(index % 6)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(pos)
      mesh.userData = { chartData: marker, index }
      this.chartGroup.add(mesh)
      this.interactionManager.addInteractive(mesh)
    })
  }

  protected rebuildWithCurrentData(): void { this.clearChart(); this.createGlobe(); if (this.currentData.length) this.buildChart(this.currentData) }
}
