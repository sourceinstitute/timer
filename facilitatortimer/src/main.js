import Vue from 'vue'
import App from './App.vue'
import vueHeadful from 'vue-headful'
import fullscreen from 'vue-fullscreen'
Vue.use(fullscreen, {name: 'fullscreen'})
Vue.use(require('vue-shortkey'),  { prevent: ['input', 'textarea'] })
import vmodal from 'vue-js-modal'
Vue.use(vmodal)
import VueMatomo from 'vue-matomo'
Vue.use(VueMatomo, {
  host: 'http://piwik.source.institute',
  siteId: 8,
  enableLinkTracking: true
  })

Vue.config.productionTip = false

Vue.component('vue-headful', vueHeadful);

new Vue({
  render: h => h(App),
}).$mount('#app')
