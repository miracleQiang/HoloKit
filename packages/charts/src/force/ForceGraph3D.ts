import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'

export interface ForceNode { id: string; label?: string; group?: string | number; size?: number; value?: number }
export interface ForceLink { source: string; target: string; weight?: number; value?: number }
export interface ForceGraphData { nodes: ForceNode[]; links: ForceLink[] }
export interface ForceGraph3DOptions extends ChartOptions<ForceGraphData> {
  nodeSize?: number
  linkDistance?: number
  gravity?: number
  iterations?: number
}

export class ForceGraph3D extends BaseChart3D<ForceGraphData> {
  private forceOptions: ForceGraph3DOptions

  constructor(container: HTMLElement, options: ForceGraph3DOptions = {}) {
    super(container, options)
    this.forceOptions = options
  }

  protected buildChart(data: ForceGraphData): void {
    if (!data?.nodes?.length) return
    const baseSize = this.forceOptions.nodeSize ?? 0.2
    const linkDistance = this.forceOptions.linkDistance ?? 2
    const groups = [...new Set(data.nodes.map((n) => n.group).filter((g) => g !== undefined))]
    const positions = new Map<string, THREE.Vector3>()

    data.nodes.forEach((node) => {
      positions.set(node.id, new THREE.Vector3(
        (Math.random() - 0.5) * linkDistance * 2,
        (Math.random() - 0.5) * linkDistance * 2,
        (Math.random() - 0.5) * linkDistance * 2
      ))
    })

    data.nodes.forEach((node) => {
      const size = baseSize * (node.size ?? 1)
      const colorIdx = node.group !== undefined ? Math.max(0, groups.indexOf(node.group)) : 0
      const geometry = new THREE.SphereGeometry(size, 16, 16)
      const material = this.themeEngine.createMaterial(colorIdx)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(positions.get(node.id)!)
      mesh.userData = { chartData: node }
      this.chartGroup.add(mesh)
      this.interactionManager.addInteractive(mesh)
    })

    data.links.forEach((link) => {
      const from = positions.get(link.source)
      const to = positions.get(link.target)
      if (!from || !to) return
      const geometry = new THREE.BufferGeometry().setFromPoints([from, to])
      const weight = link.weight ?? link.value ?? 1
      const material = this.themeEngine.createLineMaterial(0, { opacity: 0.3 + Math.min(0.5, weight * 0.1) })
      this.chartGroup.add(new THREE.Line(geometry, material))
    })
  }
}
