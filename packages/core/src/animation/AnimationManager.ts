import { easings, EasingFunction } from './easings'

export interface AnimationOptions {
  duration?: number
  easing?: string | EasingFunction
  delay?: number
  onUpdate?: (progress: number) => void
  onComplete?: () => void
}

interface ActiveAnimation {
  startTime: number
  duration: number
  delay: number
  easing: EasingFunction
  onUpdate: (progress: number) => void
  onComplete?: () => void
}

export class AnimationManager {
  private animations: Map<string, ActiveAnimation> = new Map()
  private idCounter = 0
  private rafId: number | null = null
  private running = false

  animate(options: AnimationOptions): string {
    const id = `anim_${++this.idCounter}`
    const easingFn =
      typeof options.easing === 'function'
        ? options.easing
        : easings[options.easing || 'easeOutCubic'] || easings.easeOutCubic

    this.animations.set(id, {
      startTime: performance.now() + (options.delay || 0),
      duration: options.duration || 1000,
      delay: options.delay || 0,
      easing: easingFn,
      onUpdate: options.onUpdate || (() => {}),
      onComplete: options.onComplete,
    })

    if (!this.running) this.start()
    return id
  }

  cancel(id: string): void {
    this.animations.delete(id)
    if (this.animations.size === 0) this.stop()
  }

  cancelAll(): void {
    this.animations.clear()
    this.stop()
  }

  private start(): void {
    this.running = true
    const tick = (now: number) => {
      if (!this.running) return

      for (const [id, anim] of this.animations) {
        if (now < anim.startTime) continue

        const elapsed = now - anim.startTime
        const rawProgress = Math.min(elapsed / anim.duration, 1)
        const easedProgress = anim.easing(rawProgress)

        anim.onUpdate(easedProgress)

        if (rawProgress >= 1) {
          anim.onComplete?.()
          this.animations.delete(id)
        }
      }

      if (this.animations.size === 0) {
        this.stop()
      } else {
        this.rafId = requestAnimationFrame(tick)
      }
    }
    this.rafId = requestAnimationFrame(tick)
  }

  private stop(): void {
    this.running = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  dispose(): void {
    this.cancelAll()
  }
}
