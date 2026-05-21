import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'
import { TableRow } from './types'

export interface FlipCardTable3DOptions extends ChartOptions<TableRow[]> {
  columns?: string[]
  cardWidth?: number
  cardHeight?: number
}

export class FlipCardTable3D extends BaseChart3D<TableRow[]> {
  private tableOptions: FlipCardTable3DOptions

  constructor(container: HTMLElement, options: FlipCardTable3DOptions = {}) {
    super(container, { ...options, camera: { position: [0, 3, 6], ...options.camera } })
    this.tableOptions = options
  }

  protected buildChart(data: TableRow[]): void {
    if (!data.length) return
    const cols = this.tableOptions.columns || Object.keys(data[0] || {})
    const cardW = this.tableOptions.cardWidth || 1.5
    const cardH = this.tableOptions.cardHeight || 1
    const gap = 0.2

    data.forEach((row, rowIdx) => {
      cols.forEach((col, colIdx) => {
        const geometry = new THREE.BoxGeometry(cardW, cardH, 0.05)
        const material = this.themeEngine.createMaterial(colIdx)
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(
          (colIdx - cols.length / 2 + 0.5) * (cardW + gap),
          -(rowIdx - data.length / 2 + 0.5) * (cardH + gap),
          0
        )
        mesh.userData = { chartData: { row, column: col, value: row[col] } }
        this.chartGroup.add(mesh)
        this.interactionManager.addInteractive(mesh)
        this.animateEntrance(mesh, 1, rowIdx * cols.length + colIdx)
      })
    })
  }
}
