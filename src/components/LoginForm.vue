<template>
  <div>
    <h2>Login</h2>
    <br>
    <ValidationObserver v-slot="{ handleSubmit, invalid }">
      <form @submit.prevent="handleSubmit(login)" class="column">
        <div>
          <ValidationProvider name="Email" rules="required|email" v-slot="{ errors }">
            <label for="email">Email Address</label><br>
            <input id="email" type="email" autocomplete="username" placeholder="Email Address" v-model="email">
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <br>
        <div>
          <ValidationProvider name="Password" rules="required|min:6" v-slot="{ errors }">
            <label for="password">Password</label><br>
            <input id="password" type="password" autocomplete="current-password" placeholder="Password" v-model="password">
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <br>
        <div>
          <SpinnerButton 
            class="blue"
            label="Login"
            type="submit"
            width="100%"
            height="30px"
            :disabled="$wait.waiting('login') || invalid"
            :loading="$wait.waiting('login')"
          />
          <br><br>
          <button type="button" @click="$router.push('create-account')">Create Account</button>

          <!-- Don't show Forgot Password button until it is functional -->
          <div style="display:none">
            <br><br>
            <button type="button" @click="forgotPassword">Forgot Password</button>
          </div>
        </div>
      </form>
    </ValidationObserver>

    <div class="demo-accounts">
      <b>Test Student</b><br>
      email: test.student@unb.ca<br>
      password: testing123<br>
      <br>
      <b>Test Professor</b><br>
      email: test.professor@unb.ca<br>
      password: testing123<br>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SpinnerButton from './SpinnerButton'

export default {
  name: 'LoginForm',
  components: {
    SpinnerButton
  },
  data() {
    return {
      email: '',
      password: ''
    }
  },

  computed: {
    // Import the getters from the global store
    ...mapGetters([
      'isProfessor'
    ])
  },

  methods: {
    login() {

      // Need to store 'this' since it won't work inside the .then() and .catch() blocks
      // More details: https://riptutorial.com/vue-js/example/28955/right--use-a-closure-to-capture--this-
      var vue = this;

      // Start the loading spinner
      this.$wait.start('login')

      // Make call to login API
      this.$store.dispatch('login', {
        email: this.email,
        password: this.password
      })
      .then(() => {
        // Redirect to their home page
        vue.$router.push('/home');
        // Stop the loading spinner
        vue.$wait.end('login')
      })
      .catch(err => {
        console.log(err);
        // Show a notification with the error message
        if (err.message) {
          vue.$notify({ 
            title: err.message, 
            type: err.type ?? 'error'
          });
        }
        // Stop the loading spinner
        vue.$wait.end('login')
      });
    },

    forgotPassword() {
      // TODO: Send email with a link to reset password
    }
  }
}
</script>

<style lang="scss" scoped >
.demo-accounts {
  position: absolute;
  right: 10px;
  top: 10px;
  border: 1px dashed black;
  padding: 10px;
  text-align: left;
  opacity: 0.25;
}

// Hide the demo account block on small screen sizes
@media only screen and (max-width: 880px) {
  .demo-accounts {
    display: none;
  }
}
</style>