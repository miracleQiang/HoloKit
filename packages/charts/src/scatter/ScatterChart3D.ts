import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'

export interface ScatterChartData { x: number; y: number; z?: number; size?: number; group?: string }
export interface ScatterChart3DOptions extends ChartOptions {
  pointSize?: number
  sizeField?: string
  colorField?: string
}

export class ScatterChart3D extends BaseChart3D {
  private currentData: ScatterChartData[] = []
  private scatterOptions: ScatterChart3DOptions

  constructor(container: HTMLElement, options: ScatterChart3DOptions = {}) {
    super(container, options)
    this.scatterOptions = options
  }

  protected buildChart(data: ScatterChartData[]): void {
    this.currentData = data
    const baseSize = this.scatterOptions.pointSize || 0.1

    data.forEach((item, index) => {
      const size = item.size ? baseSize * item.size : baseSize
      const geometry = new THREE.SphereGeometry(size, 16, 16)
      const colorIdx = item.group ? this.getGroupIndex(item.group, data) : 0
      const material = this.themeEngine.createMaterial(colorIdx)
      const mesh = new THREE.Mesh(geometry, material)

      mesh.position.set(item.x, item.y, item.z || 0)
      mesh.userData = { chartData: item, index }
      this.chartGroup.add(mesh)
      this.interactionManager.addInteractive(mesh)
    })

    this.addAxes()
  }

  private getGroupIndex(group: string, data: ScatterChartData[]): number {
    const groups = [...new Set(data.map((d) => d.group))]
    return groups.indexOf(group)
  }

  private addAxes(): void {
    const theme = this.themeEngine.getTheme()
    const mat = new THREE.LineBasicMaterial({ color: theme.colors.grid, transparent: true, opacity: 0.5 })
    const axes = [
      [new THREE.Vector3(-3, 0, 0), new THREE.Vector3(3, 0, 0)],
      [new THREE.Vector3(0, -3, 0), new THREE.Vector3(0, 3, 0)],
      [new THREE.Vector3(0, 0, -3), new THREE.Vector3(0, 0, 3)],
    ]
    axes.forEach(([from, to]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([from, to])
      this.chartGroup.add(new THREE.Line(geo, mat))
    })
  }

  protected rebuildWithCurrentData(): void {
    this.clearChart()
    if (this.currentData.length) this.buildChart(this.currentData)
  }
}
