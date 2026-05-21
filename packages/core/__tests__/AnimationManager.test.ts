import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AnimationManager } from '../src/animation/AnimationManager'

describe('AnimationManager', () => {
  let manager: AnimationManager
  let rafCallbacks: Array<(time: number) => void>
  let time: number

  beforeEach(() => {
    time = 0
    rafCallbacks = []
    vi.spyOn(performance, 'now').mockImplementation(() => time)
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    manager = new AnimationManager()
  })

  afterEach(() => {
    manager.dispose()
    vi.restoreAllMocks()
  })

  function advanceFrame(ms: number) {
    time += ms
    const cbs = [...rafCallbacks]
    rafCallbacks = []
    cbs.forEach((cb) => cb(time))
  }

  it('should create animation and return id', () => {
    const id = manager.animate({ duration: 1000, onUpdate: () => {} })
    expect(id).toMatch(/^anim_/)
  })

  it('should cancel animation by id', () => {
    const onUpdate = vi.fn()
    const id = manager.animate({ duration: 1000, onUpdate })
    manager.cancel(id)
    advanceFrame(500)
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('should call onUpdate with eased progress', () => {
    const onUpdate = vi.fn()
    manager.animate({ duration: 1000, easing: 'linear', onUpdate })
    advanceFrame(500)
    expect(onUpdate).toHaveBeenCalledWith(0.5)
  })

  it('should call onComplete when animation finishes', () => {
    const onComplete = vi.fn()
    manager.animate({ duration: 1000, easing: 'linear', onUpdate: () => {}, onComplete })
    advanceFrame(1000)
    expect(onComplete).toHaveBeenCalled()
  })

  it('should cancel all animations', () => {
    const onUpdate1 = vi.fn()
    const onUpdate2 = vi.fn()
    manager.animate({ duration: 1000, onUpdate: onUpdate1 })
    manager.animate({ duration: 1000, onUpdate: onUpdate2 })
    manager.cancelAll()
    advanceFrame(500)
    expect(onUpdate1).not.toHaveBeenCalled()
    expect(onUpdate2).not.toHaveBeenCalled()
  })
})
