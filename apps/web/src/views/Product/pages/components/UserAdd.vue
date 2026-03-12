<template>
	<div v-if="visible" class="modal-overlay">
		<div class="modal-content">
			<div class="modal-header">
				<h3>新增用户</h3>
				<button class="close-btn" @click="handleCancel">×</button>
			</div>
			<div class="modal-body">
				<div class="form-item">
					<label>用户名称</label>
					<input name="form-username" v-model="form.username" type="text" placeholder="请输入用户名称" />
				</div>
				<div class="form-item">
					<label>组织机构</label>
					<select name="form-organization" v-model="form.organization">
						<option value="" disabled>请选择组织机构</option>
						<option v-for="org in orgs" :key="org" :value="org">
							{{ org }}
						</option>
					</select>
				</div>
				<div class="form-item">
					<label>角色</label>
					<select name="form-role" v-model="form.role">
						<option value="" disabled>请选择角色</option>
						<option v-for="role in roles" :key="role" :value="role">
							{{ role }}
						</option>
					</select>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-default" @click="handleCancel">取消</button>
				<button class="btn btn-primary" @click="handleConfirm">确认</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {  reactive, watch } from "vue";


const props = defineProps<{
	visible: boolean;
}>();

const emit = defineEmits(["update:visible", "confirm"]);

const form = reactive({
	username: "",
	organization: "",
	role: "",
});

const setForm = (data: Partial<typeof form>) => {
	Object.assign(form, data);
};

defineExpose({
	setForm,
});




const orgs = ["研发部", "市场部", "运营部", "财务部", "人事部"];
const roles = ["管理员", "普通用户", "审计员", "运营专员"];

watch(
	() => props.visible,
	(val) => {
		if (val) {
			// Reset form when opening
			form.username = "";
			form.organization = "";
			form.role = "";
		}
	}
);

const handleCancel = () => {
	emit("update:visible", false);
};

const handleConfirm = () => {
	if (!form.username || !form.organization || !form.role) {
		alert("请填写完整信息");
		return;
	}
	emit("confirm", { ...form });
	emit("update:visible", false);
};
</script>

<style scoped>
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
}

.modal-content {
	background: white;
	border-radius: 8px;
	width: 500px;
	max-width: 90%;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	display: flex;
	flex-direction: column;
}

.modal-header {
	padding: 16px 20px;
	border-bottom: 1px solid #ebeef5;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.modal-header h3 {
	margin: 0;
	font-size: 18px;
	color: #303133;
}

.close-btn {
	border: none;
	background: none;
	font-size: 20px;
	cursor: pointer;
	color: #909399;
}

.close-btn:hover {
	color: #606266;
}

.modal-body {
	padding: 20px;
}

.form-item {
	margin-bottom: 16px;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.form-item label {
	font-size: 14px;
	color: #606266;
}

.form-item input,
.form-item select {
	height: 32px;
	padding: 0 12px;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	outline: none;
	font-size: 14px;
}

.form-item input:focus,
.form-item select:focus {
	border-color: #409eff;
}

.modal-footer {
	padding: 16px 20px;
	border-top: 1px solid #ebeef5;
	display: flex;
	justify-content: flex-end;
	gap: 12px;
}

.btn {
	height: 32px;
	padding: 0 16px;
	border-radius: 4px;
	border: none;
	cursor: pointer;
	font-size: 14px;
	transition: opacity 0.2s;
}

.btn:hover {
	opacity: 0.8;
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
	color: #409eff;
	border-color: #c6e2ff;
	background-color: #ecf5ff;
}
</style>
