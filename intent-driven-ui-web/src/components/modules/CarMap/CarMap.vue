<template>
  <div class="car-map">
    <Amap class="amap"></Amap>
  </div>
</template>

<script setup lang="ts">
import { Amap } from '@/components/shared/Amap'
import { watch } from 'vue'
export interface TypeLatLng {
  lat: number
  lng: number
}
const myProps = defineProps({
  latLng: {
    type: Object as () => TypeLatLng | null,
    default: null
  }
})
watch(
  () => myProps.latLng,
  (newVal) => {
    console.log('latLng changed:', newVal)
    // 在这里可以添加更新地图位置的逻辑
  },
  {
    immediate: true
  }
)
</script>

<style scoped lang="scss">
.car-map {
  width: 100%;
  height: 400px;
  &.amap {
    width: 100%;
    height: 100%;
  }
}
</style>
