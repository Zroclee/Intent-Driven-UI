<template>
	<div class="app-management-container">
		<!-- 顶部统计信息栏 -->
		<div class="stats-bar">
			<div class="stat-item">
				<div class="stat-label">行业领域数</div>
				<div class="stat-value">{{ stats.industryCount }}</div>
			</div>
			<div class="stat-item">
				<div class="stat-label">应用数</div>
				<div class="stat-value">{{ stats.appCount }}</div>
			</div>
			<div class="stat-item">
				<div class="stat-label">关联平台数</div>
				<div class="stat-value">{{ stats.platformCount }}</div>
			</div>
		</div>

		<!-- 搜索和操作栏 -->
		<div class="search-bar">
			<div class="search-inputs">
				<div class="input-group">
					<label>行业</label>
					<select v-model="searchForm.industry">
						<option value="">全部</option>
						<option
							v-for="ind in industryOptions"
							:key="ind.id"
							:value="ind.id"
						>
							{{ ind.name }}
						</option>
					</select>
				</div>
				<div class="input-group">
					<label>应用</label>
					<select v-model="searchForm.app">
						<option value="">全部</option>
						<option v-for="app in appOptions" :key="app.id" :value="app.id">
							{{ app.name }}
						</option>
					</select>
				</div>
				<div class="input-group">
					<label>接入时间</label>
					<div class="date-range">
						<input type="date" v-model="searchForm.startDate" />
						<span class="separator">至</span>
						<input type="date" v-model="searchForm.endDate" />
					</div>
				</div>
			</div>
			<div class="action-buttons">
				<button class="btn btn-primary" @click="handleSearch">查询</button>
				<button class="btn btn-default" @click="handleReset">重置</button>
				<button class="btn btn-success" @click="handleAdd">新增</button>
			</div>
		</div>

		<!-- 行业应用卡片列表 -->
		<div class="industry-list">
			<div
				v-for="group in filteredGroups"
				:key="group.industryId"
				class="industry-group"
			>
				<!-- 行业 Header -->
				<div class="industry-header">
					<div class="header-left">
						<span class="industry-name">{{ group.industryName }}</span>
						<span class="industry-id">ID: {{ group.industryId }}</span>
					</div>
					<div class="header-right">
						<span class="app-count">应用数量: {{ group.apps.length }}</span>
					</div>
				</div>

				<!-- 应用卡片 Grid -->
				<div class="app-grid">
					<div v-for="app in group.apps" :key="app.id" class="app-card">
						<div class="card-content">
							<div class="card-row">
								<span class="label">应用名称：</span>
								<span class="value">{{ app.name }}</span>
							</div>
							<div class="card-row">
								<span class="label">ID：</span>
								<span class="value">{{ app.id }}</span>
							</div>
							<div class="card-row">
								<span class="label">接入方式：</span>
								<span class="value">
									{{ app.accessType === "platform" ? "平台接入" : "设备直连" }}
								</span>
							</div>
						</div>
						<div class="card-actions">
							<button class="btn-text" @click="handleEdit(app)">编辑</button>
							<button
								class="btn-text btn-text-danger"
								@click="handleDelete(app)"
							>
								删除
							</button>
						</div>
					</div>
				</div>
			</div>
			<div v-if="filteredGroups.length === 0" class="empty-text">暂无数据</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

// 类型定义
interface AppInfo {
	id: string;
	name: string;
	accessType: "platform" | "direct"; // platform: 平台接入, direct: 设备直连
	createTime: string;
}

interface IndustryGroup {
	industryId: string;
	industryName: string;
	apps: AppInfo[];
}

interface Stats {
	industryCount: number;
	appCount: number;
	platformCount: number;
}

// 状态定义
const stats = ref<Stats>({
	industryCount: 0,
	appCount: 0,
	platformCount: 0,
});

const searchForm = ref({
	industry: "",
	app: "",
	startDate: "",
	endDate: "",
});

const industryGroups = ref<IndustryGroup[]>([]);
const industryOptions = ref<{ id: string; name: string }[]>([]);
const appOptions = ref<{ id: string; name: string }[]>([]);

// Mock 数据生成
const generateMockData = () => {
	const industries = [
		{ id: "IND001", name: "智慧交通" },
		{ id: "IND002", name: "智慧医疗" },
		{ id: "IND003", name: "工业制造" },
		{ id: "IND004", name: "智慧农业" },
		{ id: "IND005", name: "智慧安防" },
	];

	industryOptions.value = industries;

	const groups: IndustryGroup[] = industries.map((ind) => {
		const appCount = Math.floor(Math.random() * 8) + 1; // 1-8个应用
		const apps: AppInfo[] = [];
		for (let i = 0; i < appCount; i++) {
			apps.push({
				id: `APP${ind.id.slice(3)}${i + 1}`,
				name: `${ind.name}-应用${i + 1}`,
				accessType: Math.random() > 0.5 ? "platform" : "direct",
				createTime: "2023-01-01", // 简化日期处理
			});
		}
		return {
			industryId: ind.id,
			industryName: ind.name,
			apps: apps,
		};
	});

	industryGroups.value = groups;

	// 收集所有应用作为选项
	const allApps: { id: string; name: string }[] = [];
	groups.forEach((g) => {
		g.apps.forEach((a) => {
			allApps.push({ id: a.id, name: a.name });
		});
	});
	appOptions.value = allApps;

	// 统计数据
	stats.value = {
		industryCount: industries.length,
		appCount: allApps.length,
		platformCount: Math.floor(Math.random() * 10) + 5,
	};
};

// 计算属性：过滤逻辑
const filteredGroups = computed(() => {
	return industryGroups.value
		.map((group) => {
			// 行业筛选
			if (
				searchForm.value.industry &&
				group.industryId !== searchForm.value.industry
			) {
				return null;
			}

			// 应用筛选
			const filteredApps = group.apps.filter((app) => {
				if (searchForm.value.app && app.id !== searchForm.value.app) {
					return false;
				}
				// 时间筛选简化逻辑
				if (searchForm.value.startDate && searchForm.value.endDate) {
					// 这里应该比较日期，Mock数据日期固定，暂时不做详细比较
				}
				return true;
			});

			if (filteredApps.length === 0 && searchForm.value.app) {
				return null; // 如果选了特定应用，且该行业下没有该应用，则隐藏整个行业
			}

			return {
				...group,
				apps: filteredApps,
			};
		})
		.filter((g) => g !== null && g.apps.length > 0) as IndustryGroup[];
});

// 生命周期
onMounted(() => {
	generateMockData();
});

// 事件处理
const handleSearch = () => {
	console.log("Searching with:", searchForm.value);
};

const handleReset = () => {
	searchForm.value = {
		industry: "",
		app: "",
		startDate: "",
		endDate: "",
	};
};

const handleAdd = () => {
	console.log("Add new application");
	alert("点击了新增按钮");
};

const handleEdit = (app: AppInfo) => {
	console.log("Edit app:", app);
	alert(`编辑应用: ${app.name}`);
};

const handleDelete = (app: AppInfo) => {
	console.log("Delete app:", app);
	if (confirm(`确认删除应用 ${app.name} 吗？`)) {
		alert("删除成功");
	}
};
</script>

<style scoped>
.app-management-container {
	/* padding: 20px; */
	height: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
	background-color: #f5f7fa;
	overflow-y: auto;
}

/* 顶部统计栏 */
.stats-bar {
	display: flex;
	gap: 20px;
	background-color: #fff;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.stat-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border-right: 1px solid #ebeef5;
}

.stat-item:last-child {
	border-right: none;
}

.stat-label {
	font-size: 14px;
	color: #909399;
	margin-bottom: 8px;
}

.stat-value {
	font-size: 24px;
	font-weight: bold;
	color: #303133;
}

/* 搜索栏 - 复用 UserManagement 风格 */
.search-bar {
	background-color: #fff;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	flex-wrap: wrap;
	gap: 15px;
}

.search-inputs {
	display: flex;
	gap: 20px;
	flex-wrap: wrap;
}

.input-group {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.input-group label {
	font-size: 14px;
	color: #606266;
	font-weight: 500;
}

.input-group select,
.input-group input {
	height: 36px;
	padding: 0 12px;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	outline: none;
	color: #606266;
	font-size: 14px;
	min-width: 180px;
	background-color: #fff;
}

.input-group select:focus,
.input-group input:focus {
	border-color: #409eff;
}

.date-range {
	display: flex;
	align-items: center;
	gap: 8px;
}

.date-range input {
	min-width: 130px;
}

.separator {
	color: #909399;
}

.action-buttons {
	display: flex;
	gap: 12px;
}

.btn {
	height: 36px;
	padding: 0 20px;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 14px;
	font-weight: 500;
	transition: all 0.3s;
}

.btn-primary {
	background-color: #409eff;
	color: white;
}

.btn-primary:hover {
	background-color: #66b1ff;
}

.btn-default {
	background-color: #fff;
	border: 1px solid #dcdfe6;
	color: #606266;
}

.btn-default:hover {
	color: #409eff;
	border-color: #c6e2ff;
	background-color: #ecf5ff;
}

.btn-success {
	background-color: #67c23a;
	color: white;
}

.btn-success:hover {
	background-color: #85ce61;
}

/* 列表区域 */
.industry-list {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.industry-group {
	background-color: #fff;
	border-radius: 8px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
	overflow: hidden;
}

.industry-header {
	background-color: #e4e7ed;
	padding: 15px 20px;
	border-bottom: 1px solid #ebeef5;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 15px;
}

.industry-name {
	font-size: 16px;
	font-weight: bold;
	color: #303133;
}

.industry-id {
	font-size: 13px;
	color: #909399;
	background-color: #e9e9eb;
	padding: 2px 6px;
	border-radius: 4px;
}

.app-count {
	font-size: 14px;
	color: #606266;
}

.app-grid {
	padding: 20px;
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 20px;
}

/* 卡片样式 */
.app-card {
	border: 1px solid #ebeef5;
	border-radius: 6px;
	padding: 16px;
	transition: all 0.3s;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	background-color: #fff;
	height: 160px;
}

.app-card:hover {
	box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
	transform: translateY(-2px);
}

.card-content {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.card-row {
	display: flex;
	align-items: center;
	font-size: 14px;
}

.card-row .label {
	color: #909399;
	width: 80px;
	flex-shrink: 0;
}

.card-row .value {
	color: #303133;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.card-actions {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	margin-top: 10px;
	padding-top: 10px;
	border-top: 1px solid #f2f6fc;
}

.btn-text {
	border: none;
	background: none;
	cursor: pointer;
	font-size: 14px;
	color: #409eff;
	padding: 0 5px;
}

.btn-text:hover {
	text-decoration: underline;
}

.btn-text-danger {
	color: #f56c6c;
}

.empty-text {
	text-align: center;
	color: #909399;
	padding: 40px;
	font-size: 14px;
}

/* 响应式调整 */
@media (max-width: 1400px) {
	.app-grid {
		grid-template-columns: repeat(3, 1fr);
	}
}

@media (max-width: 1100px) {
	.app-grid {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media (max-width: 768px) {
	.app-grid {
		grid-template-columns: 1fr;
	}
}
</style>
