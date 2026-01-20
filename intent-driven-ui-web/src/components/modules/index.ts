import { type Component } from 'vue'

import CarListConfig from './CarList'
import CarMapConfig from './CarMap'
import CarTrackConfig from './CarTrack'
import ErrorComponentConfig from './ErrorComponent'

import FarmingConfigs from './Farming'

const configs = [CarListConfig, CarMapConfig, CarTrackConfig, ...FarmingConfigs]

export function getComponentByName(name: string): Component {
  return configs.find((config) => config.name === name)?.component || ErrorComponentConfig.component
}
