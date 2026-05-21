<template>
  <DemoContainer title="3D 折线图">
    <div ref="el" class="demo-3d"></div>
  </DemoContainer>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import DemoContainer from '../DemoContainer.vue'

const el = ref(null)
let renderer, scene, camera, controls, animId, ro

onMounted(async () => {
  await nextTick()
  const container = el.value
  if (!container) return
  const init = () => {
    const w = container.clientWidth || 600, h = container.clientHeight || 400
    scene = new THREE.Scene()
    scene.background = new THREE.Color('#0a0e1a')
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100)
    camera.position.set(5, 4, 7)
    camera.lookAt(0, 1, 0)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    scene.add(new THREE.AmbientLight('#ffffff', 0.4))
    const dir = new THREE.DirectionalLight('#ffffff', 0.8)
    dir.position.set(5, 10, 5)
    scene.add(dir)

    const series = [
      { data: [820, 932, 901, 934, 1290, 1330, 1520], color: '#00f5ff' },
      { data: [620, 732, 801, 734, 1090, 930, 1120], color: '#bf5af2' },
    ]
    const maxVal = Math.max(...series.flatMap(s => s.data))
    series.forEach((s, si) => {
      const points = s.data.map((v, i) => new THREE.Vector3(i * 1.2 - 3.6, (v / maxVal) * 3.5, si * 1.5))
      const curve = new THREE.CatmullRomCurve3(points)
      const cps = curve.getPoints(50)
      const geo = new THREE.BufferGeometry().setFromPoints(cps)
      scene.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: s.color })))
      points.forEach(p => {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 16, 16),
          new THREE.MeshPhysicalMaterial({ color: s.color, emissive: s.color, emissiveIntensity: 0.6 })
        )
        dot.position.copy(p)
        scene.add(dot)
      })
    })
    const grid = new THREE.GridHelper(10, 10, '#1e293b', '#1e293b')
    grid.position.y = -0.01
    scene.add(grid)

    const loop = () => { animId = requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera) }
    loop()
    ro = new ResizeObserver(() => {
      if (!renderer || !camera) return
      const nw = container.clientWidth, nh = container.clientHeight
      if (nw && nh) { renderer.setSize(nw, nh); camera.aspect = nw / nh; camera.updateProjectionMatrix() }
    })
    ro.observe(container)
  }
  if (container.clientWidth > 0) init()
  else requestAnimationFrame(init)
})
onUnmounted(() => { cancelAnimationFrame(animId); ro?.disconnect(); renderer?.dispose() })
</script>

<style scoped>
.demo-3d { width: 100%; height: 400px; }
</style>
