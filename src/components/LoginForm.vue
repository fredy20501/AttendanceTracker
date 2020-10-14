<template>
  <div>
    <h2>Login</h2>
    <br>
    <ValidationObserver v-slot="{ handleSubmit, invalid }">
      <form @submit.prevent="handleSubmit(login)" class="column">
        <ValidationProvider name="Email Address" rules="required|email" v-slot="{ errors }">
          <label for="Email">Email Address</label><br>
          <input id="Email" type="email" placeholder="Email Address" v-model="email">
          <span v-if="errors.length" class="error">{{ errors[0] }}</span>
        </ValidationProvider>
        <br><br>
        <ValidationProvider name="Password" rules="required|min:6" v-slot="{ errors }">
          <label for="Password">Password</label><br>
          <input id="Password" type="password" placeholder="Password" v-model="password">
          <span v-if="errors.length" class="error">{{ errors[0] }}</span>
        </ValidationProvider>
        <br><br>
        <button type="submit" :disabled="invalid">Login</button>
        <br><br>
        <button @click="$router.push('create-account')">Create Account</button>
        <br><br>
        <button @click="forgotPassword">Forgot Password</button>
        <br><br>
      </form>
    </ValidationObserver>
  </div>
</template>

<!--
VeeValidate Tutorial: https://www.youtube.com/watch?v=XwND-DLWCF0
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
