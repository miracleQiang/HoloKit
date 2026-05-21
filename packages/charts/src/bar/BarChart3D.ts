import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'

export interface BarChartData {
  label: string
  value: number
  group?: string
}

export interface BarChart3DOptions extends ChartOptions {
  barWidth?: number
  barGap?: number
  mode?: 'grouped' | 'stacked'
  xAxis?: { label?: string }
  yAxis?: { label?: string; max?: number }
}

export class BarChart3D extends BaseChart3D {
  private currentData: BarChartData[] = []
  private barOptions: BarChart3DOptions

  constructor(container: HTMLElement, options: BarChart3DOptions = {}) {
    super(container, options)
    this.barOptions = options
  }

  protected buildChart(data: BarChartData[]): void {
    this.currentData = data
    const barWidth = this.barOptions.barWidth || 0.6
    const barGap = this.barOptions.barGap || 0.3
    const maxValue = this.barOptions.yAxis?.max || Math.max(...data.map((d) => d.value))

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

    this.addGrid(totalWidth, maxValue)
    this.setupTooltip()
  }

  protected rebuildWithCurrentData(): void {
    this.clearChart()
    if (this.currentData.length > 0) {
      this.buildChart(this.currentData)
    }
  }

  private addGrid(width: number, maxValue: number): void {
    const theme = this.themeEngine.getTheme()
    const gridColor = new THREE.Color(theme.colors.grid)
    const material = new THREE.LineBasicMaterial({ color: gridColor, transparent: true, opacity: 0.5 })

    const halfWidth = width / 2 + 0.5
    for (let i = 0; i <= 4; i++) {
      const y = i
      const points = [new THREE.Vector3(-halfWidth, y, 0), new THREE.Vector3(halfWidth, y, 0)]
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const line = new THREE.Line(geometry, material)
      this.chartGroup.add(line)
    }
  }

  private setupTooltip(): void {
    this.interactionManager.on('hover', (e) => {
      const data = e.object.userData?.chartData as BarChartData
      if (data) {
        const formatter = this.options.tooltip?.formatter
        const content = formatter ? formatter(data) : `<b>${data.label}</b><br/>值: ${data.value}`
        this.tooltip.show(content, e.originalEvent.offsetX, e.originalEvent.offsetY)
      }
    })
    this.interactionManager.on('unhover', () => {
      this.tooltip.hide()
    })
  }
}
