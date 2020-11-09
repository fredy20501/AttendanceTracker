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
const PORT = config?.app.port || 443;

// Set API url for all requests
import Axios from 'axios'
const $http = Axios.create({
  baseURL: "http://localhost:"+PORT+"/api/"
})

// This is what we need to have for it to work on the server
// It is commented out since it doesn't work locally (hopefully this will get fixed by another pr)
// const $http = Axios.create({
//   baseURL: "https://dev1.athena.xn--9xa.network/api/"
// })

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
    // Make the state persist between browser sessions
    createPersistedState(),
    // Make the state shared accross tabs
    createMutationsSharer({
      predicate: ["setUser"]
    })
  ],

  state: {
    authenticated: false,
    user: { ...emptyUser },
    courseId: null
  },

  getters: {
    getUser: state => state.user,
    isAuthenticated: state => state.authenticated,
    isProfessor: state => state.user.is_professor,
    getCourse: state => state.courseId
  },

  mutations: {
    setUser(state, user) {
      state.user = user
      state.authenticated = true
    },
    logout(state) {
      state.user = { ...emptyUser }
      state.authenticated = false
    },
    setCourse(state, courseId) {
      state.courseId = courseId
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

    logout(context) {
      return $http.get('logout')
      .then(() => {
        context.commit('logout')
      })
    },

    testAPI() {
      return $http.get()
    },

    getSeatingLayouts() {
      return $http.get('section/previousSeatingPlans')
      .then(res => {
        // Format the response to match what frontend is expecting
        return { layouts: res.data.seatingLayout }
      })
      .catch(err => {
        err.message = "Could not get seating layouts. Please try again later"
        throw err
      })
    },

    createSeatingLayout(context, payload) {
      return $http.post('section/createSeatingLayout', payload)
      .then(res => {
        // Format the response to match what frontend is expecting
        res.data.seatingLayout.type = "saved"
        return { layout: res.data.seatingLayout }
      })
      .catch(err => {
        err.message = "Could not save seating layout. Please try again later"
        throw err
      })
    },

    createSection(context, payload) {
      return $http.post('section/createSection', payload)
      .catch(err => {
        err.message = "Could not create section. Please try again later"
        throw err
      })
    },

    updateSection(context, payload) {
      return $http.post('section/updateSection', payload)
      .catch(err => {
        err.message = "Could not save section. Please try again later"
        throw err
      })
    },

    // ==== FUNCTIONS TODO =====
    // (you might want more functions, these are just the ones I was able to think of)

    // This function will call the proper api to get the courses for a specific user.
    // Depending on the api you might need to do a different api call depending if the user is a student or a professor.
    getCourse(context, payload) {
      // The data you send from the frontend is in the "payload" object

      // This is the most basic api call where you directly pass in the payload to the api and return a simple message on error.
      // You might need to modify the data you send to the api or the format you return to the frontend depending on what the api and frontend are each expecting.
      // (you can look at the other functions above for examples)
      return $http.get('api/path/to/endpoint', payload)
      .catch(err => {
        err.message = "Could not get course data. Please try again later"
        throw err
      })
    },

    // This function will call the proper api to try reserving a seat for a student in a course
    reserveSeat(context, payload) {
      // The data you send from the frontend is in the "payload" object

      // This is the most basic api call where you directly pass in the payload to the api and return a simple message on error.
      // You might need to modify the data you send to the api or the format you return to the frontend depending on what the api and frontend are each expecting.
      // (you can look at the other functions above for examples)
      return $http.post('api/path/to/endpoint', payload)
      .catch(err => {
        err.message = "Could not reserve the seat. Please try again later"
        throw err
      })
    }
  }
})

export default store;