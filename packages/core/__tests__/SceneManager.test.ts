import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SceneManager } from '../src/scene/SceneManager'

describe('SceneManager', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({ width: 800, height: 600, top: 0, left: 0, right: 800, bottom: 600 }),
    })
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should create scene with default options', () => {
    const sm = new SceneManager(container)
    expect(sm.scene).toBeDefined()
    expect(sm.camera).toBeDefined()
    expect(sm.renderer).toBeDefined()
    sm.dispose()
  })

  it('should append canvas to container', () => {
    const sm = new SceneManager(container)
    expect(container.querySelector('canvas')).toBeTruthy()
    sm.dispose()
  })

  it('should resize camera and renderer', () => {
    const sm = new SceneManager(container)
    sm.resize(1024, 768)
    expect(sm.camera.aspect).toBeCloseTo(1024 / 768)
    sm.dispose()
  })

  it('should register and unregister render callbacks', () => {
    const sm = new SceneManager(container)
    const cb = vi.fn()
    const unsubscribe = sm.onRender(cb)
    unsubscribe()
    sm.dispose()
  })

  it('should clean up on dispose', () => {
    const sm = new SceneManager(container)
    sm.start()
    sm.dispose()
    expect(container.querySelector('canvas')).toBeNull()
  })
})
