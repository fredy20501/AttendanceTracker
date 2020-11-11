<template>
  <div>
    <h1>Professor Home</h1>
    <div>Welcome {{ getUser.name }}!</div>
    <br>
    <button v-on:click="createSection">Create Section</button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ProfessorHome',
  computed: {
    ...mapGetters([
      'getUser'
    ])
  },

  methods: {
    createSection() {
      // Go to the create section page 
      // (note that we do not pass a course id as a parameter, which means the page will be in 'create section' mode)
      this.$router.push({ name:'createSection' })
    }
  }
}
</script>

<style scoped lang="scss">
button {
  width: auto;
  padding: 0 10px;
}
</style>
