<template>
  <div class="farming-camera">
    <div class="camera-list">
      <div v-for="camera in data" :key="camera.camera_id" class="camera-item">
        <div class="camera-preview">
          <div class="video-placeholder">
            <span class="camera-type-badge">{{ camera.camera_type }}</span>
            <span class="camera-resolution">{{ camera.resolution }}</span>
          </div>
          <div class="camera-status" :class="{ online: camera.status === '在线' }">
            <span class="status-dot"></span>
            <span class="status-text">{{ camera.status }}</span>
          </div>
        </div>
        <div class="camera-info">
          <h4 class="camera-name">{{ camera.camera_name }}</h4>
          <div class="camera-details">
            <div class="detail-item">
              <span class="label">摄像头ID：</span>
              <span class="value">{{ camera.camera_id }}</span>
            </div>
            <div class="detail-item">
              <span class="label">安装位置：</span>
              <span class="value">{{ camera.location }}</span>
            </div>
            <div class="detail-item">
              <span class="label">最后活跃：</span>
              <span class="value">{{ camera.last_active_time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CameraData {
  camera_id: string
  camera_name: string
  camera_type: '枪机' | '球机' | '半球'
  location: string
  video_url: string
  stream_url: string
  status: '在线' | '离线'
  last_active_time: string
  resolution: string
}

export interface MyProps {
  data: CameraData[]
}

defineProps<MyProps>()
</script>

<style scoped>
.farming-camera {
  width: 100%;
  padding: 16px;
}

.camera-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.camera-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  transition: box-shadow 0.3s ease;
}

.camera-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.camera-preview {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background: #1f2937;
  overflow: hidden;
}

.video-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
}

.video-placeholder::before {
  content: '📹';
  font-size: 64px;
  opacity: 0.3;
}

.camera-type-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  backdrop-filter: blur(4px);
}

.camera-resolution {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  background: rgba(59, 130, 246, 0.8);
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.camera-status {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.9);
  color: #fff;
  border-radius: 20px;
  font-size: 13px;
  backdrop-filter: blur(4px);
  transition: background 0.3s ease;
}

.camera-status.online {
  background: rgba(34, 197, 94, 0.9);
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.camera-info {
  padding: 16px;
}

.camera-name {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.camera-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  font-size: 13px;
}

.detail-item .label {
  color: #6b7280;
  min-width: 80px;
}

.detail-item .value {
  color: #374151;
  font-weight: 500;
}
</style>
