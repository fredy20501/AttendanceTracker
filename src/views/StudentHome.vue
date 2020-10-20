<template>
  <div>
    <h1>Student Home</h1>
    <div>Welcome {{ getUser.name }}!</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'StudentHome',
  computed: {
    ...mapGetters([
      'getUser'
    ])
  }
}
</script>