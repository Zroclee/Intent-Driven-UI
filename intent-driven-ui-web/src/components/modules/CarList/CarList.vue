<template>
  <div class="car-list">
    <IdTableList :columns="myProps.columns" :data="myProps.data" />
  </div>
</template>

<script setup lang="ts">
import { IdTableList, type Column } from '@/components/shared/TableList'

export interface CarData {
  id: string
  name: string
  plateNumber: string
  driver: string
  status: string
}

export interface CarListProps {
  // 这里可以添加组件的 props 定义
  data: CarData[]
  columns: Column[]
}

const myProps = defineProps<CarListProps>()
</script>

<style scoped>
.car-list {
  padding: var(--id-spacing-lg);
}
</style>
