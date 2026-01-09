<template>
  <div class="car-map">
    <Amap class="amap" ref="amapRef"></Amap>
  </div>
</template>

<script setup lang="ts">
import { Amap } from '@/components/shared/Amap'
import { watch, useTemplateRef, onMounted } from 'vue'
export interface TypeLatLng {
  lat: number
  lng: number
}
const amapRef = useTemplateRef('amapRef')
const myProps = defineProps({
  data: {
    type: Object,
    default: null
  }
})

onMounted(() => {
  console.log('amapRef:', amapRef.value)
  if (amapRef.value) {
    amapRef.value.add_marker(myProps.data.longitude, myProps.data.latitude)
  }
})

watch(
  () => myProps.data,
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
  .amap {
    width: 100%;
    height: 100%;
  }
}
</style>
