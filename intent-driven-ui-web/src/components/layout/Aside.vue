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
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.id-layout-aside--visible {
  width: 300px;
  border-left: 1px solid #e0e0e0;
}
</style>
