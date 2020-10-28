<template>
  <div>
    <h2>Manage Layout</h2>
    <br>

    <!-- Basic dropdown for selecting layout -->
    <label>Select Layout</label><br>
    <select @change="stopSelect" style="height: 30px; padding: 0 5px;" v-model="layoutSelected">
      <option v-for="(layout, i) in layouts" v-bind:key="i" :value="i"
        v-bind:class="{bold: layout.type=='new'}"
      >
        {{ layout.name }}
        <span v-if="layout.type=='new'">
          *(not saved)
        </span>
      </option>
    </select>

    <br>
    <br>

    <!-- Basic button for adding new layout -->
    <button style="width:300px" v-on:click="createLayout">
      New layout
    </button>

    <br>
    <br>

    <!-- Basic column/rows buttons -->
    <button class="small-button" :disabled="!isCurrentLayoutNew || columns>=50" v-on:click="addColumn">+</button>
    Columns: 
    <span v-if="layouts.length>0">
      {{columns}}
    </span>
    <button class="small-button" :disabled="!isCurrentLayoutNew || columns<=1" v-on:click="removeColumn">-</button>

    <br>
    <br>

    <button class="small-button" :disabled="!isCurrentLayoutNew || rows>=100" v-on:click="addRow">+</button>
    Rows: 
    <span v-if="layouts.length>0">
      {{rows}}
    </span>
    <button class="small-button" :disabled="!isCurrentLayoutNew || rows<=1" v-on:click="removeRow">-</button>

    <br>
    <br>

    <div class="legend">
      <h3>Legend</h3>
      
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

  </div>
</template>

<script>

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
      layoutSelected: 0,

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
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
      }
    };
  },

  // mounted is called when the page loads
  mounted() {
    this.getLayouts()
  },

  computed: {
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

  methods: {

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
  width: 30px;
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
</style>