<template>
  <DemoContainer title="3D 饼图">
    <DemoToolbar @camera="switchCamera" @export="exportPng" @fullscreen="toggleFull" />
    <div ref="el" class="demo-3d"></div>
    <div class="demo-legend" :style="{ color: current.text }">
      <span class="legend-item" v-for="(name, i) in ['直接访问', '邮件营销', '联盟广告', '搜索引擎', '视频广告']" :key="i"><span class="legend-dot" :style="{ background: current.colors[i] }"></span>{{ name }}</span>
    </div>
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
let chartGroup: THREE.Group, ambient: THREE.AmbientLight, dirLight: THREE.DirectionalLight

const data = [335, 310, 234, 135, 548]
const labels = ['直接访问', '邮件营销', '联盟广告', '搜索引擎', '视频广告']
const total = data.reduce((s, v) => s + v, 0)

function makeTextSprite(text: string, color: string, opts: { fontSize?: number; worldHeight?: number } = {}) {
  const fs = opts.fontSize ?? 48
  const ww = opts.worldHeight ?? 0.25
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const fontSpec = `500 ${fs}px sans-serif`
  ctx.font = fontSpec
  const padding = 12
  const cssW = Math.ceil(ctx.measureText(text).width + padding * 2)
  const cssH = Math.ceil(fs + padding * 2)
  canvas.width = cssW * dpr; canvas.height = cssH * dpr
  ctx.scale(dpr, dpr); ctx.font = fontSpec; ctx.textBaseline = 'middle'
  ctx.fillStyle = color; ctx.fillText(text, padding, cssH / 2)
  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(ww * (cssW / cssH), ww, 1)
  return sprite
}

function buildPie() {
  while (chartGroup.children.length) {
    const c = chartGroup.children[0] as any
    chartGroup.remove(c); c.geometry?.dispose?.(); c.material?.dispose?.()
  }
  const t = current.value
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

    // 数据标签：名称 + 数值 + 占比（放在图形上）
    const pct = ((value / total) * 100).toFixed(1)
    const labelR = 1.3
    const lx = Math.cos(mid) * labelR
    const lz = -Math.sin(mid) * labelR
    const lbl = makeTextSprite(`${labels[i]} ${pct}%`, '#ffffff', { fontSize: 36, worldHeight: 0.2 })
    lbl.position.set(lx, 0.35, lz)
    chartGroup.add(lbl)

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

<style scoped>
.demo-legend { display: flex; gap: 10px; margin-top: 8px; font-size: 12px; flex-wrap: wrap; }
.legend-item { display: inline-flex; align-items: center; gap: 4px; }
.legend-dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
.demo-3d { width: 100%; height: 400px; }
</style>
