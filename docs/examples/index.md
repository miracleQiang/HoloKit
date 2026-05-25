---
layout: page
---

<style>
.examples-page { max-width: 1200px; margin: 0 auto; padding: 40px 24px; }
.examples-title { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.examples-desc { color: var(--vp-c-text-2); margin-bottom: 32px; font-size: 15px; }
.examples-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.example-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px; overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  background: var(--vp-c-bg-soft);
}
.example-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
.card-thumb { width: 100%; height: 180px; object-fit: cover; border-bottom: 1px solid var(--vp-c-divider); }
.card-body { padding: 16px; }
.card-title { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
.card-desc { font-size: 13px; color: var(--vp-c-text-2); margin-bottom: 12px; line-height: 1.5; }
.card-btn {
  display: inline-block; padding: 6px 16px; font-size: 13px;
  background: var(--vp-c-brand-1); color: #fff; border-radius: 6px;
  text-decoration: none; transition: opacity 0.2s;
}
.card-btn:hover { opacity: 0.85; }
.card-tag { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 10px; background: rgba(0,245,255,0.1); color: var(--vp-c-brand-1); margin-left: 8px; }
</style>

<div class="examples-page">
  <h1 class="examples-title">演示项目</h1>
  <p class="examples-desc">使用 HoloKit 构建的完整应用示例，点击卡片打开独立演示页面。</p>
  <div class="examples-grid">
    <div class="example-card">
      <div class="card-thumb" style="background:#0a0e1a;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;">
        <svg viewBox="0 0 320 180" style="width:100%;height:100%;" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="180" fill="#0a0e1a"/><rect x="8" y="6" width="304" height="16" rx="2" fill="#1e293b"/><text x="160" y="17" text-anchor="middle" fill="#00f5ff" font-size="7">BI 数据分析大屏</text><rect x="8" y="26" width="72" height="20" rx="2" fill="#1e293b"/><rect x="84" y="26" width="72" height="20" rx="2" fill="#1e293b"/><rect x="160" y="26" width="72" height="20" rx="2" fill="#1e293b"/><rect x="236" y="26" width="72" height="20" rx="2" fill="#1e293b"/><rect x="8" y="50" width="100" height="60" rx="3" fill="#111827" stroke="#1e293b" stroke-width="0.5"/><rect x="15" y="90" width="8" height="15" fill="#00f5ff" opacity="0.8"/><rect x="26" y="80" width="8" height="25" fill="#a855f7" opacity="0.8"/><rect x="37" y="70" width="8" height="35" fill="#30d158" opacity="0.8"/><rect x="48" y="85" width="8" height="20" fill="#00f5ff" opacity="0.6"/><rect x="112" y="50" width="100" height="60" rx="3" fill="#111827" stroke="#1e293b" stroke-width="0.5"/><polyline points="120,95 135,85 150,88 165,75 180,70 195,65 205,60" stroke="#00f5ff" stroke-width="1" fill="none"/><polyline points="120,98 135,92 150,95 165,85 180,82 195,80 205,75" stroke="#a855f7" stroke-width="1" fill="none"/><rect x="216" y="50" width="96" height="60" rx="3" fill="#111827" stroke="#1e293b" stroke-width="0.5"/><circle cx="260" cy="80" r="20" fill="none" stroke="#00f5ff" stroke-width="4" stroke-dasharray="40 85"/><circle cx="260" cy="80" r="20" fill="none" stroke="#a855f7" stroke-width="4" stroke-dasharray="25 100" stroke-dashoffset="-40"/><circle cx="260" cy="80" r="20" fill="none" stroke="#30d158" stroke-width="4" stroke-dasharray="20 105" stroke-dashoffset="-65"/><rect x="8" y="114" width="100" height="60" rx="3" fill="#111827" stroke="#1e293b" stroke-width="0.5"/><circle cx="30" cy="140" r="2" fill="#00f5ff"/><circle cx="45" cy="150" r="1.5" fill="#a855f7"/><circle cx="60" cy="135" r="2.5" fill="#30d158"/><circle cx="75" cy="155" r="1.5" fill="#00f5ff"/><circle cx="90" cy="130" r="2" fill="#a855f7"/><rect x="112" y="114" width="200" height="60" rx="3" fill="#111827" stroke="#1e293b" stroke-width="0.5"/><rect x="118" y="126" width="188" height="7" rx="1" fill="#1e293b"/><rect x="118" y="136" width="188" height="7" rx="1" fill="#0f172a"/><rect x="118" y="146" width="188" height="7" rx="1" fill="#1e293b"/><rect x="118" y="156" width="188" height="7" rx="1" fill="#0f172a"/></svg>
      </div>
      <div class="card-body">
        <div class="card-title">BI 数据分析大屏 <span class="card-tag">NEW</span></div>
        <div class="card-desc">企业级数据分析大屏，包含 3D 柱状图、折线图、饼图、散点图、雷达图等多种图表，模拟真实 BI 场景。赛博朋克主题，全屏展示。</div>
        <a class="card-btn" href="/holokit/demos/bi-dashboard/" target="_blank">打开演示 →</a>
      </div>
    </div>
    <div class="example-card" style="opacity:0.5;pointer-events:none;">
      <div class="card-thumb" style="background:var(--vp-c-bg-alt);display:flex;align-items:center;justify-content:center;color:var(--vp-c-text-3);font-size:14px;">即将推出</div>
      <div class="card-body">
        <div class="card-title">实时监控大屏</div>
        <div class="card-desc">IoT 设备实时监控面板，3D 地球 + 数据流 + 告警看板，适用于运维场景。</div>
      </div>
    </div>
    <div class="example-card" style="opacity:0.5;pointer-events:none;">
      <div class="card-thumb" style="background:var(--vp-c-bg-alt);display:flex;align-items:center;justify-content:center;color:var(--vp-c-text-3);font-size:14px;">即将推出</div>
      <div class="card-body">
        <div class="card-title">电商数据看板</div>
        <div class="card-desc">电商平台销售数据可视化，GMV 趋势、品类分析、用户画像、转化漏斗。</div>
      </div>
    </div>
  </div>
</div>
