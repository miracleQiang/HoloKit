import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'HoloKit',
  description: '3D 数据可视化组件库',
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '图表', link: '/charts/bar' },
      { text: '地图', link: '/map/basic' },
      { text: 'API', link: '/api/reference' },
    ],
    sidebar: {
      '/guide/': [
        { text: '快速开始', link: '/guide/getting-started' },
        { text: '主题配置', link: '/guide/themes' },
        { text: '框架适配', link: '/guide/frameworks' },
      ],
      '/charts/': [
        { text: '柱状图', link: '/charts/bar' },
        { text: '饼图', link: '/charts/pie' },
        { text: '折线图', link: '/charts/line' },
        { text: '散点图', link: '/charts/scatter' },
        { text: '曲面图', link: '/charts/surface' },
        { text: '热力图', link: '/charts/heatmap' },
        { text: '雷达图', link: '/charts/radar' },
        { text: '漏斗图', link: '/charts/funnel' },
        { text: '关系图', link: '/charts/force' },
        { text: '地球图', link: '/charts/globe' },
        { text: '翻转卡片表', link: '/charts/flip-table' },
        { text: '悬浮面板表', link: '/charts/float-table' },
      ],
      '/map/': [
        { text: '基础用法', link: '/map/basic' },
        { text: '图层系统', link: '/map/layers' },
        { text: 'GIS 分析', link: '/map/gis' },
        { text: '轨迹回放', link: '/map/track' },
        { text: '坐标转换', link: '/map/coordinate' },
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/miracleQiang/HoloKit' }],
  },
})
