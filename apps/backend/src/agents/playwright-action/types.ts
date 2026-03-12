// 1. 定义支持的定位器类型
export type LocatorStrategy = 'markId' | 'css' | 'role' | 'text';

export interface ActionLocator {
  type: LocatorStrategy;
  value: string;
  // 仅在 type === 'role' 时使用，例如 { type: 'role', value: 'button', name: '提交' }
  name?: string;
}

// 2. 定义支持的操作动作
// 对应 Playwright 的核心 API：click, fill, press, hover, check, selectOption, goto
export type ActionType =
  | 'click'
  | 'fill'
  | 'press'
  | 'hover'
  | 'check'
  | 'selectOption'
  | 'wait'
  | 'goto';

// 3. 定义动作载荷 (Payload)
export interface ActionPayload {
  text?: string; // 用于 fill
  key?: string; // 用于 press，如 'Enter', 'Ctrl+A'
  delay?: number; // 用于 wait 动作的毫秒数
  options?: string[]; // 用于 selectOption 的多选
  url?: string; // 用于 goto 动作
}

// 4. 定义单个动作指令
export interface BrowserAction {
  step: number; // 步骤序号，方便追踪和报错
  intent: string; // 该步骤的自然语言意图，方便打日志和 UI 展示
  type: ActionType;
  target?: ActionLocator; // wait 等动作不需要 target
  payload?: ActionPayload;
}

// 5. 大模型输出的整体根结构
export interface AgentActionResponse {
  task_id: string;
  plan_summary: string; // 模型对接下来操作的总结
  actions: BrowserAction[];
}
