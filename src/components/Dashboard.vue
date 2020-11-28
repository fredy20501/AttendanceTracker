<template>
<transition name="fade" mode="out-in">
  <Loading v-if="loading"/>

  <div v-else>
    <h2>My Sections</h2>
    <br>
    
    <div>
      <div v-for="(section,i) in sections" v-bind:key="i" style=" display: inline-block"> 
        <button class="tile" v-on:click="goToSection(section._id)">
          {{section.name}}

          <!-- Only show the professor's name for the student's dashboard -->
          <span v-if="!isProfessor">
            <hr>
            <b>Professor:</b> {{section.professor.name}}
          </span>

          <hr>
          <b>Attendance Type:</b> {{attendanceType(section)}}
          <br>
        </button>
      </div>
    </div>
    
    <br>
    <br>

    <div class="column">
      <div v-if="isProfessor">
        <button type="button" @click="$router.push('create-section')">Create Section</button>
      </div>

      <div v-else>
        <div v-if="hideRegistration">
          <button v-on:click="hideRegistration = false">Register for New Section</button>
        </div>
        <div v-else>
          <ValidationObserver name="Section Name" rules="required|alpha_dash" v-slot="{errors}">
            <label for="sectionName">Section Name</label><br>
            <input id="sectionName" type="text" placeholder="Section Name" v-model="sectionName">
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationObserver>
          <br><br>
          <ValidationObserver v-slot="{ handleSubmit }">
            <form @submit.prevent="handleSubmit(registerForSection)">
              <button>Register</button>
            </form>
          </ValidationObserver>
        </div>

      </div>
    </div>
    
  </div>
</transition>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Dashboard",

  data() {
    return {
      // Hide the page until data is loaded
      loading: true,

      // This variable will hold the list of sections (each an object with specific information)
      sections: [],

      // This variable can be bound to the input field for the section name.
      // You can bind variables to field values using the v-model attribute.
      sectionName: "",

      hideRegistration:true

    }
  },

  computed: {
    // Import the getters from the global store
    ...mapGetters(["getUser", "isProfessor"]),

    
  },

  // created is called when the page loads
  created() {
    // We want to fetch the sections as soon as the page loads
    this.getSections()
  },

  methods: {

    // Return a string representing the attendance type of the given section
    attendanceType(section) {
      return section.always_mandatory ? 'Mandatory' : 'Opt in'
    },

      //comparison function for Sections so they can be sorted
    compSection(firstEl, secondEl){
      return firstEl.name.localeCompare(secondEl.name);
    },

    // This function calls the backend api to get the sections for the user
    // For students it returns the sections they are registered for
    // For professors it returns the sections they are teaching (i.e. the one they created)
    getSections() {
      // Call the appropriate function defined in store.js to send a request to the api
      const functionName = this.isProfessor ? 'getSectionsForProfessor' : 'getSectionsForStudent'
      this.$store.dispatch(functionName, {
        userId: this.getUser.id
      })
      .then(res => {
        this.sections = res.sections.sort(this.compSection);

        // Show the page once data is loaded
        this.loading = false
      })
      .catch(err => {
        console.log(err);
        if (err.message) {
          this.$notify({ 
            title: err.message, 
            type: err.type ?? 'error'
          });
        }
      })
    },

    // This function redirects to the section view for the specified section
    goToSection(sectionId) {
      this.$router.push({name: 'section', params: {id: sectionId }})
    },

    // This function will make the proper api call to register the student to the specified section
    registerForSection() {
      this.$store.dispatch('registerForSection', {
        studentID: this.getUser.id,
        sectionName: this.sectionName
      })
      .then(res => {
        // Add the new section to the UI
        this.sections.push(res)
        // Clear the field
        this.sectionName = ""
        this.hideRegistration = true
        // Show notification
        this.$notify({ 
          title: "Registered successfully", 
          type: 'success'
        });
      })
      .catch(err => {
        // Error! (this is the default code I use to log the error and show a message to the user)
        console.log(err);
        // Show a notification with the error message
        if (err.message) {
          this.$notify({ 
            title: err.message, 
            type: err.type ?? 'error'
          });
        }
      })
      
    }
  },
}
</script>

<style lang="scss" scoped >

.tile {
  display: inline-block;
  width: 250px;
  margin: 10px;
  padding: 10px 0;
  height: auto;
  font-weight: normal;
}

</style>