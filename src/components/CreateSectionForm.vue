<template>
  <div>
    <!-- 
      The mode determines if we are currently adding 
      a new section or updating an existing one
     -->
    <h2 v-if="mode=='add'">Create Section</h2>
    <h2 v-if="mode=='edit'">Edit Section</h2>
    <br>

    <ValidationObserver v-slot="{ handleSubmit }">
    <form @submit.prevent="handleSubmit(createSection)">
      <div class="column">
        <div>
          <ValidationProvider name="Section Name" rules="required|alpha_dash" v-slot="{ errors }">
            <label for="sectionName">Section Name</label>
            <input placeholder="SWE4104-FR01A-LEC" type="text" v-model="sectionName">
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
            <input name="attendanceThreshold" type="number" placeholder="Attendance Threshold" v-model="attendanceThreshold">
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
      </div>
      <div class="column">
        <br>
        <!-- Add/Save button: Only one is shown depending if the mode is "add" or "update" -->
        <button v-if="mode=='add'" type="submit" class="green" v-on:click="createSection">Create Section</button>
        <button v-if="mode=='edit'" type="submit" class="green" v-on:click="saveSection">Save Section</button>
        
        <br>
        <br>

        <!-- This is the basics for the excel file upload -->
        <button style="width:300px;" v-on:click="$refs.excelInputField.click()">
          Upload Class List
        </button>
        <br>
        <br>
        <div v-if="class_list.length>0">
          Class List:
          <br>
          <table class="students">
            <tbody>
              <tr v-for="(student, index) in class_list" :key="index" >
                <td>{{student.name}}</td>
                <td>{{student.email}}</td>
              </tr>
            </tbody>
          </table>
          <button v-on:click="clearClassList">
            Clear Class List
          </button>
        </div>
      </div>
    </form>
    </ValidationObserver>

    <!-- Hidden file upload field (only allows .xlsx files) -->
    <input
      style="display:none"
      type="file"
      ref="excelInputField"
      @change="loadClassList"
      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    />

    <br>
    <hr>
    <br>

    <div class="column">
      <!-- Basic dropdown for selecting layout -->
      <label>Select Layout</label><br>
      <select @change="stopSelect" style="height: 30px; width:300px;" v-model="layoutSelected">
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
        <label>How to modify seats</label>
        <div>
          Select desired seat type from the legend, then click two seats to "paint" between them.
        </div>
      </div>
      
    </div>
    <div class="column">
      <br>
      <!-- Basic button for adding new layout -->
      <button v-on:click="createLayout">New layout</button><br>
      <br>
      <button :disabled="!isCurrentLayoutNew" v-on:click="saveLayout" class="green">Save layout</button>

      <br>
      <br>

      <!-- Basic column/rows buttons -->
      <div>
        <div style="float:left;">
          <button class="small-button" :disabled="!isCurrentLayoutNew || columns>=50" v-on:click="addColumn">+</button>
          Columns: <span v-if="layouts.length>0">{{columns}} </span>
          <button class="small-button" :disabled="!isCurrentLayoutNew || columns<=1" v-on:click="removeColumn">-</button>
        </div>
        
        <div style="float:right;">
          <button class="small-button" :disabled="!isCurrentLayoutNew || rows>=99" v-on:click="addRow">+</button>
          Rows: <span v-if="layouts.length>0">{{rows}} </span>
          <button class="small-button" :disabled="!isCurrentLayoutNew || rows<=1" v-on:click="removeRow">-</button>
        </div>
      </div>
    </div>

    <br>
    <br>

    <div id="Grid" class="border">
      <table v-if="layouts.length>0">
        <tbody v-bind:class="{isNew: isCurrentLayoutNew}">
          <tr v-for="(row, i) in currentLayout" v-bind:key="i">
            <td v-for="(seat, j) in row" v-bind:key="j">
              <div
                @click="fromSelect(i,j)" 
                @mouseover="toSelect(i,j)"
                v-bind:class="{
                  'seat': true,
                  'type-0': seat==0,
                  'type-1': seat==1,
                  'type-2': seat==2,
                  'type-3': seat==3,
                  'selected': isSeatSelected(i,j)
                }"
              ></div>
            </td>
          </tr>
          <tr>
            <td :colspan="currentLayout[0].length">
              <div style="margin: 10px auto 0 auto; padding: 0 10px; max-width: 200px" class="border">
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
        <label>Selected Access</label>
        <div  
          v-bind:class="{
            'seat': true, 
            'type-2': true, 
            'selected': currentPaintSelected==2
          }"
          v-on:click="paintSelectIndex=2"></div>
      </div>
      <div>
        <label>Extended Access</label>
        <div  
          v-bind:class="{
            'seat': true, 
            'type-3': true, 
            'selected': currentPaintSelected==3
          }"
          v-on:click="paintSelectIndex=3"></div>
      </div>
      <div>
        <label>Open Access</label>
        <div 
          v-bind:class="{
            'seat': true, 
            'type-1': true, 
            'selected': currentPaintSelected==1
          }"
          v-on:click="paintSelectIndex=1"></div>
      </div>
      <div>
        <label>Locked</label>
        <div  v-bind:class="{
            'seat': true, 
            'type-0': true, 
            'selected': currentPaintSelected==0
          }"
          v-on:click="paintSelectIndex=0"></div>
      </div>
    </div>

    <br>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import readXlsxFile from 'read-excel-file'

export default {
  name: "CreateSectionForm",

  data() {
    return {
      // The mode determines if we are currently adding 
      // a new section or updating an existing one
      mode: "add",

      // Field values
      sectionName: "",
      attendanceType: 'optIn',
      attendanceThreshold: 0,
      class_list: [],

      // Layout stuff
      layouts: [],
      layout_id: "",
      layoutSelected: 0,

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

      defaultLayout: {
        name: "default",
        // This type: "new" allows us to keep track 
        // of which layout is new in the dropdown
        type: "new",
        layout: [
          [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
          [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
          [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
          [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
          [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
        ]
      }
    }
  },

  computed: {
    // Import the getters from the global store
    ...mapGetters(["getUser"]),
    
    is_mandatory: () => { this.attendanceType == 'mandatory' },
    currentLayout: function() {
      return this.layouts.length>0 ? this.layouts[this.layoutSelected].layout : {}
    },
    isCurrentLayoutNew: function() { 
      return this.layouts.length>0 && this.layouts[this.layoutSelected].type == "new"
    },
    rows: function() {
      return this.currentLayout?.length
    },
    columns: function() {
      return this.currentLayout?.[0].length
    },
    currentPaintSelected: function() {
      return this.isCurrentLayoutNew ? this.paintSelectIndex : -1
    }
  },

  // mounted is called when the page loads
  mounted() {
    this.getLayouts()
  },

  methods: {

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
        this.class_list = rows.map(row => {
          return {
            'name': row[firstNameColumn]+' '+row[lastNameColumn],
            'email': row[emailColumn]
          }
        })
      })
    },

    clearClassList() {
      this.class_list = []
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
    
    // Call api to get the list of layouts for the dropdown
    getLayouts() {
      var vue = this;

      this.$store.dispatch('getSeatingLayouts')
      .then(res => {
        vue.layouts = res.seatingLayouts
      })
      .catch(err => {
        console.log(err)
        // Show a notification with the error message
        if (err.message) {
          vue.$notify({ 
            title: err.message, 
            type: err.type ?? 'error'
          });
        }
      })
    },

    createLayout() {
      this.stopSelect()

      // Make a copy of the default layout as the new layout
      const newLayout = JSON.parse(JSON.stringify(this.defaultLayout))
      // Add the new layout to the dropdown and select it
      this.layouts.push(newLayout)
      this.layoutSelected = this.layouts.length-1
    },

    saveLayout() {
      // Call api to save the new layout
      /* Send data:
      - 2d array with numbers representing the type of seat (open-access, ...)
      */
    },

    addRow() {
      this.stopSelect()

      // Get current layout
      var currentLayout = this.layouts[this.layoutSelected].layout
      // Get number of columns
      const numColumns = currentLayout[0].length
      // Add a new row with the correct number of columns
      // (Use the paintSelectIndex as the default type)
      const newRow = Array(numColumns).fill(this.paintSelectIndex)
      currentLayout.push(newRow)
    },
    addColumn() {
      this.stopSelect()

      // Get current layout
      var currentLayout = this.layouts[this.layoutSelected].layout
      // Add a new column to ever row
      // (Use the paintSelectIndex as the default type)
      currentLayout.forEach(row => {
        row.push(this.paintSelectIndex)
      })
    },
    removeRow() {
      this.stopSelect()

      // Get current layout
      var currentLayout = this.layouts[this.layoutSelected].layout
      // Remove last row
      currentLayout.pop()
    },
    removeColumn() {
      this.stopSelect()

      // Get current layout
      var currentLayout = this.layouts[this.layoutSelected].layout
      // Remove last column of every row
      currentLayout.forEach(row => {
        row.pop()
      })
    },

    

    fromSelect(row, column) {
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
        this.paintSelectIndexed()
        this.stopSelect()
      }
    },
    toSelect(row, column) {
      // Update the second position as you hover over seats,
      // but only if select is active
      if (!this.seatSelect.active) return
      this.seatSelect.second.row = row
      this.seatSelect.second.column = column
      this.$forceUpdate();
    },
    stopSelect() {
      this.seatSelect.active = false
      this.seatSelect.first.row = -1
      this.seatSelect.first.column = -1
      this.seatSelect.second.row = -1
      this.seatSelect.second.column = -1
    },
    paintSelectIndexed() {
      // Update all seats inside the selection
      // with the selected color
      for (var i=0; i<this.rows; i++) {
        for (var j=0; j<this.columns; j++) {
          if (this.isSeatSelected(i,j)) {
            this.currentLayout[i][j] = this.paintSelectIndex
          }
        }
      }
      this.$forceUpdate();
    },

    createSection() {
      // Call api to create a new section
      /* Send data:
      - name
      - is_mandatory
      - attendanceThreshold
      - layout_id
      - class_list
      */
    },

    saveSection() {
      // Call api to save the section
      /* Send data:
      - name
      - is_mandatory
      - attendanceThreshold
      - layout_id
      - class_list (?)
      */
    },
  },
};
</script>

<style lang="scss" scoped >

.legend {
  > div {
    display: inline-block;
    margin-right: 30px;
    .seat {
      margin: auto;
    }
  }
}

#Grid {
  overflow-x: auto;
  box-sizing: border-box;
  width: 100%;
  padding: 10px;
  border: 3px solid black;

  table {
    margin: auto;
  }
}

.border {
  border: 1px solid black;
}
.bold {
  font-weight: bold;
}
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

.seat {
  padding: 5px;
  border-radius: 10px;
  border: 1px solid black;
  width: 40px;
  height: 33px;
}
.seat.selected {
  border: 3px solid #cc0000;
}
.seat.type-0 {
  background-color: darkgray;
}
.seat.type-1 {
  background-color: lightgray;
}
.seat.type-2 {
  background-color: white;
}
.seat.type-3 {
  background-color: lightblue;
}

label.radio {
  font-weight: normal;
}

.column {
  display: inline-block;
  vertical-align: top;
  margin: 0 20px;
}
</style>