import * as THREE from 'three'

export interface TextSpriteOptions {
  color?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string | number
  bgColor?: string
  padding?: number
  worldHeight?: number
}

export function makeTextSprite(text: string, options: TextSpriteOptions = {}): THREE.Sprite {
  const fontSize = options.fontSize ?? 64
  const fontFamily = options.fontFamily ?? '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif'
  const fontWeight = options.fontWeight ?? 500
  const padding = options.padding ?? 12
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const fontSpec = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.font = fontSpec
  const textWidth = ctx.measureText(text).width
  const cssW = Math.ceil(textWidth + padding * 2)
  const cssH = Math.ceil(fontSize + padding * 2)
  canvas.width = cssW * dpr
  canvas.height = cssH * dpr
  ctx.scale(dpr, dpr)

  if (options.bgColor) {
    const r = 8
    ctx.fillStyle = options.bgColor
    ctx.beginPath()
    ctx.roundRect(0, 0, cssW, cssH, r)
    ctx.fill()
  }

  ctx.font = fontSpec
  ctx.textBaseline = 'middle'
  ctx.fillStyle = options.color ?? '#e2e8f0'
  ctx.fillText(text, padding, cssH / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false })
  const sprite = new THREE.Sprite(material)
  const worldHeight = options.worldHeight ?? 0.4
  const aspect = cssW / cssH
  sprite.scale.set(worldHeight * aspect, worldHeight, 1)
  sprite.userData.isLabel = true
  return sprite
}

export function disposeSprite(sprite: THREE.Sprite): void {
  const mat = sprite.material as THREE.SpriteMaterial
  mat.map?.dispose()
  mat.dispose()
}
