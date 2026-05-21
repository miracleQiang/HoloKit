import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'

export interface ScatterChartData {
  x: number
  y: number
  z?: number
  size?: number
  group?: string
  [key: string]: any
}
export interface ScatterChart3DOptions extends ChartOptions<ScatterChartData[]> {
  pointSize?: number
  sizeField?: string
  colorField?: string
}

export class ScatterChart3D extends BaseChart3D<ScatterChartData[]> {
  private scatterOptions: ScatterChart3DOptions

  constructor(container: HTMLElement, options: ScatterChart3DOptions = {}) {
    super(container, options)
    this.scatterOptions = options
  }

  protected buildChart(data: ScatterChartData[]): void {
    if (!data.length) return
    const baseSize = this.scatterOptions.pointSize || 0.1
    const sizeField = this.scatterOptions.sizeField || 'size'
    const colorField = this.scatterOptions.colorField || 'group'
    const groups = [...new Set(data.map((d) => d[colorField]).filter((v) => v !== undefined))]

    data.forEach((item, index) => {
      const sizeMul = item[sizeField]
      const size = typeof sizeMul === 'number' ? baseSize * sizeMul : baseSize
      const geometry = new THREE.SphereGeometry(size, 16, 16)
      const groupVal = item[colorField]
      const colorIdx = groupVal !== undefined ? groups.indexOf(groupVal) : 0
      const material = this.themeEngine.createMaterial(Math.max(0, colorIdx))
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(item.x, item.y, item.z || 0)
      mesh.userData = { chartData: item, index }
      this.chartGroup.add(mesh)
      this.interactionManager.addInteractive(mesh)
    })
    this.addAxes()
  }

  private addAxes(): void {
    const mat = this.themeEngine.createGridMaterial()
    const axes: Array<[THREE.Vector3, THREE.Vector3]> = [
      [new THREE.Vector3(-3, 0, 0), new THREE.Vector3(3, 0, 0)],
      [new THREE.Vector3(0, -3, 0), new THREE.Vector3(0, 3, 0)],
      [new THREE.Vector3(0, 0, -3), new THREE.Vector3(0, 0, 3)],
    ]
    axes.forEach(([from, to]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([from, to])
      this.chartGroup.add(new THREE.Line(geo, mat))
    })
  }
}
