import * as THREE from 'three'

export interface FlyLineOptions {
  from: [number, number]
  to: [number, number]
  color?: string
  height?: number
  segments?: number
  speed?: number
  width?: number
}

export class FlyLineLayer {
  private lines: THREE.Group = new THREE.Group()

  getGroup(): THREE.Group { return this.lines }

  addFlyLine(options: FlyLineOptions, latLngToPos: (lat: number, lng: number) => THREE.Vector3): THREE.Line {
    const from = latLngToPos(options.from[1], options.from[0])
    const to = latLngToPos(options.to[1], options.to[0])
    const mid = new THREE.Vector3().lerpVectors(from, to, 0.5)
    mid.y += options.height ?? 1
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to)
    const points = curve.getPoints(options.segments ?? 50)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: options.color ?? '#00f5ff',
      transparent: true,
      opacity: 0.8,
      linewidth: options.width ?? 1,
    })
    const line = new THREE.Line(geometry, material)
    line.userData = { flyLineOptions: options }
    this.lines.add(line)
    return line
  }

  clear(): void {
    while (this.lines.children.length) {
      const child = this.lines.children[0] as THREE.Line
      this.lines.remove(child)
      child.geometry?.dispose?.()
      const m = child.material as any
      if (Array.isArray(m)) m.forEach((mm: any) => mm.dispose?.())
      else m?.dispose?.()
    }
  }

  dispose(): void { this.clear() }
}
