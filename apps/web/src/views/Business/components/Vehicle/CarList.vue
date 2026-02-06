<template>
	<div class="car-list-container">
		<div class="header">
			<h2 class="title">车辆列表</h2>
			<div class="stats">
				<div class="stat-item">
					<span class="stat-label">总数: {{ data.length }}</span>
				</div>
			</div>
		</div>

		<div class="car-list">
			<div v-for="car in data" :key="car.car_id" class="car-card">
				<div class="card-header">
					<div class="car-icon">🚗</div>
					<div class="car-info">
						<h3 class="car-name">{{ car.car_name }}</h3>
						<span class="car-number">{{ car.car_number }}</span>
					</div>
					<div class="car-status" :class="getStatusClass(car.status)">
						{{ car.status }}
					</div>
				</div>

				<div class="card-body">
					<div class="info-row">
						<span class="label">车辆ID:</span>
						<span class="value">{{ car.car_id }}</span>
					</div>
					<div class="info-row">
						<span class="label">位置:</span>
						<span class="value">{{ car.longitude }}, {{ car.latitude }}</span>
					</div>
					<div class="info-row">
						<span class="label">更新时间:</span>
						<span class="value">{{ car.update_time }}</span>
					</div>
				</div>
			</div>

			<div v-if="!data || data.length === 0" class="empty-state">
				<div class="empty-icon">📭</div>
				<p>暂无车辆数据</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
/**
 * 车辆数据接口定义
 */
interface Car {
	car_id: string;
	car_name: string;
	car_number: string;
	status: string;
	latitude: string | number;
	longitude: string | number;
	update_time: string;
}

/**
 * 组件Props定义
 */
const props = defineProps({
	/**
	 * 车辆列表数据
	 */
	data: {
		type: Array as () => Car[],
		default: () => [],
	},
});

/**
 * 获取状态对应的样式类名
 * @param status 车辆状态
 */
const getStatusClass = (status: string) => {
	const map: Record<string, string> = {
		在线: "status-online",
		离线: "status-offline",
		行驶中: "status-running",
		静止: "status-stopped",
		故障: "status-fault",
	};
	return map[status] || "status-default";
};
</script>

<style scoped>
.car-list-container {
	padding: 20px;
	background: #f8fafc;
	border-radius: 16px;
	box-sizing: border-box;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
}

.title {
	margin: 0;
	font-size: 20px;
	font-weight: 700;
	color: #1e293b;
}

.stats {
	display: flex;
	gap: 12px;
}

.stat-item {
	padding: 4px 12px;
	background: #fff;
	border-radius: 12px;
	font-size: 12px;
	color: #64748b;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.car-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.car-card {
	background: #ffffff;
	border-radius: 12px;
	padding: 16px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	transition: all 0.2s;
	border: 1px solid transparent;
}

.car-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.card-header {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 12px;
	padding-bottom: 12px;
	border-bottom: 1px solid #f1f5f9;
}

.car-icon {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #eff6ff;
	border-radius: 10px;
	font-size: 20px;
}

.car-info {
	flex: 1;
	min-width: 0;
}

.car-name {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
	color: #0f172a;
	margin-bottom: 2px;
}

.car-number {
	font-size: 12px;
	color: #64748b;
	background: #f1f5f9;
	padding: 2px 6px;
	border-radius: 4px;
}

.car-status {
	font-size: 12px;
	padding: 4px 10px;
	border-radius: 20px;
	font-weight: 500;
}

.status-online,
.status-running {
	background: #dcfce7;
	color: #166534;
}

.status-offline,
.status-stopped {
	background: #f1f5f9;
	color: #475569;
}

.status-fault {
	background: #fee2e2;
	color: #991b1b;
}

.status-default {
	background: #f1f5f9;
	color: #475569;
}

.card-body {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.info-row {
	display: flex;
	justify-content: space-between;
	font-size: 13px;
}

.label {
	color: #64748b;
}

.value {
	color: #334155;
	font-family: monospace;
}

.empty-state {
	padding: 40px;
	text-align: center;
	color: #94a3b8;
}

.empty-icon {
	font-size: 48px;
	margin-bottom: 16px;
}
</style>
