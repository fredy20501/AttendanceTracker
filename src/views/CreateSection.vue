<template>
  <div>
    <CreateSectionForm />
    <br>
    <br>
    <br>
    <hr style="border: 10px solid black">
    <br>
    <br>
    <br>
    <TempCreateSectionLogic />
  </div>
</template>

<script>
import CreateSectionForm from '@/components/CreateSectionForm.vue'
import TempCreateSectionLogic from '@/components/TempCreateSectionLogic.vue'

export default {
  name: 'CreateSection',
  components: {
    CreateSectionForm,
    TempCreateSectionLogic
  },
}
</script>
