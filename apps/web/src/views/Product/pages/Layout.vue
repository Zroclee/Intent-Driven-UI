<template>
	<div class="layout-container">
		<!-- 顶部 Header -->
		<header class="layout-header">
			<div class="header-left">
				<div class="logo" :class="{ collapsed: isCollapsed }">
					<div class="logo-icon">
						<svg
							width="32"
							height="32"
							viewBox="0 0 32 32"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<rect width="32" height="32" rx="6" fill="#1890ff" />

							<!-- Placeholder for IDU simplified, actually let's use text for better readability in SVG -->
							<text
								x="16"
								y="21"
								font-family="Arial, sans-serif"
								font-weight="bold"
								font-size="12"
								fill="white"
								text-anchor="middle"
							>
								IDU
							</text>
						</svg>
					</div>
					<span class="logo-text" v-show="!isCollapsed">产品助手后台</span>
				</div>
				<button class="trigger-btn" @click="toggleCollapse">
					<span class="icon">{{ isCollapsed ? "》" : "《" }}</span>
				</button>
			</div>
			<div class="user-info">
				<span>管理员</span>
			</div>
		</header>

		<div class="layout-body">
			<!-- 左侧 Sidebar -->
			<aside class="layout-sidebar" :class="{ collapsed: isCollapsed }">
				<nav class="sidebar-menu">
					<router-link
						v-for="item in menuItems"
						:key="item.path"
						:to="item.path"
						class="menu-item"
						active-class="active"
						:title="isCollapsed ? item.name : ''"
					>
						<span class="icon">{{ item.icon }}</span>
						<span class="text" v-show="!isCollapsed">{{ item.name }}</span>
					</router-link>
				</nav>
			</aside>

			<!-- 右侧主要内容区域 -->
			<main class="layout-content">
				<router-view v-slot="{ Component }">
					<transition name="fade" mode="out-in">
						<component :is="Component" />
					</transition>
				</router-view>
			</main>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface MenuItem {
	path: string;
	name: string;
	icon: string;
}

const menuItems = ref<MenuItem[]>([
	{ path: "/product/users", name: "用户管理", icon: "👥" },
	{ path: "/product/roles", name: "角色管理", icon: "🛡️" },
]);

const isCollapsed = ref(false);

const toggleCollapse = () => {
	isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.layout-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f0f2f5;
}

/* Header 样式 */
.layout-header {
	height: 64px;
	background-color: #fff;
	box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 24px;
	z-index: 10;
	position: relative;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 16px;
}

.logo {
	font-size: 20px;
	font-weight: 600;
	color: #1f2937;
	display: flex;
	align-items: center;
	gap: 12px;
	transition: all 0.3s;
	width: 200px; /* 默认宽度匹配侧边栏 */
}

.logo.collapsed {
	width: 64px;
	justify-content: center;
}

.logo-icon {
	display: block; /* 始终显示图标 */
	flex-shrink: 0;
}

.logo.collapsed .logo-icon {
	/* 保持显示 */
}

.logo.collapsed .logo-text {
	display: none;
}

.trigger-btn {
	border: none;
	background: none;
	cursor: pointer;
	font-size: 20px;
	padding: 4px 8px;
	border-radius: 4px;
	color: #666;
	transition: background-color 0.3s;
}

.trigger-btn:hover {
	background-color: #f5f5f5;
}

.user-info {
	font-size: 14px;
	color: #666;
}

/* Body 布局 */
.layout-body {
	display: flex;
	flex: 1;
	overflow: hidden;
}

/* Sidebar 样式 */
.layout-sidebar {
	width: 200px; /* 用户要求的宽度 */
	background-color: #001529;
	color: #fff;
	display: flex;
	flex-direction: column;
	box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
	transition: width 0.3s ease;
	flex-shrink: 0;
}

.layout-sidebar.collapsed {
	width: 64px;
}

.sidebar-menu {
	padding: 16px 0;
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 14px 24px;
	color: rgba(255, 255, 255, 0.65);
	text-decoration: none;
	transition: all 0.3s;
	font-size: 14px;
	white-space: nowrap;
	overflow: hidden;
}

.layout-sidebar.collapsed .menu-item {
	padding: 14px 0;
	justify-content: center;
}

.menu-item:hover {
	color: #fff;
	background-color: rgba(255, 255, 255, 0.08);
}

.menu-item.active {
	color: #fff;
	background-color: #1890ff;
}

.menu-item .icon {
	margin-right: 12px;
	font-size: 18px;
	transition: margin 0.3s;
}

.layout-sidebar.collapsed .menu-item .icon {
	margin-right: 0;
}

/* Content 样式 */
.layout-content {
	flex: 1;
	overflow-y: auto;
	padding: 16px; /* 调整 padding 使内容更紧凑 */
	background-color: #f0f2f5;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
