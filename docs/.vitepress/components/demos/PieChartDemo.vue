<template>
  <DemoContainer title="3D 饼图">
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
    camera.position.set(0, 5, 5)
    camera.lookAt(0, 0, 0)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    scene.add(new THREE.AmbientLight('#ffffff', 0.5))
    const dir = new THREE.DirectionalLight('#ffffff', 0.8)
    dir.position.set(3, 8, 5)
    scene.add(dir)

    const data = [
      { value: 335, color: '#00f5ff' },
      { value: 310, color: '#bf5af2' },
      { value: 234, color: '#ff375f' },
      { value: 135, color: '#30d158' },
      { value: 548, color: '#ffd60a' },
    ]
    const total = data.reduce((s, d) => s + d.value, 0)
    let startAngle = 0
    data.forEach((item) => {
      const angle = (item.value / total) * Math.PI * 2
      const shape = new THREE.Shape()
      const segments = Math.max(16, Math.floor(angle * 24))
      shape.moveTo(0, 0)
      for (let j = 0; j <= segments; j++) {
        const a = startAngle + (j / segments) * angle
        shape.lineTo(Math.cos(a) * 2, Math.sin(a) * 2)
      }
      shape.lineTo(0, 0)
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: false })
      geo.rotateX(-Math.PI / 2)
      const mat = new THREE.MeshPhysicalMaterial({
        color: item.color, metalness: 0.2, roughness: 0.5,
        emissive: item.color, emissiveIntensity: 0.1,
      })
      const mesh = new THREE.Mesh(geo, mat)
      const midAngle = startAngle + angle / 2
      mesh.position.x = Math.cos(midAngle) * 0.1
      mesh.position.z = -Math.sin(midAngle) * 0.1
      scene.add(mesh)
      startAngle += angle
    })

    const loop = () => {
      animId = requestAnimationFrame(loop)
      controls.update()
      scene.rotation.y += 0.003
      renderer.render(scene, camera)
    }
    loop()

    ro = new ResizeObserver(() => {
      if (!renderer || !camera) return
      const nw = container.clientWidth, nh = container.clientHeight
      if (nw && nh) {
        renderer.setSize(nw, nh); camera.aspect = nw / nh; camera.updateProjectionMatrix()
      }
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
