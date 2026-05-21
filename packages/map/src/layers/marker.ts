import * as THREE from 'three'

export interface MarkerOptions { lng: number; lat: number; label?: string; color?: string; size?: number; icon?: string; data?: any }

export class MarkerLayer {
  private markers: THREE.Group = new THREE.Group()
  private markerData: Map<THREE.Object3D, MarkerOptions> = new Map()

  getGroup(): THREE.Group { return this.markers }

  addMarker(options: MarkerOptions, latLngToPos: (lat: number, lng: number) => THREE.Vector3): THREE.Mesh {
    const size = options.size || 0.05
    const geometry = new THREE.SphereGeometry(size, 16, 16)
    const material = new THREE.MeshStandardMaterial({ color: options.color || '#ff4444', emissive: options.color || '#ff4444', emissiveIntensity: 0.3 })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.copy(latLngToPos(options.lat, options.lng))
    mesh.userData = { markerData: options }
    this.markerData.set(mesh, options)
    this.markers.add(mesh)
    return mesh
  }

  removeMarker(mesh: THREE.Mesh): void { this.markers.remove(mesh); this.markerData.delete(mesh) }
  clear(): void { while (this.markers.children.length) this.markers.remove(this.markers.children[0]); this.markerData.clear() }
  getMarkers(): THREE.Object3D[] { return [...this.markers.children] }
  dispose(): void { this.clear() }
}
