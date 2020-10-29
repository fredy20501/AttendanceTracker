<template>
  <div id="app">
    <Header />
    <router-view style="position:relative;"/>
    <Footer />
    <notifications style="margin-top:5px" position="top center"/>
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

* {
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
}

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
  width: 300px;
  margin: auto;
  text-align: left;
}

.error {
  background-color: #ffaaaa;
  font-size: 13.3px;
  padding: 2px;
}

input:not([type=radio]), button, select {
  width: 100%;
  height: 30px;
  padding: 1px 2px;
}

label, button {
  font-weight: bold;
}

button {
  font-size: 16px;
}

div.vue-notification {
  font-size: 16px
}

/* Custom red/green buttons */
button.red {
  background-color: #cc0000;
  color: white;
}
button.green {
  background-color: #22a222;
  color: white;
}

/* Make buttons transparent rather 
than greyed-out when disabled */
button:disabled {
  opacity: 0.4
}

</style>
