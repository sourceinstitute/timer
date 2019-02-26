import Vue from 'vue'
import App from './App.vue'
import LoadScript from 'vue-plugin-load-script';
Vue.use(LoadScript);
import ProgressBar from 'vuejs-progress-bar'
Vue.use(ProgressBar)

Vue.config.productionTip = false


new Vue({
  render: h => h(App),
}).$mount('#app')
