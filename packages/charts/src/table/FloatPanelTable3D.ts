import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'
import { TableRow } from './types'

export interface FloatPanelTable3DOptions extends ChartOptions<TableRow[]> {
  columns?: string[]
  panelWidth?: number
  rowHeight?: number
}

export class FloatPanelTable3D extends BaseChart3D<TableRow[]> {
  private panelOptions: FloatPanelTable3DOptions

  constructor(container: HTMLElement, options: FloatPanelTable3DOptions = {}) {
    super(container, { ...options, camera: { position: [0, 2, 5], ...options.camera } })
    this.panelOptions = options
  }

  protected buildChart(data: TableRow[]): void {
    if (!data.length) return
    const cols = this.panelOptions.columns || Object.keys(data[0] || {})
    const panelW = this.panelOptions.panelWidth || (cols.length * 1.5 + 1)
    const rowH = this.panelOptions.rowHeight || 0.5
    const totalH = (data.length + 1) * rowH

    const bgGeo = new THREE.PlaneGeometry(panelW, totalH)
    const bgMat = new THREE.MeshStandardMaterial({
      color: this.themeEngine.getTheme().colors.background,
      transparent: true, opacity: 0.7, side: THREE.DoubleSide,
    })
    this.chartGroup.add(new THREE.Mesh(bgGeo, bgMat))

    data.forEach((row, rowIdx) => {
      const y = totalH / 2 - (rowIdx + 1.5) * rowH
      const depth = 0.02 + rowIdx * 0.05
      cols.forEach((col, colIdx) => {
        const cellGeo = new THREE.PlaneGeometry((panelW / cols.length) * 0.9, rowH * 0.8)
        const cellMat = this.themeEngine.createMaterial(colIdx)
        const cell = new THREE.Mesh(cellGeo, cellMat)
        cell.position.set((colIdx - cols.length / 2 + 0.5) * (panelW / cols.length), y, depth)
        cell.userData = { chartData: { row, column: col, value: row[col] } }
        this.chartGroup.add(cell)
        this.interactionManager.addInteractive(cell)
      })
    })
  }
}
