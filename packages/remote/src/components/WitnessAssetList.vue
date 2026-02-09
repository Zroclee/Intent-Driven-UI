<template>
	<div class="witness-asset-list">
		<!-- Search Bar -->
		<div class="search-bar">
			<div class="search-inputs">
				<div class="search-item">
					<label for="assetId">见证资产ID:</label>
					<input
						id="assetId"
						v-model="searchForm.assetId"
						type="text"
						placeholder="请输入资产ID"
						@keyup.enter="handleSearch"
					/>
				</div>
				<div class="search-item">
					<label for="assetName">见证资产名称:</label>
					<input
						id="assetName"
						v-model="searchForm.assetName"
						type="text"
						placeholder="请输入资产名称"
						@keyup.enter="handleSearch"
					/>
				</div>
				<div class="search-item">
					<label for="customerName">客户名称:</label>
					<input
						id="customerName"
						v-model="searchForm.customerName"
						type="text"
						placeholder="请输入客户名称"
						@keyup.enter="handleSearch"
					/>
				</div>
				<div class="search-item">
					<label>见证时间:</label>
					<div class="date-range">
						<input
							v-model="searchForm.startTime"
							type="date"
							@change="handleSearch"
						/>
						<span class="separator">-</span>
						<input
							v-model="searchForm.endTime"
							type="date"
							@change="handleSearch"
						/>
					</div>
				</div>
			</div>
			<div class="search-actions">
				<button class="btn btn-primary" @click="handleSearch">查询</button>
				<button class="btn btn-secondary" @click="handleReset">重置</button>
			</div>
		</div>

		<!-- List Table -->
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>见证资产ID</th>
						<th>见证资产名称</th>
						<th>企业客户编号</th>
						<th>客户名称</th>
						<th>见证时间</th>
						<th>见证状态</th>
						<th>见证任务</th>
						<th>客户签约状态</th>
						<th>任务签约状态</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="filteredData.length === 0">
						<td colspan="10" class="no-data">暂无数据</td>
					</tr>
					<tr v-for="item in pagedData" :key="item.id">
						<td>{{ item.assetId }}</td>
						<td>{{ item.assetName }}</td>
						<td>{{ item.customerCode }}</td>
						<td>{{ item.customerName }}</td>
						<td>{{ item.witnessTime }}</td>
						<td>
							<span :class="getStatusClass(item.witnessStatus)">
								{{ item.witnessStatus }}
							</span>
						</td>
						<td>{{ item.taskName }}</td>
						<td>
							<span
								:class="
									item.customerSignStatus === '生效'
										? 'status-success'
										: 'status-danger'
								"
							>
								{{ item.customerSignStatus }}
							</span>
						</td>
						<td>
							<span
								:class="
									item.taskSignStatus === '生效'
										? 'status-success'
										: 'status-danger'
								"
							>
								{{ item.taskSignStatus }}
							</span>
						</td>
						<td class="actions">
							<button class="btn-text" @click="handleDetail(item)">详情</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		<div class="pagination">
			<span class="total-count">共 {{ filteredData.length }} 条</span>
			<button
				:disabled="pagination.currentPage === 1"
				@click="handlePageChange(pagination.currentPage - 1)"
			>
				上一页
			</button>
			<span class="page-info">
				第 {{ pagination.currentPage }} / {{ totalPages }} 页
			</span>
			<button
				:disabled="pagination.currentPage === totalPages"
				@click="handlePageChange(pagination.currentPage + 1)"
			>
				下一页
			</button>
			<select v-model="pagination.pageSize" @change="handlePageSizeChange">
				<option :value="10">10 条/页</option>
				<option :value="20">20 条/页</option>
				<option :value="50">50 条/页</option>
			</select>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";

// --- Types ---
export interface WitnessAsset {
	id: string;
	assetId: string;
	assetName: string;
	customerCode: string;
	customerName: string;
	witnessTime: string;
	witnessStatus: string; // 见证状态
	taskName: string;
	customerSignStatus: "生效" | "已解约";
	taskSignStatus: "生效" | "已解约";
}

const props = withDefaults(defineProps<{
	data?: WitnessAsset[];
}>(), {
	data: () => []
});

// --- State ---
const searchForm = ref({
	assetId: "",
	assetName: "",
	customerName: "",
	startTime: "",
	endTime: "",
});

const allData = ref<WitnessAsset[]>([]);
const filteredData = ref<WitnessAsset[]>([]);
const pagination = ref({
	currentPage: 1,
	pageSize: 10,
});

// --- Computed ---
const totalPages = computed(() => {
	return Math.ceil(filteredData.value.length / pagination.value.pageSize) || 1;
});

const pagedData = computed(() => {
	const start = (pagination.value.currentPage - 1) * pagination.value.pageSize;
	const end = start + pagination.value.pageSize;
	return filteredData.value.slice(start, end);
});

// --- Methods ---
const handleSearch = () => {
	const idQuery = searchForm.value.assetId.trim().toLowerCase();
	const nameQuery = searchForm.value.assetName.trim().toLowerCase();
	const custQuery = searchForm.value.customerName.trim().toLowerCase();
	const startTime = searchForm.value.startTime
		? new Date(searchForm.value.startTime).getTime()
		: null;
	const endTime = searchForm.value.endTime
		? new Date(searchForm.value.endTime).getTime() + 86400000
		: null; // End of day

	filteredData.value = allData.value.filter((item) => {
		const matchId = item.assetId.toLowerCase().includes(idQuery);
		const matchName = item.assetName.toLowerCase().includes(nameQuery);
		const matchCust = item.customerName.toLowerCase().includes(custQuery);

		let matchTime = true;
		if (startTime || endTime) {
			const itemTime = new Date(item.witnessTime).getTime();
			if (startTime && itemTime < startTime) matchTime = false;
			if (endTime && itemTime > endTime) matchTime = false;
		}

		return matchId && matchName && matchCust && matchTime;
	});

	pagination.value.currentPage = 1;
};

const handleReset = () => {
	searchForm.value.assetId = "";
	searchForm.value.assetName = "";
	searchForm.value.customerName = "";
	searchForm.value.startTime = "";
	searchForm.value.endTime = "";
	handleSearch();
};

const handleDetail = (item: WitnessAsset) => {
	alert(`查看见证资产详情: ${item.assetName}`);
};

const handlePageChange = (page: number) => {
	if (page >= 1 && page <= totalPages.value) {
		pagination.value.currentPage = page;
	}
};

const handlePageSizeChange = () => {
	pagination.value.currentPage = 1;
};

const getStatusClass = (status: string) => {
	switch (status) {
		case "见证成功":
			return "status-success";
		case "见证中":
			return "status-warning";
		case "见证失败":
			return "status-danger";
		default:
			return "status-default";
	}
};

// --- Lifecycle ---
onMounted(() => {
	allData.value = [...props.data];
	filteredData.value = [...allData.value];
});

watch(
	() => props.data,
	(newData) => {
		allData.value = [...newData];
		handleSearch();
	},
	{ deep: true }
);
</script>

<style scoped>
.witness-asset-list {
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
		"Helvetica Neue", Arial, sans-serif;
	padding: 20px;
	background-color: #f8f9fa;
	min-height: 100vh;
}

/* Search Bar */
.search-bar {
	background: white;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
	margin-bottom: 20px;
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
	align-items: flex-end;
	justify-content: space-between;
}

.search-inputs {
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
	align-items: center;
}

.search-item {
	display: flex;
	flex-direction: column;
	gap: 5px;
}

@media (min-width: 768px) {
	.search-item {
		flex-direction: row;
		align-items: center;
	}
}

.search-item label {
	font-weight: 500;
	color: #606266;
	white-space: nowrap;
}

.search-item input {
	padding: 8px 12px;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	width: 180px;
	outline: none;
	transition: border-color 0.2s;
	background-color: #fff;
}

.search-item input:focus {
	border-color: #409eff;
}

.date-range {
	display: flex;
	align-items: center;
	gap: 5px;
}

.date-range input {
	width: 130px;
}

.separator {
	color: #909399;
}

.search-actions {
	display: flex;
	gap: 10px;
}

/* Buttons */
.btn {
	padding: 8px 20px;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 14px;
	transition: opacity 0.2s, transform 0.1s;
	white-space: nowrap;
}

.btn:active {
	transform: translateY(1px);
}

.btn-primary {
	background-color: #409eff;
	color: white;
}

.btn-secondary {
	background-color: #fff;
	border: 1px solid #dcdfe6;
	color: #606266;
}

.btn-secondary:hover {
	color: #409eff;
	border-color: #c6e2ff;
	background-color: #ecf5ff;
}

/* Table */
.table-container {
	background: white;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
	overflow-x: auto;
}

table {
	width: 100%;
	border-collapse: collapse;
	font-size: 14px;
}

th,
td {
	padding: 12px 10px;
	text-align: left;
	border-bottom: 1px solid #ebeef5;
}

th {
	background-color: #f5f7fa;
	color: #909399;
	font-weight: 600;
	white-space: nowrap;
}

tr:hover {
	background-color: #f5f7fa;
}

.no-data {
	text-align: center;
	color: #909399;
	padding: 30px;
}

/* Status Colors */
.status-success {
	color: #67c23a;
}
.status-warning {
	color: #e6a23c;
}
.status-danger {
	color: #f56c6c;
}
.status-default {
	color: #909399;
}

/* Actions Column */
.actions {
	white-space: nowrap;
}

.btn-text {
	background: none;
	border: none;
	color: #409eff;
	cursor: pointer;
	padding: 0 5px;
	font-size: 14px;
}

.btn-text:hover {
	text-decoration: underline;
}

/* Pagination */
.pagination {
	margin-top: 20px;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	gap: 15px;
	color: #606266;
	font-size: 14px;
}

.pagination button {
	padding: 5px 12px;
	background: #fff;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	cursor: pointer;
}

.pagination button:disabled {
	cursor: not-allowed;
	color: #c0c4cc;
	background-color: #fff;
	border-color: #ebeef5;
}

.pagination select {
	padding: 5px;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
	.search-bar {
		flex-direction: column;
		align-items: stretch;
	}
	.search-inputs {
		flex-direction: column;
		align-items: stretch;
	}
	.search-item {
		flex-direction: column;
		align-items: flex-start;
	}
	.search-item input {
		width: 100%;
	}
	.date-range {
		width: 100%;
	}
	.date-range input {
		width: calc(50% - 10px);
	}
	.search-actions {
		justify-content: flex-end;
	}
}
</style>
