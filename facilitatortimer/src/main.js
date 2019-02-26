import Vue from 'vue'
import App from './App.vue'
import vueHeadful from 'vue-headful'
import fullscreen from 'vue-fullscreen'
Vue.use(fullscreen, {name: 'fullscreen'})

Vue.config.productionTip = false

Vue.component('vue-headful', vueHeadful);

new Vue({
  render: h => h(App),
}).$mount('#app')
