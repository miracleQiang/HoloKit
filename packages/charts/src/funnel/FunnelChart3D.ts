import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'

export interface FunnelChartData { label: string; value: number }
export interface FunnelChart3DOptions extends ChartOptions { direction?: 'vertical' | 'horizontal'; gap?: number }

export class FunnelChart3D extends BaseChart3D {
  private currentData: FunnelChartData[] = []
  private funnelOptions: FunnelChart3DOptions
  constructor(container: HTMLElement, options: FunnelChart3DOptions = {}) { super(container, { ...options, camera: { position: [0, 3, 6], ...options.camera } }); this.funnelOptions = options }

  protected buildChart(data: FunnelChartData[]): void {
    this.currentData = data
    const maxVal = Math.max(...data.map((d) => d.value))
    const gap = this.funnelOptions.gap || 0.1
    const layerHeight = 0.6
    const startY = (data.length * (layerHeight + gap)) / 2

    data.forEach((item, index) => {
      const topRadius = (item.value / maxVal) * 2
      const nextVal = data[index + 1]?.value || item.value * 0.5
      const bottomRadius = (nextVal / maxVal) * 2
      const geometry = new THREE.CylinderGeometry(bottomRadius, topRadius, layerHeight, 32)
      const material = this.themeEngine.createMaterial(index)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.y = startY - index * (layerHeight + gap)
      mesh.userData = { chartData: { ...item, percentage: (item.value / maxVal) * 100 }, index }
      this.chartGroup.add(mesh)
      this.interactionManager.addInteractive(mesh)
      this.animateEntrance(mesh, 1, index)
    })
  }

  protected rebuildWithCurrentData(): void { this.clearChart(); if (this.currentData.length) this.buildChart(this.currentData) }
}
