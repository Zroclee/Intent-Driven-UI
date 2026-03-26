<template>
  <div class="login-container">
    <div class="login-box">
      <h2>系统登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">账号</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入账号"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        <button type="submit" class="login-button">登录</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const username = ref('');
const password = ref('');
const errorMessage = ref('');

const handleLogin = () => {
  errorMessage.value = '';
  if (username.value === 'admin' && password.value === '123456') {
    // 登录成功，跳转到 /product/apps
    sessionStorage.setItem('islogin', 'true');
    router.push('/product/apps');
  } else {
    // 登录失败，显示错误提示
    errorMessage.value = '账号密码错误';
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #409eff;
}

.error-message {
  color: #f56c6c;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: #66b1ff;
}
</style>
