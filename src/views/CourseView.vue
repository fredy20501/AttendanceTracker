<template>
  <div>
    <!-- Show only one component depending on the user -->
    <StudentCourseView v-if="!isProfessor"/>
    <!-- <ProfessorCourseView v-if="isProfessor"/> -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import StudentCourseView from '@/components/StudentCourseView.vue'
// The ProfessorCourseView is commented out since it will be added in a different git branch
// (we will uncoment it when it gets merged)
// import ProfessorCourseView from '@/components/ProfessorCourseView.vue'

export default {
  name: 'CourseView',
  components: {
    StudentCourseView,
    // ProfessorCourseView
  },

  computed: {
    // Import the getters from the global store
    ...mapGetters([
      'isProfessor'
    ])
  },
}
</script>
