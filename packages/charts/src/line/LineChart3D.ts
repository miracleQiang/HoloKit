import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'

export interface LineChartData { label: string; value: number }
export interface LineChart3DOptions extends ChartOptions {
  lineWidth?: number
  areaFill?: boolean
  smooth?: boolean
}

export class LineChart3D extends BaseChart3D {
  private currentData: LineChartData[] = []
  private lineOptions: LineChart3DOptions

  constructor(container: HTMLElement, options: LineChart3DOptions = {}) {
    super(container, options)
    this.lineOptions = options
  }

  protected buildChart(data: LineChartData[]): void {
    this.currentData = data
    const maxValue = Math.max(...data.map((d) => d.value))
    const totalWidth = 6
    const step = totalWidth / (data.length - 1)
    const startX = -totalWidth / 2

    const points = data.map((item, i) => {
      const x = startX + i * step
      const y = (item.value / maxValue) * 3
      return new THREE.Vector3(x, y, 0)
    })

    if (this.lineOptions.smooth && points.length >= 3) {
      const curve = new THREE.CatmullRomCurve3(points)
      const smoothPoints = curve.getPoints(points.length * 10)
      this.addLine(smoothPoints)
      if (this.lineOptions.areaFill) this.addArea(smoothPoints)
    } else {
      this.addLine(points)
      if (this.lineOptions.areaFill) this.addArea(points)
    }

    points.forEach((point, index) => {
      const geometry = new THREE.SphereGeometry(0.08, 16, 16)
      const material = this.themeEngine.createMaterial(0)
      const sphere = new THREE.Mesh(geometry, material)
      sphere.position.copy(point)
      sphere.userData = { chartData: data[index], index }
      this.chartGroup.add(sphere)
      this.interactionManager.addInteractive(sphere)
    })
  }

  private addLine(points: THREE.Vector3[]): void {
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const color = this.themeEngine.getThreeColor(0)
    const material = new THREE.LineBasicMaterial({ color, linewidth: this.lineOptions.lineWidth || 2 })
    const line = new THREE.Line(geometry, material)
    this.chartGroup.add(line)
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
    const mesh = new THREE.Mesh(geometry, material)
    this.chartGroup.add(mesh)
  }

  protected rebuildWithCurrentData(): void {
    this.clearChart()
    if (this.currentData.length) this.buildChart(this.currentData)
  }
}
