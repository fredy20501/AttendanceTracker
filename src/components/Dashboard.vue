<template>
  <div>
    <h2>My Courses</h2>
    <br>
    
    <div>
      <!--
      Here we want to display the "tiles" which show the courses for this user
        => You can use the v-for attribute to loop through each course (stored in the variable courses). 
           You can check out the grid from the create section page for an example on how to use the v-for attribute.
        => You can use the css attribute 'display: inline-block' for each tile which will make them appear side-by-side until they run out of space in which case they will wrap to the next row.
           This will make them automatically display as rows which change depending on the width of the container they are in.
        => These tiles will redirect to a different page when we click on them, so you can use the v-on:click="" attribute to call the function which will do that.
           You can pass in arguments to the function using v-on:click="goToCourse(courseId)" so the function knows which course you have clicked on.
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
        I believe we need a field to enter a course name and a register button
          => You can add basic validation for the course name field for consistency. I don't think we need any special validation other than making it required.
          => The basic validation template is shown below. You can use the validation for the login page as an example.
      -->
      <ValidationObserver v-slot="{ handleSubmit, invalid }">
        <form @submit.prevent="handleSubmit(registerForCourse)">
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

      // This variable will hold the list of courses (each an object with specific information)
      courses: [],
      // Here is an example of what it might look like when it has data (this actual data depend on what the api returns and what we need to show on the UI)
      /*
      courses: [
        {
          _id: "5fafahlkip2",
          name: "SWE4103_FR01A_LEC",
          professor: "Dawn MacIsaac",
          always_mandatory: true
        }
        {
          _id: "5fafahlkip3",
          name: "CE8902_FR01B_LAB",
          professor: "Mr Computer",
          always_mandatory: false
        }
      ]
      */

      // This variable can be bound to the input field for the course name.
      // You can bind variables to field values using the v-model attribute.
      courseName: ""

    }
  },

  computed: {
    // Import the getters from the global store
    ...mapGetters(["isProfessor"]),
    
    // Use isProfessor/isStudent to display elements specific to student/professor
    isStudent: () => !this.isProfessor
  },

  // mounted is called when the page loads
  mounted() {
    
  },

  methods: {
    
    // This function will call the backend api to get the courses for the user
    // For students it should return the courses they are registered for
    // For professors it should return the courses they are teaching (i.e. the one they created)
    getCourses() {
      // Create a function in store.js which will make the proper api call 
      // (I have copied a basic one called getCoursesForUser and added comments to guide you ther)

      // Call that function defined in store.js using the following format:
      /*
      $store.dispatch('getCoursesForUser', {
        // put the data you are sending to the api here as key-value pairs. Ex:
        userId: '123456'
      })
      .then(res => {
        // Success!
        // The result is stored in res
        // Update the variable which contains the list of courses
      })
      .catch(err => {
        // Error! (this is the default code I use to log the error and show a message to the user)
        console.log(err);
        // Show a notification with the error message
        if (err.message) {
          vue.$notify({ 
            title: err.message, 
            type: err.type ?? 'error'
          });
        }
      })
      */
    },

    // This function will redirect to the course view for the specified course
    goToCourse(courseId) {
      courseId

      // Before redirecting to the course view page we need a way to tell the page what course we want to see.
      // To make it easy, we will use a global variable defined in the vuex store.
      // I have already defined the variable with a basic getter and setter function
      // You can update the courseId by using the mutation function like so: 
      //    this.$store.commit('mutationFunction', data)

      // The course view page will then be able to get that data from the store

      // You can then redirect to the page using 
      // this.$router.push('pathOfThePage') or this.$router.push({name: 'nameOfThePage'})
    },


    // This function will make the proper api call to register the student to the specified course
    registerForCourse() {
      // Get the name of the course from the Course Name field

      // Create a function in store.js which will make the proper api call 
      // (I have copied a basic one called getCoursesForUser and added comments to guide you ther)
      
      // Call that function defined in store.js using the following format:
      /*
      $store.dispatch('courseRegister', {
        // put the data you are sending to the api here as key-value pairs. Ex:
        userId: '123456'
      })
      .then(res => {
        // Success!
        // The result is stored in res
        // Add the course you have just registered for to the list of courses so it shows up on the UI
        // (hopefully the api should return the info of the course you have just registered for, so you can update the list of courses with that information)
      })
      .catch(err => {
        // Error! (this is the default code I use to log the error and show a message to the user)
        console.log(err);
        // Show a notification with the error message
        if (err.message) {
          vue.$notify({ 
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