
<template>
  <header class="banner">
    <h1>Attendance Tracker</h1>
    <div v-if="isAuthenticated">
      <div style="text-align:left; width:49%; display: inline-block;">
        <h2>{{this.getUser.name}}</h2>
      </div>
      <div v-if="isProfessor" style="text-align:right; width:50%; display: inline-block;">
        <h2>Professor</h2>
      </div>
      <div v-else style="text-align:right; width:50%; display: inline-block;">
        <h2>Student</h2>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Header",

  computed: {
    // Import the getters from the global store
    ...mapGetters(["getUser", "isAuthenticated","isProfessor"]),
  }
}

</script>