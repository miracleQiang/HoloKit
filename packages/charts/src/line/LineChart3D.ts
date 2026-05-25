import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'
import { SingleAxisOptions, drawGrid, drawAxisTicks, drawAxisTitle, drawMarkLines, MarkLineItem } from '../base/axis'
import { makeTextSprite } from '../base/textSprite'

export interface LineChartData { label: string; value: number }
export interface LineChart3DOptions extends ChartOptions<LineChartData[]> {
  lineWidth?: number
  areaFill?: boolean
  smooth?: boolean
  showPoints?: boolean
  pointSize?: number
  xAxis?: { label?: string; showTicks?: boolean }
  yAxis?: SingleAxisOptions
  unit?: string
  showValues?: boolean
  valueFormatter?: (item: LineChartData) => string
  markLine?: MarkLineItem[]
}

export class LineChart3D extends BaseChart3D<LineChartData[]> {
  private lineOptions: LineChart3DOptions

  constructor(container: HTMLElement, options: LineChart3DOptions = {}) {
    super(container, options)
    this.lineOptions = options
  }

  protected buildChart(data: LineChartData[]): void {
    if (!data.length) return
    const maxValue = (this.lineOptions.yAxis?.max ?? Math.max(...data.map((d) => d.value))) || 1
    const totalWidth = 6
    const chartHeight = 3
    const step = data.length > 1 ? totalWidth / (data.length - 1) : 0
    const startX = data.length > 1 ? -totalWidth / 2 : 0
    const unit = this.lineOptions.unit || ''
    const showValues = this.lineOptions.showValues === true
    const showXTicks = this.lineOptions.xAxis?.showTicks !== false
    const showYTicks = this.lineOptions.yAxis?.showTicks !== false
    const yTicks = this.lineOptions.yAxis?.ticks ?? 4
    const yFmt = this.lineOptions.yAxis?.formatter || ((v: number) => `${Math.round(v * 100) / 100}${unit}`)
    const valueFmt = this.lineOptions.valueFormatter || ((d: LineChartData) => `${d.value}${unit}`)
    const theme = this.themeEngine.getTheme()
    const labelColor = this.getTextColor()

    const points = data.map((item, i) => {
      const x = startX + i * step
      const y = (item.value / maxValue) * chartHeight
      return new THREE.Vector3(x, y, 0)
    })

    if (this.lineOptions.smooth && points.length >= 3) {
      const curve = new THREE.CatmullRomCurve3(points)
      const smoothPoints = curve.getPoints(points.length * 10)
      this.addLine(smoothPoints)
      if (this.lineOptions.areaFill) this.addArea(smoothPoints)
    } else if (points.length >= 2) {
      this.addLine(points)
      if (this.lineOptions.areaFill) this.addArea(points)
    }

    if (this.lineOptions.showPoints !== false) {
      const pointSize = this.lineOptions.pointSize ?? 0.08
      points.forEach((point, index) => {
        const geometry = new THREE.SphereGeometry(pointSize, 16, 16)
        const material = this.themeEngine.createMaterial(0)
        const sphere = new THREE.Mesh(geometry, material)
        sphere.position.copy(point)
        sphere.userData = { chartData: data[index], index }
        this.chartGroup.add(sphere)
        this.interactionManager.addInteractive(sphere)
      })
    }

    if (showValues) {
      points.forEach((point, index) => {
        const valLabel = makeTextSprite(valueFmt(data[index]), { color: labelColor, fontSize: 56, worldHeight: 0.3 })
        valLabel.position.set(point.x, point.y + 0.3, 0)
        this.chartGroup.add(valLabel)
      })
    }
    if (showXTicks) {
      points.forEach((point, index) => {
        const catLabel = makeTextSprite(data[index].label, { color: labelColor, fontSize: 48, worldHeight: 0.28 })
        catLabel.position.set(point.x, -0.25, 0)
        this.chartGroup.add(catLabel)
      })
    }

    const dims = { width: totalWidth, height: chartHeight }
    drawGrid({ group: this.chartGroup, dimensions: dims, yTicks, material: this.themeEngine.createGridMaterial() })
    if (showYTicks) drawAxisTicks({ group: this.chartGroup, axis: 'y', dimensions: dims, maxValue, ticks: yTicks, formatter: yFmt, color: labelColor })
    if (this.lineOptions.xAxis?.label) drawAxisTitle({ group: this.chartGroup, text: this.lineOptions.xAxis.label, axis: 'x', dimensions: dims, color: labelColor })
    if (this.lineOptions.yAxis?.label) drawAxisTitle({ group: this.chartGroup, text: this.lineOptions.yAxis.label, axis: 'y', dimensions: dims, color: labelColor })

    if (this.lineOptions.markLine?.length) {
      drawMarkLines({ group: this.chartGroup, dimensions: dims, maxValue, lines: this.lineOptions.markLine, defaultColor: labelColor })
    }
  }

  private addLine(points: THREE.Vector3[]): void {
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = this.themeEngine.createLineMaterial(0, { linewidth: this.lineOptions.lineWidth ?? 2 })
    this.chartGroup.add(new THREE.Line(geometry, material))
  }

  private addArea(points: THREE.Vector3[]): void {
    const shape = new THREE.Shape()
    shape.moveTo(points[0].x, 0)
    points.forEach((p) => shape.lineTo(p.x, p.y))
    shape.lineTo(points[points.length - 1].x, 0)
    shape.closePath()
    const geometry = new THREE.ShapeGeometry(shape)
    const color = this.themeEngine.getThreeColor(0)
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    this.chartGroup.add(new THREE.Mesh(geometry, material))
  }
}
