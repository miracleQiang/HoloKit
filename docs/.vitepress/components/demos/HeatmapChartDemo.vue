<template>
  <DemoContainer title="3D 热力图">
    <DemoToolbar @camera="switchCamera" @export="exportPng" @fullscreen="toggleFull" />
    <div ref="el" class="demo-3d"></div>
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
let chartGroup: THREE.Group, ambient: THREE.AmbientLight, dirLight: THREE.DirectionalLight

const ROWS = 10, COLS = 10
const grid: number[][] = []
for (let r = 0; r < ROWS; r++) {
  const row: number[] = []
  for (let c = 0; c < COLS; c++) {
    const dx = c - 4.5, dz = r - 4.5
    row.push(Math.exp(-(dx * dx + dz * dz) / 12) + Math.random() * 0.15)
  }
  grid.push(row)
}

function buildHeatmap() {
  while (chartGroup.children.length) {
    const c = chartGroup.children[0] as any
    chartGroup.remove(c); c.geometry?.dispose?.(); c.material?.dispose?.()
  }
  const t = current.value
  const palette = t.colors.slice(0, 5).map(c => new THREE.Color(c))
  let max = 0
  grid.forEach(row => row.forEach(v => { if (v > max) max = v }))
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = grid[r][c] / max
      const h = Math.max(0.05, v * 2.5)
      const geo = new THREE.BoxGeometry(0.8, h, 0.8)
      geo.translate(0, h / 2, 0)
      const idx = Math.min(palette.length - 1, Math.floor(v * (palette.length - 1)))
      const color = palette[idx]
      const mat = new THREE.MeshPhysicalMaterial({
        color, metalness: t.metalness, roughness: t.roughness,
        emissive: color, emissiveIntensity: t.emissiveIntensity,
        transparent: t.opacity < 1, opacity: t.opacity,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set((c - COLS / 2 + 0.5) * 0.9, 0, (r - ROWS / 2 + 0.5) * 0.9)
      chartGroup.add(mesh)
    }
  }
}

function applyTheme() {
  const t = current.value
  scene.background = new THREE.Color(t.background)
  ambient.color.set(t.ambient.color); ambient.intensity = t.ambient.intensity
  dirLight.color.set(t.directional.color); dirLight.intensity = t.directional.intensity
  buildHeatmap()
}

onMounted(async () => {
  await nextTick()
  const c = el.value!; const init = () => {
    const w = c.clientWidth || 600, h = 400
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100); camera.position.set(8, 8, 8); camera.lookAt(0, 0, 0)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    c.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true
    ambient = new THREE.AmbientLight('#fff', 0.4); scene.add(ambient)
    dirLight = new THREE.DirectionalLight('#fff', 0.8); dirLight.position.set(5, 10, 5); scene.add(dirLight)
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
.demo-3d { width: 100%; height: 400px; }
</style>
