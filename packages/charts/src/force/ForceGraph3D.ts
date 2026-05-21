import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'

export interface ForceNode { id: string; group?: number; value?: number }
export interface ForceLink { source: string; target: string; value?: number }
export interface ForceGraphData { nodes: ForceNode[]; links: ForceLink[] }
export interface ForceGraph3DOptions extends ChartOptions { nodeSize?: number; linkDistance?: number; gravity?: number }

export class ForceGraph3D extends BaseChart3D {
  private currentData: ForceGraphData | null = null
  private forceOptions: ForceGraph3DOptions
  private positions: Map<string, THREE.Vector3> = new Map()

  constructor(container: HTMLElement, options: ForceGraph3DOptions = {}) { super(container, options); this.forceOptions = options }

  protected buildChart(data: any): void {
    const graphData = data as ForceGraphData
    this.currentData = graphData
    const nodeSize = this.forceOptions.nodeSize || 0.15
    this.positions.clear()

    graphData.nodes.forEach((node, i) => {
      const angle = (i / graphData.nodes.length) * Math.PI * 2
      const radius = 2
      const pos = new THREE.Vector3(Math.cos(angle) * radius, (Math.random() - 0.5) * 2, Math.sin(angle) * radius)
      this.positions.set(node.id, pos)

      const geometry = new THREE.SphereGeometry(nodeSize * (node.value || 1), 16, 16)
      const material = this.themeEngine.createMaterial(node.group || 0)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(pos)
      mesh.userData = { chartData: node }
      this.chartGroup.add(mesh)
      this.interactionManager.addInteractive(mesh)
    })

    const linkMat = new THREE.LineBasicMaterial({ color: this.themeEngine.getTheme().colors.grid, transparent: true, opacity: 0.4 })
    graphData.links.forEach((link) => {
      const from = this.positions.get(link.source)
      const to = this.positions.get(link.target)
      if (from && to) {
        const geo = new THREE.BufferGeometry().setFromPoints([from, to])
        this.chartGroup.add(new THREE.Line(geo, linkMat))
      }
    })
  }

  protected rebuildWithCurrentData(): void { this.clearChart(); if (this.currentData) this.buildChart(this.currentData) }
}
