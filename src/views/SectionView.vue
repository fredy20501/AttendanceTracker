<template>
  <div>
    <!-- Show only one component depending on the user -->
    <StudentSectionView v-if="!isProfessor"/>
    <ProfessorSectionView v-if="isProfessor"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import StudentSectionView from '@/components/StudentSectionView.vue'
import ProfessorSectionView from '@/components/ProfessorSectionView.vue'

export default {
  name: 'SectionView',
  components: {
    StudentSectionView,
    ProfessorSectionView
  },
  computed: {
    // Import the getters from the global store
    ...mapGetters([
      'isProfessor'
    ])
  },
}
</script>
