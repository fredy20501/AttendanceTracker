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
  if (!process.env.CI) {
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
        if (err.response?.data?.code == 11000) {
          err.message = "A seating layout with this name already exists"
        }
        else {
          err.message = "Could not save seating layout. Please try again later"
        }
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
      return $http.put('section/updateSection', payload)
      .catch(err => {
        err.message = "Could not save section. Please try again later"
        throw err
      })
    },

    deleteLayout(context, payload) {
      return $http.post('section/deleteSeatingLayout', payload)
      .catch(err => {
        err.message = "Could not delete layout. Please try again later"
        if(err.response.status == 418){
          err.message = "Layout cannot be deleted since it is currently used for a section"
        }
        throw err
      })
    },

    getSectionsForStudent(context, payload) {
      return $http.get('dashboard/getSectionsByStudent', {
        // Note: for get requests we need to send data through params
        params: {
          studentID: payload.userId
        }
      })
      .then(res => {
        return {
          sections: res.data
        }
      })
      .catch(err => {
        err.message = "Could not get sections. Please try again later"
        throw err
      })
    },

    getSectionsForProfessor(context, payload) {
      return $http.get('dashboard/getSectionsCreatedByProfessor', {
        // Note: for get requests we need to send data through params
        params: {
          professorID: payload.userId
        }
      })
      .then(res => {
        return {
          sections: res.data
        }
      })
      .catch(err => {
        err.message = "Could not get sections. Please try again later"
        throw err
      })
    },
    
    registerForSection(context, payload) {
      return $http.put('dashboard/registerForSection', payload)
      .then(res => {
        return res.data.section
      })
      .catch(err => {
        // Register failed: Add a message and propagate the error
        if (err.response.status == 520) {
          err.message = "You are already registered for this section"
        }
        else if (err.response.status == 530) {
          err.message = "Section does not exist"
        }
        else {
          err.message = "Could not register for the section. Please try again later"
        }
        throw err
      })
    },
    
    getSectionData(context, payload) {
      return $http.get('section/getSectionView', {
        // Note: for get requests we need to send data through params
        params: {
          sectionID: payload.sectionId
        }
      })
      .then(res => {
        // Format the response to match what frontend is expecting
        const section = res.data
        return {
          name: section.name,
          professor: {
            name: section.professor.name
          },
          students: section.registered_students,
          always_mandatory: section.always_mandatory,
          seating_layout: section.seating_layout,
          seating_arrangement: section.seating_arrangement,
          class_list: section.class_list,
          attendance_threshold: section.attendance_threshold
        }
      })
      .catch(err => {
        err.message = "Could not get section data. Please try again later"
        throw err
      })
    },

    saveAttendance(context, payload) {
      return $http.put('professor/pushNewAttendance', payload)
      .catch(err => {
        err.message = "Could not save attendance. Please try again later"
        throw err
      })
    },

    dropSection(context, payload) {
      return $http.post('section/dropSection', payload)
      .catch(err => {
        err.message = "Could not drop section. Please try again later"
        throw err
      })
    },

    deleteSection(context, payload) {
      return $http.post('professor/archiveSection', payload)
      .catch(err => {
        err.message = "Could not delete section. Please try again later"
        throw err
      })
    },

    clearStudents(context, payload) {
      return $http.put('professor/clearStudents', payload)
      .catch(err => {
        err.message = "Could not clear students. Please try again later"
        throw err
      })
    },
    
    getAttendanceData(context, payload) {
      return $http.get('professor/getAttendanceData', {
        // Note: for get requests we need to send data through params
        params: {
          sectionID: payload.sectionID
        }
      })
      .catch(err => {
        err.message = "Could not get attendance data. Please try again later"
        throw err
      })
    },
    
    updateSeatingArrangement(context, payload) {
      return $http.put('student/updateStudentSectionView', payload)
      .catch(err => {
        err.message = "Could not reserve the seat. Please try again later"
        throw err
      })
    }
  }
})

export default store;