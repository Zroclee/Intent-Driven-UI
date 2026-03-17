import type { Page, Locator } from 'playwright';
import { ActionLocator, BrowserAction, AgentActionResponse } from './types';

export class PlaywrightExecutor {
  private page: Page;
  // 全局视觉延迟，让用户能看清每一步操作
  private visualDelayMs: number = 500;

  constructor(page: Page) {
    this.page = page;
  }

  // 解析定位器，转化为 Playwright 的 Locator 对象
  private getLocator(target: ActionLocator): Locator {
    switch (target.type) {
      case 'markId':
        // 假设视觉标记通过 custom attribute idu-mark-id 注入
        return this.page.locator(`[idu-mark-id="${target.value}"]`); //
      case 'css':
        return this.page.locator(target.value); //
      case 'text':
        return this.page.getByText(target.value); //
      case 'role':
        return this.page.getByRole(target.value as any, { name: target.name }); //
      default: {
        const invalidTarget = target as { type: string };
        throw new Error(`Unsupported locator strategy: ${invalidTarget.type}`);
      }
    }
  }

  // 执行动作流
  public async executeActions(
    response: AgentActionResponse,
  ): Promise<{ success: boolean; error?: string; stoppedAtStep?: number }> {
    console.log(
      `[Executor] Starting task: ${response.task_id} - ${response.plan_summary}`,
    );

    for (const action of response.actions) {
      console.log(`[Executor] Step ${action.step}: ${action.intent}`);
      try {
        await this.performAction(action);

        // 动作完成后的视觉停顿，提升演示观感
        if (action.type !== 'wait') {
          await this.page.waitForTimeout(this.visualDelayMs); //
        }
      } catch (error: any) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `[Executor] Failed at step ${action.step}:`,
          errorMessage,
        );
        return {
          success: false,
          error: errorMessage,
          stoppedAtStep: action.step,
        };
      }
    }

    // 所有动作完成后，等待网络空闲，确保页面状态稳定
    await this.page.waitForLoadState('networkidle'); //
    return { success: true };
  }

  // 路由分发具体动作
  private async performAction(action: BrowserAction): Promise<void> {
    const { type, target, payload } = action;
    const locator = target ? this.getLocator(target) : null;

    switch (type) {
      case 'click':
        await locator!.click(); //
        break;
      case 'fill':
        await locator!.fill(payload?.text || ''); //
        break;
      case 'press':
        // 支持页面级别的快捷键和特定元素内的按键
        if (locator) {
          await locator.press(payload?.key || 'Enter'); //
        } else {
          await this.page.keyboard.press(payload?.key || 'Enter'); //
        }
        break;
      case 'hover':
        await locator!.hover(); //
        break;
      case 'check':
        await locator!.check(); //
        break;
      case 'selectOption':
        await locator!.selectOption(payload?.options || []); //
        break;
      case 'goto':
        await this.page.goto(payload?.url || '', {
          waitUntil: 'domcontentloaded',
        }); //
        break;
      case 'wait':
        // 显式等待，例如等待动画完成
        await this.page.waitForTimeout(payload?.delay || 1000); //
        break;
      default:
        throw new Error(`Unsupported action type: ${type as string}`);
    }
  }
}
