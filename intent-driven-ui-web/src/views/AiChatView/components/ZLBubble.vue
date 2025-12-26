<template>
  <div class="zl-bubble">
    <div>{{ content }}</div>
    <div v-if="loading">Loading...</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ZLBubble'
})
defineProps({
  content: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped></style>
