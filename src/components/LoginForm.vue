<template>
  <div>
    <h2>Login</h2>
    <br>
    <ValidationObserver v-slot="{ handleSubmit, invalid }">
      <form @submit.prevent="handleSubmit(login)" class="column">
        <div>
          <ValidationProvider name="Email" rules="required|email" v-slot="{ errors }">
            <label for="email">Email Address</label><br>
            <input id="email" type="email" autocomplete="email" placeholder="Email Address" v-model="email">
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
            color="blue"
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
      // Start the loading spinner
      this.$wait.start('login')

      // Make call to login API
      this.$store.dispatch('login', {
        email: this.email,
        password: this.password
      })
      .then(() => {
        // Redirect to their home page
        this.$router.push('/home');
        // Stop the loading spinner
        this.$wait.end('login')
      })
      .catch(err => {
        console.log(err);
        // Show a notification with the error message
        if (err.message) {
          this.$notify({ 
            title: err.message, 
            type: err.type ?? 'error'
          });
        }
        // Stop the loading spinner
        this.$wait.end('login')
      });
    },

    forgotPassword() {
      // TODO: Send email with a link to reset password
    }
  }
}
</script>
