import DefaultTheme from 'vitepress/theme'
import HoloHome from '../components/HoloHome.vue'
import BarChartDemo from '../components/demos/BarChartDemo.vue'
import PieChartDemo from '../components/demos/PieChartDemo.vue'
import LineChartDemo from '../components/demos/LineChartDemo.vue'
import ScatterChartDemo from '../components/demos/ScatterChartDemo.vue'
import RadarChartDemo from '../components/demos/RadarChartDemo.vue'
import GlobeDemo from '../components/demos/GlobeDemo.vue'
import MapDemo from '../components/demos/MapDemo.vue'
import SurfaceChartDemo from '../components/demos/SurfaceChartDemo.vue'
import HeatmapChartDemo from '../components/demos/HeatmapChartDemo.vue'
import FunnelChartDemo from '../components/demos/FunnelChartDemo.vue'
import ForceGraphDemo from '../components/demos/ForceGraphDemo.vue'
import FlipCardTableDemo from '../components/demos/FlipCardTableDemo.vue'
import FloatPanelTableDemo from '../components/demos/FloatPanelTableDemo.vue'

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
    app.component('SurfaceChartDemo', SurfaceChartDemo)
    app.component('HeatmapChartDemo', HeatmapChartDemo)
    app.component('FunnelChartDemo', FunnelChartDemo)
    app.component('ForceGraphDemo', ForceGraphDemo)
    app.component('FlipCardTableDemo', FlipCardTableDemo)
    app.component('FloatPanelTableDemo', FloatPanelTableDemo)
  },
}
