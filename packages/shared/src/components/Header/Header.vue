<script setup lang="ts">
import type { Component } from "vue";

defineOptions({
	name: "IDUHeader",
});

defineProps<{
	title: string;
	logo?: string | Component;
}>();
</script>

<template>
	<header class="header">
		<div class="header-left">
			<slot name="left"></slot>
		</div>

		<div class="header-center">
			<slot name="center">
				<template v-if="logo">
					<img
						v-if="typeof logo === 'string'"
						:src="logo"
						class="header-logo"
						alt="logo"
					/>
					<component v-else :is="logo" class="header-logo" />
				</template>
				<h1 class="header-title">{{ title }}</h1>
			</slot>
		</div>

		<div class="header-right">
			<slot name="right"></slot>
		</div>
	</header>
</template>

<style scoped>
@import "../styles/idu.css";

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	height: 50px;
	padding: 0 16px;
	background-color: var(--idu-bg-color-white);
	border-bottom: 1px solid var(--idu-border-color);
	box-shadow: var(--idu-shadow-sm);
	box-sizing: border-box;
}

.header-left,
.header-right {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 50px;
}

.header-right {
	justify-content: flex-end;
}

.header-center {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 2;
}

.header-logo {
	height: 20px;
	width: auto;
	margin-right: 8px;
}

.header-title {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
	color: var(--idu-text-color);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
