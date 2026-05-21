<template>
  <DemoContainer title="3D 柱状图">
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

  const initRender = () => {
    const w = container.clientWidth || 600
    const h = container.clientHeight || 400

    scene = new THREE.Scene()
    scene.background = new THREE.Color('#0a0e1a')

    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100)
    camera.position.set(6, 5, 8)
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

    const data = [
      { value: 120, color: '#00f5ff' },
      { value: 200, color: '#bf5af2' },
      { value: 150, color: '#ff375f' },
      { value: 280, color: '#30d158' },
      { value: 220, color: '#ffd60a' },
      { value: 310, color: '#64d2ff' },
    ]
    const maxVal = Math.max(...data.map(d => d.value))

    data.forEach((item, i) => {
      const barH = (item.value / maxVal) * 4
      const geo = new THREE.BoxGeometry(0.7, barH, 0.7)
      const mat = new THREE.MeshPhysicalMaterial({
        color: item.color,
        metalness: 0.3,
        roughness: 0.4,
        emissive: item.color,
        emissiveIntensity: 0.15,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(i * 1.2 - 3, barH / 2, 0)
      mesh.scale.y = 0.001
      scene.add(mesh)

      const start = performance.now() + i * 80
      const tick = () => {
        const t = Math.min(Math.max((performance.now() - start) / 600, 0), 1)
        mesh.scale.y = Math.max(0.001, 1 - Math.pow(1 - t, 3))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })

    const grid = new THREE.GridHelper(10, 10, '#1e293b', '#1e293b')
    grid.position.y = -0.01
    scene.add(grid)

    const loop = () => {
      animId = requestAnimationFrame(loop)
      controls.update()
      renderer.render(scene, camera)
    }
    loop()

    ro = new ResizeObserver(() => {
      if (!renderer || !camera) return
      const nw = container.clientWidth, nh = container.clientHeight
      if (nw && nh) {
        renderer.setSize(nw, nh)
        camera.aspect = nw / nh
        camera.updateProjectionMatrix()
      }
    })
    ro.observe(container)
  }

  if (container.clientWidth > 0) initRender()
  else requestAnimationFrame(initRender)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  ro?.disconnect()
  renderer?.dispose()
})
</script>

<style scoped>
.demo-3d { width: 100%; height: 400px; }
</style>
