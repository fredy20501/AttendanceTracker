import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

// Vuex tutorial: https://scrimba.com/scrim/cMPa2Uk?pl=pnyzgAP


// Get port from server config
var config;
if (!process.env.TRAVIS) {
  config = require('@/../server/config/config.js')
}
// Don't change the default port (5000) since both frontend 
// and backend assume 5000 if config is missing.
// Change the value in the config file to specify the port you want.
const PORT = config?.app.port || 5000;

// Set API url for all requests
import Axios from 'axios'
const $http = Axios.create({
  baseURL: "http://localhost:"+PORT+"/api/"
})

// Only use strict mode during development
// More info: https://vuex.vuejs.org/guide/strict.html#development-vs-production
const useStrict = process.env.NODE_ENV !== 'production'

// Import Vuex plugins. 
// More info on these plugins: https://vuejsdevelopers.com/2017/09/11/vue-js-vuex-plugins/
import createPersistedState from "vuex-persistedstate"
import createMutationsSharer from "vuex-shared-mutations"

const emptyUser = {
  id: '',
  name: '',
  email: '',
  is_professor: false
}

const store = new Vuex.Store({
  strict: useStrict,

  plugins: [
    createPersistedState(),
    createMutationsSharer({
      predicate: ["setUser"]
    })
  ],

  state: {
    authenticated: false,
    user: { ...emptyUser }
  },

  getters: {
    getUser: state => state.user,
    isAuthenticated: state => state.authenticated
  },

  mutations: {
    setUser(state, user) {
      state.user = user
      state.authenticated = true
    },
    logout(state) {
      state.user = { ...emptyUser }
      state.authenticated = false
    }
  },

  actions: {
    login(context, credentials) {
      return $http.post('login', credentials)
        .then(resp => {
          context.commit('setUser', resp.data.user)
        })
        .catch(err => {
          // Login failed: Add a message and propagate the error
          if (err.response?.status == 401) {
            err.message = "Incorrect email or password"
          }
          else {
            err.message = "Unable to login. Please try again later"
          }
          throw err
        })
    },

    registerAndLogin(context, payload) {
      return $http.post('register', payload)
      .then(() => {
        // Try to login
        return this.dispatch('login', {
          email: payload.email,
          password: payload.password
        })
        .catch(err => {
          // Login failed: Add a message and propagate the error
          err = { ...err, 
            message: "Could not login automatically. Please try logging in manually",
            type: "warn"
          }
          throw err
        })
      })
      .catch(err => {
        // Register failed: Add a message and propagate the error
        if (err.response?.data?.code == 11000) {
          err.message = "An account with this email already exists"
        }
        else {
          err.message = "Could not create account. Please try again later"
        }
        throw err
      })
    },

    testAPI() {
      return $http.get()
    }
  }
})

export default store;