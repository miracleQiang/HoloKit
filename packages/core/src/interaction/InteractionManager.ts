import * as THREE from 'three'
import { SceneManager } from '../scene/SceneManager'

export type InteractionEvent = {
  object: THREE.Object3D
  point: THREE.Vector3
  originalEvent: MouseEvent
}

export type InteractionHandler = (event: InteractionEvent) => void

export class InteractionManager {
  private sceneManager: SceneManager
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private interactiveObjects: THREE.Object3D[] = []
  private hoveredObject: THREE.Object3D | null = null
  private handlers: Map<string, Set<InteractionHandler>> = new Map()

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    const canvas = sceneManager.renderer.domElement
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this))
    canvas.addEventListener('click', this.onClick.bind(this))
  }

  addInteractive(object: THREE.Object3D): void {
    if (!this.interactiveObjects.includes(object)) {
      this.interactiveObjects.push(object)
    }
  }

  removeInteractive(object: THREE.Object3D): void {
    const idx = this.interactiveObjects.indexOf(object)
    if (idx !== -1) this.interactiveObjects.splice(idx, 1)
  }

  on(event: 'hover' | 'unhover' | 'click', handler: InteractionHandler): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)!.add(handler)
    return () => this.handlers.get(event)?.delete(handler)
  }

  private emit(event: string, data: InteractionEvent): void {
    this.handlers.get(event)?.forEach((handler) => handler(data))
  }

  private updateMouse(e: MouseEvent): void {
    const rect = this.sceneManager.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  }

  private getIntersection(e: MouseEvent): THREE.Intersection | null {
    this.updateMouse(e)
    this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera)
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true)
    return intersects.length > 0 ? intersects[0] : null
  }

  private onMouseMove(e: MouseEvent): void {
    const intersection = this.getIntersection(e)
    const hitObject = intersection?.object || null

    if (hitObject !== this.hoveredObject) {
      if (this.hoveredObject) {
        this.emit('unhover', {
          object: this.hoveredObject,
          point: new THREE.Vector3(),
          originalEvent: e,
        })
      }
      if (hitObject && intersection) {
        this.emit('hover', { object: hitObject, point: intersection.point, originalEvent: e })
      }
      this.hoveredObject = hitObject
    }

    this.sceneManager.renderer.domElement.style.cursor = hitObject ? 'pointer' : 'default'
  }

  private onClick(e: MouseEvent): void {
    const intersection = this.getIntersection(e)
    if (intersection) {
      this.emit('click', {
        object: intersection.object,
        point: intersection.point,
        originalEvent: e,
      })
    }
  }

  dispose(): void {
    const canvas = this.sceneManager.renderer.domElement
    canvas.removeEventListener('mousemove', this.onMouseMove.bind(this))
    canvas.removeEventListener('click', this.onClick.bind(this))
    this.handlers.clear()
    this.interactiveObjects = []
  }
}
