<template>
  <div id="container"></div>
</template>

<script setup lang="ts">
import AMapLoader from '@amap/amap-jsapi-loader'
import { onMounted, onUnmounted } from 'vue'
import { ref } from 'vue'

let AMap: any
let myAmap: any | null = null
const isMapLoaded = ref(false)
const markerCache: Array<{ lng: number; lat: number }> = []

const add_marker = (lng: number, lat: number) => {
  const markerData = { lng, lat }

  if (isMapLoaded.value && AMap && myAmap) {
    // 地图已加载，直接添加标记
    const marker = new AMap.Marker({
      position: [lng, lat]
    })
    myAmap.add(marker)
    myAmap.setZoomAndCenter(13, [lng, lat])
  } else {
    // 地图未加载，缓存标记数据
    markerCache.push(markerData)
  }
}

defineExpose({
  add_marker
})

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
  try {
    const key = import.meta.env.VITE_APP_AMAP_KEY
    AMap = await AMapLoader.load({
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
      zoom: 13,
      center: [116.397428, 39.90923]
    })

    // 地图加载完成，标记加载状态
    isMapLoaded.value = true

    // 处理缓存的标记数据
    processCachedMarkers()
  } catch (error) {
    console.log('error:', error)
  }
}

// 处理缓存的标记数据
const processCachedMarkers = () => {
  console.log('processCachedMarkers', markerCache)
  if (markerCache.length > 0 && AMap && myAmap) {
    markerCache.forEach((markerData) => {
      const marker = new AMap.Marker({
        position: [markerData.lng, markerData.lat]
      })
      myAmap.add(marker)
      myAmap.setZoomAndCenter(13, [markerData.lng, markerData.lat])
    })
    // 清空缓存
    markerCache.length = 0
  }
}
</script>

<style scoped>
#container {
  width: 100%;
  height: 100%;
}
</style>
