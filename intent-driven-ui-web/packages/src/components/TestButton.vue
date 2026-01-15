<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <button class="test-button">
    {{ label || 'Test Button' }}
    <slot></slot>
  </button>
</template>

<style scoped>
.test-button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
