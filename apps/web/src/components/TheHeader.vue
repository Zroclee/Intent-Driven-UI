<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <div class="header-inner container">
      <!-- 左侧 Logo -->
      <div class="logo">
        <RouterLink to="/" class="logo-link">IDU</RouterLink>
      </div>

      <!-- 中间导航 -->
      <nav class="nav-center">
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/business-assistant">业务助手</RouterLink>
        <RouterLink to="/product-assistant">产品助手</RouterLink>
      </nav>

      <!-- 右侧操作栏 -->
      <div class="actions">
        <button class="icon-btn" aria-label="GitHub">
          GitHub
        </button>
        <button class="icon-btn" aria-label="Contact">
          联系我们
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  height: 64px;
}

.header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 左侧 Logo */
.logo {
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--color-primary);
  min-width: 120px;
}

.logo-link {
  color: var(--color-primary);
  text-decoration: none;
}

/* 中间导航 */
.nav-center {
  display: flex;
  gap: 2rem;
}

.nav-center a {
  color: var(--color-text);
  font-weight: 500;
  position: relative;
  padding: 0.5rem 0;
}

.nav-center a:hover {
  color: var(--color-primary);
}

.nav-center a.router-link-active {
  color: var(--color-primary);
}

.nav-center a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--color-primary);
  border-radius: 2px;
}

/* 右侧操作栏 */
.actions {
  display: flex;
  gap: 1rem;
  min-width: 120px;
  justify-content: flex-end;
}

.icon-btn {
  background: transparent;
  color: var(--color-text-light);
  border: 1px solid var(--color-border);
  padding: 0.4em 0.8em;
  font-size: 0.9em;
  box-shadow: none;
}

.icon-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary-light);
  background-color: var(--color-hover);
  transform: translateY(-1px);
}
</style>
