import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SceneManager } from '../src/scene/SceneManager'
import { ThemeEngine } from '../src/theme/ThemeEngine'
import { cyberpunkTheme } from '../src/theme/presets'

describe('ThemeEngine', () => {
  let container: HTMLElement
  let sceneManager: SceneManager

  beforeEach(() => {
    container = document.createElement('div')
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({ width: 800, height: 600, top: 0, left: 0, right: 800, bottom: 600 }),
    })
    document.body.appendChild(container)
    sceneManager = new SceneManager(container)
  })

  afterEach(() => {
    sceneManager.dispose()
    document.body.removeChild(container)
  })

  it('should initialize with cyberpunk theme by default', () => {
    const engine = new ThemeEngine(sceneManager)
    expect(engine.getTheme().name).toBe('cyberpunk')
  })

  it('should switch theme by name', () => {
    const engine = new ThemeEngine(sceneManager)
    engine.setTheme('glass')
    expect(engine.getTheme().name).toBe('glass')
  })

  it('should accept custom theme object', () => {
    const custom = { ...cyberpunkTheme, name: 'custom' }
    const engine = new ThemeEngine(sceneManager, custom)
    expect(engine.getTheme().name).toBe('custom')
  })

  it('should throw on unknown theme name', () => {
    expect(() => new ThemeEngine(sceneManager, 'nonexistent')).toThrow()
  })

  it('should return colors by index with wrapping', () => {
    const engine = new ThemeEngine(sceneManager)
    const colors = cyberpunkTheme.colors.primary
    expect(engine.getColor(0)).toBe(colors[0])
    expect(engine.getColor(colors.length)).toBe(colors[0])
  })

  it('should create material based on theme', () => {
    const engine = new ThemeEngine(sceneManager)
    const material = engine.createMaterial(0)
    expect(material).toBeDefined()
    material.dispose()
  })
})
