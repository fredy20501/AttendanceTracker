<template>
  <div>
    <!-- Replace the title with the name of the course 
    (tip: you can use double brackets {{var}} to reference a data variable) -->
    <h2>Name of the course</h2>
    <br>
    
    <div>
    <!--
      Here we want to display the layout as a grid
        => I have copied the grid & legend from the create section page (with minor modifications) so you can use it as starting point
        => We will need to add the name of the student in each seat
        => We want to be able to select a seat by clicking on it, so we can use v-on:click="" to trigger a function when we click a seat.
           You can pass in arguments to the function using v-on:click="myFunction(param1, param2)" so the function can know which seat you clicked.
      -->
      <div class="grid-layout">
        <table v-if="layout.length>0">
          <tbody>
            <!-- First row shows the column number -->
            <tr>
              <td></td>
              <td v-for="(column, j) in layout[0]" v-bind:key="j">
                {{j+1}}
              </td>
            </tr>
            <!-- Loop through all rows of the layout -->
            <tr v-for="(row, i) in layout" v-bind:key="i">
              <!-- First column shows the row number -->
              <td>{{i+1}}</td>
              <!-- Loop through each seat in the row -->
              <td v-for="(seat, j) in row" v-bind:key="j">
                <div
                  v-bind:class="{
                    'seat': true,
                    'type-0': seat.type==0,
                    'type-1': seat.type==1,
                    'type-2': seat.type==2,
                    'type-3': seat.type==3
                  }"
                ></div>
              </td>
            </tr>
            <!-- Put a label as final row to represent the front of the class -->
            <tr>
              <td></td>
              <td :colspan="layout[0].length">
                <div style="margin: 10px auto 0 auto; padding: 0 10px; max-width: 200px;" class="border">
                  Whiteboard
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="legend">
        <h3>Seat Legend</h3>
        <div>
          <label>Selected<br>Access</label>
          <div v-bind:class="{'seat': true, 'type-2': true}"></div>
        </div>
        <div>
          <label>Extended<br>Access</label>
          <div v-bind:class="{'seat': true, 'type-3': true}"></div>
        </div>
        <div>
          <label>Open<br>Access</label>
          <div v-bind:class="{'seat': true, 'type-1': true}"></div>
        </div>
        <div>
          <label>Locked</label>
          <div v-bind:class="{'seat': true, 'type-0': true}"></div>
        </div>
      </div>
    </div>

    <!-- 
      We will need a "Save Seat" button to reserve the selected seat.
      When clicked it will call a function so we can use v-on:click="" to do that
     -->

  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'StudentCourseView',
  data() {
    return {

      // This variable will store the 2D array of the layout, where each item contains a number representing 
      // the type of seat (0=locked, 1=open access, etc) and the name of the student siting in it (if any).
      layout: [],
      // Here is an example of what the data might look like (this is just and example, 
      // it will depend on what data you need to do what we want to do
      /*
      layout: [
        // First row
        [
          {student: 'John A', type: 2},
          {student: null,     type: 2},
          {student: 'John C', type: 2},
          {student: null,     type: 2},
        ],
        // Second row
        [
          {student: null, type: 2},
          {student: null, type: 2},
          {student: null, type: 2},
          {student: null, type: 2},
        ],
        // Third row
        [
          {student: null,     type: 2},
          {student: 'John F', type: 3},
          {student: 'John G', type: 3},
          {student: 'John H', type: 3},
        ],
      ]
      */

      // You will probably want more variables to store things like the course name, the professor's name, etc. 
      // (depends on what you want to display in the UI)
    }
  },

  computed: {
    // Import the getters from the global store
    ...mapGetters(['getUser'])
  },

  methods: {

    // This function will call the backend api to get the course information, given the course id
    getCourse() {
      // The course id is determined by which course you clicked on from the dashboard which got you to this page
      // To make it easy, the dashboard will set the courseId in the global store so you can access it
      // using `this.$store.getCourse` (for testing you can set it manually or hardcode it since the dashboard
      // will be done in a different git branch)

      // Create a function in store.js which will make the proper api call 
      // (I have copied a basic one called getCourse and added comments to guide you there)
      // Call that function defined in store.js using the following format:
      /*
      $store.dispatch('getCourse', {
        // put the data you are sending to the api here as key-value pairs. Ex:
        courseId: '123456'
      })
      .then(res => {
        // Success!
        // The result is stored in res
        // Update the variable(s) which contains the course information
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

    // This function will be called when a seat is selected
    selectSeat(row, column) {
      row
      column

      // Note that the user should not be able to select a seat which already has a student sitting in it, so we should check that
      // Note that the user can only select "selected access" or "extended access" seats for reservation (can't select locked or open access seats)

      // We can use a variable to store the currently selected seat so we always know which seat is selected (maybe store the row and column of that seat?)

      // You can add the name of the user in the selected seat to further emphasize the selection
      //   -> You can get the name of the user using the getUser function: `this.getUser.name`

      // When a seat is successfuly selected, you can add the css class 'selected' to it which will show a red outline (it is defined in the css of App.vue)
      // Tip: you can use the variable which stores the selected seat to dynamically add the class to a seat in the grid if it matches the selected seat 
      // (you can do this in the html similar to how I add the seat color css class (type-1, type-2, ...) based on the number of the seat type)
    },

    // Calls the proper API to reserve the selected seat for the user
    submitSeatSelection() {
      // Get the currently selected seat (make sure there is one)
      // Make sure the selected seat is not locked, not open access, and not already taken by someone else 
      //   -> (this should already be taken care of in the selectSeat() function but it is good to double check)

      // Create a function in store.js which will make the proper api call 
      // (I have copied a basic one called reserveSeat and added comments to guide you there)

      // Call that function defined in store.js using the following format:
      /*
      $store.dispatch('reserveSeat', {
        // put the data you are sending to the api here as key-value pairs. Ex:
        userId: '123456'
        // I think the plan for the API is to give the student id, the course id, and the coordinate in the layout for the selected seat
      })
      .then(res => {
        // Success!
        // The result is stored in res
        // We can clear the selection (i.e. the seat doesn't show as being selected anymore) and refresh the grid 
        // to see the new layout (the user's name should now be in the right position)
        //  -> You can call the getCourse() function again
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
  }
}
</script>

<style lang="scss" scoped >
</style>