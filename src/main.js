import Vue from 'vue'
import App from './App.vue'
import router from './router'


// Import VeeValidate globally so we can use it in all components
import { ValidationProvider, extend } from 'vee-validate/dist/vee-validate.full.esm';
import { ValidationObserver } from 'vee-validate';
Vue.component('ValidationProvider', ValidationProvider)
Vue.component('ValidationObserver', ValidationObserver)

// Create custom validation rule for matching a unb email
extend('unbEmail', {
  message: field => `The ${field} must be a valid unb email`,
  validate: value => {
    var unbEmail = /^.*@unb\.ca$/;
    var isUnbEmail = unbEmail.test(value);
    return isUnbEmail;
  }
});


// Import vue-notifications globally
import Notifications from 'vue-notification'
Vue.use(Notifications)

import Vuex from 'vuex'
Vue.use(Vuex)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
