import { defineAsyncComponent } from 'vue'

const config = {
  name: 'ErrorComponent',
  descript: '组件-错误组件',
  component: defineAsyncComponent(() => import('./ErrorComponent.vue'))
}

export default config
