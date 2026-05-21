import * as THREE from 'three'

export interface RegionStyle {
  fillColor?: string
  fillOpacity?: number
  strokeColor?: string
  strokeWidth?: number
}

export interface RegionOptions {
  geoJSON?: any
  geoJson?: any
  color?: string
  opacity?: number
  extrudeHeight?: number
  style?: RegionStyle
}

export class RegionLayer {
  private regions: THREE.Group = new THREE.Group()

  getGroup(): THREE.Group { return this.regions }

  addRegion(options: RegionOptions, projectCoord: (lng: number, lat: number) => [number, number]): void {
    const geo = options.geoJSON ?? options.geoJson
    if (!geo) return

    const fillColor = options.style?.fillColor ?? options.color ?? '#3b82f6'
    const fillOpacity = options.style?.fillOpacity ?? options.opacity ?? 0.6
    const strokeColor = options.style?.strokeColor
    const strokeWidth = options.style?.strokeWidth ?? 1

    const features = geo.type === 'FeatureCollection' ? geo.features : [geo]
    features.forEach((feature: any) => {
      const coords = feature.geometry.type === 'MultiPolygon'
        ? feature.geometry.coordinates.flat()
        : feature.geometry.coordinates
      coords.forEach((ring: number[][]) => {
        const shape = new THREE.Shape()
        const projected: Array<[number, number]> = []
        ring.forEach((coord: number[], i: number) => {
          const [x, y] = projectCoord(coord[0], coord[1])
          projected.push([x, y])
          if (i === 0) shape.moveTo(x, y)
          else shape.lineTo(x, y)
        })

        const height = options.extrudeHeight ?? 0
        const geometry = height > 0
          ? new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false })
          : new THREE.ShapeGeometry(shape)
        if (height <= 0) geometry.rotateX(-Math.PI / 2)

        const material = new THREE.MeshStandardMaterial({
          color: fillColor,
          transparent: true,
          opacity: fillOpacity,
          side: THREE.DoubleSide,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.userData = {
          kind: 'region',
          feature,
          properties: feature.properties || {},
        }
        this.regions.add(mesh)

        if (strokeColor) {
          const linePoints = projected.map(([x, y]) =>
            height > 0 ? new THREE.Vector3(x, height + 0.001, y) : new THREE.Vector3(x, 0.001, y)
          )
          const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints)
          const lineMat = new THREE.LineBasicMaterial({ color: strokeColor, linewidth: strokeWidth })
          const line = new THREE.LineLoop(lineGeo, lineMat)
          this.regions.add(line)
        }
      })
    })
  }

  clear(): void {
    while (this.regions.children.length) {
      const child = this.regions.children[0]
      this.regions.remove(child)
      this.disposeNode(child)
    }
  }

  dispose(): void { this.clear() }

  private disposeNode(node: THREE.Object3D): void {
    node.traverse((n) => {
      const g = (n as any).geometry; const m = (n as any).material
      g?.dispose?.()
      if (Array.isArray(m)) m.forEach((mm: any) => mm.dispose?.())
      else m?.dispose?.()
    })
  }
}
