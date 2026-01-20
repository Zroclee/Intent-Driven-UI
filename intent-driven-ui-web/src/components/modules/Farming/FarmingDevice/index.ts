import FarmingDevice, { type FarmingDeviceProps } from './FarmingDevice.vue'
export { FarmingDevice, type FarmingDeviceProps }

import { defineAsyncComponent } from 'vue'

const config = {
  name: 'FarmingDevice',
  descript: '组件-农业设备列表，参数配置：data，data对应数据: 农业设备列表',
  component: defineAsyncComponent(() => import('./FarmingDevice.vue')),
  props: {
    data: []
  } as FarmingDeviceProps
}

export default config
