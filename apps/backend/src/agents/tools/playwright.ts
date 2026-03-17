import { tool } from '@langchain/core/tools';
import * as z from 'zod';
import { PlaywrightExecutor } from '../playwright-action/executor.js';
import type { AgentActionResponse } from '../playwright-action/types.js';
import { playwrightManager } from '../../BrowserManager/index';

type InteractiveElement = {
  id: number;
  tagName: string;
  text: string;
  type?: string;
  role?: string;
};

/**
 * 参考视觉标记 (Set-of-Mark)
 * 工具：extract_page_state
 * - 在页面注入标注层，为视口内可交互元素添加红色编号
 * - 同时为每个元素添加 idu-mark-id 属性，用于后续操作
 * - 返回：当前 url、title、elements 摘要
 *
 * 注意：
 * - 仅标注“可见且在当前视口内”的元素，避免误点与无效目标
 * - 元素 text 使用 textContent 或 placeholder 的前 50 字符，作为 LLM 提示上下文
 */
export const extractPageStateTool = tool(
  async () => {
    const p = await playwrightManager.getPage();
    const elementsMetadata: InteractiveElement[] = await p.evaluate(() => {
      document
        .querySelectorAll('.ai-label-container')
        .forEach((el) => el.remove());
      document
        .querySelectorAll('[idu-mark-id]')
        .forEach((el) => el.removeAttribute('idu-mark-id'));

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
      const metadata: InteractiveElement[] = [];
      let currentId = 0;

      const isInViewport = (rect: DOMRect) =>
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom >= 0 &&
        rect.right >= 0 &&
        rect.top <= window.innerHeight &&
        rect.left <= window.innerWidth;

      const isVisible = (el: Element) => {
        const element = el as HTMLElement;
        const style = window.getComputedStyle(element);
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0' &&
          !element.hasAttribute('hidden') &&
          element.getAttribute('aria-hidden') !== 'true'
        );
      };

      const container = document.createElement('div');
      container.className = 'ai-label-container';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.zIndex = '9999999';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);

      elements.forEach((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        if (isVisible(el) && isInViewport(rect)) {
          const id = currentId++;
          el.setAttribute('idu-mark-id', id.toString());

          const label = document.createElement('div');
          label.innerText = `${id}`;
          label.style.position = 'absolute';
          label.style.top = `${Math.max(0, rect.top)}px`;
          label.style.left = `${Math.max(0, rect.left)}px`;
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
          const text = (
            el.textContent ||
            (el as HTMLInputElement).placeholder ||
            ''
          )
            .trim()
            .substring(0, 50);
          metadata.push({
            id,
            tagName: (el as HTMLElement).tagName.toLowerCase(),
            text,
            type: (el as HTMLInputElement).type || undefined,
            role: el.getAttribute('role') || undefined,
          });
        }
      });
      return metadata;
    });

    const title = await p.title();

    return {
      url: p.url(),
      title,
      elements: elementsMetadata,
    };
  },
  {
    name: 'extract_page_state',
    description:
      '抓取当前页面的关键交互元素，并输出带编号的元素摘要与上下文摘要',
  },
);

/**
 * 工具：execute_playwright_actions
 * 执行大模型生成的 Playwright 指令序列 (JSON 格式)
 */
export const executePlaywrightActionsTool = tool(
  async (input) => {
    const p = await playwrightManager.getPage();
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
 * 工具集合导出：便于在 Agent 中统一引入
 */
export const browserTools = [
  extractPageStateTool,
  executePlaywrightActionsTool,
];
