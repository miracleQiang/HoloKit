import { SceneManager } from '../scene/SceneManager'

export class ResponsiveManager {
  private sceneManager: SceneManager
  private observer: ResizeObserver
  private container: HTMLElement

  constructor(sceneManager: SceneManager, container: HTMLElement) {
    this.sceneManager = sceneManager
    this.container = container

    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          this.sceneManager.resize(width, height)
        }
      }
    })
    this.observer.observe(container)
  }

  dispose(): void {
    this.observer.disconnect()
  }
}
