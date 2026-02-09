<template>
	<div class="remote-container">
		<h2>远程组件示例</h2>
		<Suspense>
			<template #default>
				<CustomerSignList :data="data" />
			</template>
			<template #fallback>
				<div class="loading">加载远程组件中...</div>
			</template>
		</Suspense>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRemoteComponent } from "./tools/useRemoteComponent";

const CustomerSignList = useRemoteComponent("CustomerSignList");

const data = ref([]);
</script>

<style scoped>
.remote-container {
	padding: 20px;
}

.loading {
	padding: 20px;
	text-align: center;
	color: #666;
}
</style>
