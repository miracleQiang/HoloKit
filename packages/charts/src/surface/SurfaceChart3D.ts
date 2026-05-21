import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'

export interface SurfaceChartData { x: number; y: number; z: number }
export interface SurfaceChart3DOptions extends ChartOptions {
  resolution?: number
  wireframe?: boolean
  colorMap?: string[]
}

export class SurfaceChart3D extends BaseChart3D {
  private currentData: SurfaceChartData[] = []
  private surfaceOptions: SurfaceChart3DOptions

  constructor(container: HTMLElement, options: SurfaceChart3DOptions = {}) {
    super(container, options)
    this.surfaceOptions = options
  }

  protected buildChart(data: SurfaceChartData[]): void {
    this.currentData = data
    const xValues = [...new Set(data.map((d) => d.x))].sort((a, b) => a - b)
    const yValues = [...new Set(data.map((d) => d.y))].sort((a, b) => a - b)
    const cols = xValues.length
    const rows = yValues.length

    const geometry = new THREE.PlaneGeometry(4, 4, cols - 1, rows - 1)
    const positions = geometry.attributes.position
    const colors: number[] = []

    const zMin = Math.min(...data.map((d) => d.z))
    const zMax = Math.max(...data.map((d) => d.z))

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const idx = j * cols + i
        const point = data.find((d) => d.x === xValues[i] && d.y === yValues[j])
        const z = point ? point.z : 0
        positions.setZ(idx, ((z - zMin) / (zMax - zMin)) * 2)

        const t = (z - zMin) / (zMax - zMin || 1)
        const color = new THREE.Color().setHSL(0.66 - t * 0.66, 0.8, 0.5)
        colors.push(color.r, color.g, color.b)
      }
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.computeVertexNormals()

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      wireframe: this.surfaceOptions.wireframe || false,
      side: THREE.DoubleSide,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = -Math.PI / 2
    this.chartGroup.add(mesh)
  }

  protected rebuildWithCurrentData(): void {
    this.clearChart()
    if (this.currentData.length) this.buildChart(this.currentData)
  }
}
