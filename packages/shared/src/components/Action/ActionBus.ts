type ActionHandler = (payload: any) => Promise<void> | void;

class ActionBus {
  private static instance: ActionBus;
  private events: Map<string, ActionHandler> = new Map();
  
  // 用于控制“等待通知”的 Promise 控制器
  private nextResolver: (() => void) | null = null;

  private constructor() {}

  public static getInstance(): ActionBus {
    if (!ActionBus.instance) ActionBus.instance = new ActionBus();
    return ActionBus.instance;
  }

  register(name: string, handler: ActionHandler) {
    this.events.set(name, handler);
  }

  unregister(name: string) {
    this.events.delete(name);
  }

  /**
   * 关键方法：由前端组件调用，通知 ActionBus 可以执行下一个任务了
   */
  notifyNext() {
    if (this.nextResolver) {
      console.log("[ActionBus] 收到继续执行的信号");
      this.nextResolver();
      this.nextResolver = null;
    }
  }

  /**
   * 内部方法：创建一个等待点
   */
  private waitNext(): Promise<void> {
    return new Promise((resolve) => {
      this.nextResolver = resolve;
    });
  }

  /**
   * 串行执行，每步完成后强制等待通知
   */
  async execute(actions: Array<{ type: string; params?: any }>) {
    for (const action of actions) {
      const { type } = action;
      const handler = this.events.get(type);

      if (handler) {
        try {
          console.log(`[ActionBus] 正在执行: ${type}`);
          
          // 1. 先初始化等待 Promise，防止 handler 内部同步调用 notifyNext 时 nextResolver 为空
          const nextPromise = this.waitNext();

          // 2. 执行具体的业务逻辑 (如跳转、打开弹窗)
          await handler(action);

          // 3. 等待 nextPromise 完成
          console.log(`[ActionBus] ${type} handler 执行完毕，正在等待 notifyNext 信号...`);
          await nextPromise;

        } catch (error) {
          console.error(`[ActionBus] 执行中断:`, error);
          break;
        }
      }
    }
    console.log("[ActionBus] 所有 Actions 串行执行完毕");
  }
}

export const actionBus = ActionBus.getInstance();