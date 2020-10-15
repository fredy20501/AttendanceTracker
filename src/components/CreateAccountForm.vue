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
            <label for="Name">Name</label><br>
            <input id="Name" type="text" placeholder="Name" v-model="name">
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <br>
        <div>
          <ValidationProvider name="Email Address" rules="required|email" v-slot="{ errors }">
            <label for="Email">Email Address</label><br>
            <input id="Email" type="text" placeholder="Email Address" v-model="email">
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <br>
        <div>
          <ValidationProvider name="Password" rules="required|min:6|confirmed:confirmation" v-slot="{ errors }">
            <label for="Password">Password</label><br>
            <input id="Password" type="text" placeholder="Password" v-model="password">
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <br>
        <div>
          <ValidationProvider name="Confirmation" vid="confirmation" v-slot="{ errors }">
            <label for="Password">Confirm Password</label><br>
            <input id="Password" type="text" placeholder="Password" v-model="passwordCheck">
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <br>
        <div>
          <button type="submit" :disabled="invalid">Create Account</button>
          <br><br>
          <button @click="$router.push('/')">Back</button>
          <br><br>
          <button @click="testAPI">Test API</button>
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
  name: 'CreateAccount',
  data() {
    return {
      accountType: 'student',
      name: '',
      email: '',
      password: '',
      passwordCheck: ''
    }
  },
  methods: {
    testAPI() {
      var vue = this;
      axios.get('http://localhost:5000/api/')
      .then(function (resp) {
        console.log(resp);
        vue.$notify({ title: "API reached! ("+resp.status+")", type: 'success' });
      })
      .catch(function (err) {
        console.log(err);
        vue.$notify({ title: "API could not be reached ("+err.status+")", type: 'error' });
      });
    },
    createAccount() {
      // Need to store 'this' since it won't work inside the .then() and .catch() blocks
      // More details: https://riptutorial.com/vue-js/example/28955/right--use-a-closure-to-capture--this-
      var vue = this;

      // Make call to register api
      axios.post('http://localhost:5000/api/register', {
        name: this.name,
        email: this.email,
        is_professor: this.accountType == 'professor',
        password: this.password
      })
      .then(function (resp) {
        console.log(resp);
        vue.$notify({ title: "Account created successfully!", type: "success" });
        
        // Automatically log the user in
        axios.post('http://localhost:5000/api/login', {
          email: vue.email,
          password: vue.password
        })
        .then(function (resp) {
          console.log(resp);
          // Redirect to their home page
          if (resp.data.is_professor) vue.$router.push('/professor');
          else vue.$router.push('/student');
        })
        .catch(function (err) {
          vue.$notify({ title: "Could not login automatically. Please try logging in manually.", type: "warn" });
          console.log(err);
        });

      })
      .catch(function (err) {
        console.log(err);
        vue.$notify({ title: "Could not create account. Please try again later.", type: "error" });
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
