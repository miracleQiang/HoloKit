import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'
import { SingleAxisOptions, drawGrid, drawAxisTicks, drawAxisTitle } from '../base/axis'

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
  xAxis?: SingleAxisOptions
  yAxis?: SingleAxisOptions
  zAxis?: SingleAxisOptions
  unit?: string
  showValues?: boolean
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
    const unit = this.scatterOptions.unit || ''

    const xMax = (this.scatterOptions.xAxis?.max ?? Math.max(...data.map((d) => d.x))) || 1
    const yMax = (this.scatterOptions.yAxis?.max ?? Math.max(...data.map((d) => d.y))) || 1
    const zMax = (this.scatterOptions.zAxis?.max ?? Math.max(...data.map((d) => d.z || 0))) || 1

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

    const theme = this.themeEngine.getTheme()
    const labelColor = this.getTextColor()
    const gridMat = this.themeEngine.createGridMaterial()
    const dims = { width: xMax * 2 + 1, height: yMax + 1, depth: zMax * 2 + 1 }
    const yTicks = this.scatterOptions.yAxis?.ticks ?? 4
    const yFmt = this.scatterOptions.yAxis?.formatter || ((v: number) => `${Math.round(v * 100) / 100}${unit}`)

    drawGrid({ group: this.chartGroup, dimensions: dims, yTicks, material: gridMat, includeZAxis: true })
    if (this.scatterOptions.yAxis?.showTicks !== false) drawAxisTicks({ group: this.chartGroup, axis: 'y', dimensions: dims, maxValue: yMax, ticks: yTicks, formatter: yFmt, color: labelColor })
    if (this.scatterOptions.xAxis?.label) drawAxisTitle({ group: this.chartGroup, text: this.scatterOptions.xAxis.label, axis: 'x', dimensions: dims, color: labelColor })
    if (this.scatterOptions.yAxis?.label) drawAxisTitle({ group: this.chartGroup, text: this.scatterOptions.yAxis.label, axis: 'y', dimensions: dims, color: labelColor })
    if (this.scatterOptions.zAxis?.label) drawAxisTitle({ group: this.chartGroup, text: this.scatterOptions.zAxis.label, axis: 'z', dimensions: dims, color: labelColor })

    if (groups.length > 1) {
      const palette = this.getColors()
      this.legend.setItems(groups.map((g, i) => ({ label: String(g), color: palette[i % palette.length] })))
      this.legend.show()
    }
  }
}
