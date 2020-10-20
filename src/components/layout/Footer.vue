
<template>
  <div>
    <br>
    <br>
    <button v-if="isAuthenticated" v-on:click="logout">Logout</button>
    <br>
    <!-- Here I'm defining two source for the image. The first with media="(min-width...)"" will show 
    only if the screen reaches the minimum width. Otherwise it will show the other -->
    <picture>
      <source media="(min-width: 480px)" srcset="@/assets/UNB_Engineering_Fredericton_RGB_K.png" />
      <img style="" src="@/assets/UNB+Fredericton_RGB_K.png" />
    </picture>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: "Footer",
  computed: {
    ...mapGetters([
      'isAuthenticated'
    ])
  },
  methods: {
    logout() {
      const vue = this;

      this.$store.dispatch('logout')
      .then(() => {
        vue.$router.push('/')
      })
      .catch(() => {
        vue.$notify({ 
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
  max-width: 445px;
  width: 100%;
  height: auto;
}
button {
  width: auto;
  padding: 0 10px;
}
</style>