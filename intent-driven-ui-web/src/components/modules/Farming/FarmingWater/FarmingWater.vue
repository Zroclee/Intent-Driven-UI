<template>
  <div class="water-monitor">
    <div class="monitor-header">
      <h3 class="base-name">{{ data.base_name }}</h3>
      <span class="base-id">{{ data.base_id }}</span>
      <span
        class="monitor-status"
        :class="{
          'status-normal': data.monitor_status === '正常',
          'status-abnormal': data.monitor_status === '异常',
          'status-offline': data.monitor_status === '离线'
        }"
      >
        {{ data.monitor_status }}
      </span>
    </div>

    <div class="monitor-content">
      <div class="monitor-item">
        <span class="label">水温</span>
        <span class="value">{{ data.water_temperature }}℃</span>
      </div>

      <div class="monitor-item">
        <span class="label">水质PH值</span>
        <span class="value">{{ data.water_ph }}</span>
      </div>

      <div class="monitor-item">
        <span class="label">电导率</span>
        <span class="value">{{ data.conductivity }} μS/cm</span>
      </div>

      <div class="monitor-item">
        <span class="label">离子含量</span>
        <span class="value">{{ data.ion_content }} mg/L</span>
      </div>

      <div class="monitor-item">
        <span class="label">水质浊度</span>
        <span class="value">{{ data.turbidity }} NTU</span>
      </div>
    </div>

    <div class="monitor-footer">
      <span class="update-time">更新时间：{{ data.update_time }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface WaterMonitorData {
  base_name: string
  base_id: string
  water_temperature: number
  water_ph: number
  conductivity: number
  ion_content: number
  turbidity: number
  update_time: string
  monitor_status: '正常' | '异常' | '离线'
}

defineProps<{
  data: WaterMonitorData
}>()
</script>

<style scoped>
.water-monitor {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.monitor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.base-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.base-id {
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.monitor-status {
  margin-left: auto;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

.status-normal {
  background: #e6f7e6;
  color: #52c41a;
}

.status-abnormal {
  background: #fff2e6;
  color: #fa8c16;
}

.status-offline {
  background: #f5f5f5;
  color: #999;
}

.monitor-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.monitor-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.monitor-item:nth-child(5) {
  grid-column: span 2;
}

.label {
  font-size: 13px;
  color: #666;
}

.value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.monitor-footer {
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.update-time {
  font-size: 12px;
  color: #999;
}
</style>
