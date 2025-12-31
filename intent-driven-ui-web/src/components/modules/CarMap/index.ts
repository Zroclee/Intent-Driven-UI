import CarMap, { type TypeLatLng } from './CarMap.vue'
export { CarMap }

import { defineAsyncComponent } from 'vue'

const config = {
  name: 'CarMap',
  descript: '组件-车辆地图，参数配置：latLng: 车辆经纬度数组',
  component: defineAsyncComponent(() => import('./CarMap.vue')),
  props: {
    latLng: [] as TypeLatLng[]
  }
}

export default config
