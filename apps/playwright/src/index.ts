import "dotenv/config";
import { HumanMessage } from "@langchain/core/messages";
import { invokeAgent } from "./agent/agent-palywright-auto.ts";

async function main() {
  const task_goal =
    "在用户管理页面新增用户：姓名“李照鹏”，组织“市场部”，角色“普通用户”。页面地址 http://localhost:5173/product/users";

  const initial = {
    task_goal,
    compressed_dom: "",
    progress: { current_step: 0, total_steps: 4, completed: [] },
    is_finished: false,
    current_url: "",
    messages: [
      new HumanMessage(
        [
          "请按以下步骤执行，并严格使用提供的工具：",
          "1) 调用 goto_url 打开 http://localhost:5173/product/users；",
          "2) 调用 extract_page_state 获取编号截图与 elements，识别“新增/新建”按钮编号；",
          "3) 调用 click_element 点击该按钮；",
          "4) 再次 extract_page_state，识别表单字段编号：姓名、组织、角色；",
          "5) 使用 fill_input/点击选择控件 完成表单填写：",
          "   - 姓名：李照鹏",
          "   - 组织：市场部",
          "   - 角色：普通用户",
          "6) 提交表单，并在页面上验证新用户已出现；",
          "7) 每完成关键子步骤调用 update_progress(step_label)，最后调用 task_complete；",
          "8) 在关键步骤前后适时调用 extract_page_state 便于自检。",
        ].join("\n")
      ),
    ],
  };

}

// main();

// import { addUser } from "./test/index.js";
// await addUser();

// import { testToolChain } from './test/tool-test.ts'
// testToolChain();

async function testAutoAgent() {
  console.log("Starting Auto Agent Test...");

  const content = `新增用户操作
1. 前往用户管理页面：http://localhost:5173/product/users
2. 点击新增“新增”按钮
3. 在弹窗中填写用户信息：用户名（input name="form-username"）、组织（select name="form-organization"）、角色（select name="form-role"）
4. 点击"确认"按钮

用户名：李照鹏，组织：市场部，角色：普通用户
`

  try {
    const result = await invokeAgent(content);
    console.log("Agent Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Agent Error:", error);
  }
}

testAutoAgent();
