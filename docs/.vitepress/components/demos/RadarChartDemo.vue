<template>
  <DemoContainer title="3D 雷达图">
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
    camera.position.set(0, 4, 5)
    camera.lookAt(0, 0, 0)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    scene.add(new THREE.AmbientLight('#ffffff', 0.5))

    const axes = 6, radius = 2.5
    const gridMat = new THREE.LineBasicMaterial({ color: '#334155', transparent: true, opacity: 0.6 })
    for (let i = 0; i < axes; i++) {
      const a = (i / axes) * Math.PI * 2 - Math.PI / 2
      const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius)]
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat))
    }
    for (let ring = 1; ring <= 4; ring++) {
      const r = (ring / 4) * radius
      const ringPts = []
      for (let i = 0; i <= 64; i++) ringPts.push(new THREE.Vector3(Math.cos((i / 64) * Math.PI * 2) * r, 0, Math.sin((i / 64) * Math.PI * 2) * r))
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPts), gridMat))
    }

    const series = [
      { data: [90, 60, 85, 70, 95, 78], color: '#00f5ff' },
      { data: [70, 90, 55, 95, 60, 82], color: '#bf5af2' },
    ]
    series.forEach((s, si) => {
      const points = s.data.map((v, i) => {
        const a = (i / axes) * Math.PI * 2 - Math.PI / 2
        const r = (v / 100) * radius
        return new THREE.Vector3(Math.cos(a) * r, 0.05 + 0.02 * si, Math.sin(a) * r)
      })
      points.push(points[0].clone())
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: s.color })))
      const shape = new THREE.Shape()
      shape.moveTo(points[0].x, points[0].z)
      for (let i = 1; i < points.length; i++) shape.lineTo(points[i].x, points[i].z)
      const geo = new THREE.ShapeGeometry(shape)
      geo.rotateX(-Math.PI / 2)
      geo.translate(0, 0.05 + 0.02 * si, 0)
      scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0.18, side: THREE.DoubleSide })))
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
