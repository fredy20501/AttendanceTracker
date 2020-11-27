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

    <br>

    <table style="width:100%">
      <tbody>
        <tr class="align-bottom">
          <td class="button-width">
            <button type="button" @click="editSection">
              Edit Section
            </button>
          </td>
          <td></td>
          <td class="button-width">
            <button type="button" @click="refreshPage">
              Refresh Grid
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="grid-layout">
      <table v-if="classLayout.length>0" aria-label="Classroom Layout">
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
              <button
                type="button"
                @click="toggleSeatAttendance(i,j)"
                v-bind:class="{
                  'seat': true,
                  'type-0': seat.type==0,
                  'type-1': seat.type==1,
                  'type-2': seat.type==2,
                  'type-3': seat.type==3,
                  'selected': seat.absent===true
                }"
              >{{seat.name}}</button>
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
        <label>Absent</label>
        <div class="seat type-2 selected"></div>
      </div>
    </div>

    <br>

    <div>
      <h3>Statistics</h3>
      <div v-if="showStats" style="display: inline-block; vertical-align: top; width:250px; margin: 5px">
        <PieChart :chartData="pieChartData" :options="pieChartOptions"/>
      </div>
      <div style="display: inline-block; text-align:left; padding-top: 8px; margin: 5px">
        <div>
          Students present: {{numPresent}} <span v-if="showStats">({{percentPresent}}%)</span>
        </div>
        <div v-if="showStats">
          Students absent: {{numAbsent}} <span v-if="showStats">({{percentAbsent}}%)</span>
        </div>
        <br>
        <button class="button-width" type="button" @click="exportData">
          Export Attendance Data
        </button>
      </div>
    </div>

    <br>
    <br>

    <SpinnerButton
      class="blue"
      label="Submit Attendance"
      width="300px"
      height="30px"
      type="submit"
      :onClick="submitAttendance"
      :disabled="$wait.waiting('submitAttendance')"
      :loading="$wait.waiting('submitAttendance')"
    />

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SpinnerButton from './SpinnerButton'
import PieChart from './PieChart'
import XLSX from 'xlsx'

export default {
  name: 'ProfessorCourseView',
  components: {
    SpinnerButton,
    PieChart
  },

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

      pieChartOptions: {
        legend: {
          labels: {
            fontSize: 17.6,
            fontColor: 'black',
            fontFamily: "'Avenir', 'Helvetica', 'Arial', 'sans-serif'"
          }
        }
      }
    }
  },
  
  computed: {
    // Import the getters from the global store
    ...mapGetters(['getUser']),

    showStats: function() {
      return this.mandatory && this.registeredStudents.length>0
    },
    numPresent: function() {
      // Calculate the number of students present by checking the absent status of each seat
      var numPresent = 0
      this.classLayout.forEach(row => {
        row.forEach(seat => {
          if (seat.absent === false) numPresent++
        })
      })
      return numPresent
    },
    numAbsent: function() {
      return this.registeredStudents.length - this.numPresent
    },
    percentPresent: function() {
      return Math.round(100*this.numPresent/this.registeredStudents.length)
    },
    percentAbsent: function() {
      return 100 - this.percentPresent
    },
    courseType: function() {
      return this.mandatory ? 'Mandatory' : 'Opt In'
    },

    // The course id for this page is given as a route parameter
    // i.e. to get to this page from another page we need to also pass the course id like so:
    //      this.$router.push({name: 'section', params: {id: '123EF41'}})
    courseId: function() {
      return this.$route.params.id
    },

    pieChartData: function() {
      return {
        labels: ['Present', 'Absent'],
        datasets: [{
          backgroundColor: ['#24a0ee', '#cc0000'],
          hoverBackgroundColor: ['#1e87c9', '#ba0000'],
          data: [this.numPresent, this.numAbsent]
        }]
      }
    }
  },

  // created is called when the page loads
  created() {
    this.setCurrentDate()
    this.getSectionData()
  },

  methods: {
    
    // Refresh the data on the page (date & grid)
    refreshPage() {
      this.setCurrentDate()
      this.getSectionData()
      this.$notify({
        title: 'Refreshed!',
        type: 'info'
      })
    },

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
            // There is a student, just add the seat type & default absence status
            student.type = seatType
            student.absent = false

            // Keep the absent cells as absent if it is absent in the current class layout
            // (this is to allow refreshing without losing the absences)
            var oldSeat = this.classLayout?.[i]?.[j]
            if (oldSeat != null) student.absent = oldSeat.absent
          }
        }
      }
      return mergedLayout
    },

    // Toggle the attendance (present or absent) of the seat at the specified row & column
    toggleSeatAttendance(row, column) {
      var student = this.classLayout[row][column]
      // Check if there is a student in the seat
      if (student.name != '') {
        // Toggle the absent status
        student.absent = !student.absent
      }
    },

    // Return an array of the student Ids for the absent students
    getAbsentStudents() {
      var studentIds = []
      // Loop through the class layout, adding absent students to the array
      this.classLayout.forEach(row => {
        row.forEach(seat => {
          if (seat.absent===true) studentIds.push(seat._id)
        })
      })
      return studentIds
    },
    
    // Calls the proper API to submit the attendance
    submitAttendance() {
      // Start the loading spinner
      this.$wait.start('submitAttendance')

      const absentStudents = this.getAbsentStudents()
      console.log(absentStudents)

      this.$store.dispatch('saveAttendance', {
        courseID: this.courseId,
        absent_students: absentStudents,
        mandatory: this.mandatory
      })
      .then(() => {
        // Success!
        this.$notify({
          title: 'Attendance saved!',
          type: 'success'
        })
        // Stop the loading spinner
        this.$wait.end('submitAttendance')
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
        // Stop the loading spinner
        this.$wait.end('submitAttendance')
      })
    },

    // Go to the create section page to edit the course
    editSection() {
      // Go to the edit section page using the router
      // We send the courseId as a parameter so that the page knows we want to edit this course
      this.$router.push({ name: 'createSection', params: {id: this.courseId} })
    },

    // Export the attendance data for this course as an excel file
    exportData() {
      this.$store.dispatch('getAttendanceData', {
        courseID: this.courseId
      })
      .then(res => {
        var attendanceData = res.data.attendanceData
        var classList = res.data.classList
        var registeredStudents = res.data.registeredStudents

        // Don't do anything if there is no attendance data or no students
        if (attendanceData.length == 0) {
          this.$notify({ 
            title: 'No attendance data to export', 
            type: 'warn'
          });
          return
        }

        // 2d array that will store the data we want to download as excel file
        var excelData = []

        // Build header row
        var headers = []
        // First column is student name
        headers.push('Student Name')
        // Other columns are date of each attendance
        attendanceData.forEach(attendance => {
          // Format date as dd/mm/yyy, hh:mm AM/PM
          const strDate = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
          }).format(new Date(attendance.date))
          // Add date to the header
          headers.push(strDate)
        })
        excelData.push(headers)

        // Get full list of students in the course (registered + classList)
        // Merge the class list into the registered students list (no duplicates)
        classList.forEach(student => {
          // Add the student if it isn't already in the list or registered students
          const addStudent = -1 == registeredStudents.findIndex(regStudent => {
            return regStudent.email === student.email
          })
          // Add identifier so we know it came from class list (in this case the student will always be marked absent by default)
          student.isFromClassList = true
          if (addStudent) registeredStudents.push(student)
        })

        // Build rows of excel file (each student)
        registeredStudents.forEach(student => {
          // Build this student's attendance for each day
          var studentAttendance = []
          // First column is the name
          studentAttendance.push(student.name)
          // Other columns are X if absent, blank if present
          attendanceData.forEach(attendance => {
            var isPresent = -1 == attendance.absent_students.findIndex(abStudent => {
              return abStudent.email === student.email
            })
            // If attendance was mandatory, add class list students as absent by default
            if (isPresent && attendance.mandatory && student.isFromClassList) {
              isPresent = false
            }
            // Add blank or X to denote present or absent for this day
            studentAttendance.push(isPresent ? '' : 'X')
          })

          // Add this student's attendance as a row in the excel file
          excelData.push(studentAttendance)
        })

        // Add explanation row
        excelData.push([], ['X = absent'])

        // Convert 2d array into excel file
        const worksheet = XLSX.utils.aoa_to_sheet(excelData)
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

        // Download file
        const fileName = 'AttendanceData ('+this.courseName+').xlsx'
        XLSX.writeFile(workbook, fileName);
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

.align-top {
  vertical-align: top;
}
.align-bottom {
  vertical-align: bottom;
}

.button-width {
  width: 300px;
}
</style>