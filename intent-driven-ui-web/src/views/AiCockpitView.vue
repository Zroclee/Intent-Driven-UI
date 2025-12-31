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
    <IdLayoutAside :show-aside="showRightPanel">
      <component :is="loadComponent" v-bind="componentProps"></component>
    </IdLayoutAside>
  </IdLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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

import { getComponentByName } from '@/components/modules/index'

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

// const curComponent = ref('CarMap')
// const componentProps = ref({
//   latLng: { lat: 39.90923, lng: 116.397428 }
// })

const curComponent = ref('CarList')
const componentProps = ref({
  columns: [
    { field: 'id', title: 'ID' },
    { field: 'name', title: '车辆名称' },
    { field: 'plateNumber', title: '车牌号' },
    { field: 'driver', title: '驾驶员' },
    { field: 'status', title: '状态' }
  ],
  data: [
    {
      id: '1',
      name: '奥迪 A6L',
      plateNumber: '京A 12345',
      driver: '张三',
      status: '行驶中'
    },
    {
      id: '2',
      name: '宝马 5系',
      plateNumber: '京B 67890',
      driver: '李四',
      status: '空闲'
    },
    {
      id: '3',
      name: '奔驰 E级',
      plateNumber: '京C 11111',
      driver: '王五',
      status: '维修中'
    }
  ]
})
const loadComponent = computed(() => {
  return getComponentByName(curComponent.value)
})
</script>

<style scoped>
.main-container {
  min-height: 100vh;
}
</style>
