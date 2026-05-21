import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'

export interface PieChartData { label: string; value: number }
export interface PieChart3DOptions extends ChartOptions {
  innerRadius?: number
  explode?: number
  depth?: number
}

export class PieChart3D extends BaseChart3D {
  private currentData: PieChartData[] = []
  private pieOptions: PieChart3DOptions

  constructor(container: HTMLElement, options: PieChart3DOptions = {}) {
    super(container, { ...options, camera: { position: [0, 5, 5], ...options.camera } })
    this.pieOptions = options
  }

  protected buildChart(data: PieChartData[]): void {
    this.currentData = data
    const total = data.reduce((sum, d) => sum + d.value, 0)
    const innerR = this.pieOptions.innerRadius || 0
    const outerR = 2
    const depth = this.pieOptions.depth || 0.5
    const explode = this.pieOptions.explode || 0
    let startAngle = 0

    data.forEach((item, index) => {
      const angle = (item.value / total) * Math.PI * 2
      const midAngle = startAngle + angle / 2
      const segments = Math.max(8, Math.floor(angle * 16))
      const shape = new THREE.Shape()

      if (innerR > 0) {
        shape.moveTo(Math.cos(startAngle) * innerR, Math.sin(startAngle) * innerR)
        for (let i = 0; i <= segments; i++) {
          const a = startAngle + (i / segments) * angle
          shape.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR)
        }
        for (let i = segments; i >= 0; i--) {
          const a = startAngle + (i / segments) * angle
          shape.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR)
        }
      } else {
        shape.moveTo(0, 0)
        for (let i = 0; i <= segments; i++) {
          const a = startAngle + (i / segments) * angle
          shape.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR)
        }
        shape.lineTo(0, 0)
      }

      const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false })
      geometry.rotateX(-Math.PI / 2)
      const material = this.themeEngine.createMaterial(index)
      const mesh = new THREE.Mesh(geometry, material)

      if (explode > 0) {
        mesh.position.x = Math.cos(midAngle) * explode
        mesh.position.z = -Math.sin(midAngle) * explode
      }

      mesh.userData = { chartData: { ...item, percentage: (item.value / total) * 100 }, index }
      this.chartGroup.add(mesh)
      this.interactionManager.addInteractive(mesh)
      this.animateEntrance(mesh, 1, index)
      startAngle += angle
    })
  }

  protected rebuildWithCurrentData(): void {
    this.clearChart()
    if (this.currentData.length) this.buildChart(this.currentData)
  }
}
