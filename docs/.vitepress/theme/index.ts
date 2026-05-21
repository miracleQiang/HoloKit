import DefaultTheme from 'vitepress/theme'
import HoloHome from '../components/HoloHome.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HoloHome', HoloHome)
  },
}
