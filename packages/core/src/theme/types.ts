export interface ThemeColors {
  primary: string[]
  background: string
  text: string
  grid: string
  tooltip: string
}

export interface ThemeMaterial {
  type: 'standard' | 'physical' | 'toon'
  metalness: number
  roughness: number
  opacity: number
  emissive: boolean
}

export interface ThemeLighting {
  ambient: { color: string; intensity: number }
  directional: { color: string; intensity: number; position: [number, number, number] }
}

export interface ThemeAnimation {
  duration: number
  easing: string
}

export interface HoloKitTheme {
  name: string
  colors: ThemeColors
  material: ThemeMaterial
  lighting: ThemeLighting
  animation: ThemeAnimation
}
