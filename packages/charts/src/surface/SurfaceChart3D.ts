import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'

export interface SurfaceChartData { x: number; y: number; z: number }
export interface SurfaceChart3DOptions extends ChartOptions<SurfaceChartData[]> {
  resolution?: number
  wireframe?: boolean
  colorMap?: string[]
  opacity?: number
}

export class SurfaceChart3D extends BaseChart3D<SurfaceChartData[]> {
  private surfaceOptions: SurfaceChart3DOptions

  constructor(container: HTMLElement, options: SurfaceChart3DOptions = {}) {
    super(container, options)
    this.surfaceOptions = options
  }

  protected buildChart(data: SurfaceChartData[]): void {
    if (!data.length) return
    const xValues = [...new Set(data.map((d) => d.x))].sort((a, b) => a - b)
    const zValues = [...new Set(data.map((d) => d.z))].sort((a, b) => a - b)
    const cols = xValues.length
    const rows = zValues.length
    if (cols < 2 || rows < 2) return

    const opacity = this.surfaceOptions.opacity ?? 1
    const planeWidth = 4
    const planeDepth = 4
    const geometry = new THREE.PlaneGeometry(planeWidth, planeDepth, cols - 1, rows - 1)
    const positions = geometry.attributes.position
    const yMap = new Map<string, number>()
    data.forEach((d) => yMap.set(`${d.x}|${d.z}`, d.y))
    let yMin = Infinity, yMax = -Infinity
    yMap.forEach((v) => { if (v < yMin) yMin = v; if (v > yMax) yMax = v })
    if (yMin === yMax) yMax = yMin + 1

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c
        const y = yMap.get(`${xValues[c]}|${zValues[r]}`) ?? 0
        positions.setZ(idx, y)
      }
    }
    geometry.rotateX(-Math.PI / 2)
    geometry.computeVertexNormals()

    const colors = (this.surfaceOptions.colorMap ?? this.themeEngine.getTheme().colors.primary).map((c: string) => new THREE.Color(c))
    const colorAttr = new Float32Array(positions.count * 3)
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i)
      const t = (y - yMin) / (yMax - yMin)
      const idx = Math.min(colors.length - 1, Math.floor(t * (colors.length - 1)))
      const color = colors[idx]
      colorAttr[i * 3] = color.r
      colorAttr[i * 3 + 1] = color.g
      colorAttr[i * 3 + 2] = color.b
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colorAttr, 3))

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      wireframe: this.surfaceOptions.wireframe ?? false,
      side: THREE.DoubleSide,
      transparent: opacity < 1,
      opacity,
    })
    const mesh = new THREE.Mesh(geometry, material)
    this.chartGroup.add(mesh)
  }
}
