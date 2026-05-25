<template>
  <DemoContainer title="3D 雷达图">
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
let chartGroup: THREE.Group, ambient: THREE.AmbientLight

const seriesData = [
  [90, 60, 85, 70, 95, 78],
  [70, 90, 55, 95, 60, 82],
]

function buildRadar() {
  while (chartGroup.children.length) {
    const c = chartGroup.children[0] as any
    chartGroup.remove(c); c.geometry?.dispose?.(); c.material?.dispose?.()
  }
  const t = current.value
  const axes = 6, radius = 2.5
  const gridMat = new THREE.LineBasicMaterial({ color: t.grid, transparent: true, opacity: 0.6 })

  for (let i = 0; i < axes; i++) {
    const a = (i / axes) * Math.PI * 2 - Math.PI / 2
    const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius)]
    chartGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat))
  }
  for (let ring = 1; ring <= 4; ring++) {
    const r = (ring / 4) * radius
    const ringPts: THREE.Vector3[] = []
    for (let i = 0; i <= 64; i++) ringPts.push(new THREE.Vector3(Math.cos((i / 64) * Math.PI * 2) * r, 0, Math.sin((i / 64) * Math.PI * 2) * r))
    chartGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPts), gridMat))
  }

  seriesData.forEach((s, si) => {
    const color = t.colors[si]
    const points = s.map((v, i) => {
      const a = (i / axes) * Math.PI * 2 - Math.PI / 2
      const r = (v / 100) * radius
      return new THREE.Vector3(Math.cos(a) * r, 0.05 + 0.02 * si, Math.sin(a) * r)
    })
    points.push(points[0].clone())
    chartGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color })))
    const shape = new THREE.Shape()
    shape.moveTo(points[0].x, points[0].z)
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i].x, points[i].z)
    const geo = new THREE.ShapeGeometry(shape)
    geo.rotateX(-Math.PI / 2); geo.translate(0, 0.05 + 0.02 * si, 0)
    chartGroup.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.18, side: THREE.DoubleSide,
    })))
  })
}

function applyTheme() {
  const t = current.value
  scene.background = new THREE.Color(t.background)
  ambient.color.set(t.ambient.color); ambient.intensity = t.ambient.intensity
  buildRadar()
}

onMounted(async () => {
  await nextTick()
  const c = el.value!; const init = () => {
    const w = c.clientWidth || 600, h = 400
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100); camera.position.set(0, 4, 5); camera.lookAt(0, 0, 0)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    c.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true
    ambient = new THREE.AmbientLight('#fff', 0.5); scene.add(ambient)
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
