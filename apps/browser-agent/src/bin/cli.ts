#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const program = new Command();

program
  .name('agent-browser')
  .description('具备自我学习能力的浏览器智能助手')
  .version('1.0.0');

program
  .command('start')
  .description('启动智能浏览器和 AI 助手')
  .action(async () => {
    try {
      // 此处后续将启动 LangGraph 循环，监听自然语言输入
    } catch (error) {
      console.error('❌ 启动失败:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);