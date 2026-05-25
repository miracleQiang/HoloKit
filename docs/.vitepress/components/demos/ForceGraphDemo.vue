<template>
  <DemoContainer title="3D 关系图">
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

interface Node { id: string; g: number; pos: THREE.Vector3 }
const nodes: Node[] = []
const links: Array<[string, string]> = []
const groups = ['core', 'dev', 'design', 'ops']
;['alice', 'bob', 'carol', 'dave', 'eve', 'frank', 'grace', 'henry', 'ivy'].forEach((id, i) => {
  nodes.push({
    id, g: i % groups.length,
    pos: new THREE.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5),
  })
})
links.push(['alice', 'bob'], ['alice', 'carol'], ['bob', 'dave'], ['carol', 'dave'],
  ['eve', 'alice'], ['frank', 'eve'], ['grace', 'henry'], ['ivy', 'grace'], ['henry', 'bob'])

function buildGraph() {
  while (chartGroup.children.length) {
    const c = chartGroup.children[0] as any
    chartGroup.remove(c); c.geometry?.dispose?.(); c.material?.dispose?.()
  }
  const t = current.value
  nodes.forEach(n => {
    const color = t.colors[n.g]
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      new THREE.MeshPhysicalMaterial({
        color, metalness: t.metalness, roughness: t.roughness,
        emissive: color, emissiveIntensity: t.emissiveIntensity * 1.5,
        transparent: t.opacity < 1, opacity: t.opacity,
      })
    )
    mesh.position.copy(n.pos)
    chartGroup.add(mesh)
  })
  const linkMat = new THREE.LineBasicMaterial({ color: t.grid, transparent: true, opacity: 0.6 })
  links.forEach(([a, b]) => {
    const na = nodes.find(n => n.id === a)!, nb = nodes.find(n => n.id === b)!
    chartGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([na.pos, nb.pos]), linkMat))
  })
}

function applyTheme() {
  const t = current.value
  scene.background = new THREE.Color(t.background)
  ambient.color.set(t.ambient.color); ambient.intensity = t.ambient.intensity
  buildGraph()
}

onMounted(async () => {
  await nextTick()
  const c = el.value!; const init = () => {
    const w = c.clientWidth || 600, h = 400
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100); camera.position.set(6, 6, 6); camera.lookAt(0, 0, 0)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    c.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true
    ambient = new THREE.AmbientLight('#fff', 0.5); scene.add(ambient)
    const dir = new THREE.DirectionalLight('#fff', 0.6); dir.position.set(5, 8, 5); scene.add(dir)
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
