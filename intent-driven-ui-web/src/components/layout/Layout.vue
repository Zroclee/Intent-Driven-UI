<template>
  <div class="id-layout">
    <slot></slot>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.id-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex: auto;
}
</style>
