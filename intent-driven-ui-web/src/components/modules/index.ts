import { type Component } from 'vue'

import CarListConfig from './CarList'
import CarMapConfig from './CarMap'
import CarTrackConfig from './CarTrack'
import ErrorComponentConfig from './ErrorComponent'

const configs = [CarListConfig, CarMapConfig, CarTrackConfig]
export function getComponentByName(name: string): Component {
  return configs.find((config) => config.name === name)?.component || ErrorComponentConfig.component
}
