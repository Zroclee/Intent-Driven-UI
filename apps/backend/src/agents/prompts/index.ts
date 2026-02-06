import * as fs from 'fs';
import * as path from 'path';

/**
 * 读取当前目录下的 Markdown 文件内容
 * @param filename 文件名
 * @returns 文件内容字符串
 */
function readPromptFile(filename: string): string {
  try {
    const filePath = path.join(__dirname, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(
        `[Prompt Loader] Warning: File ${filename} not found at ${filePath}`,
      );
      return '';
    }
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`[Prompt Loader] Error reading file ${filename}:`, error);
    return '';
  }
}

/**
 * 解析 Markdown 文件的 Front Matter
 * @param content 文件内容
 * @returns 解析后的对象或 null
 */
function parseFrontMatter(content: string): Record<string, string> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return null;
  }

  const frontMatterBlock = match[1];
  const result: Record<string, string> = {};

  frontMatterBlock.split('\n').forEach((line) => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      result[key] = value;
    }
  });

  return result;
}

/**
 * 获取子智能体的元数据信息
 * @param filename 文件名
 * @returns 格式化的信息字符串
 */
function getSubAgentInfo(filename: string): string {
  const content = readPromptFile(filename);
  const metadata = parseFrontMatter(content);

  if (!metadata || !metadata.name || !metadata.description) {
    return '';
  }

  return `- **${metadata.name}**: ${metadata.description}`;
}

/**
 * 农业管理 Agent 的系统提示词
 * 读取自同目录下的 agriculture_manager.md
 */
export const AGRICULTURE_MANAGER_PROMPT = readPromptFile(
  'agriculture_manager.md',
);

/**
 * 车辆管理 Agent 的系统提示词
 * 读取自同目录下的 carManager.md
 */
export const CAR_MANAGER_PROMPT = readPromptFile('carManager.md');

/**
 * 生成主管智能体的提示词
 */
function generateSupervisorPrompt(): string {
  const basePrompt = readPromptFile('supervisor.md');
  const agricultureInfo = getSubAgentInfo('agriculture_manager.md');
  const carInfo = getSubAgentInfo('carManager.md');

  const subAgentsInfo = [agricultureInfo, carInfo]
    .filter((info) => info)
    .join('\n');

  return basePrompt.replace('{SUB_AGENTS_INFO}', subAgentsInfo);
}

export const SUPERVISOR_PROMPT = generateSupervisorPrompt();
