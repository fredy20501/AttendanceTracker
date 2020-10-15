import Vue from 'vue'
import App from './App.vue'
import router from './router'


// Import VeeValidate globally so we can use it in all components
import { ValidationProvider } from 'vee-validate/dist/vee-validate.full.esm';
import { ValidationObserver } from 'vee-validate';
Vue.component('ValidationProvider', ValidationProvider)
Vue.component('ValidationObserver', ValidationObserver)

// Import vue-notifications globally
import Notifications from 'vue-notification'
Vue.use(Notifications)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
