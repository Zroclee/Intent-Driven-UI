<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToUsers = () => {
  router.push('/product/users');
};
</script>

<template>
	<div class="product-assistant">
		<h1>产品助手</h1>
		<p>这里是产品助手页面，用于编写产品相关辅助功能。</p>
		
		<div class="actions">
			<button class="btn-entry" @click="navigateToUsers">进入用户管理系统</button>
		</div>
	</div>
</template>

<style scoped>
.product-assistant {
	max-width: 1280px;
	padding: 2rem 20px;
}

.actions {
	margin-top: 24px;
}

.btn-entry {
	padding: 12px 24px;
	background-color: #409eff;
	color: white;
	border: none;
	border-radius: 6px;
	font-size: 16px;
	cursor: pointer;
	transition: background-color 0.2s;
}

.btn-entry:hover {
	background-color: #66b1ff;
}
</style>
