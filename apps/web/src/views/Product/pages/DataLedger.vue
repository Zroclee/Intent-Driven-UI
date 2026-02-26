<template>
	<div class="data-ledger-container">
		<!-- 顶部 Tab 切换 -->
		<div class="tabs-header">
			<div
				v-for="tab in tabs"
				:key="tab.value"
				class="tab-item"
				:class="{ active: currentTab === tab.value }"
				@click="handleTabChange(tab.value)"
			>
				{{ tab.label }}
			</div>
		</div>

		<!-- 主体内容 -->
		<div class="main-content">
			<!-- 左侧行业数据列表 -->
			<div class="left-sidebar">
				<!-- 总量显示 -->
				<div class="total-stats">
					<div class="stat-label">{{ currentTabLabel }}总量</div>
					<div class="stat-value">{{ currentTotal }}</div>
				</div>

				<!-- 行业列表 -->
				<div class="industry-list">
					<div
						class="industry-item"
						:class="{ active: currentIndustry === '' }"
						@click="currentIndustry = ''"
					>
						<span class="industry-name">全部行业</span>
					</div>
					<div
						v-for="item in currentIndustryData"
						:key="item.name"
						class="industry-item"
						:class="{ active: currentIndustry === item.name }"
						@click="currentIndustry = item.name"
					>
						<span class="industry-name">{{ item.name }}</span>
						<span class="industry-count">{{ item.count }}</span>
					</div>
				</div>
			</div>

			<!-- 右侧内容区域 -->
			<div class="right-content">
				<!-- 搜索栏 -->
				<div class="search-bar">
					<div class="search-inputs">
						<div class="input-group">
							<label>{{ currentTabLabel }}名称</label>
							<input
								v-model="searchForm.name"
								type="text"
								:placeholder="`请输入${currentTabLabel}名称`"
								@keyup.enter="handleSearch"
							/>
						</div>
						<div class="input-group">
							<label>{{ currentTabLabel }}编号</label>
							<input
								v-model="searchForm.code"
								type="text"
								:placeholder="`请输入${currentTabLabel}编号`"
								@keyup.enter="handleSearch"
							/>
						</div>
						<div class="input-group">
							<label>行业领域</label>
							<select v-model="searchForm.industry" class="search-select">
								<option value="">全部</option>
								<option v-for="ind in industries" :key="ind" :value="ind">
									{{ ind }}
								</option>
							</select>
						</div>
						<div class="input-group">
							<label>应用</label>
							<input
								v-model="searchForm.application"
								type="text"
								placeholder="请输入应用"
								@keyup.enter="handleSearch"
							/>
						</div>
					</div>
					<div class="action-buttons">
						<button class="btn btn-primary" @click="handleSearch">查询</button>
						<button class="btn btn-default" @click="handleReset">重置</button>
					</div>
				</div>

				<!-- 数据表格 -->
				<div class="table-container">
					<table class="data-table">
						<thead>
							<tr>
								<th v-for="col in currentColumns" :key="col.key">
									{{ col.label }}
								</th>
								<th>操作</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="item in paginatedData" :key="item.id">
								<td v-for="col in currentColumns" :key="col.key">
									<!-- 状态特殊处理 -->
									<span
										v-if="col.key === 'status'"
										:class="['status-badge', getStatusClass(item[col.key])]"
									>
										{{ item[col.key] }}
									</span>
									<!-- 其他字段直接显示 -->
									<span v-else>{{ item[col.key] }}</span>
								</td>
								<td>
									<button class="btn-text" @click="handleDetail(item)">
										详情
									</button>
								</td>
							</tr>
							<tr v-if="paginatedData.length === 0">
								<td :colspan="currentColumns.length + 1" class="empty-text">
									暂无数据
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<!-- 分页 -->
				<div class="pagination">
					<div class="page-info">
						共 {{ filteredData.length }} 条，当前第 {{ currentPage }} /
						{{ totalPages }} 页
					</div>
					<div class="page-controls">
						<button
							class="btn btn-sm"
							:disabled="currentPage === 1"
							@click="changePage(currentPage - 1)"
						>
							上一页
						</button>
						<button
							class="btn btn-sm"
							:disabled="currentPage === totalPages"
							@click="changePage(currentPage + 1)"
						>
							下一页
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from "vue";
import { useAIAction } from "@idu/core";
const { notifyNext } = useAIAction();

// 页面加载时初始化数据
onMounted(() => {
	notifyNext();
});



// --- 类型定义 ---
type TabValue = "client" | "asset" | "device";

interface TabOption {
	label: string;
	value: TabValue;
}

interface IndustryData {
	name: string;
	count: number;
}

interface TableColumn {
	label: string;
	key: string;
}

// 通用数据接口，包含所有可能的字段
interface LedgerData {
	id: string;
	name: string; // 名称 (客户/资产/设备)
	code: string; // 编号 (ID)
	type?: string; // 类型 (客户类型/资产类型/设备类型)
	industry: string; // 行业领域
	application: string; // 应用
	clientName?: string; // 客户名称 (资产/设备列表用)
	assetCount?: number; // 资产数 (客户列表用)
	deviceCount?: number; // 设备数 (客户/资产列表用)
	status?: string; // 状态 (设备列表用)
	joinTime: string; // 接入时间
	[key: string]: any;
}

// --- 状态定义 ---
const currentTab = ref<TabValue>("client");
const currentIndustry = ref<string>(""); // 当前选中的行业，默认为空
const currentPage = ref(1);
const pageSize = 10;

const searchForm = reactive({
	name: "",
	code: "",
	industry: "",
	application: "",
});

const tabs: TabOption[] = [
	{ label: "客户", value: "client" },
	{ label: "资产", value: "asset" },
	{ label: "设备", value: "device" },
];

const industries = [
	"智慧车联",
	"智慧制造",
	"智慧基建",
	"智慧农业",
	"智能能源",
	"智慧厅堂",
	"智慧物流",
	"智慧航运",
];

// --- 列定义 ---
const columnsMap: Record<TabValue, TableColumn[]> = {
	client: [
		{ label: "客户名称", key: "name" },
		{ label: "客户类型", key: "type" },
		{ label: "行业领域", key: "industry" },
		{ label: "应用", key: "application" },
		{ label: "资产数", key: "assetCount" },
		{ label: "设备数", key: "deviceCount" },
		{ label: "接入时间", key: "joinTime" },
	],
	asset: [
		{ label: "资产名称", key: "name" },
		{ label: "资产编号", key: "code" },
		{ label: "资产类型", key: "type" },
		{ label: "行业领域", key: "industry" },
		{ label: "应用", key: "application" },
		{ label: "客户名称", key: "clientName" },
		{ label: "设备数", key: "deviceCount" },
		{ label: "接入时间", key: "joinTime" },
	],
	device: [
		{ label: "设备名称", key: "name" },
		{ label: "设备编号", key: "code" },
		{ label: "行业领域", key: "industry" },
		{ label: "应用", key: "application" },
		{ label: "客户名称", key: "clientName" },
		{ label: "设备状态", key: "status" },
		{ label: "接入时间", key: "joinTime" },
	],
};

const currentColumns = computed(() => columnsMap[currentTab.value]);

// --- Mock 数据生成 ---
const generateData = (tab: TabValue, count: number): LedgerData[] => {
	const data: LedgerData[] = [];
	const apps = ["数据中心", "监控系统", "生产管理", "物流追踪", "客户服务"];
	const clientTypes = ["个人", "企业"];
	const assetTypes = ["服务器", "车辆", "传感器集群", "生产线"];
	const deviceStatuses = ["在线", "离线", "故障", "维护中"];

	for (let i = 1; i <= count; i++) {
		const ind = industries[Math.floor(Math.random() * industries.length)];
		const app = apps[Math.floor(Math.random() * apps.length)];
		const date = new Date();
		date.setDate(date.getDate() - Math.floor(Math.random() * 365));
		const timeStr = date.toISOString().split("T")[0];

		const item: LedgerData = {
			id: `${tab}_${i}`,
			name: `${tabs.find((t) => t.value === tab)?.label}_${ind}_${i}`,
			code: `CODE_${String(i).padStart(6, "0")}`,
			industry: ind,
			application: app,
			joinTime: timeStr,
		};

		if (tab === "client") {
			item.type = clientTypes[Math.floor(Math.random() * clientTypes.length)];
			item.assetCount = Math.floor(Math.random() * 20);
			item.deviceCount = Math.floor(Math.random() * 100);
		} else if (tab === "asset") {
			item.type = assetTypes[Math.floor(Math.random() * assetTypes.length)];
			item.clientName = `客户_${Math.floor(Math.random() * 50)}`;
			item.deviceCount = Math.floor(Math.random() * 10);
		} else if (tab === "device") {
			item.clientName = `客户_${Math.floor(Math.random() * 50)}`;
			item.status =
				deviceStatuses[Math.floor(Math.random() * deviceStatuses.length)];
		}

		data.push(item);
	}
	return data;
};

// 存储所有 Tab 的数据
const allDataMap = reactive<Record<TabValue, LedgerData[]>>({
	client: generateData("client", 50),
	asset: generateData("asset", 80),
	device: generateData("device", 120),
});

// --- 计算属性与逻辑 ---

// 计算属性
const currentTabLabel = computed(() => {
	return tabs.find((t) => t.value === currentTab.value)?.label || "";
});

const currentIndustryData = computed<IndustryData[]>(() => {
	const data = allDataMap[currentTab.value];
	return industries.map((name) => ({
		name,
		count: data.filter((item) => item.industry === name).length,
	}));
});

const currentTotal = computed(() => {
	return allDataMap[currentTab.value].length;
});

// 列表数据过滤
const filteredData = computed(() => {
	let data = allDataMap[currentTab.value];

	// 左侧行业筛选
	if (currentIndustry.value) {
		data = data.filter((item) => item.industry === currentIndustry.value);
	}

	// 顶部搜索栏筛选
	if (searchForm.name) {
		data = data.filter((item) =>
			item.name.toLowerCase().includes(searchForm.name.toLowerCase())
		);
	}
	if (searchForm.code) {
		data = data.filter((item) =>
			item.code.toLowerCase().includes(searchForm.code.toLowerCase())
		);
	}
	if (searchForm.industry) {
		data = data.filter((item) => item.industry === searchForm.industry);
	}
	if (searchForm.application) {
		data = data.filter((item) =>
			item.application
				.toLowerCase()
				.includes(searchForm.application.toLowerCase())
		);
	}

	return data;
});

// 分页数据
const paginatedData = computed(() => {
	const start = (currentPage.value - 1) * pageSize;
	const end = start + pageSize;
	return filteredData.value.slice(start, end);
});

const totalPages = computed(() => {
	return Math.ceil(filteredData.value.length / pageSize) || 1;
});

// --- 事件处理 ---

const handleTabChange = (val: TabValue) => {
	currentTab.value = val;
	currentIndustry.value = ""; // 切换 Tab 重置行业选择
	handleReset(); // 重置搜索
};

const handleSearch = () => {
	currentPage.value = 1;
};

const handleReset = () => {
	searchForm.name = "";
	searchForm.code = "";
	searchForm.industry = "";
	searchForm.application = "";
	currentPage.value = 1;
};

const changePage = (page: number) => {
	if (page >= 1 && page <= totalPages.value) {
		currentPage.value = page;
	}
};

const handleDetail = (item: LedgerData) => {
	console.log("查看详情:", item);
	alert(`查看 ${currentTabLabel.value} 详情: ${item.name}`);
};

const getStatusClass = (status?: string) => {
	switch (status) {
		case "在线":
			return "status-active";
		case "离线":
			return "status-disabled";
		case "故障":
			return "status-error";
		case "维护中":
			return "status-warning";
		default:
			return "";
	}
};

// 监听左侧行业选择变化，同步更新搜索栏的行业字段
watch(currentIndustry, (newVal) => {
	searchForm.industry = newVal;
	currentPage.value = 1;
});

// 监听搜索栏行业字段变化，同步更新左侧选择（如果匹配的话）
watch(
	() => searchForm.industry,
	(newVal) => {
		if (industries.includes(newVal) || newVal === "") {
			currentIndustry.value = newVal;
		}
	}
);
</script>

<style scoped>
.data-ledger-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	padding: 0;
	background-color: #f5f7fa;
	box-sizing: border-box;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
		"Helvetica Neue", Arial, sans-serif;
}

/* Tab 样式 - 优化版 */
.tabs-header {
	display: flex;
	gap: 12px;
	background-color: #fff;
	border-radius: 8px;
	padding: 12px 16px;
	box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.tab-item {
	padding: 8px 24px;
	cursor: pointer;
	background-color: #f5f7fa;
	border-radius: 4px;
	font-weight: 500;
	color: #606266;
	transition: all 0.3s;
	font-size: 14px;
}

.tab-item:hover {
	color: #409eff;
	background-color: #ecf5ff;
}

.tab-item.active {
	color: #fff;
	background-color: #409eff;
	font-weight: 500;
}

/* 主体布局 */
.main-content {
	display: flex;
	flex: 1;
	gap: 16px;
	overflow: hidden; /* 防止溢出 */
	padding-top: 16px;
}

/* 左侧列表 - 优化版 */
.left-sidebar {
	width: 180px; /* 稍微加宽 */
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	background-color: #fff;
	border-radius: 8px;
	box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	padding: 16px;
	gap: 12px;
}

.total-stats {
	padding: 16px;
	text-align: center;
	background: linear-gradient(135deg, #ecf5ff 0%, #f0f9eb 100%);
	border-radius: 8px;
	border: 1px solid #d9ecff;
}

.stat-label {
	font-size: 13px;
	color: #606266;
	margin-bottom: 8px;
}

.stat-value {
	font-size: 28px;
	font-weight: bold;
	color: #409eff;
}

.industry-list {
	display: flex;
	flex-direction: column;
	gap: 4px;
	overflow-y: auto;
	flex: 1;
}

.industry-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 12px;
	cursor: pointer;
	border-radius: 6px;
	transition: all 0.2s;
	font-size: 14px;
	color: #606266;
}

.industry-item:hover {
	background-color: #f5f7fa;
	color: #409eff;
}

.industry-item.active {
	background-color: #ecf5ff;
	color: #409eff;
	font-weight: 600;
}

.industry-count {
	font-size: 12px;
	color: #909399;
	background-color: #f4f4f5;
	padding: 2px 8px;
	border-radius: 10px;
	min-width: 20px;
	text-align: center;
}

.industry-item.active .industry-count {
	color: #409eff;
	background-color: #fff;
}

/* 右侧内容 */
.right-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 16px;
	overflow: hidden;
}

/* 搜索栏样式 - 参考 RoleManagement */
.search-bar {
	background: white;
	padding: 16px;
	border-radius: 8px;
	box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	flex-wrap: wrap;
	gap: 16px;
}

.search-inputs {
	display: flex;
	gap: 16px;
	flex-wrap: wrap;
	flex: 1;
}

.input-group {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.input-group label {
	font-size: 13px;
	color: #606266;
	font-weight: 500;
}

.input-group input,
.input-group select {
	height: 32px;
	padding: 0 12px;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	width: 160px;
	outline: none;
	transition: border-color 0.2s;
	font-size: 13px;
	color: #606266;
}

.input-group select {
	width: 186px; /* 补偿 padding */
}

.input-group input:focus,
.input-group select:focus {
	border-color: #409eff;
}

.action-buttons {
	display: flex;
	gap: 12px;
}

/* 按钮通用样式 */
.btn {
	height: 32px;
	padding: 0 16px;
	border-radius: 4px;
	border: none;
	cursor: pointer;
	font-size: 13px;
	transition: opacity 0.2s;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.btn:hover {
	opacity: 0.85;
}

.btn-primary {
	background-color: #409eff;
	color: white;
}

.btn-default {
	background-color: #ffffff;
	border: 1px solid #dcdfe6;
	color: #606266;
}

.btn-default:hover {
	border-color: #c6e2ff;
	color: #409eff;
	background-color: #ecf5ff;
}

/* 列表样式 */
.table-container {
	background: white;
	padding: 16px;
	border-radius: 8px;
	box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	flex: 1;
	overflow: auto;
	display: flex;
	flex-direction: column;
}

.data-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 13px;
}

.data-table th,
.data-table td {
	padding: 10px 12px;
	text-align: left;
	border-bottom: 1px solid #ebeef5;
	white-space: nowrap;
}

.data-table th {
	background-color: #fafafa;
	color: #909399;
	font-weight: 600;
	position: sticky;
	top: 0;
	z-index: 10;
}

.data-table tbody tr:hover {
	background-color: #f5f7fa;
}

.empty-text {
	text-align: center;
	color: #909399;
	padding: 40px 0;
}

/* 状态徽章 */
.status-badge {
	display: inline-block;
	padding: 2px 8px;
	border-radius: 10px;
	font-size: 12px;
}

.status-active {
	background-color: #f0f9eb;
	color: #67c23a;
	border: 1px solid #e1f3d8;
}

.status-disabled {
	background-color: #f4f4f5;
	color: #909399;
	border: 1px solid #e9e9eb;
}

.status-error {
	background-color: #fef0f0;
	color: #f56c6c;
	border: 1px solid #fde2e2;
}

.status-warning {
	background-color: #fdf6ec;
	color: #e6a23c;
	border: 1px solid #faecd8;
}

/* 操作按钮 */
.btn-text {
	background: none;
	border: none;
	color: #409eff;
	cursor: pointer;
	padding: 0 4px;
	font-size: 13px;
}

.btn-text:hover {
	text-decoration: underline;
}

/* 分页样式 */
.pagination {
	background: white;
	padding: 12px 16px;
	border-radius: 8px;
	box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 1px; /* 微调 */
}

.page-info {
	color: #606266;
	font-size: 13px;
}

.page-controls {
	display: flex;
	gap: 8px;
}

.btn-sm {
	height: 28px;
	padding: 0 12px;
	background: white;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	color: #606266;
	cursor: pointer;
	font-size: 12px;
}

.btn-sm:hover:not(:disabled) {
	color: #409eff;
	border-color: #c6e2ff;
	background-color: #ecf5ff;
}

.btn-sm:disabled {
	background-color: #f5f7fa;
	cursor: not-allowed;
	color: #c0c4cc;
}
</style>
