import * as THREE from 'three'
import type { SceneManager } from '@holokit/core'

export abstract class CustomLayer {
  protected scene: THREE.Scene | null = null
  protected sceneManager: SceneManager | null = null

  attach(scene: THREE.Scene, sceneManager: SceneManager): void {
    this.scene = scene
    this.sceneManager = sceneManager
    this.onAdd(scene, sceneManager)
  }

  detach(): void {
    if (this.scene) this.onRemove(this.scene)
    this.scene = null
    this.sceneManager = null
  }

  abstract onAdd(scene: THREE.Scene, sceneManager: SceneManager): void
  onUpdate(_delta: number): void {}
  abstract onRemove(scene: THREE.Scene): void
}
