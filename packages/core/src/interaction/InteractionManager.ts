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
  private boundMouseMove: (e: MouseEvent) => void
  private boundClick: (e: MouseEvent) => void

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.boundMouseMove = this.onMouseMove.bind(this)
    this.boundClick = this.onClick.bind(this)

    const canvas = sceneManager.renderer.domElement
    canvas.addEventListener('mousemove', this.boundMouseMove)
    canvas.addEventListener('click', this.boundClick)
  }

  addInteractive(object: THREE.Object3D): void {
    if (!this.interactiveObjects.includes(object)) {
      this.interactiveObjects.push(object)
    }
  }

  removeInteractive(object: THREE.Object3D): void {
    const idx = this.interactiveObjects.indexOf(object)
    if (idx !== -1) this.interactiveObjects.splice(idx, 1)
    if (this.hoveredObject === object) this.hoveredObject = null
  }

  clearInteractive(): void {
    this.interactiveObjects = []
    this.hoveredObject = null
  }

  on(event: 'hover' | 'unhover' | 'click', handler: InteractionHandler): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)!.add(handler)
    return () => this.handlers.get(event)?.delete(handler)
  }

  off(event: 'hover' | 'unhover' | 'click', handler?: InteractionHandler): void {
    if (!handler) {
      this.handlers.delete(event)
    } else {
      this.handlers.get(event)?.delete(handler)
    }
  }

  private emit(event: string, data: InteractionEvent): void {
    this.handlers.get(event)?.forEach((handler) => handler(data))
  }

  private updateMouse(e: MouseEvent): void {
    const rect = this.sceneManager.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  }

  private resolveInteractiveAncestor(obj: THREE.Object3D): THREE.Object3D | null {
    let cur: THREE.Object3D | null = obj
    while (cur) {
      if (this.interactiveObjects.includes(cur)) return cur
      cur = cur.parent
    }
    return null
  }

  private getIntersection(e: MouseEvent): { object: THREE.Object3D; point: THREE.Vector3 } | null {
    this.updateMouse(e)
    this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera)
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true)
    for (const hit of intersects) {
      const ancestor = this.resolveInteractiveAncestor(hit.object)
      if (ancestor) return { object: ancestor, point: hit.point }
    }
    return null
  }

  private onMouseMove(e: MouseEvent): void {
    const hit = this.getIntersection(e)
    const hitObject = hit?.object || null

    if (hitObject !== this.hoveredObject) {
      if (this.hoveredObject) {
        this.emit('unhover', {
          object: this.hoveredObject,
          point: new THREE.Vector3(),
          originalEvent: e,
        })
      }
      if (hitObject && hit) {
        this.emit('hover', { object: hitObject, point: hit.point, originalEvent: e })
      }
      this.hoveredObject = hitObject
    }

    this.sceneManager.renderer.domElement.style.cursor = hitObject ? 'pointer' : 'default'
  }

  private onClick(e: MouseEvent): void {
    const hit = this.getIntersection(e)
    if (hit) {
      this.emit('click', { object: hit.object, point: hit.point, originalEvent: e })
    }
  }

  dispose(): void {
    const canvas = this.sceneManager.renderer.domElement
    canvas.removeEventListener('mousemove', this.boundMouseMove)
    canvas.removeEventListener('click', this.boundClick)
    this.handlers.clear()
    this.interactiveObjects = []
    this.hoveredObject = null
  }
}
