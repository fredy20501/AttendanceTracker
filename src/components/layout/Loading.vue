
<template>
  <HalfCircleSpinner
    id="loadingSpinner"
    :animation-duration="1000"
    :size="100"
    :color="'#cc0000'"
  />
</template>

<script>
export default {
  name: "Loading"
}
</script>

<style lang="scss" scoped>
#loadingSpinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
}
</style>
