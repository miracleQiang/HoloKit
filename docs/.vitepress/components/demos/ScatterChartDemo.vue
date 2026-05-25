<template>
  <DemoContainer title="3D 散点图">
    <DemoToolbar @camera="switchCamera" @export="exportPng" @fullscreen="toggleFull" />
    <div ref="el" class="demo-3d"></div>
    <div class="demo-legend" :style="{ color: current.text }">
      <span class="legend-item"><span class="legend-dot" :style="{ background: current.colors[0] }"></span>组 A</span>
      <span class="legend-item"><span class="legend-dot" :style="{ background: current.colors[1] }"></span>组 B</span>
      <span class="legend-item"><span class="legend-dot" :style="{ background: current.colors[2] }"></span>组 C</span>
    </div>
  </DemoContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import DemoContainer from '../DemoContainer.vue'
import DemoToolbar from './DemoToolbar.vue'
import { useDemoTheme, AUTO_ROTATE_SPEED } from '../demo-theme'
import { useDemoToolbar } from './demo-toolbar'

const el = ref<HTMLDivElement | null>(null)
const { current } = useDemoTheme()
const { switchCamera, exportPng, toggleFull } = useDemoToolbar(() => renderer ? { renderer, camera, scene, controls, el } : null)
let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera
let controls: OrbitControls, animId: number | null = null, ro: ResizeObserver | null = null
let chartGroup: THREE.Group, ambient: THREE.AmbientLight

const points = Array.from({ length: 60 }, () => ({
  g: Math.floor(Math.random() * 3),
  x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4, z: (Math.random() - 0.5) * 4,
  s: 0.06 + Math.random() * 0.1,
}))

function buildPoints() {
  while (chartGroup.children.length) {
    const c = chartGroup.children[0] as any
    chartGroup.remove(c); c.geometry?.dispose?.(); c.material?.dispose?.()
  }
  const t = current.value
  points.forEach(p => {
    const color = t.colors[p.g]
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(p.s, 12, 12),
      new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: t.emissiveIntensity })
    )
    dot.position.set(p.x, p.y, p.z); chartGroup.add(dot)
  })
  const axisMat = new THREE.LineBasicMaterial({ color: t.grid, transparent: true, opacity: 0.5 })
  const axes: Array<[number[], number[]]> = [[[-3,0,0],[3,0,0]], [[0,-3,0],[0,3,0]], [[0,0,-3],[0,0,3]]]
  axes.forEach(([a, b]) => chartGroup.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]), axisMat
  )))

  const makeLabel = (text: string, pos: [number, number, number]) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const fs = 48, dpr = 2
    ctx.font = `500 ${fs}px sans-serif`
    const w = Math.ceil(ctx.measureText(text).width + 24)
    canvas.width = w * dpr; canvas.height = (fs + 24) * dpr
    ctx.scale(dpr, dpr); ctx.font = `500 ${fs}px sans-serif`
    ctx.textBaseline = 'middle'; ctx.fillStyle = t.text
    ctx.fillText(text, 12, (fs + 24) / 2)
    const tex = new THREE.CanvasTexture(canvas)
    tex.minFilter = THREE.LinearFilter
    const smat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
    const sprite = new THREE.Sprite(smat)
    sprite.scale.set(0.28 * (w / (fs + 24)), 0.28, 1)
    sprite.position.set(...pos)
    chartGroup.add(sprite)
  }
  makeLabel('温度 (°C)', [3.5, 0, 0])
  makeLabel('湿度 (%)', [0, 3.5, 0])
  makeLabel('气压 (hPa)', [0, 0, 3.5])
}

function applyTheme() {
  const t = current.value
  scene.background = new THREE.Color(t.background)
  ambient.color.set(t.ambient.color); ambient.intensity = t.ambient.intensity
  buildPoints()
}

onMounted(async () => {
  await nextTick()
  const c = el.value!; const init = () => {
    const w = c.clientWidth || 600, h = 400
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100); camera.position.set(5, 4, 6); camera.lookAt(0, 0, 0)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    c.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true
    ambient = new THREE.AmbientLight('#fff', 0.4); scene.add(ambient)
    const dir = new THREE.DirectionalLight('#fff', 0.7); dir.position.set(5, 8, 5); scene.add(dir)
    chartGroup = new THREE.Group(); scene.add(chartGroup)
    applyTheme()
    const loop = () => { animId = requestAnimationFrame(loop); if (chartGroup) chartGroup.rotation.y += AUTO_ROTATE_SPEED; controls.update(); renderer.render(scene, camera) }; loop()
    ro = new ResizeObserver(() => {
      const nw = c.clientWidth, nh = c.clientHeight
      if (nw && nh) { renderer.setSize(nw, nh); camera.aspect = nw / nh; camera.updateProjectionMatrix() }
    }); ro.observe(c)
  }
  c.clientWidth > 0 ? init() : requestAnimationFrame(init)
})

watch(current, () => scene && applyTheme())
onUnmounted(() => { if (animId) cancelAnimationFrame(animId); ro?.disconnect(); renderer?.dispose() })
</script>

<style scoped>
.demo-legend { display: flex; gap: 10px; margin-top: 8px; font-size: 12px; flex-wrap: wrap; }
.legend-item { display: inline-flex; align-items: center; gap: 4px; }
.legend-dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
.demo-3d { width: 100%; height: 400px; }
</style>
