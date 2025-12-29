<template>
  <IdLayout>
    <IdLayoutChat>
      <IdLayoutHeader>
        <button @click="togglePanel">Toggle Right Panel</button>
      </IdLayoutHeader>
      <IdLayoutContent></IdLayoutContent>
      <IdLayoutSender></IdLayoutSender>
    </IdLayoutChat>
    <IdLayoutAside> </IdLayoutAside>
  </IdLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  IdLayout,
  IdLayoutChat,
  IdLayoutHeader,
  IdLayoutContent,
  IdLayoutSender,
  IdLayoutAside
} from '@/components/layout'

const showRightPanel = ref(false)

const togglePanel = () => {
  showRightPanel.value = !showRightPanel.value
}
</script>

<style scoped>
.main-container {
  min-height: 100vh;
}
</style>
