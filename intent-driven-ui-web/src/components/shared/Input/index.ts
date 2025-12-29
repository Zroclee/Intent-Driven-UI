import IdInput from './Input.vue'

export { IdInput }

import type { App } from 'vue'
IdInput.install = (app: App) => {
  app.component('IdInput', IdInput)
}
