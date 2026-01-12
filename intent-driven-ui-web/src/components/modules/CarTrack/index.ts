import CarTrack from './CarTrack.vue'
export { CarTrack }

import { defineAsyncComponent } from 'vue'

const config = {
  name: 'CarTrack',
  descript: '车辆轨迹地图组件',
  component: defineAsyncComponent(() => import('./CarTrack.vue')),
  props: {
    data: Object
  },
  toolName: 'get_car_trajectory_list'
}

export default config
