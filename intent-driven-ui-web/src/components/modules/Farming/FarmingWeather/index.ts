import FarmingWeather, { type MyProps } from './FarmingWeather.vue'
export { FarmingWeather, type MyProps }

import { defineAsyncComponent } from 'vue'

const config = {
  name: 'FarmingWeather',
  descript: '组件-气象监测组件，参数配置：data: 气象监测数据',
  component: defineAsyncComponent(() => import('./FarmingWeather.vue')),
  props: {
    data: {}
  } as MyProps
}

export default config
