import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'
import { makeTextSprite } from '../base/textSprite'
import { MarkLineItem, drawMarkLines } from '../base/axis'

export interface BarChartData {
  label: string
  value: number
  group?: string
}

export interface BarChart3DOptions extends ChartOptions<BarChartData[]> {
  barWidth?: number
  barGap?: number
  mode?: 'grouped' | 'stacked'
  xAxis?: {
    label?: string
    showTicks?: boolean
  }
  yAxis?: {
    label?: string
    max?: number
    ticks?: number
    showTicks?: boolean
    formatter?: (value: number) => string
  }
  showValues?: boolean
  valueFormatter?: (item: BarChartData) => string
  unit?: string
  markLine?: MarkLineItem[]
  onDrillDown?: (item: BarChartData) => void
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
    const showValues = this.barOptions.showValues !== false
    const showXTicks = this.barOptions.xAxis?.showTicks !== false
    const showYTicks = this.barOptions.yAxis?.showTicks !== false
    const yTicks = this.barOptions.yAxis?.ticks ?? 4
    const unit = this.barOptions.unit || ''
    const valueFmt = this.barOptions.valueFormatter || ((d: BarChartData) => `${d.value}${unit}`)
    const yFmt = this.barOptions.yAxis?.formatter || ((v: number) => `${Math.round(v * 100) / 100}${unit}`)

    const totalWidth = data.length * (barWidth + barGap) - barGap
    const startX = -totalWidth / 2
    const chartHeight = 4
    const theme = this.themeEngine.getTheme()
    const labelColor = this.getTextColor()

    data.forEach((item, index) => {
      const height = (item.value / maxValue) * chartHeight
      const geometry = new THREE.BoxGeometry(barWidth, height, barWidth)
      geometry.translate(0, height / 2, 0)
      const material = this.themeEngine.createMaterial(index)
      const mesh = new THREE.Mesh(geometry, material)
      const cx = startX + index * (barWidth + barGap) + barWidth / 2
      mesh.position.set(cx, 0, 0)
      mesh.userData = { chartData: item, index }
      this.chartGroup.add(mesh)
      this.interactionManager.addInteractive(mesh)
      this.animateEntrance(mesh, 1, index)

      if (showValues) {
        const valLabel = makeTextSprite(valueFmt(item), { color: labelColor, fontSize: 56, worldHeight: 0.3 })
        valLabel.position.set(cx, height + 0.3, 0)
        this.chartGroup.add(valLabel)
      }
      if (showXTicks) {
        const catLabel = makeTextSprite(item.label, { color: labelColor, fontSize: 48, worldHeight: 0.28 })
        catLabel.position.set(cx, -0.25, barWidth / 2 + 0.05)
        this.chartGroup.add(catLabel)
      }
    })

    this.addGrid(totalWidth, chartHeight)
    if (showYTicks) this.addYAxisTicks(totalWidth, chartHeight, maxValue, yTicks, yFmt, labelColor)
    if (this.barOptions.xAxis?.label) this.addAxisTitle(this.barOptions.xAxis.label, 'x', totalWidth, chartHeight, labelColor)
    if (this.barOptions.yAxis?.label) this.addAxisTitle(this.barOptions.yAxis.label, 'y', totalWidth, chartHeight, labelColor)

    const groups = [...new Set(data.map((d) => d.group).filter((g): g is string => !!g))]
    if (groups.length > 1) {
      const palette = this.getColors()
      this.legend.setItems(groups.map((g, i) => ({ label: g, color: palette[i % palette.length] })))
      this.legend.show()
    }

    if (this.barOptions.markLine?.length) {
      drawMarkLines({ group: this.chartGroup, dimensions: { width: totalWidth, height: chartHeight }, maxValue, lines: this.barOptions.markLine, defaultColor: this.getTextColor() })
    }
  }

  private addGrid(width: number, chartHeight: number): void {
    const material = this.themeEngine.createGridMaterial()
    const halfWidth = width / 2 + 0.3
    const ticks = this.barOptions.yAxis?.ticks ?? 4
    for (let i = 0; i <= ticks; i++) {
      const y = (i / ticks) * chartHeight
      const points = [new THREE.Vector3(-halfWidth, y, 0), new THREE.Vector3(halfWidth, y, 0)]
      this.chartGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material))
    }
    const baseY = [new THREE.Vector3(-halfWidth, 0, 0), new THREE.Vector3(-halfWidth, chartHeight, 0)]
    this.chartGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(baseY), material))
  }

  private addYAxisTicks(
    width: number,
    chartHeight: number,
    maxValue: number,
    ticks: number,
    formatter: (v: number) => string,
    color: string
  ): void {
    const halfWidth = width / 2 + 0.3
    for (let i = 0; i <= ticks; i++) {
      const t = i / ticks
      const y = t * chartHeight
      const value = t * maxValue
      const sprite = makeTextSprite(formatter(value), { color, fontSize: 44, worldHeight: 0.25 })
      sprite.position.set(-halfWidth - 0.4, y, 0)
      this.chartGroup.add(sprite)
    }
  }

  private addAxisTitle(text: string, axis: 'x' | 'y', width: number, chartHeight: number, color: string): void {
    const sprite = makeTextSprite(text, { color, fontSize: 60, fontWeight: 600, worldHeight: 0.34 })
    if (axis === 'x') sprite.position.set(0, -0.7, 0)
    else sprite.position.set(-(width / 2 + 1.4), chartHeight / 2, 0)
    this.chartGroup.add(sprite)
  }

  private setupTooltip(): void {
    if (this.tooltipBound) return
    this.tooltipBound = true
    this.interactionManager.on('hover', (e: any) => {
      const data = e.object.userData?.chartData as BarChartData
      if (data) {
        const formatter = this.options.tooltip?.formatter
        const unit = this.barOptions.unit || ''
        const xLabel = this.barOptions.xAxis?.label || '类别'
        const yLabel = this.barOptions.yAxis?.label || '数值'
        const content = formatter
          ? formatter(data)
          : `<b>${data.label}</b><br/>${xLabel}: ${data.label}<br/>${yLabel}: ${data.value}${unit}`
        this.tooltip.show(content, e.originalEvent.offsetX, e.originalEvent.offsetY)
      }
    })
    this.interactionManager.on('unhover', () => this.tooltip.hide())
    this.interactionManager.on('click', (e: any) => {
      const data = e.object.userData?.chartData as BarChartData
      if (data && this.barOptions.onDrillDown) this.barOptions.onDrillDown(data)
    })
  }
}
