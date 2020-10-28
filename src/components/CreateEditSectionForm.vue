<template>
  <div>
    <h2>Create/Edit Section</h2>
    <br>
    
    <ValidationObserver v-slot="{ handleSubmit, invalid }">
      <form @submit.prevent="handleSubmit(sectionName)" class="column">
        <div>
          <ValidationProvider name="Name" rules="required" v-slot="{ errors }">
            <label for="name">Section Tag</label><br>
            <input name="sectionTag" type="text" placeholder="Section Tag" v-model="name">
              <datalist id=ExistingTags>
                <!--Example, should import user's sections from db-->
                <option value=ADAM-ECE3221-FRO1B-LEC></option>
              </datalist>
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <div>
          <SpinnerButton 
            label="Add Section"
            width="100%"
            height="30px"
            type="submit"
            :disabled="$wait.waiting('addSection') || invalid"
            :loading="$wait.waiting('addSection')"
          />
        </div>
        <div>
          <SpinnerButton 
            label="Save Section"
            width="100%"
            height="30px"
            type="submit"
            :disabled="$wait.waiting('saveSection') || invalid"
            :loading="$wait.waiting('saveSection')"
          />
        </div>
        <br>
        <div>
          <label>Attendence Type</label><br>
          <input id="MandatoryAttendence" type="radio" name="attendence" value="mandatory"
            v-model="attendenceType">
          <label for="MandatoryAttendence" class="radio">Mandatory Attendence</label>
          <br>
          <input id="OptInAttendence" type="radio" name="attendence" value="optIn"
            v-model="attendenceType">
          <label for="OptInAttendence" class="radio">Opt In/Opt Out</label>
        </div>
        <div>
          <SpinnerButton 
            label="Upload Class List"
            width="100%"
            height="30px"
            type="submit"
            :disabled="$wait.waiting('uploadClassList') || invalid"
            :loading="$wait.waiting('uploadClassList')"
          />
        </div>
        <br>
        <div>
          <ValidationProvider name="absentThreshold" rules="required" v-slot="{ errors }">
            <label for="absentThreshold">Absent Threshold</label><br>
            <input name="absentThreshold" type="text" placeholder="Absent Threshold" v-model="name">
            <span v-if="errors.length" class="error">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <br>
        <div>
          <button>+</button>
          <label >Columns: </label>
          <button>-</button>
        </div>
        <br>
        <div>
          <button>+</button>
          <label >Rows: </label>
          <button>-</button>
        </div>
        <br><br>
        <div>
          <label >Seat Legend: </label><br>
          <label >Locked  Open  Absent  Avalible  Reserved</label><br>
        </div>
        <br>
        <select placeholder="Select Layout">
          <datalist id=existingLayouts>
          </datalist>
        </select>
        <div>
          <button >Create New Layout</button>
        </div>
        <div>
          <button>Save Layout</button>
        </div>
        <br><br>
        <div>
          <button @click="$router.push('/professor')">Back</button>
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
      'getUser'
    ])
  },

  methods: {
    createAccount() {
      // Need to store 'this' since it won't work inside the .then() and .catch() blocks
      // More details: https://riptutorial.com/vue-js/example/28955/right--use-a-closure-to-capture--this-
      var vue = this;

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
        if (vue.getUser.is_professor) vue.$router.push('/professor');
        else vue.$router.push('/student')
      })
      .catch(err => {
        console.log(err)
        // Show a notification with the error message
        if (err.message) {
          vue.$notify({ 
            title: err.message, 
            type: err.type ?? 'error'
          });
        }
        // Stop loading spinner
        vue.$wait.end('register')
      });
    }
  }
}
</script>

<style scoped lang="scss">
label.radio {
  font-weight: normal;
}

div.half-circle-spinner {
  position: absolute;
  right: 4px;
  top: 4px;
}
</style>