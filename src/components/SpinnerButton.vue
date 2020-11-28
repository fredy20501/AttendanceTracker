<template>
  <button 
    :class="color"
    :style="buttonStyle"
    v-on:click="onClick"
  >
    {{ label }}
    <HalfCircleSpinner 
      :style="spinnerStyle"
      v-if="loading"
      :animation-duration="1000"
      :size="spinnerSize"
      :color="autoColor"
    />
  </button>
</template>

<script>
export default {
  name: 'SpinnerButton',
  props: {
    color: String,
    label: String,
    width: String,
    height: String,
    loading: Boolean,
    onClick: {
      type: Function,
      default: () => {}
    }
  },
  computed: {
    heightNum() {
      return this.height.match(/\d+/)[0]
    },
    buttonStyle() {
      return 'width:'+this.width+'; height:'+this.height
    },
    spinnerSize() {
      return Math.min(this.heightNum-12, 30)
    },
    spinnerMargin() {
      return ((this.heightNum- this.spinnerSize)/4) + 'px'
    },
    spinnerStyle() {
      return 'right:'+this.spinnerMargin+'; top:'+this.spinnerMargin
    },
    autoColor() {
      return this.color == 'red' ? 'white' : 'black'
    }
  }
}
</script>

<style lang="scss" scoped >
button {
  position: relative;
}
div.half-circle-spinner {
  position: absolute;
}
</style>