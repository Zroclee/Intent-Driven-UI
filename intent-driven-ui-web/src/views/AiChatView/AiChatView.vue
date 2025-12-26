<template>
  <div class="ai-chat">
    <ZLHeader />
    <ZLContent>
      <ZLBubble content="Hi, I'm a chatbot" />
    </ZLContent>
    <ZLInput />
  </div>
</template>

<script setup lang="ts">
import { ZLHeader, ZLInput, ZLContent, ZLBubble } from './components'
</script>

<style scoped></style>
