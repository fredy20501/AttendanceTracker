<template>
  <div>
    <h2>My Sections</h2>
    <br>
    
    <div>
      <!--
      Here we want to display the "tiles" which show the sections for this user
        => You can use the v-for attribute to loop through each section (stored in the variable sections). 
           You can check out the grid from the create section page for an example on how to use the v-for attribute.
        => You can use the css attribute 'display: inline-block' for each tile which will make them appear side-by-side until they run out of space in which case they will wrap to the next row.
           This will make them automatically display as rows which change depending on the width of the container they are in.
        => These tiles will redirect to a different page when we click on them, so you can use the v-on:click="" attribute to call the function which will do that.
           You can pass in arguments to the function using v-on:click="goToSection(sectionId)" so the function knows which section you have clicked on.
      -->
    </div>

    <!-- Since this page will be used for both students and professors, we will show the specific buttons depending on whether the user is a student or prof -->
    <div v-if="isProfessor">
      <!--
        Here you can put the buttons for professor
        I think we only need the Create Section button which should redirect to the create section page)
          => You can redirect to a different page by using: $router.push('pathOfThePage') or $router.push({name: 'nameOfThePage'})
      -->
    </div>

    <div v-if="isStudent">
      <!--
        Here you can put the buttons for students
        I believe we need a field to enter a section name and a register button
          => You can add basic validation for the section name field for consistency. I don't think we need any special validation other than making it required.
          => The basic validation template is shown below. You can use the validation for the login page as an example.
      -->
      <ValidationObserver v-slot="{ handleSubmit, invalid }">
        <form @submit.prevent="handleSubmit(registerForSection)">
          <button :disabled="invalid"></button>
        </form>
      </ValidationObserver>
    </div>
    
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Dashboard",

  data() {
    return {

      // This variable will hold the list of sections (each an object with specific information)
      sections: [],
      // Here is an example of what it might look like when it has data (this actual data depend on what the api returns and what we need to show on the UI)
      /*
      sections: [
        {
          _id: "5fafahlkip2",
          name: "SWE4103_FR01A_LEC",
          professor: "Dawn MacIsaac",
          always_mandatory: true
        },
        {
          _id: "5fafahlkip3",
          name: "CE8902_FR01B_LAB",
          professor: "Mr Computer",
          always_mandatory: false
        }
      ]
      */

      // This variable can be bound to the input field for the section name.
      // You can bind variables to field values using the v-model attribute.
      sectionName: ""

    }
  },

  computed: {
    // Import the getters from the global store
    ...mapGetters(["isProfessor"]),
    
    // Use isProfessor/isStudent to display elements specific to student/professor
    isStudent: () => !this.isProfessor,
  },

  // created is called when the page loads
  created() {
    // We want to fetch the sections as soon as the page loads
    this.getSections()
  },

  methods: {
    
    // This function will call the backend api to get the sections for the user
    // For students it should return the sections they are registered for
    // For professors it should return the sections they are teaching (i.e. the one they created)
    getSections() {
      // Create a function in store.js which will make the proper api call 
      // (I have copied a basic one called getSectionsForUser and added comments to guide you ther)

      // Call that function defined in store.js using the following format:
      /*
      this.$store.dispatch('getSectionsForUser', {
        // put the data you are sending to the api here as key-value pairs. Ex:
        userId: '123456'
      })
      .then(res => {
        // Success!
        // The result is stored in res
        // Update the variable which contains the list of sections
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
      */
    },

    // This function will redirect to the section view for the specified section
    goToSection(sectionId) {
      sectionId

      // Note that we need to tell the page which section we want to see
      // To do that we will give it the id as part of the url using the router's params option

      // You can redirect to the page and give the id as a parameter as follows:
      // this.$router.push({name: 'nameOfThePage', params: {id: variableHoldingTheSectionId }})

      // Note: you won't actually be able to go to the page until it is all integrated together
    },


    // This function will make the proper api call to register the student to the specified section
    registerForSection() {
      // Get the name of the section from the section Name field

      // Create a function in store.js which will make the proper api call 
      // (I have copied a basic one called getSectionsForUser and added comments to guide you ther)
      
      // Call that function defined in store.js using the following format:
      /*
      this.$store.dispatch('registerForSection', {
        // put the data you are sending to the api here as key-value pairs. Ex:
        userId: '123456'
      })
      .then(res => {
        // Success!
        // The result is stored in res
        // Add the section you have just registered for to the list of sections so it shows up on the UI
        // (hopefully the api should return the info of the section you have just registered for, so you can update the list of sections with that information)
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
      */
    }
  },
}
</script>

<style lang="scss" scoped >

</style>