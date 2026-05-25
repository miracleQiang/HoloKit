<template>
  <DemoContainer title="3D 地图 - 飞线动画">
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
let chartGroup: THREE.Group, ambient: THREE.AmbientLight, ground: THREE.Mesh, grid: THREE.GridHelper

const cities = [
  { x: 0, z: 0, c: 2 },
  { x: 2.5, z: 1.5, c: 0 },
  { x: 1.5, z: 3, c: 3 },
  { x: -2, z: 1, c: 4 },
  { x: -3, z: -1, c: 1 },
  { x: 3, z: -1, c: 5 },
]

function buildMap() {
  while (chartGroup.children.length) {
    const c = chartGroup.children[0] as any
    chartGroup.remove(c); c.geometry?.dispose?.(); c.material?.dispose?.()
  }
  const t = current.value
  cities.forEach(city => {
    const color = t.colors[city.c]
    const dot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.4, 16),
      new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: t.emissiveIntensity * 1.8 })
    )
    dot.position.set(city.x, 0.2, city.z); chartGroup.add(dot)
  })
  const beijing = cities[0]
  cities.slice(1).forEach(target => {
    const from = new THREE.Vector3(beijing.x, 0.2, beijing.z)
    const to = new THREE.Vector3(target.x, 0.2, target.z)
    const mid = new THREE.Vector3().lerpVectors(from, to, 0.5); mid.y = 1.5 + Math.random() * 0.5
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to)
    const pts = curve.getPoints(50)
    chartGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: t.colors[target.c], transparent: true, opacity: 0.85 })
    ))
  })
}

function applyTheme() {
  const t = current.value
  scene.background = new THREE.Color(t.background)
  ambient.color.set(t.ambient.color); ambient.intensity = t.ambient.intensity
  ;(ground.material as THREE.MeshStandardMaterial).color.set(t.background === '#0a0e1a' ? '#0f172a' : '#283449')
  scene.remove(grid)
  grid = new THREE.GridHelper(12, 24, t.grid, t.grid); grid.position.y = 0.01; scene.add(grid)
  buildMap()
}

onMounted(async () => {
  await nextTick()
  const c = el.value!; const init = () => {
    const w = c.clientWidth || 600, h = 400
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100); camera.position.set(0, 7, 6); camera.lookAt(0, 0, 0)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    c.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true
    ambient = new THREE.AmbientLight('#fff', 0.4); scene.add(ambient)
    const dir = new THREE.DirectionalLight('#fff', 0.6); dir.position.set(5, 8, 5); scene.add(dir)
    ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), new THREE.MeshStandardMaterial({ color: '#0f172a' }))
    ground.rotation.x = -Math.PI / 2; scene.add(ground)
    grid = new THREE.GridHelper(12, 24, '#1e293b', '#1e293b'); grid.position.y = 0.01; scene.add(grid)
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
