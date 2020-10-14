<template>
  <div id="app">
    <Header />
    <router-view />
    <Footer />
  </div>
</template>

<script>
// @ is an alias to /src
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'

export default {
  name: "App",
  components: {
    Header,
    Footer
  }
}
</script>

<!-- This css is applied to ALL components because it does not have the `scoped` attribute. 
The lang="scss" means you can use the syntax of Sass (https://sass-lang.com/documentation/syntax) 
(it is a css pre-processor which allows fancy syntax - don't worry about it, you can just stick to plain css) -->
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-size: 1.1em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  max-width: 900px;
  margin: auto;
}

.column {
  max-width: 300px;
  margin: auto;
  text-align: left;
}

.error {
  background-color: #ffaaaa;
  font-size: 13.3px;
  padding: 2px;
}

input:not([type=radio]), button {
  width: 100%;
  height: 30px;
}

label, button {
  font-weight: bold;
}

button {
  font-size: 16px;
}

</style>
