<template>
	<div class="customer-sign-list">
		<!-- Search Bar -->
		<div class="search-bar">
			<div class="search-inputs">
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
					<label for="customerCode">客户编号:</label>
					<input
						id="customerCode"
						v-model="searchForm.customerCode"
						type="text"
						placeholder="请输入客户编号"
						@keyup.enter="handleSearch"
					/>
				</div>
				<div class="search-item">
					<label for="signStatus">签约状态:</label>
					<select
						id="signStatus"
						v-model="searchForm.signStatus"
						@change="handleSearch"
					>
						<option value="">全部</option>
						<option value="已签约">已签约</option>
						<option value="签约中">签约中</option>
						<option value="已解约">已解约</option>
					</select>
				</div>
			</div>
			<div class="search-actions">
				<button class="btn btn-primary" @click="handleSearch">查询</button>
				<button class="btn btn-secondary" @click="handleReset">重置</button>
				<button class="btn btn-success" @click="handleAdd">新增签约</button>
			</div>
		</div>

		<!-- Task List Table -->
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>企业客户编号</th>
						<th>客户名称</th>
						<th>签约时间</th>
						<th>签约状态</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="filteredData.length === 0">
						<td colspan="5" class="no-data">暂无数据</td>
					</tr>
					<tr v-for="item in pagedData" :key="item.id">
						<td>{{ item.customerCode }}</td>
						<td>{{ item.customerName }}</td>
						<td>{{ item.signTime }}</td>
						<td>
							<span :class="getStatusClass(item.signStatus)">
								{{ item.signStatus }}
							</span>
						</td>
						<td class="actions">
							<button
								class="btn-text btn-text-danger"
								@click="handleTerminate(item)"
								v-if="item.signStatus === '已签约'"
							>
								终止签约
							</button>
							<span v-else class="text-disabled">-</span>
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
export interface CustomerSign {
	id: string;
	customerCode: string; // 企业客户编号
	customerName: string; // 客户名称
	signTime: string; // 签约时间
	signStatus: string; // 签约状态
}

const props = withDefaults(
	defineProps<{
		data?: CustomerSign[];
	}>(),
	{
		data: () => [],
	}
);

// --- State ---
const searchForm = ref({
	customerName: "",
	customerCode: "",
	signStatus: "",
});

const allData = ref<CustomerSign[]>([]);
const filteredData = ref<CustomerSign[]>([]); // Data after search filter
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
	const nameQuery = searchForm.value.customerName.trim().toLowerCase();
	const codeQuery = searchForm.value.customerCode.trim().toLowerCase();
	const statusQuery = searchForm.value.signStatus;

	filteredData.value = allData.value.filter((item) => {
		const matchName = item.customerName.toLowerCase().includes(nameQuery);
		const matchCode = item.customerCode.toLowerCase().includes(codeQuery);
		const matchStatus = statusQuery ? item.signStatus === statusQuery : true;
		return matchName && matchCode && matchStatus;
	});

	pagination.value.currentPage = 1; // Reset to first page
};

const handleReset = () => {
	searchForm.value.customerName = "";
	searchForm.value.customerCode = "";
	searchForm.value.signStatus = "";
	handleSearch();
};

const handleAdd = () => {
	console.log("点击了新增签约按钮");
	alert("功能开发中：新增客户签约");
};

const handleTerminate = (item: CustomerSign) => {
	if (confirm(`确定要终止与 ${item.customerName} 的签约吗?`)) {
		// Mock logic: change status to '已解约'
		const index = allData.value.findIndex((t) => t.id === item.id);
		if (index !== -1 && allData.value[index]) {
			allData.value[index].signStatus = "已解约";
			handleSearch(); // Refresh view
		}
	}
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
		case "已签约":
			return "status-success";
		case "签约中":
			return "status-warning";
		case "已解约":
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
.customer-sign-list {
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
	align-items: flex-end; /* Align bottom to match buttons with inputs */
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
	flex-direction: column; /* Label above input for better multi-field layout or side-by-side */
	gap: 5px;
}

/* Make it side-by-side like the reference if space permits, or stick to column if fields are many */
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

.search-item input,
.search-item select {
	padding: 8px 12px;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	width: 180px;
	outline: none;
	transition: border-color 0.2s;
	background-color: #fff;
}

.search-item input:focus,
.search-item select:focus {
	border-color: #409eff;
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

.btn-success {
	background-color: #67c23a;
	color: white;
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

.text-disabled {
	color: #c0c4cc;
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

.btn-text-danger {
	color: #f56c6c;
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
	.search-item input,
	.search-item select {
		width: 100%;
	}
	.search-actions {
		justify-content: flex-end;
	}
}
</style>
