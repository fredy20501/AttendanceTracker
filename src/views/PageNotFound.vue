<template>
  <div>
    <h1>Page not found</h1>
    <br>
    <button v-on:click="$router.push('/')">Back to login screen</button>
  </div>
</template>

<script>
export default {
  name: 'PageNotFound'
}
</script>

<style scoped lang="scss">
button {
  width: auto;
  padding: 0 10px;
}
</style>