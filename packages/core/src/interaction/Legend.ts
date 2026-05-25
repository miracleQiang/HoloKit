export interface LegendItem {
  label: string
  color: string
}

export interface LegendOptions {
  show?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  direction?: 'horizontal' | 'vertical'
  fontSize?: string
  textColor?: string
}

const DEFAULTS: Required<LegendOptions> = {
  show: true,
  position: 'top-right',
  direction: 'horizontal',
  fontSize: '12px',
  textColor: '#e2e8f0',
}

export class Legend {
  private el: HTMLDivElement
  private container: HTMLElement
  private opts: Required<LegendOptions>

  constructor(container: HTMLElement, options: LegendOptions = {}) {
    this.container = container
    this.opts = { ...DEFAULTS, ...options }
    this.el = document.createElement('div')
    this.applyStyles()
    if (getComputedStyle(container).position === 'static') container.style.position = 'relative'
    container.appendChild(this.el)
  }

  private applyStyles(): void {
    const pos = this.opts.position
    const posMap: Record<string, Record<string, string>> = {
      'top-left': { top: '8px', left: '8px' },
      'top-right': { top: '8px', right: '8px' },
      'bottom-left': { bottom: '8px', left: '8px' },
      'bottom-right': { bottom: '8px', right: '8px' },
    }
    Object.assign(this.el.style, {
      position: 'absolute',
      zIndex: '999',
      display: this.opts.show ? 'flex' : 'none',
      flexDirection: this.opts.direction === 'vertical' ? 'column' : 'row',
      flexWrap: 'wrap',
      gap: '8px',
      padding: '8px 12px',
      fontSize: this.opts.fontSize,
      color: this.opts.textColor,
      pointerEvents: 'none',
      ...posMap[pos],
    })
  }

  setItems(items: LegendItem[]): void {
    this.el.innerHTML = ''
    items.forEach((item) => {
      const row = document.createElement('span')
      row.style.display = 'inline-flex'
      row.style.alignItems = 'center'
      row.style.gap = '4px'
      const dot = document.createElement('span')
      Object.assign(dot.style, { width: '10px', height: '10px', borderRadius: '2px', background: item.color, display: 'inline-block' })
      row.appendChild(dot)
      row.appendChild(document.createTextNode(item.label))
      this.el.appendChild(row)
    })
  }

  show(): void { this.el.style.display = 'flex' }
  hide(): void { this.el.style.display = 'none' }

  dispose(): void {
    if (this.el.parentElement === this.container) this.container.removeChild(this.el)
  }
}
