import Vue from 'vue'
import App from './App.vue'
import vueHeadful from 'vue-headful';

Vue.component('vue-headful', vueHeadful);

Vue.config.productionTip = false


new Vue({
  render: h => h(App),
}).$mount('#app')
