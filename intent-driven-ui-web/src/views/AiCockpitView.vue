<template>
  <IdLayout>
    <IdLayoutChat>
      <IdLayoutHeader>
        <IdHeader title="Intent Driven UI" :is-logo-clickable="true" @logo-click="handleLogoClick">
          <template #operation>
            <button @click="togglePanel">切换侧边栏</button>
            <button @click="handleSettings">设置</button>
          </template>
        </IdHeader>
      </IdLayoutHeader>
      <IdLayoutContent>
        <!-- 基本用法 -->
        <IdBubble content="Hello MateChat!" align="left" />
        <IdBubble content="Hello MateChat!" align="right" />
      </IdLayoutContent>
      <IdLayoutSender>
        <IdInput placeholder="请输入" />
      </IdLayoutSender>
    </IdLayoutChat>
    <IdLayoutAside :show-aside="showRightPanel"> </IdLayoutAside>
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
import { IdHeader } from '@/components/shared/Header'
import { IdBubble } from '@/components/shared/Bubble'
import { IdInput } from '@/components/shared/Input'

const showRightPanel = ref(false)

const togglePanel = () => {
  showRightPanel.value = !showRightPanel.value
}

const handleLogoClick = () => {
  console.log('Logo clicked!')
}

const handleSettings = () => {
  console.log('Settings clicked!')
}
</script>

<style scoped>
.main-container {
  min-height: 100vh;
}
</style>
