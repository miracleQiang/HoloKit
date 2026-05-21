import { ThemeEngine } from '../theme/ThemeEngine'

export interface TooltipOptions {
  backgroundColor?: string
  textColor?: string
  fontSize?: string
  padding?: string
  borderRadius?: string
  maxWidth?: string
}

const FALLBACK: Required<TooltipOptions> = {
  backgroundColor: 'rgba(15, 23, 42, 0.9)',
  textColor: '#e2e8f0',
  fontSize: '13px',
  padding: '8px 12px',
  borderRadius: '6px',
  maxWidth: '240px',
}

export class Tooltip {
  private el: HTMLDivElement
  private container: HTMLElement
  private themeEngine: ThemeEngine | null

  constructor(container: HTMLElement, options: TooltipOptions = {}, themeEngine: ThemeEngine | null = null) {
    this.container = container
    this.themeEngine = themeEngine
    const themeBg = themeEngine?.getTheme().colors.tooltip
    const themeText = themeEngine?.getTheme().colors.text
    const style = {
      ...FALLBACK,
      ...(themeBg ? { backgroundColor: themeBg } : {}),
      ...(themeText ? { textColor: themeText } : {}),
      ...options,
    }

    this.el = document.createElement('div')
    Object.assign(this.el.style, {
      position: 'absolute',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 0.15s ease',
      backgroundColor: style.backgroundColor,
      color: style.textColor,
      fontSize: style.fontSize,
      padding: style.padding,
      borderRadius: style.borderRadius,
      maxWidth: style.maxWidth,
      zIndex: '1000',
      whiteSpace: 'nowrap',
    })
    if (getComputedStyle(container).position === 'static') container.style.position = 'relative'
    container.appendChild(this.el)
  }

  show(content: string, x: number, y: number): void {
    this.el.innerHTML = content
    this.el.style.left = `${x + 12}px`
    this.el.style.top = `${y - 12}px`
    this.el.style.opacity = '1'
  }

  hide(): void { this.el.style.opacity = '0' }

  dispose(): void {
    if (this.el.parentElement === this.container) this.container.removeChild(this.el)
  }
}
