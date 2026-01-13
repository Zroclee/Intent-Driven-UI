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
  position: relative;
  width: 0;
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
  background-color: var(--id-bg-page-container);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.id-layout-aside--visible {
  width: 50%;
  border-left: 1px solid #e0e0e0;
}
</style>
