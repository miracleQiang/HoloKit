import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'

export interface HeatmapChartData { x: number; z: number; value: number }
export interface HeatmapChart3DOptions extends ChartOptions<HeatmapChartData[]> {
  gridSize?: number
  heightScale?: number
  colorRange?: string[]
  opacity?: number
}

export class HeatmapChart3D extends BaseChart3D<HeatmapChartData[]> {
  private heatmapOptions: HeatmapChart3DOptions

  constructor(container: HTMLElement, options: HeatmapChart3DOptions = {}) {
    super(container, options)
    this.heatmapOptions = options
  }

  protected buildChart(data: HeatmapChartData[]): void {
    if (!data.length) return
    const gridSize = this.heatmapOptions.gridSize ?? 1
    const heightScale = this.heatmapOptions.heightScale ?? 1
    const opacity = this.heatmapOptions.opacity ?? 0.9
    const max = Math.max(...data.map((d) => d.value)) || 1
    const colors = this.heatmapOptions.colorRange?.map((c) => new THREE.Color(c))

    data.forEach((item) => {
      const t = item.value / max
      const h = Math.max(0.01, t * heightScale * 2)
      const geometry = new THREE.BoxGeometry(gridSize * 0.9, h, gridSize * 0.9)
      geometry.translate(0, h / 2, 0)

      let color: THREE.Color
      if (colors && colors.length) {
        const idx = Math.min(colors.length - 1, Math.floor(t * (colors.length - 1)))
        color = colors[idx]
      } else {
        color = new THREE.Color().setHSL(0.66 - t * 0.66, 0.9, 0.5)
      }
      const material = new THREE.MeshStandardMaterial({ color, transparent: opacity < 1, opacity })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(item.x * gridSize, 0, item.z * gridSize)
      mesh.userData = { chartData: item }
      this.chartGroup.add(mesh)
      this.interactionManager.addInteractive(mesh)
    })
  }
}
