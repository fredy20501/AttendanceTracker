
<template>
  <header class="banner" style="position:relative">
    <h1>Attendance Tracker</h1>
    <div v-if="isAuthenticated" v-on:click="$router.push({name:'home'})" class="profileButton">  <!--Only shows after login-->
      
      <div v-if="isProfessor">
        &#9413; {{this.getUser.name}}
      </div>
      
      <div v-else>
        &#9416; {{this.getUser.name}}
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
