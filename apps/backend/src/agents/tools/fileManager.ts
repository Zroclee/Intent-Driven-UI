import { tool } from '@langchain/core/tools';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as z from 'zod';

const memoryRoot = path.resolve(process.cwd(), 'src', 'agents', 'memory');

const resolveSafePath = (relativePath: string): string => {
  const normalizedInput = relativePath.trim();
  if (!normalizedInput) {
    throw new Error('路径不能为空');
  }

  if (path.isAbsolute(normalizedInput)) {
    throw new Error('不允许使用绝对路径');
  }

  const absolutePath = path.resolve(memoryRoot, normalizedInput);
  const relativeToRoot = path.relative(memoryRoot, absolutePath);

  if (
    relativeToRoot === '' ||
    relativeToRoot.startsWith('..') ||
    path.isAbsolute(relativeToRoot)
  ) {
    throw new Error('禁止访问工作目录之外的路径');
  }

  return absolutePath;
};

export const createFileTool = tool(
  async ({ filePath, content }) => {
    const targetPath = resolveSafePath(filePath);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, content, { encoding: 'utf-8', flag: 'wx' });
    return JSON.stringify({
      success: true,
      operation: 'create_file',
      filePath,
    });
  },
  {
    name: 'create_file',
    description: '在工作目录内新增文件，不允许覆盖已有文件',
    schema: z.object({
      filePath: z.string().min(1).describe('相对工作目录的文件路径'),
      content: z.string().default('').describe('文件初始内容'),
    }),
  },
);

export const deleteFileTool = tool(
  async ({ filePath }) => {
    const targetPath = resolveSafePath(filePath);
    await fs.unlink(targetPath);
    return JSON.stringify({
      success: true,
      operation: 'delete_file',
      filePath,
    });
  },
  {
    name: 'delete_file',
    description: '在工作目录内删除文件',
    schema: z.object({
      filePath: z.string().min(1).describe('相对工作目录的文件路径'),
    }),
  },
);

export const readFileTool = tool(
  async ({ filePath }) => {
    const targetPath = resolveSafePath(filePath);
    const content = await fs.readFile(targetPath, 'utf-8');
    return JSON.stringify({
      success: true,
      operation: 'read_file',
      filePath,
      content,
    });
  },
  {
    name: 'read_file',
    description: '在工作目录内读取文件内容',
    schema: z.object({
      filePath: z.string().min(1).describe('相对工作目录的文件路径'),
    }),
  },
);

export const writeFileTool = tool(
  async ({ filePath, content }) => {
    const targetPath = resolveSafePath(filePath);
    const stat = await fs.stat(targetPath);
    if (!stat.isFile()) {
      throw new Error('目标路径不是文件');
    }

    await fs.writeFile(targetPath, content, { encoding: 'utf-8' });
    return JSON.stringify({
      success: true,
      operation: 'write_file',
      filePath,
    });
  },
  {
    name: 'write_file',
    description: '在工作目录内写入文件内容，要求目标文件已存在',
    schema: z.object({
      filePath: z.string().min(1).describe('相对工作目录的文件路径'),
      content: z.string().describe('要写入的完整文件内容'),
    }),
  },
);
