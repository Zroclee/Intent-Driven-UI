import FarmingSoil, { type MyProps } from './FarmingSoil.vue'
export { FarmingSoil, type MyProps }

import { defineAsyncComponent } from 'vue'

const config = {
  name: 'FarmingSoil',
  descript: '组件-土壤监测组件，参数配置：data: 土壤监测数据',
  component: defineAsyncComponent(() => import('./FarmingSoil.vue')),
  props: {
    data: {}
  } as MyProps
}

export default config
