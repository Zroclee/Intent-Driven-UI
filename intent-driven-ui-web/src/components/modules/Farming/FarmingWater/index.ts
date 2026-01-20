import FarmingWater, { type WaterMonitorData } from './FarmingWater.vue'
export { FarmingWater, type WaterMonitorData }

import { defineAsyncComponent } from 'vue'

const config = {
  name: 'FarmingWater',
  descript: '组件-水质监测组件，参数配置：data， data对应数据: 水质监测数据',
  component: defineAsyncComponent(() => import('./FarmingWater.vue')),
  props: {
    data: {} as WaterMonitorData
  }
}

export default config
