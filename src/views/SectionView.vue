<template>
  <div>
    <!-- Show only one component depending on the user -->
    <!-- <StudentSectionView v-if="!isProfessor"/> -->
    <div v-if="!isProfessor">
      <h2>Student Course View</h2>
      This page has not been implemented yet. Come back later!
      <br>
      <SpinnerButton 
        color="red"
        label="Drop Section"
        type="button"
        width="300px"
        height="30px"
        :onClick="confirmDropSection"
        :disabled="$wait.waiting('dropSection')"
        :loading="$wait.waiting('dropSection')"
        />
    </div>

    <ProfessorSectionView v-if="isProfessor"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import StudentSectionView from '@/components/StudentSectionView.vue'
// The StudentSectionView is commented out since it will be added in a different git branch
// (we will uncoment it when it gets merged)
import ProfessorSectionView from '@/components/ProfessorSectionView.vue'
import SpinnerButton from '@/components/SpinnerButton.vue'

export default {
  name: 'SectionView',
  components: {
    // StudentSectionView,
    ProfessorSectionView,
    SpinnerButton
  },
  computed: {
    // Import the getters from the global store
    ...mapGetters([
      'isProfessor', 'getUser'
    ])
  },
  methods: {

    confirmDropSection() {
      this.$dialog.confirm('Are you sure?')
      .then(() => {
        this.dropSection()
      })
      .catch(() => {})
    },

    dropSection() {
      // Start the loading spinner
      this.$wait.start('dropSection')

      this.$store.dispatch('dropSection', {
        courseID: this.courseId,
        studentID: this.getUser.id
      })
      .then(() => {
        // Redirect to home page
        this.$router.push({name: 'home'})
        // Show success notification
        this.$notify({
          title: 'Section dropped successfully!',
          type: 'success'
        })
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
      })
      .finally(() => {
        // Stop the loading spinner
        this.$wait.end('dropSection')
      })
    }
  }
}
</script>