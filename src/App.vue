<template>
  <div id="app">
    <Header />
    <main>
      <notifications class="custom-notification" position="top center"/>
      <transition name="fade" mode="out-in">
        <router-view style="margin:10px;"/>
      </transition>
    </main>
    <br>
    <br>
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

* {
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
}

// ====== Make footer always at the bottom of the screen ======
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}
#app {
  position: relative;
  height: auto !important;
  min-height: 100%;
  padding-bottom: 155px;
}
footer {
  position: absolute;
  width: 100%;
  bottom: 0;
}
// ============================================================

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

.banner {
  background: #333;
  color: #fff;
  text-align: center;
  padding: 10px;
  border-left: solid 20px #cc0000;
}

// Make banners flush with the screen on small screens
@media only screen and (max-width: 900px) {
  body { margin: 0; }
}

// Custom transition
.fade-enter-active,
.fade-leave-active {
  transition: opacity .3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.custom-notification {
  // Style of the notification itself 
  margin-top: 5px;
 
  .notification-title {
    // Style for title line
    color: black;
  }
 
  .notification-content {
    // Style for content
    color: black;
  }
}

.legend {
  > div {
    display: inline-block;
      width: 80px;
    .seat {
      margin: auto;
    }
    
  }
  > div:not(:last-child) {
    margin-right: 10px;
  }
}

.grid-layout {
  overflow: auto;
  box-sizing: border-box;
  width: 100%;
  height: 350px;
  padding: 10px;
  border: 3px solid black;

  table {
    margin: auto;
  }
}

.seat {
  padding: 5px;
  border-radius: 10px;
  border: 1px solid black;
  width: 40px;
  height: 33px;
  cursor: default;
}
.seat.selected {
  border: 3px solid #cc0000;
}
.seat.type-0 {
  background-color: darkgray;
}
.seat.type-1 {
  background-color: lightgray;
}
.seat.type-2 {
  background-color: white;
}
.seat.type-3 {
  background-color: lightblue;
}
.seat.type-2-3 {
  background: linear-gradient(90deg, white 50%, lightblue 50%);
}

.border {
  border: 1px solid black;
}
.bold {
  font-weight: bold;
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
  color: black;
}
button.blue {
  background-color: #24a0ee;
  color: black;
}
button.red:hover:enabled { background-color: #ba0000; }
button.green:hover:enabled { background-color: #1e901e; }
button.blue:hover:enabled { background-color: #1e87c9; }

/* Make buttons transparent rather 
than greyed-out when disabled */
button:disabled {
  opacity: 0.4
}

/* Customize the popup dialogs from vuejs-dialog */
div.dg-main-content {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-size: 1.1em;
  width: calc(98% - 30px);

  .dg-btn {
    border-radius: 0;
    width: 100px;
  }

  .dg-btn--ok {
    @extend .red;
    border-color: black;
  }
  .dg-btn--cancel {
    @extend .blue;
    border-color: black;
  }
}

.danger-zone {
  > div > div {
    text-align: left;
    display: inline-block;
    max-width: 300px;
    vertical-align: top;
  }
}
</style>
