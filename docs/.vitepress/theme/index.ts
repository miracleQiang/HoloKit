import DefaultTheme from 'vitepress/theme'
import HoloHome from '../components/HoloHome.vue'
import BarChartDemo from '../components/demos/BarChartDemo.vue'
import PieChartDemo from '../components/demos/PieChartDemo.vue'
import LineChartDemo from '../components/demos/LineChartDemo.vue'
import ScatterChartDemo from '../components/demos/ScatterChartDemo.vue'
import RadarChartDemo from '../components/demos/RadarChartDemo.vue'
import GlobeDemo from '../components/demos/GlobeDemo.vue'
import MapDemo from '../components/demos/MapDemo.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HoloHome', HoloHome)
    app.component('BarChartDemo', BarChartDemo)
    app.component('PieChartDemo', PieChartDemo)
    app.component('LineChartDemo', LineChartDemo)
    app.component('ScatterChartDemo', ScatterChartDemo)
    app.component('RadarChartDemo', RadarChartDemo)
    app.component('GlobeDemo', GlobeDemo)
    app.component('MapDemo', MapDemo)
  },
}
