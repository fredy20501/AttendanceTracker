import Vue from 'vue'
import App from './App.vue'
import router from './router'


// Import vee-validate globally
// Tutorial: https://www.youtube.com/watch?v=XwND-DLWCF0
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
// Docs: https://www.npmjs.com/package/vue-notification
import Notifications from 'vue-notification'
Vue.use(Notifications)


// Import vue-wait globally
// More info: https://github.com/f/vue-wait
import VueWait from 'vue-wait'
Vue.use(VueWait)


// Import epic-spinners globally
// More info: https://github.com/epicmaxco/epic-spinners
import {HalfCircleSpinner} from 'epic-spinners'
Vue.component('HalfCircleSpinner', HalfCircleSpinner)


// Import vuejs-dialog globally
// More info: https://www.npmjs.com/package/vuejs-dialog
import VuejsDialog from 'vuejs-dialog'
import 'vuejs-dialog/dist/vuejs-dialog.min.css'
Vue.use(VuejsDialog, {
  html: true,
  okText: 'Yes',
  cancelText: 'Cancel',
  backdropClose: true
})


// Import Loading component globally
import Loading from '@/components/layout/Loading'
Vue.component('Loading', Loading)


// Global store is defined in store.js
import store from './store'


Vue.config.productionTip = false

new Vue({
  router,
  store,
  wait: new VueWait({
    useVuex: true
  }),
  render: h => h(App)
}).$mount('#app')
