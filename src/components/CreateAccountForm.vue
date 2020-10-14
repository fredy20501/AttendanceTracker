<template>
  <div>
    <h2>Create Account</h2>
    <br>
    
    <ValidationObserver v-slot="{ handleSubmit, invalid }">
      <form @submit.prevent="handleSubmit(createAccount)" class="column">
        <label>Account Type</label><br>
        <input id="StudentAccount" type="radio" name="account" value="student"
          v-model="accountType">
        <label for="StudentAccount" class="radio">Student</label>
        <br>
        <input id="ProfessorAccount" type="radio" name="account" value="Professor"
          v-model="accountType">
        <label for="ProfessorAccount" class="radio">Professor</label>
        <br><br>
        <ValidationProvider name="Email Address" rules="required|email" v-slot="{ errors }">
          <label for="Email">Email Address</label><br>
          <input id="Email" type="text" placeholder="Email Address" v-model="email">
          <span v-if="errors.length" class="error">{{ errors[0] }}</span>
        </ValidationProvider>
        <br><br>
        <!-- v-if will only show this element if showStudentID is true -->
        <span v-if="showStudentID" >
          <ValidationProvider name="Student Number" rules="required|numeric" v-slot="{ errors }">
            <label for="StudentID">Student Number</label><br>
            <input id="StudentID" type="text" placeholder="Student Number" v-model="studentID">
          <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
          <br><br>
        </span>
        <ValidationProvider name="Password" rules="required|min:6|confirmed:confirmation" v-slot="{ errors }">
          <label for="Password">Password</label><br>
          <input id="Password" type="text" placeholder="Password" v-model="password">
          <span v-if="errors.length" class="error">{{ errors[0] }}</span>
        </ValidationProvider>
        <br><br>
        <ValidationProvider name="Confirmation" vid="confirmation" v-slot="{ errors }">
          <label for="Password">Confirm Password</label><br>
          <input id="Password" type="text" placeholder="Password" v-model="passwordCheck">
          <span v-if="errors.length" class="error">{{ errors[0] }}</span>
        </ValidationProvider>
        <br><br>
        <button type="submit" :disabled="invalid">Create Account</button>
        <br><br>
        <button @click="$router.push('/')">Back</button>
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
  name: 'CreateAccount',
  data() {
    return {
      accountType: 'student',
      email: '',
      studentID:'',
      password: '',
      passwordCheck: ''
    }
  },
  computed: {
    // The showStudentID value is computed from accountType
    // and used to show/hide the student number field
    showStudentID: function() {
      return this.accountType == "student"
    }
  },
  methods: {
    createAccount() {
      console.log("Account Type: ", this.accountType);
      console.log("Student Number: ", this.studentID);
      console.log("Password: ", this.password);
      console.log("Confirmed Password: ", this.passwordCheck);

      // TOOD: Make API call
    }
  }
}
</script>

<style scoped lang="scss">
label.radio {
  font-weight: normal;
}
</style>
