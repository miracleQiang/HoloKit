<template>
  <DemoContainer title="3D 柱状图">
    <DemoToolbar @camera="switchCamera" @export="exportPng" @fullscreen="toggleFull" />
    <div ref="el" class="demo-3d"></div>
    <div class="demo-legend" :style="{ color: current.text }">
      <span class="legend-item"><span class="legend-dot" :style="{ background: current.colors[0] }"></span>销售额</span>
      <span class="legend-item legend-mark"><span class="legend-line"></span>均值线</span>
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

const el = ref<HTMLDivElement | null>(null)
const { current } = useDemoTheme()
let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera
let controls: OrbitControls, animId: number | null = null, ro: ResizeObserver | null = null
let chartGroup: THREE.Group, ambient: THREE.AmbientLight, dirLight: THREE.DirectionalLight

const cameraPresets: Record<string, [number, number, number]> = {
  default: [6, 5, 8],
  top: [0, 12, 0.01],
  front: [0, 3, 12],
}

function switchCamera(preset: string) {
  const pos = cameraPresets[preset] || cameraPresets.default
  camera.position.set(...pos)
  camera.lookAt(0, 1, 0)
  controls?.update()
}

function exportPng() {
  if (!renderer) return
  renderer.render(scene, camera)
  const url = renderer.domElement.toDataURL('image/png')
  const a = document.createElement('a')
  a.download = 'chart.png'; a.href = url; a.click()
}

function toggleFull() {
  if (!el.value) return
  if (!document.fullscreenElement) el.value.requestFullscreen?.()
  else document.exitFullscreen?.()
}

const data = [
  { label: '1月', value: 120 },
  { label: '2月', value: 200 },
  { label: '3月', value: 150 },
  { label: '4月', value: 280 },
  { label: '5月', value: 220 },
  { label: '6月', value: 310 },
]
const xAxisTitle = '月份'
const yAxisTitle = '销售额'
const unit = '万'

function makeTextSprite(text: string, color: string, opts: { fontSize?: number; worldHeight?: number; bold?: boolean } = {}) {
  const fs = opts.fontSize ?? 56
  const ww = opts.worldHeight ?? 0.3
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const fontSpec = `${opts.bold ? 600 : 500} ${fs}px -apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif`
  ctx.font = fontSpec
  const padding = 12
  const cssW = Math.ceil(ctx.measureText(text).width + padding * 2)
  const cssH = Math.ceil(fs + padding * 2)
  canvas.width = cssW * dpr
  canvas.height = cssH * dpr
  ctx.scale(dpr, dpr)
  ctx.font = fontSpec
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText(text, padding, cssH / 2)
  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(ww * (cssW / cssH), ww, 1)
  return sprite
}

function buildBars() {
  while (chartGroup.children.length) {
    const c = chartGroup.children[0] as any
    chartGroup.remove(c); c.geometry?.dispose?.()
    if (c.material) {
      const m = c.material as any
      m.map?.dispose?.(); m.dispose?.()
    }
  }
  const t = current.value
  const maxVal = Math.max(...data.map(d => d.value))
  const barW = 0.6, gap = 0.3
  const totalWidth = data.length * (barW + gap) - gap
  const startX = -totalWidth / 2
  const chartH = 4
  const ticks = 4
  const labelColor = t.text

  data.forEach((item, i) => {
    const h = (item.value / maxVal) * chartH
    const geo = new THREE.BoxGeometry(barW, h, barW)
    geo.translate(0, h / 2, 0)
    const color = t.colors[i % t.colors.length]
    const mat = new THREE.MeshPhysicalMaterial({
      color, metalness: t.metalness, roughness: t.roughness,
      emissive: color, emissiveIntensity: t.emissiveIntensity,
      transparent: t.opacity < 1, opacity: t.opacity,
    })
    const mesh = new THREE.Mesh(geo, mat)
    const cx = startX + i * (barW + gap) + barW / 2
    mesh.position.set(cx, 0, 0)
    chartGroup.add(mesh)
    // 顶部数值标签
    const valLabel = makeTextSprite(`${item.value}${unit}`, labelColor, { fontSize: 56, worldHeight: 0.3 })
    valLabel.position.set(cx, h + 0.3, 0)
    chartGroup.add(valLabel)
    // X 轴类别标签
    const catLabel = makeTextSprite(item.label, labelColor, { fontSize: 48, worldHeight: 0.28 })
    catLabel.position.set(cx, -0.25, barW / 2 + 0.05)
    chartGroup.add(catLabel)
  })

  // 网格线 + Y 轴刻度
  const halfW = totalWidth / 2 + 0.3
  const gridMat = new THREE.LineBasicMaterial({ color: t.grid, transparent: true, opacity: 0.5 })
  for (let i = 0; i <= ticks; i++) {
    const y = (i / ticks) * chartH
    chartGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-halfW, y, 0), new THREE.Vector3(halfW, y, 0)]),
      gridMat
    ))
    const tick = makeTextSprite(`${Math.round((i / ticks) * maxVal)}${unit}`, labelColor, { fontSize: 44, worldHeight: 0.25 })
    tick.position.set(-halfW - 0.4, y, 0)
    chartGroup.add(tick)
  }
  // Y 轴线
  chartGroup.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-halfW, 0, 0), new THREE.Vector3(-halfW, chartH, 0)]),
    gridMat
  ))
  // 轴标题
  const xTitle = makeTextSprite(xAxisTitle, labelColor, { fontSize: 60, worldHeight: 0.34, bold: true })
  xTitle.position.set(0, -0.75, 0)
  chartGroup.add(xTitle)
  const yTitle = makeTextSprite(yAxisTitle, labelColor, { fontSize: 60, worldHeight: 0.34, bold: true })
  yTitle.position.set(-halfW - 1.2, chartH / 2, 0)
  chartGroup.add(yTitle)

  // markLine 均值线
  const avg = data.reduce((s, d) => s + d.value, 0) / data.length
  const avgY = (avg / maxVal) * chartH
  const dashMat = new THREE.LineDashedMaterial({ color: '#f59e0b', dashSize: 0.1, gapSize: 0.05 })
  const mlPts = [new THREE.Vector3(-halfW, avgY, 0), new THREE.Vector3(halfW, avgY, 0)]
  const mlGeo = new THREE.BufferGeometry().setFromPoints(mlPts)
  const mlLine = new THREE.Line(mlGeo, dashMat)
  mlLine.computeLineDistances()
  chartGroup.add(mlLine)
  const avgLabel = makeTextSprite(`均值 ${Math.round(avg)}${unit}`, '#f59e0b', { fontSize: 44, worldHeight: 0.25 })
  avgLabel.position.set(halfW + 0.3, avgY, 0)
  chartGroup.add(avgLabel)
}

function applyTheme() {
  const t = current.value
  scene.background = new THREE.Color(t.background)
  ambient.color.set(t.ambient.color); ambient.intensity = t.ambient.intensity
  dirLight.color.set(t.directional.color); dirLight.intensity = t.directional.intensity
  buildBars()
}

onMounted(async () => {
  await nextTick()
  const c = el.value!; const init = () => {
    const w = c.clientWidth || 600, h = 400
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100)
    camera.position.set(6, 5, 8); camera.lookAt(0, 1, 0)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    c.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true
    ambient = new THREE.AmbientLight('#fff', 0.4); scene.add(ambient)
    dirLight = new THREE.DirectionalLight('#fff', 0.8); dirLight.position.set(5, 10, 5); scene.add(dirLight)
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
.demo-3d { width: 100%; height: 400px; }
.demo-legend { display: flex; gap: 12px; margin-top: 8px; font-size: 12px; }
.legend-item { display: inline-flex; align-items: center; gap: 4px; }
.legend-dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
.legend-mark { gap: 4px; }
.legend-line { width: 16px; height: 2px; background: #f59e0b; display: inline-block; border-top: 1px dashed #f59e0b; }
</style>
