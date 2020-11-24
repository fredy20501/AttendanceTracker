
<template>
  <footer class="banner">
    <button v-on:click="$router.go(-1)" v-if="showBackButton">Back</button>
    <button class="red" id="logout" v-if="isAuthenticated" v-on:click="logout">Logout</button>
    <br>
    <!-- Here I'm defining two source for the image. The first with media="(min-width...)"" will show 
    only if the screen reaches the minimum width. Otherwise it will show the other -->
    <picture>
      <source media="(min-width: 480px)" srcset="@/assets/UNB_Engineering_Fredericton_RGB_W.png" />
      <img style="" src="@/assets/UNB+Fredericton_RGB_W.png" alt="UNB Fredericton logo"/>
    </picture>
  </footer>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: "Footer",
  computed: {
    ...mapGetters([
      'isAuthenticated'
    ]),
    showBackButton: function() {
      return this.$route.meta.back
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout')
      .then(() => {
        // Go to login page
        this.$router.push({ name:'login' })
      })
      .catch(() => {
        this.$notify({ 
          title: "Could not logout. Please try again later", 
          type: 'error'
        });
      })
    }
  }
}
</script>

<style scoped>
img {
  width: auto;
  height: 100px;
}
button {
  width: auto;
  padding: 0 10px;
  margin-left: 10px;
  position: relative;
  left: -10px;
}
</style>