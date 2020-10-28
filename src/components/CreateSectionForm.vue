<template>
  <div>
    <h2>Create/Edit Section</h2>
    <br>

    <form @submit.prevent>
      <!-- Put fields & buttons with their labels here -->
        <div >
          <ValidationProvider name="Section Tag" rules="required" v-slot="{ errors }">
            <label for="sectionTags">Section Tag</label><br>
            <input list= "sectionTags" name="sectionTag" type="text" style="width:300px;" v-model="sectionTag">
            <datalist id=sectionTags>
              <!--Example, should import user's sections from db-->
              <option value=ADAM-ECE3221-FRO1B-LEC></option>
            </datalist>
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
          <br><br>
          <button 
            style="width:300px;"
            v-on:click="$.createSection()"
          >
            Add Section
          </button> 
          <br><br>
          <button 
            style="width:300px;"
            v-on:click="$.saveSection()"
          >
            Save Section
          </button>
        </div>
        <br>
        <div >
          <ValidationProvider name="Attenence Type" rules="required" v-slot="{ errors }">
            <label>Attendence Type</label><br>
            <input id="MandatoryAttendence" type="radio" name="attendence" value="mandatory"
              v-model="attendenceType">
            <label for="MandatoryAttendence" class="radio">Mandatory Attendence</label>
            <br>
            <input id="OptInAttendence" type="radio" name="attendence" value="optIn"
              v-model="attendenceType">
            <label for="OptInAttendence" class="radio">Opt In/Opt Out</label>
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <br>
        <div >
          <ValidationProvider name="Absent Threshold" v-slot="{ errors }">
            <label for="absentThreshold">Absent Threshold</label><br>
            <input name="absentThreshold" style="width:300px;" type="number" placeholder="Absent Threshold" v-model="absentThreshold">
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <br>

      <!-- This is the basics for the excel file upload -->
      <div >
        <button 
          style="width:300px;"
          v-on:click="$refs.excelInputField.click()"
        >
          Upload Class List
        </button><br>
        <br>
        <div v-if="class_list.length>0" style="text-align: left">
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
        </div>
      </div>
    </form>
    <!--
    <br>
    
    <div id="Grid" class="border">
      The grid goes here!
      
      Tip: use vue's v-for attribute to loop through the number of rows and columns and add a box element each
      Here's an example of a vue grid: https://vuejs.org/v2/examples/grid-component.html
      *careful: that specific example is for vue 2 and we are using vue 3 
      
    </div>
    -->

    <!-- Hidden file input (only allows .xlsx files) -->
    <input
      style="display:none"
      type="file"
      ref="excelInputField"
      @change="loadClassList"
      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import readXlsxFile from 'read-excel-file'

export default {
  name: "CreateSectionForm",

  data() {
    return {
      name: "",
      is_mandatory: false,
      class_list: [],
      absence_threshold: 0,

      layouts: [],
      layout_id: "",
      layout: [],
      rows: 0,
      columns: 0,
    };
  },

  computed: {
    // Import the getters from the global store
    ...mapGetters(["isProfessor"]),
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
    
    getLayouts() {
      // Call api to get the list of layouts for the dropdown
    },

    createLayout() {
      // Reset the grid and enable the rows/columns and save layout buttons
    },

    saveLayout() {
      // Call api to save the new layout
      /* Send data:
      - 2d array with numbers representing the type of seat (open-access, ...)
      */
    },

    createSection() {
      // Call api to create a new section
      /* Send data:
      - name
      - is_mandatory
      - absence_threshold
      - layout_id
      - class_list
      */
    },

    saveSection() {
      // Call api to save the section
      /* Send data:
      - name
      - is_mandatory
      - absence_threshold
      - layout_id
      - class_list (?)
      */
    },
  },
};
</script>

<style lang="scss" scoped >
#Grid {
  box-sizing: border-box;
  width: 100%;
  min-height: 200px;
  padding: 10px;
  text-align: center;
}

.border {
  border: 3px solid black;
}

.column {
  display: inline-block;
}

.students {
  border-collapse: collapse;
  display: inline-block;
  max-height: 200px;
  width: auto;
  overflow-y: scroll;
  border: 1px solid black;
}
.students th, .students td {
  border: 1px solid black;
  padding: 5px;
}
</style>