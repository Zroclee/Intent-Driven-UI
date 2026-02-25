<template>
	<div class="user-management-container">
		<!-- 顶部搜索和操作栏 -->
		<div class="search-bar">
			<div class="search-inputs">
				<div class="input-group">
					<label>用户名称</label>
					<input
						v-model="searchForm.name"
						type="text"
						placeholder="请输入用户名称"
						@keyup.enter="handleSearch"
					/>
				</div>
				<div class="input-group">
					<label>用户ID</label>
					<input
						v-model="searchForm.userId"
						type="text"
						placeholder="请输入用户ID"
						@keyup.enter="handleSearch"
					/>
				</div>
			</div>
			<div class="action-buttons">
				<button class="btn btn-primary" @click="handleSearch">搜索</button>
				<button class="btn btn-default" @click="handleReset">重置</button>
				<button class="btn btn-success" @click="handleAdd">新增</button>
				<button class="btn btn-danger" @click="handleBatchDelete">删除</button>
			</div>
		</div>

		<!-- 用户列表 -->
		<div class="table-container">
			<table class="user-table">
				<thead>
					<tr>
						<th width="50">
							<input
								type="checkbox"
								v-model="isAllSelected"
								@change="toggleSelectAll"
							/>
						</th>
						<th>用户ID</th>
						<th>用户名称</th>
						<th>组织机构</th>
						<th>角色</th>
						<th>状态</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="user in paginatedData" :key="user.id">
						<td>
							<input
								type="checkbox"
								v-model="selectedUserIds"
								:value="user.id"
							/>
						</td>
						<td>{{ user.id }}</td>
						<td>{{ user.name }}</td>
						<td>{{ user.organization }}</td>
						<td>{{ user.role }}</td>
						<td>
							<span :class="['status-badge', getStatusClass(user.status)]">
								{{ user.status }}
							</span>
						</td>
						<td>
							<button class="btn-text" @click="handleEdit(user)">编辑</button>
							<button
								class="btn-text btn-text-danger"
								@click="handleDelete(user)"
							>
								删除
							</button>
						</td>
					</tr>
					<tr v-if="paginatedData.length === 0">
						<td colspan="7" class="empty-text">暂无数据</td>
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

		<!-- 新增用户弹窗 -->
		<UserAdd
			ref="userAddRef"
			v-model:visible="isAddModalVisible"
			@confirm="handleUserAdd"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { useAIAction } from "../actions/useAIAction";
import UserAdd from "./components/UserAdd.vue";
const { notifyNext, registerAction } = useAIAction();

const userAddRef = ref<InstanceType<typeof UserAdd> | null>(null);

registerAction("OPEN_MODAL", async (action) => {
	if (action.target === "createUserModal") {
		isAddModalVisible.value = true;
		
		notifyNext();
	}
});
registerAction("FILL_FORM", async (action) => {
	if (action.target === "createUserForm") {
		const fields = action.fields || {};
		if (userAddRef.value) {
			userAddRef.value.setForm(fields);
		}
		await nextTick();
		notifyNext();
	}
});

/**
 * 用户接口定义
 */
interface User {
	id: string;
	name: string;
	organization: string;
	role: string;
	status: "启用" | "禁用" | "锁定";
}

// 搜索表单状态
const searchForm = reactive({
	name: "",
	userId: "",
});

// 所有用户数据（模拟数据库）
const allData = ref<User[]>([]);
// 选中的用户ID
const selectedUserIds = ref<string[]>([]);
// 当前页码
const currentPage = ref(1);
// 每页条数
const pageSize = 10;
// 新增弹窗显示状态
const isAddModalVisible = ref(false);

/**
 * 初始化假数据
 */
const initMockData = () => {
	const roles = ["管理员", "普通用户", "审计员", "运营专员"];
	const orgs = ["研发部", "市场部", "运营部", "财务部", "人事部"];
	const statuses: User["status"][] = ["启用", "禁用", "锁定"];

	const mockData: User[] = [];
	// 生成 30 条数据
	for (let i = 1; i <= 30; i++) {
		mockData.push({
			id: `U${String(i).padStart(5, "0")}`,
			name: `用户_${i}`,
			organization: orgs[Math.floor(Math.random() * orgs.length)],
			role: roles[Math.floor(Math.random() * roles.length)],
			status: statuses[Math.floor(Math.random() * statuses.length)],
		});
	}
	allData.value = mockData;
};

// 页面加载时初始化数据
onMounted(() => {
	notifyNext()
	initMockData();
});

/**
 * 过滤后的数据（基于搜索条件）
 */
const filteredData = computed(() => {
	return allData.value.filter((user) => {
		const matchName = user.name
			.toLowerCase()
			.includes(searchForm.name.toLowerCase());
		const matchId = user.id
			.toLowerCase()
			.includes(searchForm.userId.toLowerCase());
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
			paginatedData.value.every((user) =>
				selectedUserIds.value.includes(user.id)
			)
		);
	},
	set: (val: boolean) => {
		if (val) {
			// 选中当前页所有
			const newIds = paginatedData.value.map((u) => u.id);
			selectedUserIds.value = [
				...new Set([...selectedUserIds.value, ...newIds]),
			];
		} else {
			// 取消选中当前页所有
			const currentPageIds = paginatedData.value.map((u) => u.id);
			selectedUserIds.value = selectedUserIds.value.filter(
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
	searchForm.userId = "";
	currentPage.value = 1;
};

/**
 * 新增用户
 */
const handleAdd = () => {
	isAddModalVisible.value = true;
};

/**
 * 处理新增确认
 */
const handleUserAdd = (userData: {
	username: string;
	organization: string;
	role: string;
}) => {
	const newId = `U${String(allData.value.length + 1).padStart(5, "0")}`;
	const newUser: User = {
		id: newId,
		name: userData.username,
		organization: userData.organization,
		role: userData.role,
		status: "启用", // 默认状态
	};
	// 添加到开头
	allData.value.unshift(newUser);
	// 提示
	alert(`添加成功：${newUser.name}`);
};

/**
 * 批量删除
 */
const handleBatchDelete = () => {
	if (selectedUserIds.value.length === 0) {
		alert("请先选择要删除的用户");
		return;
	}
	if (confirm(`确定要删除选中的 ${selectedUserIds.value.length} 个用户吗？`)) {
		allData.value = allData.value.filter(
			(u) => !selectedUserIds.value.includes(u.id)
		);
		selectedUserIds.value = [];
		alert("删除成功");
	}
};

/**
 * 编辑用户
 */
const handleEdit = (user: User) => {
	alert(`编辑用户: ${user.name} (${user.id})`);
};

/**
 * 单个删除
 */
const handleDelete = (user: User) => {
	if (confirm(`确定要删除用户 ${user.name} 吗？`)) {
		allData.value = allData.value.filter((u) => u.id !== user.id);
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
		case "锁定":
			return "status-locked";
		default:
			return "";
	}
};
</script>

<style scoped>
.user-management-container {
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

.user-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 14px;
}

.user-table th,
.user-table td {
	padding: 8px 12px; /* 减小单元格内边距，使表格更紧凑 */
	text-align: left;
	border-bottom: 1px solid #ebeef5;
}

.user-table th {
	background-color: #fafafa; /* 颜色淡一点 */
	color: #909399;
	font-weight: 600;
}

.user-table tbody tr:hover {
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

.status-locked {
	background-color: #f4f4f5;
	color: #909399;
	border: 1px solid #e9e9eb;
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
