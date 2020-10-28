<template>
  <div>
    <h2>Create/Edit Section</h2>
    <ValidationObserver v-slot="{ handleSubmit, invalid }">

        <form @submit.prevent="handleSubmit(createSection)" class="column">

            <div>
                <label>Attendance Type</label><br>
                <input id="Mandatory" type="radio" name="attendance" value="mandatory"
                    v-model="attendanceType">
                <label for="Mandatory" class="radio">Mandatory Attendance</label>
                <br>
                <input id="Opt" type="radio" name="attendance" value="opt"
                    v-model="attendanceType">
                <label for="Opt" class="radio">Opt in/Opt out</label>
            </div>

            <ValidationProvider name="Section Tag" rules="required|alpha_dash" v-slot="{ errors }">

                <div class="form-group">
                    <label>Section Tag</label>
                    <input type="sectionTag" class="form-control" v-model="section">
                    <span v-if="errors.length" class="error">{{ errors[0] }}</span>
                </div>

            </ValidationProvider>

             <ValidationProvider name="Absent Threshold" rules="required|integer|min:0" v-slot="{ errors }">

                <div class="form-group">
                    <label>Absent Threshold</label>
                    <input type="absentThreshold" class="form-control" v-model="absentThreshold">
                    <span v-if="errors.length" class="error">{{ errors[0] }}</span>
                </div>

            </ValidationProvider>

            <SpinnerButton 
            label="Save Section"
            width="100%"
            height="30px"
            type="submit"
            :disabled="$wait.waiting('register') || invalid"
            :loading="$wait.waiting('register')"
          />

    </ValidationObserver>

 
</div>
</template>



<script>
import SpinnerButton from './SpinnerButton'
export default {

     data() {
        return {
        sectionTag: '',
        absentThreshold: '',
        attendanceType: '',
        }
    
    },


    methods: {

            createSection() {

                console.log(this.data());

            }

    }
}   
</script>

<style scoped lang="scss">
label.radio {
  font-weight: normal;
}