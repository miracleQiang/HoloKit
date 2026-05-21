import { defineComponent, h, ref, onMounted, onUnmounted, watch, PropType } from 'vue'
import type { ChartOptions } from '@holokit/charts'

function createChartComponent(chartName: string, ChartClass: any) {
  return defineComponent({
    name: `Holo${chartName}`,
    props: {
      data: { type: Array as PropType<any[]>, required: true },
      theme: { type: [String, Object] as PropType<string | object>, default: 'cyberpunk' },
      options: { type: Object as PropType<ChartOptions>, default: () => ({}) },
    },
    setup(props) {
      const containerRef = ref<HTMLElement | null>(null)
      let chart: any = null

      onMounted(() => {
        if (containerRef.value) {
          chart = new ChartClass(containerRef.value, { ...props.options, theme: props.theme, data: props.data })
        }
      })

      watch(() => props.data, (newData) => { chart?.setData(newData) }, { deep: true })
      watch(() => props.theme, (newTheme) => { chart?.setTheme(newTheme) })

      onUnmounted(() => { chart?.dispose() })

      return () => h('div', { ref: containerRef, style: { width: '100%', height: '100%' } })
    },
  })
}

export { createChartComponent }
export default { install(app: any) { /* register components globally */ } }
