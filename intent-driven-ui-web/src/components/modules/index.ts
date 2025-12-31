import { type Component } from 'vue'

import CarListConfig from './CarList'
import CarMapConfig from './CarMap'
import ErrorComponentConfig from './ErrorComponent'

const configs = [CarListConfig, CarMapConfig]
export function getComponentByName(name: string): Component {
  return configs.find((config) => config.name === name)?.component || ErrorComponentConfig.component
}
