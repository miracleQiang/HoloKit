import * as THREE from 'three'
import { makeTextSprite } from './textSprite'

export interface SingleAxisOptions {
  label?: string
  showTicks?: boolean
  max?: number
  ticks?: number
  formatter?: (value: number) => string
}

export interface AxisConfig {
  xAxis?: SingleAxisOptions
  yAxis?: SingleAxisOptions
  zAxis?: SingleAxisOptions
  unit?: string
  showValues?: boolean
  valueFormatter?: (item: any) => string
}

export interface AxisDimensions {
  width: number
  height: number
  depth?: number
}

export interface DrawGridOptions {
  group: THREE.Group
  dimensions: AxisDimensions
  yTicks: number
  material: THREE.Material
  includeZAxis?: boolean
}

export function drawGrid(opts: DrawGridOptions): void {
  const { group, dimensions, yTicks, material, includeZAxis } = opts
  if (yTicks <= 0) return
  const halfWidth = dimensions.width / 2 + 0.3
  for (let i = 0; i <= yTicks; i++) {
    const y = (i / yTicks) * dimensions.height
    const points = [new THREE.Vector3(-halfWidth, y, 0), new THREE.Vector3(halfWidth, y, 0)]
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material))
  }
  const baseY = [new THREE.Vector3(-halfWidth, 0, 0), new THREE.Vector3(-halfWidth, dimensions.height, 0)]
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(baseY), material))
  if (includeZAxis && dimensions.depth) {
    const halfDepth = dimensions.depth / 2 + 0.3
    const baseZ = [new THREE.Vector3(0, 0, -halfDepth), new THREE.Vector3(0, 0, halfDepth)]
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(baseZ), material))
  }
}
export interface DrawAxisTicksOptions {
  group: THREE.Group
  axis: 'x' | 'y' | 'z'
  dimensions: AxisDimensions
  maxValue: number
  ticks: number
  formatter: (v: number) => string
  color: string
}

export function drawAxisTicks(opts: DrawAxisTicksOptions): void {
  const { group, axis, dimensions, maxValue, ticks, formatter, color } = opts
  if (ticks <= 0) return
  const halfWidth = dimensions.width / 2 + 0.3

  for (let i = 0; i <= ticks; i++) {
    const t = i / ticks
    const value = t * maxValue
    const label = makeTextSprite(formatter(value), { color, fontSize: 44, worldHeight: 0.25 })

    if (axis === 'y') {
      label.position.set(-halfWidth - 0.4, t * dimensions.height, 0)
    } else if (axis === 'x') {
      label.position.set(-halfWidth + t * dimensions.width + 0.6, -0.3, 0)
    } else {
      const halfDepth = (dimensions.depth || dimensions.width) / 2 + 0.3
      label.position.set(0, -0.3, -halfDepth + t * (dimensions.depth || dimensions.width) + 0.6)
    }
    group.add(label)
  }
}
export interface DrawAxisTitleOptions {
  group: THREE.Group
  text: string
  axis: 'x' | 'y' | 'z'
  dimensions: AxisDimensions
  color: string
}

export function drawAxisTitle(opts: DrawAxisTitleOptions): void {
  const { group, text, axis, dimensions, color } = opts
  const sprite = makeTextSprite(text, { color, fontSize: 60, fontWeight: 600, worldHeight: 0.34 })
  const halfWidth = dimensions.width / 2
  if (axis === 'x') {
    sprite.position.set(0, -0.7, 0)
  } else if (axis === 'y') {
    sprite.position.set(-(halfWidth + 1.4), dimensions.height / 2, 0)
  } else {
    const halfDepth = (dimensions.depth || dimensions.width) / 2
    sprite.position.set(0, -0.7, halfDepth + 0.8)
  }
  group.add(sprite)
}

export interface MarkLineItem {
  value: number
  label?: string
  color?: string
  lineWidth?: number
  dashSize?: number
}

export interface DrawMarkLineOptions {
  group: THREE.Group
  dimensions: AxisDimensions
  maxValue: number
  lines: MarkLineItem[]
  defaultColor?: string
}

export function drawMarkLines(opts: DrawMarkLineOptions): void {
  const { group, dimensions, maxValue, lines, defaultColor } = opts
  if (!lines.length || maxValue <= 0) return
  const halfWidth = dimensions.width / 2 + 0.3

  lines.forEach((line) => {
    const y = (line.value / maxValue) * dimensions.height
    const color = line.color || defaultColor || '#f59e0b'
    const mat = new THREE.LineDashedMaterial({ color, dashSize: line.dashSize ?? 0.1, gapSize: 0.05, linewidth: line.lineWidth ?? 1 })
    const points = [new THREE.Vector3(-halfWidth, y, 0), new THREE.Vector3(halfWidth, y, 0)]
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    const lineObj = new THREE.Line(geo, mat)
    lineObj.computeLineDistances()
    group.add(lineObj)

    if (line.label) {
      const sprite = makeTextSprite(line.label, { color, fontSize: 44, worldHeight: 0.25 })
      sprite.position.set(halfWidth + 0.3, y, 0)
      group.add(sprite)
    }
  })
}
