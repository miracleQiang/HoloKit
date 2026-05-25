import { Ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export interface DemoToolbarContext {
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  scene: THREE.Scene
  controls: OrbitControls
  el: Ref<HTMLDivElement | null>
}

const PRESETS: Record<string, [number, number, number]> = {
  default: [6, 5, 8],
  top: [0, 12, 0.01],
  front: [0, 3, 12],
  side: [12, 3, 0],
}

export function useDemoToolbar(ctx: () => DemoToolbarContext | null) {
  function switchCamera(preset: string) {
    const c = ctx()
    if (!c) return
    const pos = PRESETS[preset] || PRESETS.default
    c.camera.position.set(...pos)
    c.camera.lookAt(0, 0, 0)
    if (c.controls) {
      c.controls.target.set(0, 0, 0)
      c.controls.update()
    }
  }

  function exportPng() {
    const c = ctx()
    if (!c) return
    c.renderer.render(c.scene, c.camera)
    const url = c.renderer.domElement.toDataURL('image/png')
    const a = document.createElement('a')
    a.download = 'chart.png'; a.href = url; a.click()
  }

  function toggleFull() {
    const c = ctx()
    if (!c?.el.value) return
    if (!document.fullscreenElement) c.el.value.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  return { switchCamera, exportPng, toggleFull }
}
