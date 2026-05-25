<template>
  <DemoContainer title="3D 曲面图">
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

const SIZE = 30
const heights: number[] = []
for (let r = 0; r < SIZE; r++) {
  for (let c = 0; c < SIZE; c++) {
    const x = (c / (SIZE - 1) - 0.5) * 6
    const z = (r / (SIZE - 1) - 0.5) * 6
    heights.push(Math.sin(x) * Math.cos(z) * 0.8)
  }
}

function buildSurface() {
  while (chartGroup.children.length) {
    const c = chartGroup.children[0] as any
    chartGroup.remove(c); c.geometry?.dispose?.(); c.material?.dispose?.()
  }
  const t = current.value
  const geometry = new THREE.PlaneGeometry(6, 6, SIZE - 1, SIZE - 1)
  const positions = geometry.attributes.position
  let yMin = Infinity, yMax = -Infinity
  for (let i = 0; i < heights.length; i++) {
    if (heights[i] < yMin) yMin = heights[i]
    if (heights[i] > yMax) yMax = heights[i]
    positions.setZ(i, heights[i])
  }
  geometry.rotateX(-Math.PI / 2)
  geometry.computeVertexNormals()

  const palette = t.colors.slice(0, 5).map(c => new THREE.Color(c))
  const colorAttr = new Float32Array(positions.count * 3)
  for (let i = 0; i < positions.count; i++) {
    const tt = (positions.getY(i) - yMin) / (yMax - yMin || 1)
    const idx = Math.min(palette.length - 1, Math.floor(tt * (palette.length - 1)))
    colorAttr[i * 3] = palette[idx].r; colorAttr[i * 3 + 1] = palette[idx].g; colorAttr[i * 3 + 2] = palette[idx].b
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colorAttr, 3))

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true, side: THREE.DoubleSide,
    metalness: t.metalness, roughness: t.roughness,
    transparent: t.opacity < 1, opacity: t.opacity,
  })
  chartGroup.add(new THREE.Mesh(geometry, mat))
}

function applyTheme() {
  const t = current.value
  scene.background = new THREE.Color(t.background)
  ambient.color.set(t.ambient.color); ambient.intensity = t.ambient.intensity
  dirLight.color.set(t.directional.color); dirLight.intensity = t.directional.intensity
  buildSurface()
}

onMounted(async () => {
  await nextTick()
  const c = el.value!; const init = () => {
    const w = c.clientWidth || 600, h = 400
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100); camera.position.set(5, 5, 5); camera.lookAt(0, 0, 0)
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
