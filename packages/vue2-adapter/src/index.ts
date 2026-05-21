function createChartComponent(chartName: string, ChartClass: any) {
  return {
    name: `Holo${chartName}`,
    props: {
      data: { type: Array, required: true },
      theme: { type: [String, Object], default: 'cyberpunk' },
      options: { type: Object, default: () => ({}) },
    },
    data() { return { chart: null as any } },
    mounted() {
      this.chart = new ChartClass(this.$el, { ...this.options, theme: this.theme, data: this.data })
    },
    watch: {
      data: { handler(val: any) { this.chart?.setData(val) }, deep: true },
      theme(val: any) { this.chart?.setTheme(val) },
    },
    beforeDestroy() { this.chart?.dispose() },
    render(h: any) { return h('div', { style: { width: '100%', height: '100%' } }) },
  }
}

export { createChartComponent }
export default { install(Vue: any) { /* register components globally */ } }
