<template>
	<div class="role-management-container">
		<!-- 顶部搜索和操作栏 -->
		<div class="search-bar">
			<div class="search-inputs">
				<div class="input-group">
					<label>角色名称</label>
					<input
						v-model="searchForm.name"
						type="text"
						placeholder="请输入角色名称"
						@keyup.enter="handleSearch"
					/>
				</div>
				<div class="input-group">
					<label>角色ID</label>
					<input
						v-model="searchForm.roleId"
						type="text"
						placeholder="请输入角色ID"
						@keyup.enter="handleSearch"
					/>
				</div>
			</div>
			<div class="action-buttons">
				<button class="btn btn-primary" @click="handleSearch">查询</button>
				<button class="btn btn-default" @click="handleReset">重置</button>
				<button class="btn btn-success" @click="handleAdd">新增</button>
				<button class="btn btn-danger" @click="handleBatchDelete">删除</button>
			</div>
		</div>

		<!-- 角色列表 -->
		<div class="table-container">
			<table class="role-table">
				<thead>
					<tr>
						<th width="50">
							<input
								type="checkbox"
								v-model="isAllSelected"
								@change="toggleSelectAll"
							/>
						</th>
						<th>角色ID</th>
						<th>角色名称</th>
						<th>状态</th>
						<th>创建时间</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="role in paginatedData" :key="role.id">
						<td>
							<input
								type="checkbox"
								v-model="selectedRoleIds"
								:value="role.id"
							/>
						</td>
						<td>{{ role.id }}</td>
						<td>{{ role.name }}</td>
						<td>
							<span :class="['status-badge', getStatusClass(role.status)]">
								{{ role.status }}
							</span>
						</td>
						<td>{{ role.createTime }}</td>
						<td>
							<button class="btn-text" @click="handleEdit(role)">编辑</button>
							<button
								class="btn-text btn-text-danger"
								@click="handleDelete(role)"
							>
								删除
							</button>
						</td>
					</tr>
					<tr v-if="paginatedData.length === 0">
						<td colspan="6" class="empty-text">暂无数据</td>
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
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";

/**
 * 角色接口定义
 */
interface Role {
	id: string;
	name: string;
	status: "启用" | "禁用";
	createTime: string;
}

// 搜索表单状态
const searchForm = reactive({
	name: "",
	roleId: "",
});

// 所有角色数据（模拟数据库）
const allData = ref<Role[]>([]);
// 选中的角色ID
const selectedRoleIds = ref<string[]>([]);
// 当前页码
const currentPage = ref(1);
// 每页条数
const pageSize = 10;

/**
 * 初始化假数据
 */
const initMockData = () => {
	const roleNames = [
		"超级管理员",
		"系统管理员",
		"普通用户",
		"访客",
		"运维人员",
		"审计员",
		"内容编辑",
		"财务专员",
	];
	const statuses: Role["status"][] = ["启用", "禁用"];

	const mockData: Role[] = [];
	// 生成 20 条数据
	for (let i = 1; i <= 20; i++) {
		const date = new Date();
		date.setDate(date.getDate() - Math.floor(Math.random() * 365));
		const dateStr =
			date.toISOString().split("T")[0] +
			" " +
			date.toTimeString().split(" ")[0].slice(0, 5);

		mockData.push({
			id: `R${String(i).padStart(5, "0")}`,
			name: roleNames[Math.floor(Math.random() * roleNames.length)] + `_${i}`,
			status: statuses[Math.floor(Math.random() * statuses.length)],
			createTime: dateStr,
		});
	}
	allData.value = mockData;
};

// 页面加载时初始化数据
onMounted(() => {
	initMockData();
});

/**
 * 过滤后的数据（基于搜索条件）
 */
const filteredData = computed(() => {
	return allData.value.filter((role) => {
		const matchName = role.name
			.toLowerCase()
			.includes(searchForm.name.toLowerCase());
		const matchId = role.id
			.toLowerCase()
			.includes(searchForm.roleId.toLowerCase());
		return matchName && matchId;
	});
});

/**
 * 分页后的当前页数据
 */
const paginatedData = computed(() => {
	const start = (currentPage.value - 1) * pageSize;
	const end = start + pageSize;
	return filteredData.value.slice(start, end);
});

/**
 * 总页数
 */
const totalPages = computed(() => {
	return Math.ceil(filteredData.value.length / pageSize) || 1;
});

/**
 * 全选状态
 */
const isAllSelected = computed({
	get: () => {
		return (
			paginatedData.value.length > 0 &&
			paginatedData.value.every((role) =>
				selectedRoleIds.value.includes(role.id)
			)
		);
	},
	set: (val: boolean) => {
		if (val) {
			// 选中当前页所有
			const newIds = paginatedData.value.map((u) => u.id);
			selectedRoleIds.value = [
				...new Set([...selectedRoleIds.value, ...newIds]),
			];
		} else {
			// 取消选中当前页所有
			const currentPageIds = paginatedData.value.map((u) => u.id);
			selectedRoleIds.value = selectedRoleIds.value.filter(
				(id) => !currentPageIds.includes(id)
			);
		}
	},
});

/**
 * 全选/反选操作
 */
const toggleSelectAll = () => {
	// 逻辑已在 computed setter 中处理
};

/**
 * 搜索操作
 */
const handleSearch = () => {
	currentPage.value = 1; // 重置到第一页
	console.log("执行搜索:", searchForm);
};

/**
 * 重置操作
 */
const handleReset = () => {
	searchForm.name = "";
	searchForm.roleId = "";
	currentPage.value = 1;
};

/**
 * 新增角色
 */
const handleAdd = () => {
	alert("点击了新增按钮");
};

/**
 * 批量删除
 */
const handleBatchDelete = () => {
	if (selectedRoleIds.value.length === 0) {
		alert("请先选择要删除的角色");
		return;
	}
	if (confirm(`确定要删除选中的 ${selectedRoleIds.value.length} 个角色吗？`)) {
		allData.value = allData.value.filter(
			(r) => !selectedRoleIds.value.includes(r.id)
		);
		selectedRoleIds.value = [];
		alert("删除成功");
	}
};

/**
 * 编辑角色
 */
const handleEdit = (role: Role) => {
	alert(`编辑角色: ${role.name} (${role.id})`);
};

/**
 * 单个删除
 */
const handleDelete = (role: Role) => {
	if (confirm(`确定要删除角色 ${role.name} 吗？`)) {
		allData.value = allData.value.filter((r) => r.id !== role.id);
		// 如果当前页为空且不是第一页，向前翻页
		if (paginatedData.value.length === 0 && currentPage.value > 1) {
			currentPage.value--;
		}
	}
};

/**
 * 切换分页
 */
const changePage = (page: number) => {
	if (page >= 1 && page <= totalPages.value) {
		currentPage.value = page;
	}
};

/**
 * 获取状态样式
 */
const getStatusClass = (status: string) => {
	switch (status) {
		case "启用":
			return "status-active";
		case "禁用":
			return "status-disabled";
		default:
			return "";
	}
};
</script>

<style scoped>
.role-management-container {
	/* padding: 24px;  移除内边距，由Layout控制 */
	background-color: transparent; /* 背景色跟随Layout */
	/* min-height: 100vh; 移除最小高度，避免双滚动条 */
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
		"Helvetica Neue", Arial, sans-serif;
}

/* 搜索栏样式 */
.search-bar {
	background: white;
	padding: 16px; /* 稍微减小内边距 */
	border-radius: 8px;
	box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* 减淡阴影 */
	margin-bottom: 16px;
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	flex-wrap: wrap;
	gap: 16px;
}

.search-inputs {
	display: flex;
	gap: 20px;
	flex-wrap: wrap;
}

.input-group {
	display: flex;
	flex-direction: column;
	gap: 6px; /* 减小间距 */
}

.input-group label {
	font-size: 14px;
	color: #606266;
	font-weight: 500;
}

.input-group input {
	height: 32px; /* 减小高度 */
	padding: 0 12px;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	width: 200px;
	outline: none;
	transition: border-color 0.2s;
	font-size: 14px;
}

.input-group input:focus {
	border-color: #409eff;
}

.action-buttons {
	display: flex;
	gap: 12px;
}

/* 按钮通用样式 */
.btn {
	height: 32px; /* 减小高度 */
	padding: 0 16px;
	border-radius: 4px;
	border: none;
	cursor: pointer;
	font-size: 14px;
	transition: opacity 0.2s;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.btn:hover {
	opacity: 0.8;
}

.btn:active {
	opacity: 1;
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

.btn-success {
	background-color: #67c23a;
	color: white;
}

.btn-danger {
	background-color: #f56c6c;
	color: white;
}

.btn-sm {
	height: 28px; /* 减小高度 */
	padding: 0 12px;
	background: white;
	border: 1px solid #dcdfe6;
	color: #606266;
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

/* 列表样式 */
.table-container {
	background: white;
	padding: 16px; /* 减小内边距 */
	border-radius: 8px;
	box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	overflow-x: auto;
}

.role-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 14px;
}

.role-table th,
.role-table td {
	padding: 8px 12px; /* 减小单元格内边距，使表格更紧凑 */
	text-align: left;
	border-bottom: 1px solid #ebeef5;
}

.role-table th {
	background-color: #fafafa; /* 颜色淡一点 */
	color: #909399;
	font-weight: 600;
}

.role-table tbody tr:hover {
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
	border-radius: 12px;
	font-size: 12px;
}

.status-active {
	background-color: #f0f9eb;
	color: #67c23a;
	border: 1px solid #e1f3d8;
}

.status-disabled {
	background-color: #fef0f0;
	color: #f56c6c;
	border: 1px solid #fde2e2;
}

/* 操作按钮 */
.btn-text {
	background: none;
	border: none;
	color: #409eff;
	cursor: pointer;
	padding: 0 4px;
	font-size: 14px;
}

.btn-text:hover {
	text-decoration: underline;
}

.btn-text-danger {
	color: #f56c6c;
}

/* 分页样式 */
.pagination {
	margin-top: 16px; /* 减小间距 */
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 4px;
}

.page-info {
	color: #606266;
	font-size: 13px; /* 稍微减小字体 */
}

.page-controls {
	display: flex;
	gap: 8px;
}
</style>
