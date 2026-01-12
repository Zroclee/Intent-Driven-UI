import CarMap from './CarMap.vue'
export { CarMap }

import { defineAsyncComponent } from 'vue'

const config = {
  name: 'CarMap',
  descript: '车辆地图组件',
  component: defineAsyncComponent(() => import('./CarMap.vue')),
  props: {
    data: Object
  },
  toolName: 'get_car_info'
}

export default config
