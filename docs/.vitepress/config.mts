import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'HoloKit',
  description: '3D 数据可视化组件库',
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '图表', link: '/charts/bindbar' },
      { text: '地图', link: '/map/bindbasic' },
      { text: 'API', link: '/api/reference' },
    ],
    sidebar: {
      '/guide/': [
        { text: '快速开始', link: '/guide/getting-started' },
        { text: '主题配置', link: '/guide/themes' },
        { text: '框架适配', link: '/guide/frameworks' },
      ],
      '/charts/': [
        { text: '柱状图', link: '/charts/bindbar' },
        { text: '饼图', link: '/charts/bindpie' },
        { text: '折线图', link: '/charts/bindline' },
        { text: '散点图', link: '/charts/scatter' },
        { text: '曲面图', link: '/charts/surface' },
        { text: '热力图', link: '/charts/heatmap' },
        { text: '雷达图', link: '/charts/radar' },
        { text: '漏斗图', link: '/charts/funnel' },
        { text: '关系图', link: '/charts/force' },
        { text: '地球图', link: '/charts/globe' },
      ],
      '/map/': [
        { text: '基础用法', link: '/map/bindbasic' },
        { text: '图层', link: '/map/layers' },
        { text: 'GIS 分析', link: '/map/bindgis' },
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/nicekid1/HoloKit' }],
  },
})
