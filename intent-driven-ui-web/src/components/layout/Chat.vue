<template>
  <div class="id-layout-chat">
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
.id-layout-chat {
  display: flex;
  flex-direction: column;
  flex: auto;
}
</style>
