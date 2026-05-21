import * as THREE from 'three'
import { HoloKitTheme } from './types'
import { themePresets } from './presets'
import { SceneManager } from '../scene/SceneManager'

export class ThemeEngine {
  private currentTheme: HoloKitTheme
  private sceneManager: SceneManager

  constructor(sceneManager: SceneManager, theme: string | HoloKitTheme = 'cyberpunk') {
    this.sceneManager = sceneManager
    this.currentTheme = typeof theme === 'string' ? this.resolveTheme(theme) : theme
    this.applyTheme()
  }

  getTheme(): HoloKitTheme {
    return this.currentTheme
  }

  setTheme(theme: string | HoloKitTheme): void {
    this.currentTheme = typeof theme === 'string' ? this.resolveTheme(theme) : theme
    this.applyTheme()
  }

  getColor(index: number): string {
    const colors = this.currentTheme.colors.primary
    return colors[index % colors.length]
  }

  getThreeColor(index: number): THREE.Color {
    return new THREE.Color(this.getColor(index))
  }

  createMaterial(colorIndex: number): THREE.Material {
    const { material } = this.currentTheme
    const color = this.getThreeColor(colorIndex)

    if (material.type === 'physical') {
      return new THREE.MeshPhysicalMaterial({
        color,
        metalness: material.metalness,
        roughness: material.roughness,
        transparent: material.opacity < 1,
        opacity: material.opacity,
        emissive: material.emissive ? color.clone().multiplyScalar(0.2) : undefined,
      })
    }

    if (material.type === 'toon') {
      return new THREE.MeshToonMaterial({
        color,
        transparent: material.opacity < 1,
        opacity: material.opacity,
      })
    }

    return new THREE.MeshStandardMaterial({
      color,
      metalness: material.metalness,
      roughness: material.roughness,
      transparent: material.opacity < 1,
      opacity: material.opacity,
    })
  }

  private resolveTheme(name: string): HoloKitTheme {
    const theme = themePresets[name]
    if (!theme) {
      throw new Error(`Theme "${name}" not found. Available: ${Object.keys(themePresets).join(', ')}`)
    }
    return theme
  }

  private applyTheme(): void {
    const { scene } = this.sceneManager
    scene.background = new THREE.Color(this.currentTheme.colors.background)
    this.applyLighting()
  }

  private applyLighting(): void {
    const { scene } = this.sceneManager
    const { lighting } = this.currentTheme

    scene.children
      .filter((c) => c instanceof THREE.AmbientLight || c instanceof THREE.DirectionalLight)
      .forEach((c) => scene.remove(c))

    const ambient = new THREE.AmbientLight(lighting.ambient.color, lighting.ambient.intensity)
    scene.add(ambient)

    const directional = new THREE.DirectionalLight(
      lighting.directional.color,
      lighting.directional.intensity
    )
    directional.position.set(...lighting.directional.position)
    scene.add(directional)
  }
}
