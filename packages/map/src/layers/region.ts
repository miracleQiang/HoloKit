import * as THREE from 'three'

export interface RegionOptions { geoJson: any; color?: string; opacity?: number; extrudeHeight?: number }

export class RegionLayer {
  private regions: THREE.Group = new THREE.Group()

  getGroup(): THREE.Group { return this.regions }

  addRegion(options: RegionOptions, projectCoord: (lng: number, lat: number) => [number, number]): void {
    const features = options.geoJson.type === 'FeatureCollection' ? options.geoJson.features : [options.geoJson]
    features.forEach((feature: any) => {
      const coords = feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates.flat() : feature.geometry.coordinates
      coords.forEach((ring: number[][]) => {
        const shape = new THREE.Shape()
        ring.forEach((coord: number[], i: number) => {
          const [x, y] = projectCoord(coord[0], coord[1])
          if (i === 0) shape.moveTo(x, y)
          else shape.lineTo(x, y)
        })

        const height = options.extrudeHeight || 0
        const geometry = height > 0
          ? new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false })
          : new THREE.ShapeGeometry(shape)
        if (height <= 0) geometry.rotateX(-Math.PI / 2)

        const material = new THREE.MeshStandardMaterial({ color: options.color || '#3b82f6', transparent: true, opacity: options.opacity || 0.6, side: THREE.DoubleSide })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.userData = { feature }
        this.regions.add(mesh)
      })
    })
  }

  clear(): void { while (this.regions.children.length) this.regions.remove(this.regions.children[0]) }
  dispose(): void { this.clear() }
}
