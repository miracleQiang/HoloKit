<template>
  <DemoContainer title="3D 漏斗图">
    <DemoToolbar @camera="switchCamera" @export="exportPng" @fullscreen="toggleFull" />
    <div ref="el" class="demo-3d"></div>
    <div class="demo-legend" :style="{ color: current.text }">
      <span class="legend-item" v-for="(name, i) in ['展示', '点击', '访问', '咨询', '成交']" :key="i"><span class="legend-dot" :style="{ background: current.colors[i] }"></span>{{ name }}</span>
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
let chartGroup: THREE.Group, ambient: THREE.AmbientLight, dirLight: THREE.DirectionalLight

const data = [8000, 5000, 3000, 1200, 800]

function buildFunnel() {
  while (chartGroup.children.length) {
    const c = chartGroup.children[0] as any
    chartGroup.remove(c); c.geometry?.dispose?.(); c.material?.dispose?.()
  }
  const t = current.value
  const max = data[0]
  const layerHeight = 0.7, gap = 0.05
  const total = data.length
  data.forEach((v, i) => {
    const ratio = v / max
    const radius = ratio * 2
    const geo = new THREE.CylinderGeometry(radius, radius * 0.85, layerHeight, 32)
    const color = t.colors[i % t.colors.length]
    const mat = new THREE.MeshPhysicalMaterial({
      color, metalness: t.metalness, roughness: t.roughness,
      emissive: color, emissiveIntensity: t.emissiveIntensity,
      transparent: t.opacity < 1, opacity: t.opacity,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.y = (total - i - 1) * (layerHeight + gap) - ((total - 1) * (layerHeight + gap)) / 2
    chartGroup.add(mesh)
  })
}

function applyTheme() {
  const t = current.value
  scene.background = new THREE.Color(t.background)
  ambient.color.set(t.ambient.color); ambient.intensity = t.ambient.intensity
  dirLight.color.set(t.directional.color); dirLight.intensity = t.directional.intensity
  buildFunnel()
}

onMounted(async () => {
  await nextTick()
  const c = el.value!; const init = () => {
    const w = c.clientWidth || 600, h = 400
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100); camera.position.set(0, 1, 7); camera.lookAt(0, 0, 0)
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
.demo-legend { display: flex; gap: 10px; margin-top: 8px; font-size: 12px; flex-wrap: wrap; }
.legend-item { display: inline-flex; align-items: center; gap: 4px; }
.legend-dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
.demo-3d { width: 100%; height: 400px; }
</style>
