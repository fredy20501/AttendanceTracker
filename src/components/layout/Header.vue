
<template>
  <header class="banner">
    <h1>Attendance Tracker</h1>
    <div v-if="isAuthenticated">
      <div v-if="isProfessor">
        <h2>Welcome, Professor {{this.getUser.name}}</h2>
      </div>
      <div v-else>
        <h2>Welcome, {{this.getUser.name}}</h2>
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