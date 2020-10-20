
<template>
  <div>
    <br>
    <br>
    <!-- Here I'm defining two source for the image. The first with media="(min-width...)"" will show 
    only if the screen reaches the minimum width. Otherwise it will show the other -->
    <picture>
      <source media="(min-width: 480px)" srcset="@/assets/UNB_Engineering_Fredericton_RGB_K.png" />
      <img style="" src="@/assets/UNB+Fredericton_RGB_K.png" />
    </picture>
  </div>
</template>

<script>
export default {
  name: "Footer"
}
</script>

<style scoped>
img {
  max-width: 445px;
  width: 100%;
  height: auto;
}
</style>