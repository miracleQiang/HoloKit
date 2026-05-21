<template>
  <DemoContainer title="3D 散点图">
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
    camera.position.set(5, 4, 6)
    camera.lookAt(0, 0, 0)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    scene.add(new THREE.AmbientLight('#ffffff', 0.4))
    const dir = new THREE.DirectionalLight('#ffffff', 0.7)
    dir.position.set(5, 8, 5)
    scene.add(dir)

    const colors = ['#00f5ff', '#bf5af2', '#ff375f']
    for (let g = 0; g < 3; g++) {
      for (let i = 0; i < 20; i++) {
        const x = (Math.random() - 0.5) * 4 + (g - 1) * 1.5
        const y = (Math.random() - 0.5) * 4
        const z = (Math.random() - 0.5) * 4
        const size = 0.06 + Math.random() * 0.1
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(size, 12, 12),
          new THREE.MeshPhysicalMaterial({ color: colors[g], emissive: colors[g], emissiveIntensity: 0.4 })
        )
        dot.position.set(x, y, z)
        scene.add(dot)
      }
    }
    const axisMat = new THREE.LineBasicMaterial({ color: '#334155', transparent: true, opacity: 0.5 })
    ;[[[-3,0,0],[3,0,0]], [[0,-3,0],[0,3,0]], [[0,0,-3],[0,0,3]]].forEach(([a, b]) => {
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]), axisMat))
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
