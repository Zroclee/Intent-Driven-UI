<template>
  <div id="container"></div>
</template>

<script setup lang="ts">
import AMapLoader from '@amap/amap-jsapi-loader'
import { onMounted, onUnmounted } from 'vue'
let myAmap: any | null = null

onMounted(() => {
  loadAmap()
})
onUnmounted(() => {
  if (myAmap) {
    myAmap.destroy()
    myAmap = null
  }
})

const loadAmap = async () => {
  const key = import.meta.env.VITE_APP_AMAP_KEY
  try {
    const AMap = await AMapLoader.load({
      key: key,
      version: '2.0',
      plugins: [
        'AMap.Scale',
        'AMap.ToolBar',
        'AMap.MapType',
        'AMap.PolyEditor',
        'AMap.CircleEditor'
      ]
    })
    myAmap = new AMap.Map('container', {
      center: [116.397428, 39.90923]
    })
  } catch (error) {
    console.log('error:', error)
  }
}
</script>

<style scoped>
#container {
  width: 100%;
  height: 100%;
}
</style>
