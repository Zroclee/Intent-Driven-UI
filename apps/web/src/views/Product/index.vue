<template>
  <div class="layout-container">
    <!-- 顶部 Header -->
    <header class="layout-header">
      <div class="header-left">
        <div class="logo" @click="router.push('/')">
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
          <span class="logo-text">产品助手后台</span>
        </div>
      </div>
      <div class="user-info">
        <span>管理员</span>
      </div>
    </header>

    <div class="layout-body">
      <!-- 左侧 Sidebar -->
      <aside class="layout-sidebar">
        <nav class="sidebar-menu">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="menu-item"
            active-class="active"
          >
            <span class="icon">{{ item.icon }}</span>
            <span class="text">{{ item.name }}</span>
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

    <!-- AI 悬浮按钮 -->
    <!-- <button class="ai-float-btn" @click="toggleChat" title="产品助手">
      <span v-if="!isChatOpen">🤖</span>
      <span v-else>✖️</span>
    </button> -->

    <!-- 悬浮聊天窗口 -->
    <transition name="chat-slide">
      <div v-if="isChatOpen" class="chat-window-container">
        <ChatComponent />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import ChatComponent from "./components/chat.vue";

interface MenuItem {
  path: string;
  name: string;
  icon: string;
}

const menuItems = ref<MenuItem[]>([
  { path: "/product/apps", name: "应用管理", icon: "📱" },
  { path: "/product/users", name: "用户管理", icon: "👥" },
  { path: "/product/roles", name: "角色管理", icon: "🛡️" },
  { path: "/product/data-ledger", name: "数据台账", icon: "📊" },
  { path: "/product/stats", name: "统计报表", icon: "📈" },
]);

const isChatOpen = ref(false);

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
};

const router = useRouter();

import { useAIAction } from "@idu/core";
const { registerAction, notifyNext } = useAIAction();

registerAction("NAVIGATE", async (action: any) => {
  if (action.path) {
    const targetPath = action.path;
    // 如果是当前页面就不要跳转了
    if (router.currentRoute.value.path !== targetPath) {
      await router.push(targetPath);
    } else {
		notifyNext();
	}
	
  }
});
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f2f5;
  position: relative;
}

/* AI 悬浮按钮 */
.ai-float-btn {
  position: fixed;
  bottom: 50px;
  right: 8px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 1000;
  border: none;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-float-btn:hover {
  transform: scale(1.1) rotate(10deg);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.3);
}

.ai-float-btn:active {
  transform: scale(0.95);
}

/* 聊天窗口容器 */
.chat-window-container {
  position: fixed;
  bottom: 110px;
  right: 8px;
  width: 380px;
  height: 600px;
  max-height: 80vh;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 999;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #e8e8e8;
}

/* 聊天窗口过渡动画 */
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  transform-origin: bottom right;
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
  cursor: pointer;
}

.logo-icon {
  display: block; /* 始终显示图标 */
  flex-shrink: 0;
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
