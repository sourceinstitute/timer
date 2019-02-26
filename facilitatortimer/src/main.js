import Vue from 'vue'
import App from './App.vue'
import LoadScript from 'vue-plugin-load-script';
Vue.use(LoadScript);
import vueHeadful from 'vue-headful';

Vue.component('vue-headful', vueHeadful);

Vue.config.productionTip = false


new Vue({
  render: h => h(App),
}).$mount('#app')
