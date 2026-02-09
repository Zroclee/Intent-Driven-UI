<script setup lang="ts">
import { useRouter } from "vue-router";
import TheHeader from "../components/TheHeader.vue";

const router = useRouter();

const navigateTo = (path: string) => {
	router.push(path);
};
</script>

<template>
	<TheHeader />
	<main class="home-container">
		<div class="home">
			<h1>首页</h1>
			<p>欢迎来到 Intent Driven Monorepo 演示项目</p>
			<div class="actions">
				<button @click="navigateTo('/business-assistant')">进入业务助手</button>
				<button @click="navigateTo('/product-assistant')">进入产品助手</button>
				<button @click="navigateTo('/business-remote')">
					进入业务远程组件
				</button>
			</div>
		</div>
	</main>
</template>

<style scoped>
.home-container {
	max-width: 1280px;
	margin: 0 auto;
	padding: 2rem 0;
}

.home {
	text-align: center;
	padding: 20px;
}
.actions {
	margin-top: 20px;
	display: flex;
	gap: 10px;
	justify-content: center;
}
button {
	padding: 10px 20px;
	font-size: 16px;
	cursor: pointer;
}
</style>
