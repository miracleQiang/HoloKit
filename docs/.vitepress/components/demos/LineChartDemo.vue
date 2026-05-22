<template>
  <DemoContainer title="3D 折线图">
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

const series = [
  [820, 932, 901, 934, 1290, 1330, 1520],
  [620, 732, 801, 734, 1090, 930, 1120],
]

function buildLines() {
  while (chartGroup.children.length) {
    const c = chartGroup.children[0] as any
    chartGroup.remove(c); c.geometry?.dispose?.(); c.material?.dispose?.()
  }
  const t = current.value
  const maxVal = Math.max(...series.flat())
  series.forEach((s, si) => {
    const points = s.map((v, i) => new THREE.Vector3(i * 1.2 - 3.6, (v / maxVal) * 3.5, si * 1.5))
    const curve = new THREE.CatmullRomCurve3(points)
    const cps = curve.getPoints(50)
    const color = t.colors[si]
    chartGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(cps), new THREE.LineBasicMaterial({ color })))
    points.forEach(p => {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 16, 16),
        new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: t.emissiveIntensity * 1.5 })
      )
      dot.position.copy(p); chartGroup.add(dot)
    })
  })
}

function applyTheme() {
  const t = current.value
  scene.background = new THREE.Color(t.background)
  ambient.color.set(t.ambient.color); ambient.intensity = t.ambient.intensity
  dirLight.color.set(t.directional.color); dirLight.intensity = t.directional.intensity
  buildLines()
}

onMounted(async () => {
  await nextTick()
  const c = el.value!; const init = () => {
    const w = c.clientWidth || 600, h = 400
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100); camera.position.set(5, 4, 7); camera.lookAt(0, 1, 0)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    c.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true
    ambient = new THREE.AmbientLight('#fff', 0.4); scene.add(ambient)
    dirLight = new THREE.DirectionalLight('#fff', 0.8); dirLight.position.set(5, 10, 5); scene.add(dirLight)
    chartGroup = new THREE.Group(); scene.add(chartGroup)
    const grid = new THREE.GridHelper(10, 10, '#1e293b', '#1e293b'); grid.position.y = -0.01; scene.add(grid)
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
