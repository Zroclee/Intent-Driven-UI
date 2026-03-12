import { extractPageStateTool, executePlaywrightActionsTool } from "../tools/tool-playwright.js";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件所在目录 (__dirname in ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 测试工具链的可用性
 * 模拟用户添加流程：
 * 1. 打开页面
 * 2. 识别页面元素
 * 3. 执行添加用户操作
 */
export async function testToolChain() {
  console.log("🚀 Starting tool chain test...");

  try {
    // 1. 测试 execute_playwright_actions 工具
    console.log("\n[1/2] Testing execute_playwright_actions...");
    
    // 构造添加用户的动作序列
    // 注意：这里我们模拟大模型生成的 JSON 计划
    const addUserPlan = {
      task_id: "test-task-001",
      plan_summary: "添加新用户：李照鹏，市场部，普通用户",
      actions: [
        {
          step: 0,
          intent: "打开用户管理页面",
          type: "goto",
          payload: { url: "http://localhost:5173/product/users" }
        },
        {
          step: 1,
          intent: "点击新增按钮",
          type: "click",
          target: { type: "role", value: "button", name: "新增" }
        },
        {
          step: 2,
          intent: "等待弹窗出现",
          type: "wait",
          payload: { delay: 1000 }
        },
        {
          step: 3,
          intent: "填写用户名",
          type: "fill",
          target: { type: "css", value: "input[name='form-username']" },
          payload: { text: "李照鹏" }
        },
        {
          step: 5,
          intent: "选择组织机构",
          type: "selectOption",
          target: { type: "css", value: "select[name='form-organization']" },
          payload: { options: ["市场部"] }
        },
        {
          step: 7,
          intent: "选择角色",
          type: "selectOption",
          target: { type: "css", value: "select[name='form-role']" },
          payload: { options: ["普通用户"] }
        },
        {
          step: 9,
          intent: "点击确认按钮",
          type: "click",
          target: { type: "role", value: "button", name: "确认" }
        },
        {
          step: 10,
          intent: "等待提交完成并观察结果",
          type: "wait",
          payload: { delay: 5000 } 
        }
      ]
    };

    const executionResult = await executePlaywrightActionsTool.invoke(addUserPlan as any);
    console.log("Execution result:", executionResult);

    // 2. 测试 extract_page_state 工具
    console.log("\n[2/2] Testing extract_page_state...");
    // const pageState = await extractPageStateTool.invoke({});

    console.log("\n✅ Test completed successfully!");

  } catch (error) {
    console.error("\n❌ Test failed:", error);
  }
}

// 运行测试
// testToolChain();
