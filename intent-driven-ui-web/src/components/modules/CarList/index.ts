import CarList, { type CarListProps } from './CarList.vue'
export { CarList }

import { defineAsyncComponent } from 'vue'

const config = {
  name: 'CarList',
  descript: '组件-车辆列表，参数配置：data: 车辆数据数组，columns: 列配置数组',
  component: defineAsyncComponent(() => import('./CarList.vue')),
  props: {
    data: [],
    columns: []
  } as CarListProps
}

export default config
