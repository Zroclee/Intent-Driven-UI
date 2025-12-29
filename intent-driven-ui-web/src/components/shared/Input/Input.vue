<template>
  <div class="id-input">
    <slot></slot>
    <textarea :placeholder="placeholder" :value="value"></textarea>
  </div>
</template>

<script setup lang="ts">
defineProps({
  placeholder: {
    type: String,
    default: ''
  },
  value: {
    type: String,
    default: ''
  }
})
</script>
<style scoped lang="scss">
@use './input.scss';
</style>
