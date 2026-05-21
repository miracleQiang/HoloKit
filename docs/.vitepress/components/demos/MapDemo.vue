<template>
  <DemoContainer title="3D 地图 - 飞线动画">
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
    camera.position.set(0, 7, 6)
    camera.lookAt(0, 0, 0)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    scene.add(new THREE.AmbientLight('#ffffff', 0.4))
    const dir = new THREE.DirectionalLight('#ffffff', 0.6)
    dir.position.set(5, 8, 5)
    scene.add(dir)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 8),
      new THREE.MeshStandardMaterial({ color: '#0f172a' })
    )
    ground.rotation.x = -Math.PI / 2
    scene.add(ground)
    const grid = new THREE.GridHelper(12, 24, '#1e293b', '#1e293b')
    grid.position.y = 0.01
    scene.add(grid)

    const cities = [
      { x: 0, z: 0, color: '#ff375f' },
      { x: 2.5, z: 1.5, color: '#00f5ff' },
      { x: 1.5, z: 3, color: '#30d158' },
      { x: -2, z: 1, color: '#ffd60a' },
      { x: -3, z: -1, color: '#bf5af2' },
      { x: 3, z: -1, color: '#64d2ff' },
    ]
    cities.forEach(c => {
      const dot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.4, 16),
        new THREE.MeshPhysicalMaterial({ color: c.color, emissive: c.color, emissiveIntensity: 0.7 })
      )
      dot.position.set(c.x, 0.2, c.z)
      scene.add(dot)
    })

    const beijing = cities[0]
    cities.slice(1).forEach(target => {
      const from = new THREE.Vector3(beijing.x, 0.2, beijing.z)
      const to = new THREE.Vector3(target.x, 0.2, target.z)
      const mid = new THREE.Vector3().lerpVectors(from, to, 0.5)
      mid.y = 1.5 + Math.random() * 0.5
      const curve = new THREE.QuadraticBezierCurve3(from, mid, to)
      const pts = curve.getPoints(50)
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      scene.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: target.color, transparent: true, opacity: 0.8 })))
    })

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
