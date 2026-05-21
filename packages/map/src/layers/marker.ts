import * as THREE from 'three'

export interface MarkerStyle { color?: string; size?: number }
export interface MarkerOptions {
  lng: number
  lat: number
  label?: string
  color?: string
  size?: number
  icon?: string
  style?: MarkerStyle
  coordinateSystem?: 'wgs84' | 'gcj02' | 'bd09'
  data?: any
}

export class MarkerLayer {
  private markers: THREE.Group = new THREE.Group()
  private markerData: Map<THREE.Object3D, MarkerOptions> = new Map()

  getGroup(): THREE.Group { return this.markers }

  addMarker(options: MarkerOptions, latLngToPos: (lat: number, lng: number) => THREE.Vector3): THREE.Mesh {
    const color = options.style?.color ?? options.color ?? '#ff4444'
    const size = options.style?.size ?? options.size ?? 0.05
    const geometry = new THREE.SphereGeometry(size, 16, 16)
    const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.copy(latLngToPos(options.lat, options.lng))
    mesh.userData = { markerData: options }
    this.markerData.set(mesh, options)
    this.markers.add(mesh)
    return mesh
  }

  removeMarker(mesh: THREE.Mesh): void {
    this.markers.remove(mesh)
    this.disposeMesh(mesh)
    this.markerData.delete(mesh)
  }

  clear(): void {
    while (this.markers.children.length) {
      const child = this.markers.children[0] as THREE.Mesh
      this.markers.remove(child)
      this.disposeMesh(child)
    }
    this.markerData.clear()
  }

  getMarkers(): THREE.Object3D[] { return [...this.markers.children] }
  dispose(): void { this.clear() }

  private disposeMesh(child: THREE.Mesh): void {
    child.geometry?.dispose?.()
    const m = child.material as any
    if (Array.isArray(m)) m.forEach((mm: any) => mm.dispose?.())
    else m?.dispose?.()
  }
}
