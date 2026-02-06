<template>
  <div class="farming-device">
    <div class="device-header">
      <h2 class="title">农业设备列表</h2>
      <div class="device-stats">
        <div class="stat-item stat-online">
          <span class="stat-icon">●</span>
          <span class="stat-label">在线: {{ onlineCount }}</span>
        </div>
        <div class="stat-item stat-offline">
          <span class="stat-icon">●</span>
          <span class="stat-label">离线: {{ offlineCount }}</span>
        </div>
        <div class="stat-item stat-fault">
          <span class="stat-icon">●</span>
          <span class="stat-label">故障: {{ faultCount }}</span>
        </div>
      </div>
    </div>

    <div class="device-list">
      <div
        v-for="device in data"
        :key="device.device_id"
        class="device-card"
        :class="statusClass(device.status)"
      >
        <div class="device-card-header">
          <div class="device-icon">{{ getDeviceIcon(device.device_type) }}</div>
          <div class="device-main-info">
            <h3 class="device-name">{{ device.device_name }}</h3>
            <span class="device-id">{{ device.device_id }}</span>
          </div>
          <div class="device-status" :class="`status-${device.status}`">
            {{ device.status }}
          </div>
        </div>

        <div class="device-card-body">
          <div class="device-info-row">
            <span class="info-label">设备类型:</span>
            <span class="info-value">{{ device.device_type }}</span>
          </div>
          <div class="device-info-row">
            <span class="info-label">所在位置:</span>
            <span class="info-value">{{ device.location }}</span>
          </div>
          <div class="device-info-row">
            <span class="info-label">最后活跃:</span>
            <span class="info-value">{{ device.last_active_time }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="data.length === 0" class="empty-state">
      <div class="empty-icon">📱</div>
      <p>暂无设备数据</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface DeviceData {
  device_id: string
  device_name: string
  device_type: string
  status: '在线' | '离线' | '故障'
  last_active_time: string
  location: string
}

export interface FarmingDeviceProps {
  data: DeviceData[]
}

const props = defineProps<FarmingDeviceProps>()

const onlineCount = computed(() => props.data.filter((d) => d.status === '在线').length)
const offlineCount = computed(() => props.data.filter((d) => d.status === '离线').length)
const faultCount = computed(() => props.data.filter((d) => d.status === '故障').length)

const getDeviceIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    气象监测: '🌤️',
    土壤监测: '🌱',
    水质监测: '💧',
    监控摄像头: '📹',
    灌溉设备: '🚿',
    无人机: '🚁',
    拖拉机: '🚜',
    收割机: '🌾',
    温度传感器: '🌡️',
    湿度传感器: '💧',
    光照传感器: '☀️'
  }
  return iconMap[type] || '📱'
}

const statusClass = (status: string): string => {
  if (status === '在线') return 'card-online'
  if (status === '离线') return 'card-offline'
  if (status === '故障') return 'card-fault'
  return ''
}
</script>

<style scoped>
.farming-device {
  padding: 20px;
  background: #f8fafc;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.device-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #ffffff;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  font-size: 10px;
}

.stat-online .stat-icon {
  color: #10b981;
}

.stat-online .stat-label {
  color: #065f46;
}

.stat-offline .stat-icon {
  color: #6b7280;
}

.stat-offline .stat-label {
  color: #374151;
}

.stat-fault .stat-icon {
  color: #ef4444;
}

.stat-fault .stat-label {
  color: #991b1b;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.device-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s;
  border-left: 4px solid transparent;
}

.device-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-online {
  border-left-color: #10b981;
}

.card-offline {
  border-left-color: #6b7280;
}

.card-fault {
  border-left-color: #ef4444;
}

.device-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.device-icon {
  width: 56px;
  height: 56px;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  flex-shrink: 0;
}

.device-main-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.device-name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-id {
  font-size: 12px;
  color: #64748b;
  font-family: 'Courier New', monospace;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
  width: fit-content;
}

.device-status {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.status-在线 {
  background: #d1fae5;
  color: #065f46;
}

.status-离线 {
  background: #f3f4f6;
  color: #374151;
}

.status-故障 {
  background: #fee2e2;
  color: #991b1b;
}

.device-card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 600;
  text-align: right;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

@media (max-width: 768px) {
  .farming-device {
    padding: 16px;
  }

  .device-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .title {
    font-size: 20px;
  }

  .device-stats {
    width: 100%;
    flex-wrap: wrap;
  }

  .stat-item {
    flex: 1;
    justify-content: center;
    min-width: 100px;
  }

  .device-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .device-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .device-name {
    font-size: 16px;
  }

  .device-status {
    width: 100%;
    text-align: center;
  }

  .device-info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .info-value {
    text-align: left;
  }
}
</style>
