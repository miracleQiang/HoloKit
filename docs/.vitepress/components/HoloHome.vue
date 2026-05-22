<template>
  <div class="holo-home">
    <div ref="canvasContainer" class="hero-canvas"></div>
    <div class="hero-content">
      <img src="/logo.svg" alt="HoloKit" class="hero-logo" />
      <h1 class="hero-title">HoloKit</h1>
      <p class="hero-subtitle">3D 数据可视化组件库</p>
      <p class="hero-desc">基于 Three.js，支持 Vue2 / Vue3 / React，一行代码创建沉浸式 3D 图表</p>
      <div class="hero-actions">
        <a href="/guide/getting-started" class="btn-primary">快速开始</a>
        <a href="https://github.com/nicekid1/HoloKit" class="btn-secondary">GitHub</a>
      </div>
    </div>
    <div class="features">
      <div class="feature-card">
        <h3>12+ 图表组件</h3>
        <p>柱状图、饼图、折线图、散点图、曲面图、热力图、雷达图、漏斗图、关系图、地球图等</p>
      </div>
      <div class="feature-card">
        <h3>专业 GIS</h3>
        <p>瓦片加载、坐标转换、飞线动画、区域下钻、轨迹回放、空间分析</p>
      </div>
      <div class="feature-card">
        <h3>主题系统</h3>
        <p>内置 Cyberpunk 和 Glass 两套预设主题，支持完全自定义颜色、材质、光照</p>
      </div>
      <div class="feature-card">
        <h3>框架无关</h3>
        <p>纯 JS Class API，同时提供 Vue2、Vue3、React 适配器，一行代码接入</p>
      </div>
    </div>
    <div class="code-demo">
      <h2>3 行代码，创建 3D 图表</h2>
      <pre><code>import HoloKit from 'holokit'

const chart = new HoloKit.BarChart3D(document.getElementById('chart'), {
  theme: 'cyberpunk',
  data: [
    { label: '一月', value: 120 },
    { label: '二月', value: 200 },
    { label: '三月', value: 150 },
  ]
})</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const canvasContainer = ref(null)
let scene, camera, renderer, globe, particles, animationId

function init() {
  if (!canvasContainer.value) return
  const w = canvasContainer.value.clientWidth
  const h = canvasContainer.value.clientHeight

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100)
  camera.position.set(0, 0, 4)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  canvasContainer.value.appendChild(renderer.domElement)

  // Globe wireframe
  const globeGeo = new THREE.SphereGeometry(1.2, 32, 32)
  const globeMat = new THREE.MeshBasicMaterial({ color: '#00f5ff', wireframe: true, transparent: true, opacity: 0.15 })
  globe = new THREE.Mesh(globeGeo, globeMat)
  scene.add(globe)

  // Particles
  const particleCount = 500
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount * 3; i++) positions[i] = (Math.random() - 0.5) * 8
  const particleGeo = new THREE.BufferGeometry()
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particleMat = new THREE.PointsMaterial({ color: '#a855f7', size: 0.02, transparent: true, opacity: 0.6 })
  particles = new THREE.Points(particleGeo, particleMat)
  scene.add(particles)

  animate()
}

function animate() {
  animationId = requestAnimationFrame(animate)
  globe.rotation.y += 0.003
  particles.rotation.y += 0.001
  renderer.render(scene, camera)
}

onMounted(() => init())
onUnmounted(() => { cancelAnimationFrame(animationId); renderer?.dispose() })
</script>

<style scoped>
.holo-home { position: relative; overflow: hidden; }
.hero-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100vh; z-index: 0; }
.hero-content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 2rem; }
.hero-logo { width: 140px; height: 140px; margin-bottom: 1.25rem; filter: drop-shadow(0 0 24px rgba(0, 245, 255, 0.45)) drop-shadow(0 0 48px rgba(168, 85, 247, 0.35)); animation: hero-logo-float 6s ease-in-out infinite; }
@keyframes hero-logo-float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(3deg); } }
.hero-title { font-size: 4rem; font-weight: 800; background: linear-gradient(135deg, #00f5ff, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
.hero-subtitle { font-size: 1.5rem; color: #e2e8f0; margin: 0.5rem 0; }
.hero-desc { font-size: 1.1rem; color: #94a3b8; max-width: 600px; }
.hero-actions { display: flex; gap: 1rem; margin-top: 2rem; }
.btn-primary { padding: 0.75rem 2rem; background: linear-gradient(135deg, #00f5ff, #a855f7); color: #0a0e1a; border-radius: 8px; font-weight: 600; text-decoration: none; }
.btn-secondary { padding: 0.75rem 2rem; border: 1px solid #475569; color: #e2e8f0; border-radius: 8px; text-decoration: none; }
.features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; }
.feature-card { background: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; border-radius: 12px; padding: 1.5rem; }
.feature-card h3 { color: #00f5ff; margin: 0 0 0.5rem; }
.feature-card p { color: #94a3b8; margin: 0; font-size: 0.9rem; }
.code-demo { max-width: 800px; margin: 2rem auto; padding: 2rem; text-align: center; }
.code-demo h2 { color: #e2e8f0; }
.code-demo pre { background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 1.5rem; text-align: left; overflow-x: auto; }
.code-demo code { color: #e2e8f0; font-size: 0.9rem; }
</style>
