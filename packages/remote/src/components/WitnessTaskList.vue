<template>
	<div class="witness-task-list">
		<!-- Search Bar -->
		<div class="search-bar">
			<div class="search-item">
				<label for="taskName">见证任务名称:</label>
				<input
					id="taskName"
					v-model="searchForm.taskName"
					type="text"
					placeholder="请输入任务名称"
					@keyup.enter="handleSearch"
				/>
			</div>
			<div class="search-actions">
				<button class="btn btn-primary" @click="handleSearch">查询</button>
				<button class="btn btn-secondary" @click="handleReset">重置</button>
				<button class="btn btn-success" @click="handleAdd">新增</button>
			</div>
		</div>

		<!-- Task List Table -->
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>见证任务数据</th>
						<th>执行方式</th>
						<th>通用任务</th>
						<th>签约状态</th>
						<th>创建人</th>
						<th>创建时间</th>
						<th>更新人</th>
						<th>更新时间</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="filteredData.length === 0">
						<td colspan="9" class="no-data">暂无数据</td>
					</tr>
					<tr v-for="task in pagedData" :key="task.id">
						<td>{{ task.taskName }}</td>
						<td>
							<span
								:class="[
									'tag',
									task.executionMode === 'web' ? 'tag-blue' : 'tag-green',
								]"
							>
								{{ task.executionMode === "web" ? "Web" : "桌面" }}
							</span>
						</td>
						<td>{{ task.isGeneral ? "是" : "否" }}</td>
						<td>
							<span :class="getStatusClass(task.signingStatus)">
								{{ task.signingStatus }}
							</span>
						</td>
						<td>{{ task.creator }}</td>
						<td>{{ task.createTime }}</td>
						<td>{{ task.updater }}</td>
						<td>{{ task.updateTime }}</td>
						<td class="actions">
							<button class="btn-text" @click="handleEdit(task)">编辑</button>
							<button
								class="btn-text btn-text-danger"
								@click="handleDelete(task)"
							>
								删除
							</button>
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
export interface WitnessTask {
	id: string;
	taskName: string; // 见证任务数据/名称
	executionMode: "web" | "desktop"; // 执行方式
	isGeneral: boolean; // 通用任务
	signingStatus: string; // 签约状态
	creator: string; // 创建人
	createTime: string; // 创建时间
	updater: string; // 更新人
	updateTime: string; // 更新时间
}

const props = defineProps<{
	data: WitnessTask[];
}>();

// --- State ---
const searchForm = ref({
	taskName: "",
});

const allData = ref<WitnessTask[]>([]);
const filteredData = ref<WitnessTask[]>([]); // Data after search filter
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
	const query = searchForm.value.taskName.trim().toLowerCase();
	if (!query) {
		filteredData.value = [...allData.value];
	} else {
		filteredData.value = allData.value.filter((item) =>
			item.taskName.toLowerCase().includes(query)
		);
	}
	pagination.value.currentPage = 1; // Reset to first page
};

const handleReset = () => {
	searchForm.value.taskName = "";
	handleSearch();
};

const handleAdd = () => {
	console.log("点击了新增按钮");
	alert("功能开发中：新增见证任务");
};

const handleEdit = (task: WitnessTask) => {
	console.log("Edit task:", task);
	alert(`编辑任务: ${task.taskName}`);
};

const handleDelete = (task: WitnessTask) => {
	if (confirm(`确定要删除任务: ${task.taskName} 吗?`)) {
		allData.value = allData.value.filter((t) => t.id !== task.id);
		handleSearch(); // Re-filter to update view
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
		case "已失效":
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
		handleSearch(); // Re-apply filters
	},
	{ deep: true }
);
</script>

<style scoped>
.witness-task-list {
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
	align-items: center;
	justify-content: space-between;
}

.search-item {
	display: flex;
	align-items: center;
	gap: 10px;
}

.search-item label {
	font-weight: 500;
	color: #606266;
}

.search-item input {
	padding: 8px 12px;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	width: 200px;
	outline: none;
	transition: border-color 0.2s;
}

.search-item input:focus {
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

/* Tags & Status */
.tag {
	padding: 2px 8px;
	border-radius: 4px;
	font-size: 12px;
	border: 1px solid;
}
.tag-blue {
	background-color: #ecf5ff;
	border-color: #d9ecff;
	color: #409eff;
}
.tag-green {
	background-color: #f0f9eb;
	border-color: #e1f3d8;
	color: #67c23a;
}

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
	.search-item {
		flex-direction: column;
		align-items: flex-start;
	}
	.search-item input {
		width: 100%;
	}
}
</style>
