<template>
  <div class="id-layout-content">
    <slot></slot>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.id-layout-content {
  flex: auto;
  min-height: 0;
  padding: 1rem;
}
</style>
