<template>
  <div>
    <h2>Login</h2>
    <br>
    <ValidationObserver v-slot="{ handleSubmit, invalid }">
      <form @submit.prevent="handleSubmit(login)" class="column">
        <div>
          <ValidationProvider name="Email Address" rules="required|email" v-slot="{ errors }">
            <label for="Email">Email Address</label><br>
            <input id="Email" type="email" placeholder="Email Address" v-model="email">
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <br>
        <div>
          <ValidationProvider name="Password" rules="required|min:6" v-slot="{ errors }">
            <label for="Password">Password</label><br>
            <input id="Password" type="password" placeholder="Password" v-model="password">
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <br>
        <div>
          <button type="submit" :disabled="invalid">Login</button>
          <br><br>
          <button @click="$router.push('create-account')">Create Account</button>
          <br><br>
          <button @click="forgotPassword">Forgot Password</button>
        </div>
      </form>
    </ValidationObserver>
    <notifications style="margin-top:5px" position="top center"/>
  </div>
</template>

<!--
VeeValidate Tutorial: https://www.youtube.com/watch?v=XwND-DLWCF0
 -->

<script>
const axios = require('axios').default;

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
      // Need to store 'this' since it won't work inside the .then() and .catch() blocks
      // More details: https://riptutorial.com/vue-js/example/28955/right--use-a-closure-to-capture--this-
      var vue = this;

      // Make call to login API
      axios.post('http://localhost:5000/api/login', {
        email: this.email,
        password: this.password
      })
      .then(function (resp) {
        console.log(resp);

        // Redirect to their home page
        if (resp.data.is_professor) vue.$router.push('/professor');
        else vue.$router.push('/student');
      })
      .catch(function (err) {
        vue.$notify({ title: "Invalid email or password", type: "error" });
        console.log(err);
      });
    },
    forgotPassword() {
      // TODO: Send email with a link to reset password
    }
  }
}
</script>
