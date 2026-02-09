<script setup lang="ts">
import { ref, onMounted } from "vue";
import WitnessTaskList, {
	type WitnessTask,
} from "./components/WitnessTaskList.vue";
import CustomerSignList, {
	type CustomerSign,
} from "./components/CustomerSignList.vue";
import WitnessAssetList, {
	type WitnessAsset,
} from "./components/WitnessAssetList.vue";

const currentComponent = ref<"witness" | "customer" | "asset">("witness");
const witnessData = ref<WitnessTask[]>([]);
const customerData = ref<CustomerSign[]>([]);
const assetData = ref<WitnessAsset[]>([]);

// --- Mock Data Generation ---
const generateWitnessData = () => {
	const data: WitnessTask[] = [];
	const modes: ("web" | "desktop")[] = ["web", "desktop"];
	const statuses = ["未签约", "签约中", "已签约", "已失效"];
	const users = ["张三", "李四", "王五", "赵六", "Admin"];

	for (let i = 1; i <= 32; i++) {
		const isWeb = Math.random() > 0.5;
		data.push({
			id: i.toString(),
			taskName: `见证任务测试数据 ${i} - ${isWeb ? "线上" : "线下"}办理`,
			executionMode: modes[Math.floor(Math.random() * modes.length)] as
				| "web"
				| "desktop",
			isGeneral: Math.random() > 0.3,
			signingStatus: statuses[
				Math.floor(Math.random() * statuses.length)
			] as string,
			creator: users[Math.floor(Math.random() * users.length)] as string,
			createTime: new Date(
				Date.now() - Math.floor(Math.random() * 10000000000)
			).toLocaleString(),
			updater: users[Math.floor(Math.random() * users.length)] as string,
			updateTime: new Date().toLocaleString(),
		});
	}
	return data;
};

const generateCustomerData = () => {
	const data: CustomerSign[] = [];
	const statuses = ["已签约", "签约中", "已解约"];

	for (let i = 1; i <= 45; i++) {
		const status = statuses[
			Math.floor(Math.random() * statuses.length)
		] as string;
		data.push({
			id: i.toString(),
			customerCode: `CUST${20240000 + i}`,
			customerName: `企业客户示例 ${i} 有限公司`,
			signTime: new Date(
				Date.now() - Math.floor(Math.random() * 10000000000)
			).toLocaleString(),
			signStatus: status,
		});
	}
	return data;
};

const generateAssetData = () => {
	const data: WitnessAsset[] = [];
	const witnessStatuses = ["见证成功", "见证中", "见证失败"];
	const signStatuses = ["生效", "已解约"];

	for (let i = 1; i <= 30; i++) {
		const wStatus = witnessStatuses[
			Math.floor(Math.random() * witnessStatuses.length)
		] as string;
		const cStatus = signStatuses[
			Math.floor(Math.random() * signStatuses.length)
		] as "生效" | "已解约";
		const tStatus = signStatuses[
			Math.floor(Math.random() * signStatuses.length)
		] as "生效" | "已解约";

		data.push({
			id: i.toString(),
			assetId: `AST${20240000 + i}`,
			assetName: `资产示例项目 ${i}`,
			customerCode: `CUST${20240000 + i}`,
			customerName: `企业客户 ${i} 有限公司`,
			witnessTime: new Date(
				Date.now() - Math.floor(Math.random() * 10000000000)
			).toLocaleString(),
			witnessStatus: wStatus,
			taskName: `关联见证任务 ${i}`,
			customerSignStatus: cStatus,
			taskSignStatus: tStatus,
		});
	}
	return data;
};

onMounted(() => {
	witnessData.value = generateWitnessData();
	customerData.value = generateCustomerData();
	assetData.value = generateAssetData();
});
</script>

<template>
	<div class="app-container">
		<div class="nav-bar">
			<button
				:class="['nav-btn', { active: currentComponent === 'witness' }]"
				@click="currentComponent = 'witness'"
			>
				见证任务列表
			</button>
			<button
				:class="['nav-btn', { active: currentComponent === 'customer' }]"
				@click="currentComponent = 'customer'"
			>
				客户签约列表
			</button>
			<button
				:class="['nav-btn', { active: currentComponent === 'asset' }]"
				@click="currentComponent = 'asset'"
			>
				见证资产列表
			</button>
		</div>

		<div class="content-area">
			<WitnessTaskList
				v-if="currentComponent === 'witness'"
				:data="witnessData"
			/>
			<CustomerSignList
				v-if="currentComponent === 'customer'"
				:data="customerData"
			/>
			<WitnessAssetList v-if="currentComponent === 'asset'" :data="assetData" />
		</div>
	</div>
</template>

<style>
body {
	margin: 0;
	padding: 0;
	background-color: #f0f2f5;
}

.app-container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 20px;
}

.nav-bar {
	margin-bottom: 20px;
	display: flex;
	gap: 10px;
	background: white;
	padding: 10px 20px;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.nav-btn {
	padding: 8px 16px;
	border: 1px solid #dcdfe6;
	background: white;
	border-radius: 4px;
	cursor: pointer;
	font-size: 14px;
	color: #606266;
	transition: all 0.3s;
}

.nav-btn:hover {
	color: #409eff;
	border-color: #c6e2ff;
	background-color: #ecf5ff;
}

.nav-btn.active {
	color: white;
	background-color: #409eff;
	border-color: #409eff;
}

.content-area {
	background: white;
	border-radius: 8px;
	overflow: hidden;
}
</style>
