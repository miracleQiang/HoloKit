import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'

export interface RadarChartData { axis: string; value: number }
export interface RadarChart3DOptions extends ChartOptions {
  axisCount?: number
  fillOpacity?: number
  maxValue?: number
}

export class RadarChart3D extends BaseChart3D {
  private currentData: RadarChartData[][] = []
  private radarOptions: RadarChart3DOptions

  constructor(container: HTMLElement, options: RadarChart3DOptions = {}) {
    super(container, { ...options, camera: { position: [0, 4, 4], ...options.camera } })
    this.radarOptions = options
  }

  protected buildChart(data: RadarChartData[][]): void {
    this.currentData = data
    const maxVal = this.radarOptions.maxValue || Math.max(...data.flat().map((d) => d.value))
    const axisCount = data[0]?.length || 0
    const radius = 2

    this.addGrid(axisCount, radius)

    data.forEach((series, seriesIdx) => {
      const points: THREE.Vector3[] = []
      series.forEach((item, i) => {
        const angle = (i / axisCount) * Math.PI * 2 - Math.PI / 2
        const r = (item.value / maxVal) * radius
        points.push(new THREE.Vector3(Math.cos(angle) * r, 0.01 * seriesIdx, Math.sin(angle) * r))
      })
      points.push(points[0].clone())

      const lineGeo = new THREE.BufferGeometry().setFromPoints(points)
      const color = this.themeEngine.getThreeColor(seriesIdx)
      const lineMat = new THREE.LineBasicMaterial({ color })
      this.chartGroup.add(new THREE.Line(lineGeo, lineMat))

      const shape = new THREE.Shape()
      shape.moveTo(points[0].x, points[0].z)
      for (let i = 1; i < points.length; i++) shape.lineTo(points[i].x, points[i].z)
      const fillGeo = new THREE.ShapeGeometry(shape)
      fillGeo.rotateX(-Math.PI / 2)
      fillGeo.translate(0, 0.01 * seriesIdx, 0)
      const fillMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: this.radarOptions.fillOpacity || 0.3,
        side: THREE.DoubleSide,
      })
      this.chartGroup.add(new THREE.Mesh(fillGeo, fillMat))
    })
  }

  private addGrid(axisCount: number, radius: number): void {
    const theme = this.themeEngine.getTheme()
    const gridMat = new THREE.LineBasicMaterial({ color: theme.colors.grid, transparent: true, opacity: 0.4 })

    for (let i = 0; i < axisCount; i++) {
      const angle = (i / axisCount) * Math.PI * 2 - Math.PI / 2
      const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)]
      this.chartGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat))
    }

    for (let ring = 1; ring <= 4; ring++) {
      const r = (ring / 4) * radius
      const ringPts: THREE.Vector3[] = []
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2
        ringPts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r))
      }
      this.chartGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPts), gridMat))
    }
  }

  protected rebuildWithCurrentData(): void {
    this.clearChart()
    if (this.currentData.length) this.buildChart(this.currentData)
  }
}
