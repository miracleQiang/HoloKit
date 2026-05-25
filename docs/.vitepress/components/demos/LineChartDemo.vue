<template>
  <DemoContainer title="3D 折线图">
    <DemoToolbar @camera="switchCamera" @export="exportPng" @fullscreen="toggleFull" />
    <div ref="el" class="demo-3d"></div>
    <div class="demo-legend" :style="{ color: current.text }">
      <span class="legend-item"><span class="legend-dot" :style="{ background: current.colors[0] }"></span>系列 A</span>
      <span class="legend-item"><span class="legend-dot" :style="{ background: current.colors[1] }"></span>系列 B</span>
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
import { useDemoToolbar } from './demo-toolbar'

const el = ref<HTMLDivElement | null>(null)
const { current } = useDemoTheme()
const { switchCamera, exportPng, toggleFull } = useDemoToolbar(() => renderer ? { renderer, camera, scene, controls, el } : null)
let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera
let controls: OrbitControls, animId: number | null = null, ro: ResizeObserver | null = null
let chartGroup: THREE.Group, ambient: THREE.AmbientLight, dirLight: THREE.DirectionalLight

const series = [
  [820, 932, 901, 934, 1290, 1330, 1520],
  [620, 732, 801, 734, 1090, 930, 1120],
]
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月']

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
  canvas.width = cssW * dpr; canvas.height = cssH * dpr
  ctx.scale(dpr, dpr); ctx.font = fontSpec; ctx.textBaseline = 'middle'
  ctx.fillStyle = color; ctx.fillText(text, padding, cssH / 2)
  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(ww * (cssW / cssH), ww, 1)
  return sprite
}

function buildLines() {
  while (chartGroup.children.length) {
    const c = chartGroup.children[0] as any
    chartGroup.remove(c); c.geometry?.dispose?.(); c.material?.dispose?.()
  }
  const t = current.value
  const maxVal = Math.max(...series.flat())
  const chartH = 3.5
  const totalW = (series[0].length - 1) * 1.2
  const startX = -totalW / 2
  const labelColor = t.text

  series.forEach((s, si) => {
    const points = s.map((v, i) => new THREE.Vector3(startX + i * 1.2, (v / maxVal) * chartH, si * 1.5))
    const curve = new THREE.CatmullRomCurve3(points)
    const cps = curve.getPoints(50)
    const color = t.colors[si]
    chartGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(cps), new THREE.LineBasicMaterial({ color })))
    points.forEach(p => {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 16, 16),
        new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: t.emissiveIntensity * 1.5 })
      )
      dot.position.copy(p); chartGroup.add(dot)
    })
  })

  // X 轴类别标签
  months.forEach((m, i) => {
    const lbl = makeTextSprite(m, labelColor, { fontSize: 44, worldHeight: 0.25 })
    lbl.position.set(startX + i * 1.2, -0.25, 0)
    chartGroup.add(lbl)
  })

  // Y 轴网格 + 刻度
  const halfW = totalW / 2 + 0.3
  const gridMat = new THREE.LineBasicMaterial({ color: t.grid, transparent: true, opacity: 0.5 })
  const ticks = 4
  for (let i = 0; i <= ticks; i++) {
    const y = (i / ticks) * chartH
    chartGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-halfW, y, 0), new THREE.Vector3(halfW, y, 0)]), gridMat))
    const tick = makeTextSprite(`${Math.round((i / ticks) * maxVal)}`, labelColor, { fontSize: 40, worldHeight: 0.22 })
    tick.position.set(-halfW - 0.4, y, 0)
    chartGroup.add(tick)
  }

  // 轴标题
  const xTitle = makeTextSprite('月份', labelColor, { fontSize: 56, worldHeight: 0.3, bold: true })
  xTitle.position.set(0, -0.65, 0); chartGroup.add(xTitle)
  const yTitle = makeTextSprite('访问量', labelColor, { fontSize: 56, worldHeight: 0.3, bold: true })
  yTitle.position.set(-halfW - 1.2, chartH / 2, 0); chartGroup.add(yTitle)

  // markLine 均值线
  const allAvg = series.flat().reduce((s, v) => s + v, 0) / series.flat().length
  const avgY = (allAvg / maxVal) * chartH
  const dashMat = new THREE.LineDashedMaterial({ color: '#f59e0b', dashSize: 0.1, gapSize: 0.05 })
  const mlGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-halfW, avgY, 0), new THREE.Vector3(halfW, avgY, 0)])
  const mlLine = new THREE.Line(mlGeo, dashMat); mlLine.computeLineDistances()
  chartGroup.add(mlLine)
  const avgLbl = makeTextSprite(`均值 ${Math.round(allAvg)}`, '#f59e0b', { fontSize: 40, worldHeight: 0.22 })
  avgLbl.position.set(halfW + 0.4, avgY, 0); chartGroup.add(avgLbl)
}

function applyTheme() {
  const t = current.value
  scene.background = new THREE.Color(t.background)
  ambient.color.set(t.ambient.color); ambient.intensity = t.ambient.intensity
  dirLight.color.set(t.directional.color); dirLight.intensity = t.directional.intensity
  buildLines()
}

onMounted(async () => {
  await nextTick()
  const c = el.value!; const init = () => {
    const w = c.clientWidth || 600, h = 400
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100); camera.position.set(5, 4, 7); camera.lookAt(0, 1, 0)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    c.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true
    ambient = new THREE.AmbientLight('#fff', 0.4); scene.add(ambient)
    dirLight = new THREE.DirectionalLight('#fff', 0.8); dirLight.position.set(5, 10, 5); scene.add(dirLight)
    chartGroup = new THREE.Group(); scene.add(chartGroup)
    const grid = new THREE.GridHelper(10, 10, '#1e293b', '#1e293b'); grid.position.y = -0.01; scene.add(grid)
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
