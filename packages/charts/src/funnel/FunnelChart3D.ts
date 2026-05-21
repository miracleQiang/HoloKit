import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'

export interface FunnelChartData { label: string; value: number }
export interface FunnelChart3DOptions extends ChartOptions<FunnelChartData[]> {
  direction?: 'descending' | 'ascending' | 'vertical' | 'horizontal'
  gap?: number
  sortOrder?: 'none' | 'ascending' | 'descending'
  height?: number
  layerHeight?: number
}

export class FunnelChart3D extends BaseChart3D<FunnelChartData[]> {
  private funnelOptions: FunnelChart3DOptions

  constructor(container: HTMLElement, options: FunnelChart3DOptions = {}) {
    super(container, { ...options, camera: { position: [0, 4, 6], ...options.camera } })
    this.funnelOptions = options
  }

  protected buildChart(data: FunnelChartData[]): void {
    if (!data.length) return
    let processed = [...data]
    const sortOrder = this.funnelOptions.sortOrder
    if (sortOrder === 'descending') processed.sort((a, b) => b.value - a.value)
    else if (sortOrder === 'ascending') processed.sort((a, b) => a.value - b.value)

    // direction: ascending means small at top (reverse render order)
    const direction = this.funnelOptions.direction ?? 'descending'
    const ascending = direction === 'ascending'
    if (ascending) processed = [...processed].reverse()

    const max = Math.max(...processed.map((d) => d.value)) || 1
    const layerHeight = this.funnelOptions.layerHeight ?? this.funnelOptions.height ?? 0.7
    const gap = this.funnelOptions.gap ?? 0.05

    processed.forEach((item, index) => {
      const ratio = item.value / max
      const radius = ratio * 2
      const geometry = new THREE.CylinderGeometry(radius, radius * 0.85, layerHeight, 32)
      const material = this.themeEngine.createMaterial(index)
      const mesh = new THREE.Mesh(geometry, material)
      const total = processed.length
      mesh.position.y = (total - index - 1) * (layerHeight + gap) - ((total - 1) * (layerHeight + gap)) / 2
      const percentage = index === 0 ? 100 : (item.value / processed[0].value) * 100
      mesh.userData = { chartData: { ...item, percentage }, index }
      this.chartGroup.add(mesh)
      this.interactionManager.addInteractive(mesh)
      this.animateEntrance(mesh, 1, index)
    })
  }
}
