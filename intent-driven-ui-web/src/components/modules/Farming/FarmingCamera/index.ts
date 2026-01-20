import FarmingCamera, { type MyProps } from './FarmingCamera.vue'
export { FarmingCamera, type MyProps }

import { defineAsyncComponent } from 'vue'

const config = {
  name: 'FarmingCamera',
  descript: '组件-农业设备列表，参数配置：data，data对应数据: 农业设备列表',
  component: defineAsyncComponent(() => import('./FarmingCamera.vue')),
  props: {
    data: []
  } as MyProps
}

export default config
