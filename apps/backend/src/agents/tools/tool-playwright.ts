import { tool } from '@langchain/core/tools';
import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from 'playwright';
import * as z from 'zod';
import { PlaywrightExecutor } from '../playwright-action/executor.js';
import type { AgentActionResponse } from '../playwright-action/types.js';

type InteractiveElement = {
  id: number;
  tagName: string;
  text: string;
  type?: string;
  role?: string;
};

/**
 * Playwright 全局单例管理器
 * 负责管理 Browser, Context 和 Page 的生命周期，确保所有工具共享同一个 Page 实例。
 */
class PlaywrightManager {
  private static instance: PlaywrightManager;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  private constructor() {}

  public static getInstance(): PlaywrightManager {
    if (!PlaywrightManager.instance) {
      PlaywrightManager.instance = new PlaywrightManager();
    }
    return PlaywrightManager.instance;
  }

  /**
   * 获取当前的 Page 实例。如果不存在，则初始化一个新的浏览器和页面。
   */
  public async getPage(): Promise<Page> {
    if (!this.page || this.page.isClosed()) {
      await this.init();
    }
    // 再次检查以确保类型安全
    if (!this.page) {
      throw new Error('Failed to initialize Playwright page.');
    }
    return this.page;
  }

  public async start() {
    await this.init();
  }

  private async init() {
    if (!this.browser || !this.browser.isConnected()) {
      // 启动浏览器 - 使用有头模式以便观察
      this.browser = await chromium.launch({
        channel: 'chrome',
        headless: false,
      });

      this.browser.on('disconnected', () => {
        this.browser = null;
        this.context = null;
        this.page = null;
      });
    }

    if (!this.context) {
      // 创建上下文 - 设置视口大小
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });

      this.context.on('close', () => {
        this.context = null;
        this.page = null;
      });
    }

    if (!this.page || this.page.isClosed()) {
      // 创建页面
      this.page = await this.context.newPage();

      // 监听关闭事件，清理引用
      this.page.on('close', () => {
        this.page = null;
      });
    }
  }

  public async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }
}

/**
 * 工具：goto_url
 * 打开指定 URL，返回最终 URL、HTTP 状态码与页面标题
 */
export const gotoUrlTool = tool(
  async ({ url }: { url: string }) => {
    const manager = PlaywrightManager.getInstance();
    const p = await manager.getPage();
    const resp = await p.goto(url, { waitUntil: 'domcontentloaded' });
    const title = await p.title();
    return { url: p.url(), status: resp?.status() ?? 0, title };
  },
  {
    name: 'goto_url',
    description: '打开指定页面 URL',
    schema: z.object({
      url: z.string().url().describe('目标页面 URL'),
    }),
  },
);

/**
 * 参考视觉标记 (Set-of-Mark)
 * 工具：extract_page_state
 * - 在页面注入标注层，为视口内可交互元素添加红色编号
 * - 同时为每个元素添加 data-som-id 属性，用于后续操作
 * - 截图（包含编号）并移除标注层
 * - 返回：当前 url、title、elements 摘要与截图 Base64
 *
 * 注意：
 * - 仅标注“可见且在当前视口内”的元素，避免误点与无效目标
 * - 元素 text 使用 textContent 或 placeholder 的前 50 字符，作为 LLM 提示上下文
 */
export const extractPageStateTool = tool(
  async () => {
    const manager = PlaywrightManager.getInstance();
    const p = await manager.getPage();
    const elementsMetadata: InteractiveElement[] = await p.evaluate(() => {
      // Cleanup previous state
      document
        .querySelectorAll('.ai-label-container')
        .forEach((el) => el.remove());
      document
        .querySelectorAll('[data-som-id]')
        .forEach((el) => el.removeAttribute('data-som-id'));

      const selectors = [
        'a[href]',
        'button',
        'input',
        'select',
        'textarea',
        '[role="button"]',
        '[role="link"]',
        '[role="checkbox"]',
      ];
      const elements = document.querySelectorAll(selectors.join(','));
      const metadata: Omit<InteractiveElement, 'role'>[] = [];
      let currentId = 0;
      const container = document.createElement('div');
      container.className = 'ai-label-container';
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.style.zIndex = '9999999';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);

      elements.forEach((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        if (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.top >= 0 &&
          rect.top <= window.innerHeight
        ) {
          const id = currentId++;

          // Inject data-som-id
          el.setAttribute('data-som-id', id.toString());

          const label = document.createElement('div');
          label.innerText = `${id}`;
          label.style.position = 'absolute';
          label.style.top = `${rect.top + window.scrollY}px`;
          label.style.left = `${rect.left + window.scrollX}px`;
          label.style.backgroundColor = 'transparent';
          label.style.color = 'red';
          label.style.fontSize = '12px';
          label.style.fontWeight = 'bold';
          label.style.border = '2px solid red';
          label.style.borderRadius = '50%';
          label.style.width = '20px';
          label.style.height = '20px';
          label.style.display = 'flex';
          label.style.justifyContent = 'center';
          label.style.alignItems = 'center';
          container.appendChild(label);
          metadata.push({
            id,
            tagName: (el as HTMLElement).tagName.toLowerCase(),
            text: (el.textContent || (el as HTMLInputElement).placeholder || '')
              .trim()
              .substring(0, 50),
            type: (el as HTMLInputElement).type || undefined,
          });
        }
      });
      return metadata;
    });

    const screenshot = await p.screenshot({ fullPage: false, type: 'png' });

    await p.evaluate(() => {
      document
        .querySelectorAll('.ai-label-container')
        .forEach((el) => el.remove());
    });

    const title = await p.title();

    return {
      type: 'image_url',
      image_url: {
        url: `data:image/png;base64,${screenshot.toString('base64')}`,
      },
      url: p.url(),
      title,
      elements: elementsMetadata,
    };
  },
  {
    name: 'extract_page_state',
    description: '抓取当前页面的关键交互元素，并输出带编号截图与上下文摘要',
  },
);

/**
 * 工具：execute_playwright_actions
 * 执行大模型生成的 Playwright 指令序列 (JSON 格式)
 */
export const executePlaywrightActionsTool = tool(
  async (input) => {
    const manager = PlaywrightManager.getInstance();
    const p = await manager.getPage();
    const executor = new PlaywrightExecutor(p);
    const result = await executor.executeActions(input as AgentActionResponse);
    return JSON.stringify(result);
  },
  {
    name: 'execute_playwright_actions',
    description: '执行大模型生成的 Playwright 指令序列 (JSON 格式)',
    schema: z.object({
      task_id: z.string().describe('任务 ID'),
      plan_summary: z.string().describe('计划摘要'),
      actions: z
        .array(
          z.object({
            step: z.number().describe('步骤序号'),
            intent: z.string().describe('该步骤的意图'),
            type: z
              .enum([
                'click',
                'fill',
                'press',
                'hover',
                'check',
                'selectOption',
                'wait',
                'goto',
              ])
              .describe('动作类型'),
            target: z
              .object({
                type: z.enum(['markId', 'css', 'role', 'text']),
                value: z.string(),
                name: z.string().optional(),
              })
              .optional()
              .describe('定位器'),
            payload: z
              .object({
                text: z.string().optional(),
                key: z.string().optional(),
                delay: z.number().optional(),
                options: z.array(z.string()).optional(),
                url: z.string().optional(),
              })
              .optional()
              .describe('动作参数'),
          }),
        )
        .describe('动作列表'),
    }),
  },
);

/**
 * 工具：start_browser
 * 启动浏览器实例
 */
export const startBrowserTool = tool(
  async () => {
    const manager = PlaywrightManager.getInstance();
    await manager.start();
    return 'Browser started successfully';
  },
  {
    name: 'start_browser',
    description: '启动浏览器实例',
  },
);

/**
 * 工具：close_browser
 * 关闭浏览器实例
 */
export const closeBrowserTool = tool(
  async () => {
    const manager = PlaywrightManager.getInstance();
    await manager.close();
    return 'Browser closed successfully';
  },
  {
    name: 'close_browser',
    description: '关闭浏览器实例',
  },
);

/**
 * 工具集合导出：便于在 Agent 中统一引入
 */
export const browserTools = [
  startBrowserTool,
  closeBrowserTool,
  gotoUrlTool,
  extractPageStateTool,
  executePlaywrightActionsTool,
];
