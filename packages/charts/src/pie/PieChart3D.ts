import * as THREE from 'three'
import { BaseChart3D, ChartOptions } from '../base/BaseChart3D'
import { makeTextSprite } from '../base/textSprite'

export interface PieChartData { label: string; value: number }
export interface PieChart3DOptions extends ChartOptions<PieChartData[]> {
  innerRadius?: number
  explode?: number
  height?: number
  depth?: number
  showValues?: boolean
  labelPosition?: 'inside' | 'outside'
  valueFormatter?: (item: PieChartData, percentage: number) => string
  onDrillDown?: (item: PieChartData) => void
}

export class PieChart3D extends BaseChart3D<PieChartData[]> {
  private pieOptions: PieChart3DOptions

  constructor(container: HTMLElement, options: PieChart3DOptions = {}) {
    super(container, { ...options, camera: { position: [0, 5, 5], ...options.camera } })
    this.pieOptions = options
    this.interactionManager.on('click', (e: any) => {
      const data = e.object.userData?.chartData as PieChartData & { percentage?: number }
      if (data && this.pieOptions.onDrillDown) this.pieOptions.onDrillDown(data)
    })
  }

  protected buildChart(data: PieChartData[]): void {
    if (!data.length) return
    const total = data.reduce((sum, d) => sum + d.value, 0)
    if (total <= 0) {
      this.showEmpty('数据值之和为 0')
      return
    }
    const innerRadius = this.pieOptions.innerRadius || 0
    const outerRadius = 2
    const depth = this.pieOptions.depth ?? this.pieOptions.height ?? 0.5
    const explode = this.pieOptions.explode || 0

    let startAngle = 0

    data.forEach((item, index) => {
      const angle = (item.value / total) * Math.PI * 2
      const shape = new THREE.Shape()
      const midAngle = startAngle + angle / 2
      const segments = Math.max(8, Math.floor(angle * 16))

      if (innerRadius > 0) {
        shape.moveTo(Math.cos(startAngle) * innerRadius, Math.sin(startAngle) * innerRadius)
        for (let i = 0; i <= segments; i++) {
          const a = startAngle + (i / segments) * angle
          shape.lineTo(Math.cos(a) * outerRadius, Math.sin(a) * outerRadius)
        }
        for (let i = segments; i >= 0; i--) {
          const a = startAngle + (i / segments) * angle
          shape.lineTo(Math.cos(a) * innerRadius, Math.sin(a) * innerRadius)
        }
      } else {
        shape.moveTo(0, 0)
        for (let i = 0; i <= segments; i++) {
          const a = startAngle + (i / segments) * angle
          shape.lineTo(Math.cos(a) * outerRadius, Math.sin(a) * outerRadius)
        }
        shape.lineTo(0, 0)
      }

      const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false })
      geometry.rotateX(-Math.PI / 2)

      const material = this.themeEngine.createMaterial(index)
      const mesh = new THREE.Mesh(geometry, material)

      if (explode > 0) {
        mesh.position.x = Math.cos(midAngle) * explode
        mesh.position.z = -Math.sin(midAngle) * explode
      }

      mesh.userData = { chartData: { ...item, percentage: (item.value / total) * 100 }, index }
      this.chartGroup.add(mesh)
      this.interactionManager.addInteractive(mesh)
      this.animateEntrance(mesh, 1, index)

      if (this.pieOptions.showValues !== false) {
        const pct = ((item.value / total) * 100).toFixed(1)
        const labelText = this.pieOptions.valueFormatter
          ? this.pieOptions.valueFormatter(item, item.value / total * 100)
          : `${item.label} ${pct}%`
        const isInside = this.pieOptions.labelPosition === 'inside'
        const labelR = isInside ? (outerRadius + innerRadius) / 2 || outerRadius * 0.6 : outerRadius + 0.5
        const lx = Math.cos(midAngle) * labelR + (explode > 0 ? Math.cos(midAngle) * explode : 0)
        const lz = -Math.sin(midAngle) * labelR + (explode > 0 ? -Math.sin(midAngle) * explode : 0)
        const theme = this.themeEngine.getTheme()
        const sprite = makeTextSprite(labelText, { color: this.getTextColor(), fontSize: isInside ? 38 : 44, worldHeight: isInside ? 0.2 : 0.25 })
        sprite.position.set(lx, depth / 2 + 0.1, lz)
        sprite.renderOrder = 999
        this.chartGroup.add(sprite)
      }

      startAngle += angle
    })

    const palette = this.getColors()
    this.legend.setItems(data.map((item, i) => ({ label: item.label, color: palette[i % palette.length] })))
    this.legend.show()
  }
}
