<template>
  <DemoContainer title="3D 饼图">
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

const data = [335, 310, 234, 135, 548]

function buildPie() {
  while (chartGroup.children.length) {
    const c = chartGroup.children[0] as any
    chartGroup.remove(c); c.geometry?.dispose?.(); c.material?.dispose?.()
  }
  const t = current.value
  const total = data.reduce((s, v) => s + v, 0)
  let startAngle = 0
  data.forEach((value, i) => {
    const angle = (value / total) * Math.PI * 2
    const shape = new THREE.Shape()
    const segs = Math.max(16, Math.floor(angle * 24))
    shape.moveTo(0, 0)
    for (let j = 0; j <= segs; j++) {
      const a = startAngle + (j / segs) * angle
      shape.lineTo(Math.cos(a) * 2, Math.sin(a) * 2)
    }
    shape.lineTo(0, 0)
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: false })
    geo.rotateX(-Math.PI / 2)
    const color = t.colors[i % t.colors.length]
    const mat = new THREE.MeshPhysicalMaterial({
      color, metalness: t.metalness, roughness: t.roughness,
      emissive: color, emissiveIntensity: t.emissiveIntensity,
      transparent: t.opacity < 1, opacity: t.opacity,
    })
    const mesh = new THREE.Mesh(geo, mat)
    const mid = startAngle + angle / 2
    mesh.position.x = Math.cos(mid) * 0.1; mesh.position.z = -Math.sin(mid) * 0.1
    chartGroup.add(mesh)
    startAngle += angle
  })
}

function applyTheme() {
  const t = current.value
  scene.background = new THREE.Color(t.background)
  ambient.color.set(t.ambient.color); ambient.intensity = t.ambient.intensity
  dirLight.color.set(t.directional.color); dirLight.intensity = t.directional.intensity
  buildPie()
}

onMounted(async () => {
  await nextTick()
  const c = el.value!; const init = () => {
    const w = c.clientWidth || 600, h = 400
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100); camera.position.set(0, 5, 5); camera.lookAt(0, 0, 0)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    c.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true
    ambient = new THREE.AmbientLight('#fff', 0.5); scene.add(ambient)
    dirLight = new THREE.DirectionalLight('#fff', 0.8); dirLight.position.set(3, 8, 5); scene.add(dirLight)
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

<style scoped>.demo-3d { width: 100%; height: 400px; }</style>
