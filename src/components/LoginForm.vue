<template>
  <div>
    <h2>Login</h2>
    <br>
    <form @submit.prevent class="column">
      <!-- The `for` attribute specifies the id for the input it is labeling. It is for accessibility reasons -->
      <label for="Email">Email Address</label><br>
      <input id="Email" type="text" placeholder="Email Address" v-model="email">
    
      <br><br>
      <label for="Password">Password</label><br>
      <input id="Password" type="text" placeholder="Password" v-model="password">
      <br><br>
      <button @click="login">Login</button>
      <br><br>
      <button @click="$router.push('create-account')">Create Account</button>
      <br><br>
      <button @click="forgotPassword">Forgot Password</button>
      <br><br>
    </form>
  </div>
</template>

<!--
IDEA: 
Maybe use VeeValidate to make error/invalid popup show up if values are wrong/missing
Resource: https://logaretm.github.io/vee-validate/
 -->

<script>
export default {
  name: 'LoginForm',

  // These are the variables we are using on this page 
  // (see `v-model` in the html above)
  data() {
      return {
          email: '',
          password: ''
      }
  },

  // Here we define functions we can call when a certain event happens 
  // (see `@click` in the html above)
  methods: {
    login() {
      // Log the values to the console 
      // (you can open the console by pressing F12 in your browser)
      console.log("Email: ", this.email);
      console.log("Password: ", this.password);

      // TODO: make call to login API
    },
    forgotPassword() {
      // TODO: Send email with a link to reset password
    }
  }
}
</script>
