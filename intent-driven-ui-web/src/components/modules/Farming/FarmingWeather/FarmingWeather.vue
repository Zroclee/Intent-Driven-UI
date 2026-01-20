<template>
  <div class="farming-weather">
    <div class="weather-header">
      <div class="base-info">
        <h2 class="base-name">{{ data.base_name }}</h2>
        <span class="base-id">{{ data.base_id }}</span>
      </div>
      <div class="status-badge" :class="statusClass">
        {{ data.monitor_status }}
      </div>
    </div>

    <div class="update-time">
      <span class="time-icon">🕐</span>
      更新时间：{{ data.update_time }}
    </div>

    <div class="weather-grid">
      <div class="weather-card temperature">
        <div class="card-icon">🌡️</div>
        <div class="card-content">
          <div class="card-value">{{ data.temperature }}℃</div>
          <div class="card-label">温度</div>
        </div>
      </div>

      <div class="weather-card humidity">
        <div class="card-icon">💧</div>
        <div class="card-content">
          <div class="card-value">{{ data.humidity }}%</div>
          <div class="card-label">湿度</div>
        </div>
      </div>

      <div class="weather-card wind-speed">
        <div class="card-icon">💨</div>
        <div class="card-content">
          <div class="card-value">{{ data.wind_speed }} m/s</div>
          <div class="card-label">风速</div>
        </div>
      </div>

      <div class="weather-card rainfall">
        <div class="card-icon">🌧️</div>
        <div class="card-content">
          <div class="card-value">{{ data.rainfall }} mm</div>
          <div class="card-label">降雨量</div>
        </div>
      </div>

      <div class="weather-card air-pressure">
        <div class="card-icon">🌬️</div>
        <div class="card-content">
          <div class="card-value">{{ data.air_pressure }} hPa</div>
          <div class="card-label">大气压</div>
        </div>
      </div>

      <div class="weather-card co2">
        <div class="card-icon">☁️</div>
        <div class="card-content">
          <div class="card-value">{{ data.co2 }} ppm</div>
          <div class="card-label">CO₂浓度</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface WeatherData {
  base_name: string
  base_id: string
  temperature: number
  humidity: number
  wind_speed: number
  rainfall: number
  air_pressure: number
  co2: number
  update_time: string
  monitor_status: string
}

export interface MyProps {
  data: WeatherData
}

const props = defineProps<MyProps>()

const statusClass = computed(() => {
  const status = props.data.monitor_status
  if (status === '正常') return 'status-normal'
  if (status === '异常') return 'status-warning'
  return 'status-offline'
})
</script>

<style scoped>
.farming-weather {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.base-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.base-name {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
}

.base-id {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Courier New', monospace;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-normal {
  background: rgba(16, 185, 129, 0.9);
  color: #ffffff;
}

.status-warning {
  background: rgba(245, 158, 11, 0.9);
  color: #ffffff;
}

.status-offline {
  background: rgba(239, 68, 68, 0.9);
  color: #ffffff;
}

.update-time {
  margin-bottom: 20px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #ffffff;
}

.time-icon {
  font-size: 14px;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.weather-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.weather-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 10px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.card-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

@media (max-width: 640px) {
  .farming-weather {
    padding: 16px;
  }

  .base-name {
    font-size: 20px;
  }

  .weather-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }

  .weather-card {
    padding: 16px;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }

  .card-value {
    font-size: 18px;
  }
}
</style>
