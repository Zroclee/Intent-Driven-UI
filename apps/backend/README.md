# backend

## 项目介绍

这是一个基于 NestJS 框架的后端项目，用于处理前端应用的请求和响应。
基于langchain框架，构建智能体。

## 环境准备
在开始之前，请确保您的开发环境满足以下要求：
- Node.js 版本 20 或以上
- 包管理器: npm(Node.js自带)、pnpm(推荐)

## 项目初始化

```bash
npm install -g @nestjs/cli
nest new backend
cd backend
pnpm install
pnpm add langchain @langchain/core @langchain/langgraph @langchain/openai dotenv zod
```

## 运行项目

```bash
# 开发模式
$ npm run start

# 监听模式
$ npm run start:dev

# 生产模式
$ npm run start:prod
``` 

## 智能体 - AI驱动组件
agent_multi

## 智能体 - 产品智能助手
agent_product

## 智能体 - playwright 操作浏览器
agent_playwright
1. 技术方向
  为实现效果，我设计了两个技术方向
  方向一：利用playwright封装原子化工具，大模型自行组合调用 ()
  方向二：大模型通过协议生成包含playwright指令的json，通过playwright执行器执行 (agent_playwright)
2. 方向一必备工具构建 - Set-of-Mark (SoM)技术