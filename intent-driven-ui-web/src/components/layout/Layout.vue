<template>
  <div class="id-layout">
    <slot></slot>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.id-layout {
  display: flex;
  flex-direction: row;
  flex: auto;
}
</style>
