<template>
  <div>
    <!-- Show only one component depending on the user -->
    <!-- <StudentSectionView v-if="!isProfessor"/> -->
    <div v-if="!isProfessor">
      <h2>Student Course View</h2>
      This page has not been implemented yet. Come back later!
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

export default {
  name: 'SectionView',
  components: {
    // StudentSectionView,
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