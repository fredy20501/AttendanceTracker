<template>
  <div>
    <h2>{{courseName}}</h2>
    <br>

    <div style="text-align:left">
      <div>
        <b>Date:</b> <span>{{currentDateAndTime}}</span>
      </div>
      <div>
        <b>Professor:</b> <span>{{professor}}</span>
      </div>
      <div>
        <b>Attendance Type:</b> <span>{{courseType}}</span>
      </div>
    </div>

    <div class="grid-layout">
      <table v-if="classLayout.length>0">
        <tbody>
          <tr>
            <td :colspan="classLayout[0].length+1">
              <div style="font-weight:bold">
                Click to mark absent
              </div>
              <br>
            </td>
          </tr>
          <!-- First row shows the column number -->
          <tr>
            <td></td>
            <td v-for="(column, j) in classLayout[0]" v-bind:key="j">
              {{j+1}}
            </td>
          </tr>
          <!-- Loop through all rows of the layout -->
          <tr v-for="(row, i) in classLayout" v-bind:key="i">
            <!-- First column shows the row number -->
            <td>{{i+1}}</td>
            <!-- Loop through each seat in the row -->
            <td v-for="(seat, j) in row" v-bind:key="j">
              <div
                @click="selectSeat(i,j)"
                v-bind:class="{
                  'seat': true,
                  'type-0': seat.type==0,
                  'type-1': seat.type==1,
                  'type-2': seat.type==2,
                  'type-3': seat.type==3,
                  'selected': isSelected(i,j),
                  'green-selected': seat._id==getUser.id
                }"
              >
                <!-- Show the user's name in the new selected seat -->
                {{isSelected(i,j) ? getUser.name : seat.name}}
              </div>
            </td>
          </tr>
          <!-- Put a label as final row to represent the front of the class -->
          <tr>
            <td></td>
            <td :colspan="classLayout[0].length">
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
        <div class="seat type-2"></div>
      </div>
      <div>
        <label>Extended<br>Access</label>
        <div class="seat type-3"></div>
      </div>
      <div>
        <label>Open<br>Access</label>
        <div class="seat type-1"></div>
      </div>
      <div>
        <label>Locked</label>
        <div class="seat type-0"></div>
      </div>
      <div>
        <label>Current<br>Seat</label>
        <div class="seat green-selected"></div>
      </div>
      <div>
        <label>New<br>Seat</label>
        <div class="seat selected"></div>
      </div>
    </div>

    <br>
    <br>

    <!-- 
      We will need a "Save Seat" button to reserve the selected seat.
      When clicked it will call a function so we can use v-on:click="" to do that
     -->
    <button type="button" class="blue button-width" :disabled="isSelected(-1,-1)" @click="submitSeatSelection">
      Update Seat
    </button>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'StudentSectionView',
  data() {
    return {

      currentDateAndTime: '',
      
      // Course data
      courseName: '',
      professor: '',
      registeredStudents: [],
      mandatory: false,

      // This variable will store the 2D array of the layout, where each item contains a number representing 
      // the type of seat (0=locked, 1=open access, etc) and the name of the student siting in it (if any).
      classLayout: [],

      // Store row+column of the currently selected seat
      selectedSeat: {
        row: -1,
        column: -1
      },
    }
  },

  computed: {
    // Import the getters from the global store
    ...mapGetters(['getUser']),

    courseType: function() {
      return this.mandatory ? 'Mandatory' : 'Opt In'
    },
    // The section id for this page is given as a route parameter
    // i.e. to get to this page from another page we need to also pass the section id like so:
    //      this.$router.push({name: 'section', params: {id: '123EF41'}})
    courseId: function() {
      return this.$route.params.id
    }
  },

  // created is called when the page loads
  created() {
    this.setCurrentDate()
    this.getSectionData()
  },

  methods: {

    // Set the current date & time formatted as a string
    setCurrentDate() {
      this.currentDateAndTime = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(new Date)
    },

    // Call the backend api to get the course information (given the course id in the store)
    getSectionData() {
      this.$store.dispatch('getSectionData', {
        courseId: this.courseId
      })
      .then(res => {
        // Set the page values
        this.courseName = res.name
        this.professor = res.professor.name
        this.registeredStudents = res.students
        this.mandatory = res.always_mandatory
        // Merge the seat type & student info into the full class layout
        this.classLayout = this.mergeStudentSeatLayouts(res.seating_layout.layout, res.seating_arrangement)
      })
      .catch(err => {
        console.log(err);
        // Show a notification with the error message
        if (err.message) {
          this.$notify({ 
            title: err.message, 
            type: err.type ?? 'error'
          });
        }
      })
    },

    // Merge the seat layout (seat types) with the seating arrangement (student positions) into one layout
    // Assumes that both 2d arrays are the exact same size
    // Returns the merged layout as a 2d array
    mergeStudentSeatLayouts(seatLayout, studentLayout) {
      // Copy the student layout
      var mergedLayout = JSON.parse(JSON.stringify(studentLayout))
      // Loop through the student layout, adding the seat type to each seat
      const numRows = mergedLayout.length
      const numColumns = mergedLayout[0].length
      for (var i=0; i<numRows; i++) {
        for (var j=0; j<numColumns; j++) {
          var seatType = seatLayout[i][j]
          var student = mergedLayout[i][j]
          if (student == null) {
            // No student in this seat
            mergedLayout[i][j] = {name: '', type: seatType}
          }
          else {
            // There is a student, just add the seat type
            student.type = seatType
          }
        }
      }
      return mergedLayout
    },

    // Returns true if the seat at the given row+column is selected
    isSelected(row, column) {
      return this.selectedSeat.row === row && this.selectedSeat.column === column
    },
    
    // Returns true if the seat at the given row+column is the current seat of the user
    isCurrent(row, column) {
      const seat = this.classLayout[row][column]
      return seat._id==this.getUser.id
    },

    // This function will be called when a seat is selected
    selectSeat(row, column) {
      // TODO!! -> finish this function

      // If that seat is already selected, unselect it
      if (this.isSelected(row, column) || this.isCurrent(row, column)) {
        this.selectedSeat.row = -1
        this.selectedSeat.column = -1
        return
      }

      // Get the seat type based on the row+column
      const seatType = this.classLayout[row][column].type
      console.log(seatType)

      // Note that the user should not be able to select a seat which already has a student sitting in it, so we should check that
      // Note that the user can only select "selected access" or "extended access" seats for reservation (can't select locked or open access seats)

      // We can use a variable to store the currently selected seat so we always know which seat is selected (maybe store the row and column of that seat?)

      // You can add the name of the user in the selected seat to further emphasize the selection
      //   -> You can get the name of the user using the getUser function: `this.getUser.name`

      // When a seat is successfuly selected, you can add the css class 'selected' to it which will show a red outline (it is defined in the css of App.vue)
      // Tip: you can use the variable which stores the selected seat to dynamically add the class to a seat in the grid if it matches the selected seat 
      // (you can do this in the html similar to how I add the seat color css class (type-1, type-2, ...) based on the number of the seat type)
      this.selectedSeat.row = row
      this.selectedSeat.column = column
    },

    // Returns the new seating arrangement
    getNewSeatingArrangement() {
      // TODO!! -> finish this function

      // Loop through the classLayout and create a new 2d array which contains
      // the student IDs of the student in each seat (or null if no student)

      // The 2d array should look like this
    },

    // Calls the proper API to reserve the selected seat for the user
    submitSeatSelection() {
      // TODO!! -> finish this function

      // Get the currently selected seat (make sure there is one)
      // Make sure the selected seat is not locked, not open access, and not already taken by someone else 
      //   -> (this should already be taken care of in the selectSeat() function but it is good to double check)

      // Create a new 2d array showing the new position of all students
      const newSeatingArrangement = this.getNewSeatingArrangement()

      this.$store.dispatch('reserveSeat', {
        // The API expects the courseid and the new seating arrangment (a 2d array showing the student positions)
        courseID: this.courseId,
        seatingArrangement: newSeatingArrangement
      })
      .then(res => {
        console.log(res)

        // Success!
        // The result (if any) is stored in res
        // We can clear the selection (i.e. the seat doesn't show as being selected anymore) and refresh the grid 
        // to see the new layout (the user's name should now be in the right position)
        //  -> You can call the getSectionData() function again
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
  }
}
</script>

<style lang="scss" scoped >
.grid-layout {
  margin: 10px 0;
  height: auto;
  max-height: 450px;
}
.grid-layout .seat {
  font-size: 0.7em;
  width: 100px;
  height: 45px;
  overflow: auto;
  font-weight: bold;
}

.button-width {
  width: 300px;
}
.green-selected {
  border: 3px solid #22a222;
}
</style>