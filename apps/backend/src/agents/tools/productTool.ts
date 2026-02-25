import { tool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * 新增用户工具
 * 仅返回操作意图和参数，不执行实际业务逻辑
 */
export const createUserTool = tool(
  ({ username, organization, role }) => {
    return {
      intent: 'create_user',
      reply: '我将为你打开新增用户页面。',
      actions: [
        { type: 'NAVIGATE', path: '/product/users' },
        { type: 'OPEN_MODAL', target: 'createUserModal' },
        {
          type: 'FILL_FORM',
          target: 'createUserForm',
          fields: {
            username: username || '',
            organization: organization || '',
            role: role || '',
          },
        },
      ],
    };
  },
  {
    name: 'create_user',
    description: '新增一个系统用户',
    schema: z.object({
      username: z.string().optional().describe('用户名'),
      organization: z.string().optional().describe('组织名称'),
      role: z.string().optional().describe('用户角色'),
    }),
  },
);

/**
 * 新增角色工具
 */
export const createRoleTool = tool(
  ({ roleName, description }) => {
    return {
      intent: 'create_role',
      reply: '我将为你打开新增角色页面。',
      actions: [
        { type: 'NAVIGATE', path: '/product/roles' },
        { type: 'OPEN_MODAL', target: 'createRoleModal' },
        {
          type: 'FILL_FORM',
          target: 'createRoleForm',
          fields: {
            roleName: roleName || '',
            description: description || '',
          },
        },
      ],
    };
  },
  {
    name: 'create_role',
    description: '新增一个系统角色',
    schema: z.object({
      roleName: z.string().optional().describe('角色名称'),
      description: z.string().optional().describe('角色描述'),
    }),
  },
);

/**
 * 新增应用工具
 */
export const createAppTool = tool(
  ({ appName, description }) => {
    return {
      intent: 'create_app',
      reply: '我将为你打开新增应用页面。',
      actions: [
        { type: 'NAVIGATE', path: '/product/apps' },
        { type: 'OPEN_MODAL', target: 'createAppModal' },
        {
          type: 'FILL_FORM',
          target: 'createAppForm',
          fields: {
            appName: appName || '',
            description: description || '',
          },
        },
      ],
    };
  },
  {
    name: 'create_app',
    description: '新增一个应用',
    schema: z.object({
      appName: z.string().optional().describe('应用名称'),
      description: z.string().optional().describe('应用描述'),
    }),
  },
);

/**
 * 页面导航工具
 * 支持动态跳转到指定路径
 */
export const navigateTool = tool(
  ({ path }) => {
    return {
      intent: 'navigate',
      reply: `正在跳转到页面：${path}`,
      actions: [{ type: 'NAVIGATE', path }],
    };
  },
  {
    name: 'navigate',
    description:
      '跳转到指定页面，支持 /product/users, /product/roles, /product/stats 等路径',
    schema: z.object({
      path: z.string().describe('目标页面路径，如 /product/users'),
    }),
  },
);
