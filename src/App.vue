<template>
  <div id="app">
    <div id="nav">
      <h1>Attendance Tracker</h1>
      <h2>Login</h2>
      <br>
      <h2> Email Address</h2>
      <input style='width: 300px' v-model="message" placeholder="Email Address">
      <h2>Password</h2>
      <input style='width: 300px' v-model="message" placeholder="Password">
      <br><br>
      <button style='width: 310px' >Login</button>
      <br><br>
      <button style='width: 310px'  >Create Account</button>
      <br><br>
      <button style='width: 310px' >Forgot Password</button>
      <br><br>
       <img src="src/assets/UNB.PNG" />
    </div>
    <router-view/>
  </div>
</template>


<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
