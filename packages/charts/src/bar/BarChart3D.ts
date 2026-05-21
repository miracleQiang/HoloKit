import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'

export interface BarChartData {
  label: string
  value: number
  group?: string
}

export interface BarChart3DOptions extends ChartOptions<BarChartData[]> {
  barWidth?: number
  barGap?: number
  mode?: 'grouped' | 'stacked'
  xAxis?: { label?: string }
  yAxis?: { label?: string; max?: number }
}

export class BarChart3D extends BaseChart3D<BarChartData[]> {
  private barOptions: BarChart3DOptions
  private tooltipBound = false

  constructor(container: HTMLElement, options: BarChart3DOptions = {}) {
    super(container, options)
    this.barOptions = options
    this.setupTooltip()
  }

  protected buildChart(data: BarChartData[]): void {
    if (!data.length) return
    const barWidth = this.barOptions.barWidth || 0.6
    const barGap = this.barOptions.barGap || 0.3
    const maxValue = this.barOptions.yAxis?.max || Math.max(...data.map((d) => d.value)) || 1

    const totalWidth = data.length * (barWidth + barGap) - barGap
    const startX = -totalWidth / 2

    data.forEach((item, index) => {
      const height = (item.value / maxValue) * 4
      const geometry = new THREE.BoxGeometry(barWidth, height, barWidth)
      geometry.translate(0, height / 2, 0)
      const material = this.themeEngine.createMaterial(index)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.x = startX + index * (barWidth + barGap) + barWidth / 2
      mesh.position.y = 0
      mesh.userData = { chartData: item, index }
      this.chartGroup.add(mesh)
      this.interactionManager.addInteractive(mesh)
      this.animateEntrance(mesh, 1, index)
    })

    this.addGrid(totalWidth)
  }

  private addGrid(width: number): void {
    const material = this.themeEngine.createGridMaterial()
    const halfWidth = width / 2 + 0.5
    for (let i = 0; i <= 4; i++) {
      const points = [new THREE.Vector3(-halfWidth, i, 0), new THREE.Vector3(halfWidth, i, 0)]
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      this.chartGroup.add(new THREE.Line(geometry, material))
    }
  }

  private setupTooltip(): void {
    if (this.tooltipBound) return
    this.tooltipBound = true
    this.interactionManager.on('hover', (e: any) => {
      const data = e.object.userData?.chartData as BarChartData
      if (data) {
        const formatter = this.options.tooltip?.formatter
        const content = formatter ? formatter(data) : `<b>${data.label}</b><br/>值: ${data.value}`
        this.tooltip.show(content, e.originalEvent.offsetX, e.originalEvent.offsetY)
      }
    })
    this.interactionManager.on('unhover', () => this.tooltip.hide())
  }
}
