<template>
  <DemoContainer title="3D 地球图">
    <div ref="el" class="demo-3d"></div>
  </DemoContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import DemoContainer from '../DemoContainer.vue'
import { useDemoTheme, AUTO_ROTATE_SPEED } from '../demo-theme'

const el = ref<HTMLDivElement | null>(null)
const { current } = useDemoTheme()
let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera
let controls: OrbitControls, animId: number | null = null, ro: ResizeObserver | null = null
let chartGroup: THREE.Group, ambient: THREE.AmbientLight, dirLight: THREE.DirectionalLight
let globe: THREE.Mesh, solid: THREE.Mesh

const cities = [
  { lat: 39.90, lng: 116.39, c: 0 },
  { lat: 31.23, lng: 121.47, c: 1 },
  { lat: 40.75, lng: -73.98, c: 2 },
  { lat: 51.50, lng: -0.12, c: 3 },
  { lat: 35.68, lng: 139.69, c: 4 },
  { lat: -33.86, lng: 151.20, c: 5 },
]

function buildMarkers() {
  while (globe.children.length) {
    const c = globe.children[0] as any
    globe.remove(c); c.geometry?.dispose?.(); c.material?.dispose?.()
  }
  const t = current.value
  const radius = 2
  cities.forEach(city => {
    const phi = (90 - city.lat) * (Math.PI / 180)
    const theta = (city.lng + 180) * (Math.PI / 180)
    const pos = new THREE.Vector3(
      -(radius * 1.02) * Math.sin(phi) * Math.cos(theta),
      (radius * 1.02) * Math.cos(phi),
      (radius * 1.02) * Math.sin(phi) * Math.sin(theta)
    )
    const color = t.colors[city.c % t.colors.length]
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 16),
      new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: t.emissiveIntensity * 2 })
    )
    dot.position.copy(pos); globe.add(dot)
  })
}

function applyTheme() {
  const t = current.value
  scene.background = new THREE.Color(t.background)
  ambient.color.set(t.ambient.color); ambient.intensity = t.ambient.intensity
  dirLight.color.set(t.directional.color); dirLight.intensity = t.directional.intensity
  ;(globe.material as THREE.MeshStandardMaterial).color.set(t.colors[0])
  ;(globe.material as THREE.MeshStandardMaterial).opacity = t.opacity * 0.4
  ;(solid.material as THREE.MeshStandardMaterial).color.set(t.background)
  buildMarkers()
}

onMounted(async () => {
  await nextTick()
  const c = el.value!; const init = () => {
    const w = c.clientWidth || 600, h = 400
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100); camera.position.set(0, 0, 5)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    c.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true
    ambient = new THREE.AmbientLight('#fff', 0.3); scene.add(ambient)
    dirLight = new THREE.DirectionalLight('#fff', 0.8); dirLight.position.set(5, 3, 5); scene.add(dirLight)
    chartGroup = new THREE.Group(); scene.add(chartGroup)
    const radius = 2
    globe = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 64, 64),
      new THREE.MeshStandardMaterial({ color: '#00f5ff', wireframe: true, transparent: true, opacity: 0.3 })
    )
    chartGroup.add(globe)
    solid = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.98, 64, 64),
      new THREE.MeshStandardMaterial({ color: '#0a1929' })
    )
    chartGroup.add(solid)
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

<style scoped>.demo-3d { width: 100%; height: 400px; }</style>
