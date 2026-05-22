<template>
  <DemoContainer title="3D 翻转卡片表">
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

const ROWS = 4, COLS = 4

function buildTable() {
  while (chartGroup.children.length) {
    const c = chartGroup.children[0] as any
    chartGroup.remove(c); c.geometry?.dispose?.(); c.material?.dispose?.()
  }
  const t = current.value
  const cardW = 1.5, cardH = 1, gap = 0.2
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const geo = new THREE.BoxGeometry(cardW, cardH, 0.05)
      const color = t.colors[c % t.colors.length]
      const mat = new THREE.MeshPhysicalMaterial({
        color, metalness: t.metalness, roughness: t.roughness,
        emissive: color, emissiveIntensity: t.emissiveIntensity,
        transparent: t.opacity < 1, opacity: t.opacity,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(
        (c - COLS / 2 + 0.5) * (cardW + gap),
        -(r - ROWS / 2 + 0.5) * (cardH + gap),
        0
      )
      mesh.rotation.y = Math.sin((r * COLS + c) * 0.5) * 0.4
      chartGroup.add(mesh)
    }
  }
}

function applyTheme() {
  const t = current.value
  scene.background = new THREE.Color(t.background)
  ambient.color.set(t.ambient.color); ambient.intensity = t.ambient.intensity
  dirLight.color.set(t.directional.color); dirLight.intensity = t.directional.intensity
  buildTable()
}

onMounted(async () => {
  await nextTick()
  const c = el.value!; const init = () => {
    const w = c.clientWidth || 600, h = 400
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100); camera.position.set(0, 3, 8); camera.lookAt(0, 0, 0)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    c.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true
    ambient = new THREE.AmbientLight('#fff', 0.4); scene.add(ambient)
    dirLight = new THREE.DirectionalLight('#fff', 0.8); dirLight.position.set(5, 10, 5); scene.add(dirLight)
    chartGroup = new THREE.Group(); scene.add(chartGroup)
    applyTheme()
    const startTime = performance.now()
    const loop = () => {
      animId = requestAnimationFrame(loop)
      if (chartGroup) chartGroup.rotation.y += AUTO_ROTATE_SPEED; const elapsed = (performance.now() - startTime) / 1000
      chartGroup.children.forEach((child, i) => {
        child.rotation.y = Math.sin(elapsed * 0.6 + i * 0.4) * 0.5
      })
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
