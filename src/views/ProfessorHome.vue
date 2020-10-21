<template>
  <div>
    <h1>Professor Home</h1>
    <div>Welcome {{ getUser.name }}!</div>
    <br>
    <button v-on:click="$router.push({ name:'createSection' })">Create Section</button>
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
  }
}
</script>

<style scoped lang="scss">
button {
  width: auto;
  padding: 0 10px;
}
</style>
