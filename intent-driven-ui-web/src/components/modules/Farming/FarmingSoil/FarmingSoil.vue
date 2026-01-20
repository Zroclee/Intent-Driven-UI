<template>
  <div class="farming-soil">
    <div class="soil-header">
      <div class="base-info">
        <h3 class="base-name">{{ data.base_name }}</h3>
        <span class="base-id">{{ data.base_id }}</span>
      </div>
      <div class="monitor-status" :class="getStatusClass(data.monitor_status)">
        {{ data.monitor_status }}
      </div>
    </div>

    <div class="soil-content">
      <div class="soil-grid">
        <div class="soil-card ph-card">
          <div class="card-icon">🧪</div>
          <div class="card-content">
            <div class="card-label">PH值</div>
            <div class="card-value">{{ data.ph_value }}</div>
          </div>
        </div>

        <div class="soil-card humidity-card">
          <div class="card-icon">💧</div>
          <div class="card-content">
            <div class="card-label">土壤湿度</div>
            <div class="card-value">{{ data.soil_humidity }}<span class="unit">%</span></div>
          </div>
        </div>

        <div class="soil-card temperature-card">
          <div class="card-icon">🌡️</div>
          <div class="card-content">
            <div class="card-label">土壤温度</div>
            <div class="card-value">{{ data.soil_temperature }}<span class="unit">℃</span></div>
          </div>
        </div>
      </div>

      <div class="nutrient-section">
        <div class="section-title">土壤养分</div>
        <div class="nutrient-grid">
          <div class="nutrient-item nitrogen-item">
            <div class="nutrient-icon">🌿</div>
            <div class="nutrient-info">
              <div class="nutrient-label">氮含量</div>
              <div class="nutrient-value">{{ data.nitrogen }}<span class="unit">mg/kg</span></div>
            </div>
          </div>

          <div class="nutrient-item phosphorus-item">
            <div class="nutrient-icon">🧬</div>
            <div class="nutrient-info">
              <div class="nutrient-label">磷含量</div>
              <div class="nutrient-value">{{ data.phosphorus }}<span class="unit">mg/kg</span></div>
            </div>
          </div>

          <div class="nutrient-item potassium-item">
            <div class="nutrient-icon">🌱</div>
            <div class="nutrient-info">
              <div class="nutrient-label">钾含量</div>
              <div class="nutrient-value">{{ data.potassium }}<span class="unit">mg/kg</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="soil-footer">
      <span class="update-time">更新时间：{{ data.update_time }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FarmingSoilData {
  base_name: string
  base_id: string
  ph_value: number
  soil_humidity: number
  soil_temperature: number
  nitrogen: number
  phosphorus: number
  potassium: number
  update_time: string
  monitor_status: '正常' | '异常' | '离线'
}

export interface MyProps {
  data: FarmingSoilData
}

defineProps<MyProps>()

const getStatusClass = (status: string) => {
  switch (status) {
    case '正常':
      return 'status-normal'
    case '异常':
      return 'status-warning'
    case '离线':
      return 'status-offline'
    default:
      return ''
  }
}
</script>

<style scoped>
.farming-soil {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.soil-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.base-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.base-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.base-id {
  font-size: 13px;
  color: #999;
  background: #f5f5f5;
  padding: 4px 10px;
  border-radius: 12px;
}

.monitor-status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-normal {
  background: #e6f7ef;
  color: #00b06a;
}

.status-warning {
  background: #fff7e6;
  color: #fa8c16;
}

.status-offline {
  background: #f5f5f5;
  color: #999;
}

.soil-content {
  margin-bottom: 16px;
}

.soil-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.soil-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  transition: all 0.3s ease;
}

.soil-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-icon {
  font-size: 28px;
  line-height: 1;
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.card-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
}

.card-value .unit {
  font-size: 13px;
  font-weight: 400;
  color: #999;
  margin-left: 2px;
}

.nutrient-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.nutrient-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.nutrient-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  transition: all 0.3s ease;
}

.nutrient-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.nitrogen-item {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.phosphorus-item {
  background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
}

.potassium-item {
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
}

.nutrient-icon {
  font-size: 24px;
  line-height: 1;
}

.nutrient-info {
  flex: 1;
}

.nutrient-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.nutrient-value {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.nutrient-value .unit {
  font-size: 12px;
  font-weight: 400;
  color: #999;
  margin-left: 2px;
}

.soil-footer {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.update-time {
  font-size: 12px;
  color: #999;
}

@media (max-width: 768px) {
  .soil-grid,
  .nutrient-grid {
    grid-template-columns: 1fr;
  }

  .soil-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
