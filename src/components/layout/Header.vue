
<template>
  <header class="banner">
    <h1>Attendance Tracker</h1>
    <div v-if="isAuthenticated">  <!--Only shows after login-->
      
      <div v-if="isProfessor">
         <h2>{{this.getUser.name}}	&#9413; </h2>
      </div>
      
      <div v-else>
        <h2>{{this.getUser.name}}	&#9416; </h2>
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
<style lang="scss" scoped>
.profileButton {
  position:absolute;
  top:5px;
  right:5px;
  border:1px solid white;
  padding: 3px;
  font-size:1.1em;
}
</style>
