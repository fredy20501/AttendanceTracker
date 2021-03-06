<template>
<transition name="fade" mode="out-in">
  <Loading v-if="loading && !isCreateMode"/>

  <div v-else>
    <!-- 
      The mode determines if we are currently adding 
      a new section or updating an existing one
     -->
    <h2 v-if="isCreateMode">Create Section</h2>
    <h2 v-if="!isCreateMode">Edit Section</h2>
    <br>

    <ValidationObserver v-slot="{ handleSubmit, invalid}">
    <form @submit.prevent="handleSubmit(submit)">
      <div class="column">
        <div>
          <ValidationProvider name="Section Name" rules="required|alpha_dash" v-slot="{ errors }">
            <label for="sectionName">Section Name</label>
            <input id="sectionName" placeholder="SWE4104-FR01A-LEC" type="text" v-model="sectionName">
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <br>
        <div>
          <label>Attendance Type</label><br>
          <input id="OptInAttendance" type="radio" name="attendance" value="optIn"
            v-model="attendanceType">
          <label for="OptInAttendance" class="radio">Opt In/Opt Out</label>
          <br>
          <input id="MandatoryAttendance" type="radio" name="attendance" value="mandatory"
            v-model="attendanceType">
          <label for="MandatoryAttendance" class="radio">Mandatory Attendance</label>
        </div>
        <br>
        <div >
          <ValidationProvider name="Attendance Threshold" rules="required|integer|min_value:0" v-slot="{ errors }">
            <label for="attendanceThreshold">Attendance Threshold</label><br>
            <input id="attendanceThreshold" type="number" placeholder="Attendance Threshold" v-model="attendanceThreshold">
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
      </div>
      <div class="column">
        <br>

        <!-- This is the basics for the excel file upload -->
        <button type="button" style="width:300px;" v-on:click="$refs.excelInputField.click()">
          Upload Class List
        </button>
        <br>
        <label>Column Format</label>
        <div>First Name, Last Name, Email</div>
        <br>
        <div v-if="classList.length>0">
          Class List:
          <br>
          <table class="students" tabindex="0">
            <tbody>
              <tr v-for="(student, index) in classList" :key="index" >
                <td>{{student.name}}</td>
                <td>{{student.email}}</td>
              </tr>
            </tbody>
          </table>
          <button type="button" v-on:click="clearClassList">
            Remove Class List
          </button>
        </div>
      </div>

      <!-- Hidden file upload field (only allows .xlsx files) -->
      <input
        style="display:none"
        type="file"
        ref="excelInputField"
        @change="loadClassList"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      />

      <br>
      <br>
      <hr class="divider">
      <h2>Class Layout</h2>

      <div class="column">
        <!-- Basic dropdown for selecting layout -->
        <label for="layoutDropdown">Select Layout</label><br>
        <select id="layoutDropdown" @change="layoutSelectedEvent" style="height: 30px; width:300px;" v-model="layoutSelected">
          <option v-for="(layout, i) in layouts" v-bind:key="i" :value="i"
            v-bind:class="{bold: layout.type=='new'}"
          >
            {{ layout.name }}
            <!-- Add small tooltip to specify unsaved layouts -->
            <span v-if="layout.type=='new'">*(not saved)</span>
          </option>
        </select><br>
        <br>
        <div v-if="isCurrentLayoutNew">
          <label for="layoutName">Layout Name</label>
          <input id="layoutName" @change="updateLayoutName($event)" 
            type="text" placeholder="Layout Name" v-model="newLayoutName">
        </div>
        <br>
        <div v-if="isCurrentLayoutNew">
          <label>How to modify seats</label>
          <div>Select desired seat type from the legend, then click two seats to "paint" between them.</div>
        </div>
        
      </div>
      <div class="column">
        <br>
        <!-- Basic button for adding new layout -->
        <button type="button" v-on:click="createLayout">New layout</button><br>
        <br>
        <SpinnerButton 
          v-if="isCurrentLayoutNew"
          color="blue"
          label="Save Layout"
          type="button"
          width="100%"
          height="30px"
          :disabled="$wait.waiting('saveLayout') || !isCurrentLayoutNew"
          :loading="$wait.waiting('saveLayout')"
          :onClick="saveLayout" 
        />
        <SpinnerButton 
          v-if="!isCurrentLayoutNew && layouts.length != 0"
          class="red"
          label="Delete Layout"
          type="button"
          width="100%"
          height="30px"
          :disabled="$wait.waiting('deleteLayout') || isCurrentLayoutNew "
          :loading="$wait.waiting('deleteLayout')"
          :onClick="confirmDeleteLayout" 
        />
        <br>
        <br>

        <!-- Basic column/rows buttons -->
        <div>
          <div style="float:left;">
            <button type="button" class="small-button" :disabled="!isCurrentLayoutNew || columns<=1" v-on:click="removeColumn">-</button>
            Columns: <span v-if="layouts.length>0">{{columns}} </span>
            <button type="button" class="small-button" :disabled="!isCurrentLayoutNew || columns>=50" v-on:click="addColumn">+</button>
          </div>
          
          <div style="float:right;">
            <button type="button" class="small-button" :disabled="!isCurrentLayoutNew || rows<=1" v-on:click="removeRow">-</button>
            Rows: <span v-if="layouts.length>0">{{rows}} </span>
            <button type="button" class="small-button" :disabled="!isCurrentLayoutNew || rows>=99" v-on:click="addRow">+</button>
          </div>
        </div>
      </div>

      <br>
      <br>

      <div class="double-column">
        <div class="grid-layout">
          <table v-if="layouts.length>0" aria-label="Classroom Layout">
            <tbody>
              <!-- First row shows the column number -->
              <tr>
                <td></td>
                <td v-for="(column, j) in currentLayout.layout[0]" v-bind:key="j">
                  {{j+1}}
                </td>
              </tr>
              <!-- Loop through all rows of the layout -->
              <tr v-for="(row, i) in currentLayout.layout" v-bind:key="i">
                <!-- First column shows the row number -->
                <td>{{i+1}}</td>
                <!-- Loop through each seat in the row -->
                <td v-for="(seat, j) in row" v-bind:key="j">
                  <button
                    aria-label="select seat"
                    type="button"
                    @click="fromPaintSelect(i,j)" 
                    @mouseover="toPaintSelect(i,j)"
                    @focus="toPaintSelect(i,j)"
                    v-bind:class="{
                      'seat': true,
                      'type-0': seat==0,
                      'type-1': seat==1,
                      'type-2': seat==2,
                      'type-3': seat==3,
                      'selected': isSeatSelected(i,j)
                    }"
                  ></button>
                </td>
              </tr>
              <!-- Put a label as final row to represent the front of the class -->
              <tr>
                <td></td>
                <td :colspan="currentLayout.layout[0].length">
                  <div style="margin: 10px auto 0 auto; padding: 0 10px; max-width: 200px;" class="border">
                    Front of Classroom
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="legend">
          <h3>Seat Legend</h3>
          <div>
            <label id="legendSelectedAccess">Selected<br>Access</label>
            <button type="button" 
              aria-labelledby="legendSelectedAccess"
              v-bind:class="{'seat': true, 'type-2': true, 
                'selected': currentPaintSelected==2
              }"
              v-on:click="paintSelectIndex=2"></button>
          </div>
          <div>
            <label id="legendExtendedAccess">Extended<br>Access</label>
            <button type="button" 
              aria-labelledby="legendExtendedAccess"
              v-bind:class="{'seat': true, 'type-3': true, 
                'selected': currentPaintSelected==3
              }"
              v-on:click="paintSelectIndex=3"></button>
          </div>
          <div>
            <label id="legendOpenAccess">Open<br>Access</label>
            <button type="button" 
              aria-labelledby="legendOpenAccess"
              v-bind:class="{'seat': true, 'type-1': true, 
                'selected': currentPaintSelected==1
              }"
              v-on:click="paintSelectIndex=1"></button>
          </div>
          <div>
            <label id="legendLocked">Locked</label>
            <button type="button" 
              aria-labelledby="legendLocked"
              v-bind:class="{'seat': true, 'type-0': true, 
                'selected': currentPaintSelected==0
              }"
              v-on:click="paintSelectIndex=0"></button>
          </div>
        </div>
      </div>

      <br>
      <br>

      <!-- Add/Save button: Only one is shown depending if the mode is "add" or "update" -->
      <SpinnerButton 
        v-if="isCreateMode"
        color="blue"
        label="Create Section"
        width="300px"
        height="30px"
        type="submit"
        :disabled="$wait.waiting('createSection') || invalid"
        :loading="$wait.waiting('createSection')"
      />
      <SpinnerButton 
        v-if="!isCreateMode"
        color="blue"
        label="Save Section"
        width="300px"
        height="30px"
        type="submit"
        :disabled="$wait.waiting('saveSection') || invalid"
        :loading="$wait.waiting('saveSection')"
      />

    </form>
    </ValidationObserver>

    <div v-if="!isCreateMode">
      <br>
      <br>
      <hr class="divider">
      <h2>Danger Zone</h2>

      <div class="double-column danger-zone">
        <div>
          <div>
            <b>Clear Students</b><br>
            Remove all students from the section. Students may 
            register again but will have lost their seats.
          </div>
          <div>
            <SpinnerButton 
              style="margin:5px"
              color="red"
              label="Clear Students"
              width="300px"
              height="30px"
              type="button"
              :disabled="$wait.waiting('clearStudents')"
              :loading="$wait.waiting('clearStudents')"
              :onClick="confirmClearStudents"
            />
          </div>
        </div>
        <br>
        <div>
          <div>
            <b>Delete section</b><br>
            Delete the section entirely. Deleted sections 
            are archived so an administrator may be able 
            to recover them if needed.
          </div>
          <div>
            <SpinnerButton 
              style="margin:5px"
              color="red"
              label="Delete Section"
              width="300px"
              height="30px"
              type="button"
              :disabled="$wait.waiting('deleteSection')"
              :loading="$wait.waiting('deleteSection')"
              :onClick="confirmDeleteSection"
            />
          </div>
        </div>
      </div>
    </div>

  </div>
</transition>
</template>

<script>
import { mapGetters } from "vuex";
import readXlsxFile from 'read-excel-file'
import SpinnerButton from './SpinnerButton'

export default {
  name: "CreateSectionForm",
  components: {
    SpinnerButton
  },

  data() {
    return {
      // Hide the page until data is loaded
      loading: true,
      
      // Field values
      sectionName: "",
      attendanceType: 'optIn',
      attendanceThreshold: 0,
      classList: [],

      // Layout stuff
      layouts: [],
      newLayoutName: "",
      layoutSelected: 0,

      // [Edit mode] Storing the old layout allows us to check if the layout was changed
      // (if it didn't change we don't want to overwrite the seating_arrangement on save)
      oldSeatingLayoutId: "",

      // Select grid data
      paintSelectIndex: 2,
      seatSelect: {
        active: false,
        first: {
          row: -1,
          column: -1
        },
        second: {
          row: -1,
          columns: -1
        }
      },

      // This value is referenced in computed values so we can force update them
      // by updating this "updated" value
      updated: 0
    }
  },

  computed: {
    // Import the getters from the global store
    ...mapGetters(["getUser"]),

    // The mode determines if we are currently adding a new section or updating an existing one
    // (this is determined by whether the sectionId is set as a url parameter)
    isCreateMode: function() {
      return this.sectionId == null
    },
    isMandatory: function() { 
      return this.attendanceType == 'mandatory'
    },
    currentLayout: function() {
      this.updated // Reference this value to allow forcing an update
      return this.layouts.length>0 ? this.layouts[this.layoutSelected] : {}
    },
    isCurrentLayoutNew: function() {
      return this.layouts.length>0 && this.currentLayout.type == "new"
    },
    rows: function() {
      return this.currentLayout.layout?.length
    },
    columns: function() {
      return this.currentLayout.layout?.[0].length
    },
    currentPaintSelected: function() {
      return this.isCurrentLayoutNew ? this.paintSelectIndex : -1
    },

    // The section id is given as a route parameter if we want to edit a section
    // i.e. to get to this page from another page we need to also pass the section id like so:
    //      this.$router.push({name: 'createEditSection', params: {id: '123EF41'}})
    sectionId: function() {
      return this.$route.params.id
    }
  },

  // created is called when the page loads
  created() {
    this.getLayouts(() => {
      // When getLayouts is done run this code

      if (!this.isCreateMode) {
        // Load the section information into the fields
        this.getSectionData()
      }
    })
    
  },



  methods: {

    // Call the backend api to get the section information (given the section id)
    getSectionData() {
      this.$store.dispatch('getSectionData', {
        sectionId: this.sectionId
      })
      .then(res => {
        this.sectionName = res.name
        this.attendanceType = res.always_mandatory ? 'mandatory' : 'optIn'
        this.attendanceThreshold = res.attendance_threshold
        this.classList = res.class_list
        this.oldSeatingLayoutId = res.seating_layout._id
        
        // Find the index of the layout that matches the layout id from the section
        var layoutIndex = this.layouts.findIndex(layout => {
          return layout._id == res.seating_layout._id
        })
        // Set the layout selected to match to section's layout id
        if (layoutIndex !== -1) {
          this.layoutSelected = layoutIndex
        }
        
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

    // Extract the class list from the uploaded .xlsx file
    loadClassList() {
      // Get file from the input field
      const file = this.$refs.excelInputField.files[0];
      
      readXlsxFile(file).then((rows) => {
        // `rows` is an array of rows
        // each row being an array of cells.

        // Identify each column
        const emailColumn = rows[0].findIndex(title => title.toLowerCase().includes('email'))
        const firstNameColumn = rows[0].findIndex(title => title.toLowerCase().includes('first'))
        const lastNameColumn = rows[0].findIndex(title => title.toLowerCase().includes('last'))

        // Show error if a column is missing
        var columnsMissing = []
        if (emailColumn == -1) columnsMissing.push('Email')
        if (firstNameColumn == -1) columnsMissing.push('First Name')
        if (lastNameColumn == -1) columnsMissing.push('Last Name')
        if (columnsMissing.length > 0) {
          this.$notify({
            title: "Columns missing in the excel file",
            body: columnsMissing.join(', '),
            type: "error"
          })
        }

        // Remove the first row (header)
        rows.shift()

        // Condense the 2d array into an array of 
        // objects with full name and email
        this.classList = rows.map(row => {
          return {
            'name': row[firstNameColumn]+' '+row[lastNameColumn],
            'email': row[emailColumn]
          }
        })
      })
    },

    clearClassList() {
      this.classList = []
      this.$refs.excelInputField.value = ""
    },

    // Check if y is between x1 and x2
    isBetween(y, x1, x2) {
      return (y-x1)*(y-x2) <= 0;
    },
    isSeatSelected(row, column) {
      return this.isCurrentLayoutNew &&
        this.isBetween(row, this.seatSelect.first.row, this.seatSelect.second.row) &&
        this.isBetween(column, this.seatSelect.first.column, this.seatSelect.second.column)
    },
    

    //comparison function for layouts so they can be sorted
    compLayout(firstEl, secondEl){
      return firstEl.name.localeCompare(secondEl.name);
    },

    // Call api to get the list of layouts for the dropdown
    getLayouts(callback) {
      this.$store.dispatch('getSeatingLayouts')
      .then(res => {
        this.layouts = res.layouts.sort(this.compLayout)

        // Run the callback function (if one was given)
        if (callback) callback()
      })
      .catch(err => {
        console.log(err)
        // Show a notification with the error message
        if (err.message) {
          this.$notify({ 
            title: err.message, 
            type: err.type ?? 'error'
          });
        }
      })
    },

    createLayout() {
      this.stopPaintSelect()
      var newLayout;
      
      if(this.layouts.length == 0){
        // if we dont have any layouts, use a default example as template
        newLayout = {layout: [[0, 1, 2, 3]]};
      }
      else{
        // Make a copy of the current layout as the new layout
        newLayout = JSON.parse(JSON.stringify(this.currentLayout));
      }
      
      newLayout.type = "new"
      // Remove the id since it isn't correct anymore
      delete newLayout._id

      // Add the new layout to the dropdown and select it
      this.layouts.push(newLayout)
      this.layoutSelected = this.layouts.length-1

      // Set the layout name field
      this.newLayoutName = newLayout.name
    },

    layoutSelectedEvent() {
      this.stopPaintSelect()
      if (this.isCurrentLayoutNew) {
        this.newLayoutName = this.currentLayout.name
      }
    },

    updateLayoutName(event) {
      this.currentLayout.name = event.srcElement.value
    },

    // Returns the number of non-locked seats in the current layout
    getLayoutCapacity() {
      var capacity = 0;
      this.currentLayout.layout.forEach(row => {
        row.forEach(seat => {
          if (seat !== 0) capacity++
        })
      })
      return capacity
    },

    // Call api to save the currently selected new layout
    saveLayout() {
      // Start the loading spinner
      this.$wait.start('saveLayout')

      // Calculate fields
      const dimensions = [this.rows, this.columns]
      const capacity = this.getLayoutCapacity()
      const userId = this.getUser.id
      const layoutName = this.currentLayout.name
      const layout = this.currentLayout.layout

      this.$store.dispatch('createSeatingLayout', {
        name: layoutName,
        capacity: capacity,
        createdBy: userId,
        dimensions: dimensions,
        layout: layout,
        default: false
      })
      .then(res => {
        // Overwrite the current layout with what we just saved
        this.layouts[this.layoutSelected] = res.layout
        // Force some computed value(s) to update
        this.updated++

        // show success message
        this.$notify({ 
          title: "Seating layout saved successfully", 
          type: "success"
        })

        // Stop the loading spinner
        this.$wait.end('saveLayout')
      })
      .catch(err => {
        console.log(err)
        // Show a notification with the error message
        if (err.message) {
          this.$notify({ 
            title: err.message, 
            type: err.type ?? 'error'
          })
        }
        // Stop the loading spinner
        this.$wait.end('saveLayout')
      })
    },

    confirmDeleteLayout() {
      this.$dialog.confirm('Are you sure?')
      .then(() => {
        this.deleteLayout()
      })
      .catch(() => {})
    },

    deleteLayout(){
      // Start loading spinner
      this.$wait.start('deleteLayout');

      this.$store.dispatch('deleteLayout', {
        id: this.currentLayout._id
      }).then( () =>{//used to have res

        //this.layouts[this.layoutSelected] = null;
        this.layouts.splice(this.layoutSelected, 1);
        this.layoutSelected = 0;

        // show success message
        this.$notify({ 
          title: "Seating layout saved successfully", 
          type: "success"
        })
      }).catch(err =>{
        console.log(err)
        // Show a notification with the error message
        if (err.message) {
          this.$notify({ 
            title: err.message, 
            type: err.type ?? 'error',
            duration: 10000
          })
        }    
      })
      .finally(() => {
        // Stop the loading spinner
        this.$wait.end('deleteLayout')    
      })
    },

    // General submit function which redirects
    // to the proper function depending on the mode
    submit() {
      if (this.isCreateMode) this.createSection()
      else this.saveSection()
    },

    // Check if the currently selected seating layout is saved
    // If not, show an error notification and return false
    // If it is saved, return true
    isSeatingLayoutSaved() {
      if (this.isCurrentLayoutNew || this.layouts.length == 0) {
        this.$notify({ 
          title: "Current seating layout is not saved", 
          type: "error"
        })
        return false
      }
      return true
    },

    // Call api to create a new section
    createSection() {
      // Stop if selected layout is not saved
      if (!this.isSeatingLayoutSaved()) return

      // Start the loading spinner
      this.$wait.start('createSection')

      // Calculate fields
      const capacity = this.getLayoutCapacity()
      const userId = this.getUser.id
      const layoutId = this.currentLayout._id

      // Create a seating arrangment the same size as the layout
      // Filled with null values since there are no studetns to begin with
      const seatingArrangement = new Array(this.rows).fill(null).map(() => new Array(this.columns).fill(null))

      this.$store.dispatch('createSection', {
        sectionName: this.sectionName,
        professor: userId,
        maxCapacity: capacity,
        attendanceThreshold: this.attendanceThreshold,
        seatingLayout: layoutId,
        attMandatory: this.isMandatory,
        classList: this.classList,
        seatingArrangement: seatingArrangement
      })
      .then(() => {
        // show success message
        this.$notify({ 
          title: "Section saved successfully", 
          type: "success"
        })
        // Redirect to their home page
        this.$router.push('/home');

        // Stop the loading spinner
        this.$wait.end('createSection')
      })
      .catch(err => {
        console.log(err)
        // Show a notification with the error message
        if (err.message) {
          this.$notify({ 
            title: err.message, 
            type: err.type ?? 'error'
          })
        }
        // Stop the loading spinner
        this.$wait.end('createSection')
      })
    },

    // Call api to save the section
    saveSection() {
      // Stop if selected layout is not saved
      if (!this.isSeatingLayoutSaved()) return

      // Start the loading spinner
      this.$wait.start('saveSection')

      // Calculate fields
      const capacity = this.getLayoutCapacity()
      const userId = this.getUser.id
      const layoutId = this.currentLayout._id

      // If the layout changed, reset the seating arrangement (i.e. student lose their seats)
      var seatingArrangement = null
      if (this.oldSeatingLayoutId != layoutId) {
        // Create a seating arrangment the same size as the layout
        // Filled with null values since there are no studetns to begin with
        seatingArrangement = new Array(this.rows).fill(null).map(() => new Array(this.columns).fill(null))
      }

      this.$store.dispatch('updateSection', {
        sectionId: this.sectionId,
        sectionName: this.sectionName,
        professor: userId,
        maxCapacity: capacity,
        attendanceThreshold: this.attendanceThreshold,
        seatingLayout: layoutId,
        attMandatory: this.isMandatory,
        classList: this.classList,
        seatingArrangement: seatingArrangement
      })
      .then(() => {
        // show success message
        this.$notify({ 
          title: "Section saved successfully", 
          type: "success"
        })

        // Stop the loading spinner
        this.$wait.end('saveSection')
      })
      .catch(err => {
        console.log(err)
        // Show a notification with the error message
        if (err.message) {
          this.$notify({ 
            title: err.message, 
            type: err.type ?? 'error'
          })
        }
        // Stop the loading spinner
        this.$wait.end('saveSection')
      })
    },

    confirmDeleteSection() {
      this.$dialog.confirm('Are you sure?')
      .then(() => {
        this.deleteSection()
      })
      .catch(() => {})
    },

    deleteSection() {
      // Start the loading spinner
      this.$wait.start('deleteSection')

      this.$store.dispatch('deleteSection', {
        sectionID: this.sectionId,
      })
      .then(() => {
        // Redirect to home page
        this.$router.push({name: 'home'})
        // show success message
        this.$notify({ 
          title: "Section deleted successfully", 
          type: "success"
        })
      })
      .catch(err => {
        console.log(err)
        // Show a notification with the error message
        if (err.message) {
          this.$notify({ 
            title: err.message, 
            type: err.type ?? 'error'
          })
        }
      })
      .finally(() => {
        // Stop the loading spinner
        this.$wait.end('deleteSection')
      })
    },

    confirmClearStudents() {
      this.$dialog.confirm('Are you sure?')
      .then(() => {
        this.clearStudents()
      })
      .catch(() => {})
    },

    clearStudents() {
      // Start the loading spinner
      this.$wait.start('clearStudents')

      this.$store.dispatch('clearStudents', {
        sectionID: this.sectionId,
      })
      .then(() => {
        // show success message
        this.$notify({ 
          title: "Students cleared successfully", 
          type: "success"
        })
      })
      .catch(err => {
        console.log(err)
        // Show a notification with the error message
        if (err.message) {
          this.$notify({ 
            title: err.message, 
            type: err.type ?? 'error'
          })
        }
      })
      .finally(() => {
        // Stop the loading spinner
        this.$wait.end('clearStudents')
      })
    },


    addRow() {
      this.stopPaintSelect()
      // Add a new row with the correct number of columns
      // (Use the paintSelectIndex as the default type)
      const newRow = Array(this.columns).fill(this.paintSelectIndex)
      this.currentLayout.layout.push(newRow)
    },
    addColumn() {
      this.stopPaintSelect()
      // Add a new column to every row
      // (Use the paintSelectIndex as the default type)
      this.currentLayout.layout.forEach(row => {
        row.push(this.paintSelectIndex)
      })
    },
    removeRow() {
      this.stopPaintSelect()
      // Remove last row
      this.currentLayout.layout.pop()
    },
    removeColumn() {
      this.stopPaintSelect()
      // Remove last column of every row
      this.currentLayout.layout.forEach(row => {
        row.pop()
      })
    },

    fromPaintSelect(row, column) {
      // Only allow modifying new layouts
      if (!this.isCurrentLayoutNew) return

      // Select the first position if not already acive
      if (!this.seatSelect.active) {
        this.seatSelect.first.row = row
        this.seatSelect.first.column = column
        this.seatSelect.second.row = row
        this.seatSelect.second.column = column
        this.seatSelect.active = true
      }
      // End the selection if already active
      else {
        this.paintSelectedSeats()
        this.stopPaintSelect()
      }
    },
    toPaintSelect(row, column) {
      // Update the second position as you hover over seats,
      // but only if select is active
      if (!this.seatSelect.active) return
      this.seatSelect.second.row = row
      this.seatSelect.second.column = column
      this.updated++;
    },
    stopPaintSelect() {
      this.seatSelect.active = false
      this.seatSelect.first.row = -1
      this.seatSelect.first.column = -1
      this.seatSelect.second.row = -1
      this.seatSelect.second.column = -1
    },
    paintSelectedSeats() {
      // Update all seats inside the selection
      // with the selected color
      for (var i=0; i<this.rows; i++) {
        for (var j=0; j<this.columns; j++) {
          if (this.isSeatSelected(i,j)) {
            this.currentLayout.layout[i][j] = this.paintSelectIndex
          }
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped >
.small-button {
  width: 25px;
  height: 25px;
}

.students {
  border-collapse: collapse;
  display: inline-block;
  max-height: 150px;
  width: auto;
  overflow-y: scroll;
  border: 1px solid black;
}
.students th, .students td {
  border: 1px solid black;
  padding: 5px;
}

label.radio {
  font-weight: normal;
}

.column {
  display: inline-block;
  vertical-align: top;
  margin: 0 20px;
}
.double-column {
  max-width: 640px;
  margin: auto;
}

.divider {
  margin: 20px 0; border-top: 10px solid #333;
}

</style>