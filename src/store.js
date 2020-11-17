import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'

Vue.use(Vuex)
// Vuex tutorial: https://scrimba.com/scrim/cMPa2Uk?pl=pnyzgAP

const isProduction = process.env.NODE_ENV === 'production'

var $http
if (isProduction) {
  // Use the correct server url if running in production
  $http = Axios.create({
    baseURL: "https://dev1.athena.xn--9xa.network/api/"
  })
}
else {
  // Get port from server config
  var config
  if (!process.env.TRAVIS) {
    config = require('@/../server/config/config.js')
  }
  
  // Don't change the default port (5000) since both frontend 
  // and backend assume 5000 if config is missing.
  // Change the value in the config file to specify the port you want.
  const PORT = config?.app.port || 5000;

  // Set API url for all requests
  $http = Axios.create({
    baseURL: "http://localhost:"+PORT+"/api/"
  })
}

// Only use strict mode during development
// More info: https://vuex.vuejs.org/guide/strict.html#development-vs-production
const useStrict = !isProduction

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
    user: { ...emptyUser }
  },

  getters: {
    getUser: state => state.user,
    isAuthenticated: state => state.authenticated,
    isProfessor: state => state.user.is_professor
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

    getSectionData(context, payload) {
      payload

      // Return test data (will later integrate with the actual api)
      return {
        _id: "5fac407ad44a0c3c7803adc7",
        name: "JPT9411_FR23A_LEC",
        professor: {
          name: 'Jarvis Dumbledore'
        },
        attendance_threshold: 3,
        students: [
          {name: 'Frederic Verret'},
          {name: 'John F Kennedy'},
          {name: 'This is a very long name'},
          {name: 'This is a very long name. Even longer than the other one'},
          {name: 'Peter Parker'},
          {name: 'Algernon Prime'},
          {name: 'Mister Horsey McHorseface'},
        ],
        seating_layout: {
          name: 'PPE405',
          _id: "5fac3aebddc8393810164444",
          layout: [
            [2,1,1,0],
            [2,2,2,2],
            [3,3,2,3],
          ]
        },
        seating_arrangement: [
          [
            {name: 'Frederic Verret'},
            null,
            null,
            null,
          ],
          // Second row
          [
            {name: 'John F Kennedy'},
            null,
            {name: 'This is a very long name'},
            {name: 'This is a very long name. Even longer than the other one'},
          ],
          // Third row
          [
            null,
            {name: 'Peter Parker'},
            {name: 'Algernon Prime'},
            {name: 'Mister Horsey McHorseface'},
          ],
        ],
        always_mandatory: true,
      }

      // return $http.get('api/path/to/endpoint', payload)
      // .catch(err => {
      //   err.message = "Could not get course data. Please try again later"
      //   throw err
      // })
    },

    saveAttendance(context, payload) {
      payload

      // Return test data (will later integrate with the actual api)
      return

      // return $http.post('api/path/to/endpoint', payload)
      // .catch(err => {
      //   err.message = "Could not save attendance. Please try again later"
      //   throw err
      // })
    }
  }
})

export default store;