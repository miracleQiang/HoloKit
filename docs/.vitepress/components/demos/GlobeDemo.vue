<template>
  <DemoContainer title="3D 地球图">
    <div ref="el" class="demo-3d"></div>
  </DemoContainer>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import DemoContainer from '../DemoContainer.vue'

const el = ref(null)
let renderer, scene, camera, controls, animId, ro, globe, solid

onMounted(async () => {
  await nextTick()
  const container = el.value
  if (!container) return
  const init = () => {
    const w = container.clientWidth || 600, h = container.clientHeight || 400
    scene = new THREE.Scene()
    scene.background = new THREE.Color('#0a0e1a')
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100)
    camera.position.set(0, 0, 5)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    scene.add(new THREE.AmbientLight('#ffffff', 0.3))
    const dir = new THREE.DirectionalLight('#ffffff', 0.8)
    dir.position.set(5, 3, 5)
    scene.add(dir)

    const radius = 2
    globe = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 64, 64),
      new THREE.MeshStandardMaterial({ color: '#00f5ff', wireframe: true, transparent: true, opacity: 0.3 })
    )
    scene.add(globe)
    solid = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.98, 64, 64),
      new THREE.MeshStandardMaterial({ color: '#0a1929' })
    )
    scene.add(solid)

    const cities = [
      { lat: 39.90, lng: 116.39, color: '#00f5ff', size: 0.06 },
      { lat: 31.23, lng: 121.47, color: '#bf5af2', size: 0.05 },
      { lat: 40.75, lng: -73.98, color: '#ff375f', size: 0.06 },
      { lat: 51.50, lng: -0.12, color: '#30d158', size: 0.05 },
      { lat: 35.68, lng: 139.69, color: '#ffd60a', size: 0.06 },
      { lat: -33.86, lng: 151.20, color: '#64d2ff', size: 0.04 },
    ]
    cities.forEach(c => {
      const phi = (90 - c.lat) * (Math.PI / 180)
      const theta = (c.lng + 180) * (Math.PI / 180)
      const pos = new THREE.Vector3(
        -(radius * 1.02) * Math.sin(phi) * Math.cos(theta),
        (radius * 1.02) * Math.cos(phi),
        (radius * 1.02) * Math.sin(phi) * Math.sin(theta)
      )
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(c.size, 16, 16),
        new THREE.MeshPhysicalMaterial({ color: c.color, emissive: c.color, emissiveIntensity: 0.9 })
      )
      dot.position.copy(pos)
      globe.add(dot)
      solid.add(dot.clone())
    })

    const loop = () => {
      animId = requestAnimationFrame(loop)
      globe.rotation.y += 0.003
      solid.rotation.y += 0.003
      controls.update()
      renderer.render(scene, camera)
    }
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
