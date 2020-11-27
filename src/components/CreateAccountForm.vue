<template>
  <div>
    <h2>Create Account</h2>
    <br>
    
    <ValidationObserver v-slot="{ handleSubmit, invalid }">
      <form @submit.prevent="handleSubmit(createAccount)" class="column">
        <div>
          <label>Account Type</label><br>
          <input id="StudentAccount" type="radio" name="account" value="student"
            v-model="accountType">
          <label for="StudentAccount" class="radio">Student</label>
          <br>
          <input id="ProfessorAccount" type="radio" name="account" value="professor"
            v-model="accountType">
          <label for="ProfessorAccount" class="radio">Professor</label>
        </div>
        <br>
        <div>
          <ValidationProvider name="Name" rules="required" v-slot="{ errors }">
            <label for="name">Name</label><br>
            <input id="name" type="text" placeholder="Name" v-model="name">
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <br>
        <div>
          <ValidationProvider name="Email Address" rules="required|email|unbEmail" v-slot="{ errors }">
            <label for="email">Email Address</label><br>
            <input id="email" type="email" autocomplete="email" placeholder="Email Address" v-model="email">
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <br>
        <div>
          <ValidationProvider name="Password" rules="required|min:6|confirmed:confirmation" v-slot="{ errors }">
            <label for="password">Password</label><br>
            <input id="password" type="password"  placeholder="Password" v-model="password">
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <br>
        <div>
          <ValidationProvider name="Confirmation" vid="confirmation">
            <label for="password-conf">Password Confirmation</label><br>
            <input id="password-conf" type="password" placeholder="Password" v-model="passwordConfirmation">
          </ValidationProvider>
        </div>
        <br>
        <div>
          <SpinnerButton 
            class="blue"
            label="Create Account"
            type="submit"
            width="100%"
            height="30px"
            :disabled="$wait.waiting('register') || invalid"
            :loading="$wait.waiting('register')"
          />
        </div>
      </form>
    </ValidationObserver>
  </div>
</template>


<script>
import { mapGetters } from 'vuex'
import SpinnerButton from './SpinnerButton'

export default {
  name: 'CreateAccount',
  components: {
    SpinnerButton
  },
  data() {
    return {
      accountType: 'student',
      name: '',
      email: '',
      password: '',
      passwordConfirmation: ''
    }
  },

  computed: {
    // Import the getters from the global store
    ...mapGetters([
      'isProfessor'
    ])
  },

  methods: {
    createAccount() {
      // Start the loading spinner
      this.$wait.start('register')

      // Register & Login
      this.$store.dispatch('registerAndLogin', {
        name: this.name,
        email: this.email,
        is_professor: this.accountType == 'professor',
        password: this.password
      })
      .then(() => {
        // Redirect to their home page
        this.$router.push('/home');
        // Stop loading spinner
        this.$wait.end('register')
      })
      .catch(err => {
        console.log(err)
        // Show a notification with the error message
        if (err.message) {
          this.$notify({ 
            title: err.message, 
            type: err.type ?? 'error'
          });
        }
        // Stop loading spinner
        this.$wait.end('register')
      });
    }
  }
}
</script>

<style scoped lang="scss">
label.radio {
  font-weight: normal;
}
</style>