<template>
  <div class="id-table-list">
    <table class="id-table-list__table">
      <thead class="id-table-list__thead">
        <tr>
          <th v-for="column in columns" :key="column.field" class="id-table-list__th">
            {{ column.title }}
          </th>
        </tr>
      </thead>
      <tbody class="id-table-list__tbody">
        <tr v-for="(row, rowIndex) in data" :key="rowIndex" class="id-table-list__tr">
          <td v-for="column in columns" :key="column.field" class="id-table-list__td">
            {{ row[column.field] }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="data.length === 0" class="id-table-list__empty">暂无数据</div>
  </div>
</template>

<script setup lang="ts">
export interface Column {
  field: string
  title: string
}

export interface TableRow {
  [key: string]: any
}

interface Props {
  columns: Column[]
  data: TableRow[]
}

withDefaults(defineProps<Props>(), {
  columns: () => [],
  data: () => []
})
</script>

<style scoped lang="scss">
@use './tableList.scss';
</style>
