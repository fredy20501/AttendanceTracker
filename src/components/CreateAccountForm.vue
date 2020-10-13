<template>
  <div>
    <h2>Create Account</h2>
    <br>
    <form class="column">
      <label>Account Type</label><br>
      <input id="StudentAccount" type="radio" name="account" value="student"
        v-model="accountType">
      <label for="StudentAccount" class="radio">Student</label>
      <br>
      <input id="ProfessorAccount" type="radio" name="account" value="Professor" 
        v-model="accountType">
      <label for="ProfessorAccount" class="radio">Professor</label>
      <br><br>
      <label for="Email">Email Address</label><br>
      <input id="Email" type="text" placeholder="Email Address" v-model="email">
      <br><br>
      <!-- v-if will only show this element if showStudentID is true -->
      <span v-if="showStudentID" >
        <label for="StudentID">Student Number</label><br>
        <input id="StudentID" type="text" placeholder="Student Number" v-model="studentID">
        <br><br>
      </span>
      <label for="Password">Password</label><br>
      <input id="Password" type="text" placeholder="Password" v-model="password">
      <br><br>
      <label for="Password">Confirm Password</label><br>
      <input id="Password" type="text" placeholder="Password" v-model="passwordCheck">
      <br><br>
      <button @click="createAccount">Create Account</button>
      <br><br>
      <button @click="$router.push('/')">Back</button>
      <br><br>
    </form>
  </div>
</template>

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
