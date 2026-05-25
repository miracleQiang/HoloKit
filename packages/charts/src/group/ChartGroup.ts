import { BaseChart3D } from '../base/BaseChart3D'

export class ChartGroup {
  private charts: BaseChart3D[] = []

  add(chart: BaseChart3D): void {
    this.charts.push(chart)
  }

  remove(chart: BaseChart3D): void {
    this.charts = this.charts.filter((c) => c !== chart)
  }

  setTheme(theme: string): void {
    this.charts.forEach((c) => c.setTheme(theme))
  }

  setCameraPreset(preset: 'default' | 'top' | 'front' | 'side'): void {
    this.charts.forEach((c) => c.setCameraPreset(preset))
  }

  setAutoRotate(enabled: boolean): void {
    this.charts.forEach((c) => c.setAutoRotate(enabled))
  }

  exportAll(type: 'png' | 'jpeg' = 'png'): string[] {
    return this.charts.map((c) => c.exportImage(type))
  }

  dispose(): void {
    this.charts.forEach((c) => c.dispose())
    this.charts = []
  }
}
