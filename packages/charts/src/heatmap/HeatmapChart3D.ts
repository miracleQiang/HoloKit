import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'

export interface HeatmapChartData { x: number; y: number; value: number }
export interface HeatmapChart3DOptions extends ChartOptions { gridSize?: number; heightScale?: number; colorRange?: [string, string] }

export class HeatmapChart3D extends BaseChart3D {
  private currentData: HeatmapChartData[] = []
  private heatmapOptions: HeatmapChart3DOptions
  constructor(container: HTMLElement, options: HeatmapChart3DOptions = {}) { super(container, options); this.heatmapOptions = options }

  protected buildChart(data: HeatmapChartData[]): void {
    this.currentData = data
    const gridSize = this.heatmapOptions.gridSize || 0.4
    const heightScale = this.heatmapOptions.heightScale || 2
    const maxVal = Math.max(...data.map((d) => d.value))

    data.forEach((item, index) => {
      const height = (item.value / maxVal) * heightScale
      const geometry = new THREE.BoxGeometry(gridSize * 0.9, height, gridSize * 0.9)
      geometry.translate(0, height / 2, 0)
      const t = item.value / maxVal
      const color = new THREE.Color().setHSL(0.66 - t * 0.66, 0.9, 0.5)
      const material = new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.4 })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(item.x * gridSize, 0, item.y * gridSize)
      mesh.userData = { chartData: item, index }
      this.chartGroup.add(mesh)
      this.interactionManager.addInteractive(mesh)
      this.animateEntrance(mesh, 1, index)
    })
  }

  protected rebuildWithCurrentData(): void { this.clearChart(); if (this.currentData.length) this.buildChart(this.currentData) }
}
