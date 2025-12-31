<template>
  <div class="id-layout-aside" :class="{ 'id-layout-aside--visible': showAside }">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  showAside: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.id-layout-aside {
  width: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}
.id-layout-aside--visible {
  width: 50%;
  border-left: 1px solid #e0e0e0;
}
</style>
