<template>
  <div>
    <h2>Login</h2>
    <br>
    <label for="Email">Email Address</label><br/>
    <input id="Email" type="text" placeholder="Email Address">
    <br/><br/>
    <label for="Password">Password</label><br/>
    <input id="Password" type="text" placeholder="Password">
    <br><br>
    <button>Login</button>
    <br><br>
    <button>Create Account</button>
    <br><br>
    <button>Forgot Password</button>
    <br><br>

    <!-- The src must start with a `.` to make it relative to the current directory -->
    <img src="../assets/UNB.png" />
  </div>
</template>

<script>
export default {
  name: 'LoginForm'
}
</script>

<style scoped lang="scss">
input, button {
  width: 300px;
  height: 30px;
}

label, button {
  font-weight: bold;
}

button {
  font-size: 16px;
}
</style>
