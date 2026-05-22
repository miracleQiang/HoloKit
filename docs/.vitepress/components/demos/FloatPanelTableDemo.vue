<template>
  <DemoContainer title="3D 悬浮面板表">
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

const ROWS = 5, COLS = 4

function buildPanel() {
  while (chartGroup.children.length) {
    const c = chartGroup.children[0] as any
    chartGroup.remove(c); c.geometry?.dispose?.(); c.material?.dispose?.()
  }
  const t = current.value
  const panelW = 7, rowH = 0.6
  const totalH = (ROWS + 1) * rowH

  const bgGeo = new THREE.PlaneGeometry(panelW, totalH)
  const bgMat = new THREE.MeshStandardMaterial({
    color: t.background, transparent: true, opacity: 0.7, side: THREE.DoubleSide,
  })
  chartGroup.add(new THREE.Mesh(bgGeo, bgMat))

  for (let r = 0; r < ROWS; r++) {
    const y = totalH / 2 - (r + 1.5) * rowH
    const depth = 0.05 + r * 0.1
    for (let c = 0; c < COLS; c++) {
      const cellGeo = new THREE.PlaneGeometry((panelW / COLS) * 0.9, rowH * 0.8)
      const color = t.colors[c % t.colors.length]
      const cellMat = new THREE.MeshPhysicalMaterial({
        color, metalness: t.metalness, roughness: t.roughness,
        emissive: color, emissiveIntensity: t.emissiveIntensity,
        transparent: true, opacity: t.opacity * 0.9, side: THREE.DoubleSide,
      })
      const cell = new THREE.Mesh(cellGeo, cellMat)
      cell.position.set((c - COLS / 2 + 0.5) * (panelW / COLS), y, depth)
      chartGroup.add(cell)
    }
  }
}

function applyTheme() {
  const t = current.value
  scene.background = new THREE.Color(t.background)
  ambient.color.set(t.ambient.color); ambient.intensity = t.ambient.intensity
  dirLight.color.set(t.directional.color); dirLight.intensity = t.directional.intensity
  buildPanel()
}

onMounted(async () => {
  await nextTick()
  const c = el.value!; const init = () => {
    const w = c.clientWidth || 600, h = 400
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100); camera.position.set(0, 1, 6); camera.lookAt(0, 0, 0)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    c.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true
    ambient = new THREE.AmbientLight('#fff', 0.5); scene.add(ambient)
    dirLight = new THREE.DirectionalLight('#fff', 0.6); dirLight.position.set(5, 8, 5); scene.add(dirLight)
    chartGroup = new THREE.Group(); scene.add(chartGroup)
    applyTheme()
    const startTime = performance.now()
    const loop = () => {
      animId = requestAnimationFrame(loop)
      const elapsed = (performance.now() - startTime) / 1000
      chartGroup.position.y = Math.sin(elapsed * 0.8) * 0.05
      chartGroup.rotation.y += AUTO_ROTATE_SPEED
      controls.update(); renderer.render(scene, camera)
    }; loop()
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
