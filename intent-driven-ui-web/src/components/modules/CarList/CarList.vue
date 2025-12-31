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

// const columns = ref<Column[]>([
//   { field: 'id', title: 'ID' },
//   { field: 'name', title: '车辆名称' },
//   { field: 'plateNumber', title: '车牌号' },
//   { field: 'driver', title: '驾驶员' },
//   { field: 'status', title: '状态' }
// ])

// const carData = ref<CarData[]>([
//   {
//     id: '1',
//     name: '奥迪 A6L',
//     plateNumber: '京A 12345',
//     driver: '张三',
//     status: '行驶中'
//   },
//   {
//     id: '2',
//     name: '宝马 5系',
//     plateNumber: '京B 67890',
//     driver: '李四',
//     status: '空闲'
//   },
//   {
//     id: '3',
//     name: '奔驰 E级',
//     plateNumber: '京C 11111',
//     driver: '王五',
//     status: '维修中'
//   }
// ])
</script>

<style scoped>
.car-list {
  padding: var(--id-spacing-lg);
}
</style>
