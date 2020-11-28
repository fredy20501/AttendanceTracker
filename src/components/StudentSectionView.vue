<template>
<transition name="fade" mode="out-in">
  <Loading v-if="loading"/>

  <div v-else>
    <h2>{{sectionName}}</h2>
    <br>

    <div style="text-align:left">
      <div>
        <b>Date:</b> <span>{{currentDateAndTime}}</span>
      </div>
      <div>
        <b>Professor:</b> <span>{{professor}}</span>
      </div>
      <div>
        <b>Attendance Type:</b> <span>{{sectionType}}</span>
      </div>
    </div>

    <div class="grid-layout">
      <table v-if="classLayout.length>0" aria-label="Classroom Layout">
        <tbody>
          <tr>
            <td :colspan="classLayout[0].length+1">
              <div style="font-weight:bold">
                Click to select a new seat
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
              <button
                type="button"
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
              </button>
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

    <button type="button" class="blue button-width" :disabled="isSelected(-1,-1)" @click="submitSeatSelection">
      Update Seat
    </button>

    <br>
    <br>
    <hr class="divider">
    <h2>Danger Zone</h2>

    <div class="double-column danger-zone">
      <div>
        <div>
          <b>Drop section</b><br>
          Unregister yourself from this section. 
          You may register again but your seat will be lost.
        </div>
        <div>
          <SpinnerButton 
            color="red"
            label="Drop Section"
            type="button"
            width="300px"
            height="30px"
            :onClick="confirmDropSection"
            :disabled="$wait.waiting('dropSection')"
            :loading="$wait.waiting('dropSection')"
          />
        </div>
      </div>
    </div>

  </div>
</transition>
</template>

<script>
import { mapGetters } from 'vuex'
import SpinnerButton from '@/components/SpinnerButton.vue'

export default {
  name: 'StudentSectionView',
  components: {
    SpinnerButton
  },

  data() {
    return {
      // Hide the page until data is loaded
      loading: true,

      currentDateAndTime: '',
      
      // Section data
      sectionName: '',
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

    sectionType: function() {
      return this.mandatory ? 'Mandatory' : 'Opt In'
    },
    // The section id for this page is given as a route parameter
    // i.e. to get to this page from another page we need to also pass the section id like so:
    //      this.$router.push({name: 'section', params: {id: '123EF41'}})
    sectionId: function() {
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

    // Call the backend api to get the section information (given the section id in the store)
    getSectionData() {
      this.$store.dispatch('getSectionData', {
        sectionId: this.sectionId
      })
      .then(res => {
        // Set the page values
        this.sectionName = res.name
        this.professor = res.professor.name
        this.registeredStudents = res.students
        this.mandatory = res.always_mandatory
        
        // Merge the seat type & student info into the full class layout
        this.classLayout = this.mergeStudentSeatLayouts(res.seating_layout.layout, res.seating_arrangement)

        // Show the page once data is loaded
        this.loading = false
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

    // Returns true if the given seat is selectable, false otherwise
    // (A seat is not selectable if it is locked, open-access, or a student is already in it)
    isSelectableSeat(row, column) {
      const seat = this.classLayout[row][column]
      var selectable = true;
      // Can't select locked or open-access seats
      if (seat.type == 0 || seat.type == 1) selectable = false
      // Can't select a seat which already has a student
      if (seat.name != "") selectable = false
      return selectable
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

      // Make sure the seat is selectable
      if (!this.isSelectableSeat(row, column)) return

      // Select the seat
      this.selectedSeat.row = row
      this.selectedSeat.column = column
    },

    // Returns the new seating arrangement (2d array of student Ids)
    getNewSeatingArrangement() {
      var newLayout = new Array()

      for (var i = 0; i < this.classLayout.length; i++)  {
        var newRow = new Array()
        for (var j = 0; j < this.classLayout[0].length; j++)  {
          const seat = this.classLayout[i][j]
          // Add the id if seat is not empty (but don't add the current seat)
          if (seat.name != "" && !this.isCurrent(i, j)) {
            newRow.push(seat._id)
          }
          // Add the new seat (i.e. the selected one)
          else if (this.isSelected(i, j))  {
            newRow.push(this.getUser.id)
          }
          // Empty seat
          else  {
            newRow.push(null)
          }
        }
        newLayout.push(newRow)
      }
      return newLayout
    },

    // Calls the proper API to reserve the selected seat for the user
    submitSeatSelection() {
      // Don't do anything if no seat is selected or the selected seat is not valid
      if (this.isSelected(-1,-1) || !this.isSelectableSeat(this.selectedSeat.row, this.selectedSeat.column)) {
        return;
      }

      // Create a new 2d array showing the new position of all students
      const newSeatingArrangement = this.getNewSeatingArrangement()

      this.$store.dispatch('updateSeatingArrangement', {
        sectionID: this.sectionId,
        seatingArrangement: newSeatingArrangement
      })
      .then(() => {
        // Refresh the grid
        this.getSectionData()

        // Show success notification
        this.$notify({ 
          title: "Seat Updated Successfully", 
          type: "success"
        });

        // Clear the seat selection
        this.selectedSeat.row = -1
        this.selectedSeat.column = -1
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

    confirmDropSection() {
      this.$dialog.confirm('Are you sure?')
      .then(() => {
        this.dropSection()
      })
      .catch(() => {})
    },

    dropSection() {
      // Start the loading spinner
      this.$wait.start('dropSection')

      this.$store.dispatch('dropSection', {
        sectionID: this.sectionId,
        studentID: this.getUser.id
      })
      .then(() => {
        // Redirect to home page
        this.$router.push({name: 'home'})
        // Show success notification
        this.$notify({
          title: 'Section dropped successfully!',
          type: 'success'
        })
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
      .finally(() => {
        // Stop the loading spinner
        this.$wait.end('dropSection')
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