<template>
  <div>
    <h2>Create Section (UI)</h2>
    <br>

    <form @submit.prevent>
      <!-- Put fields & buttons with their labels here -->
      

      <!-- This is the basics for the excel file upload -->
      <div style="text-align:left">
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

    <br>

    <div id="Grid" class="border">
      The grid goes here!
      <!-- Tip: use vue's v-for attribute to loop through the number of rows and columns and add a box element each
      Here's an example of a vue grid: https://vuejs.org/v2/examples/grid-component.html
      *careful: that specific example is for vue 2 and we are using vue 3 
      -->
    </div>


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