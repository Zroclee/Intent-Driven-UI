import { tool } from '@langchain/core/tools';
import * as z from 'zod';

export const getCurrentTimeTool = tool(
  ({
    fmt = '%Y-%m-%d %H:%M:%S',
    tz = 'local',
  }: {
    fmt?: string;
    tz?: string;
  } = {}) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');

    const isUtc = tz === 'UTC';

    const year = isUtc ? now.getUTCFullYear() : now.getFullYear();
    const month = isUtc ? now.getUTCMonth() + 1 : now.getMonth() + 1;
    const date = isUtc ? now.getUTCDate() : now.getDate();
    const hours = isUtc ? now.getUTCHours() : now.getHours();
    const minutes = isUtc ? now.getUTCMinutes() : now.getMinutes();
    const seconds = isUtc ? now.getUTCSeconds() : now.getSeconds();

    const map: Record<string, string> = {
      '%Y': year.toString(),
      '%m': pad(month),
      '%d': pad(date),
      '%H': pad(hours),
      '%M': pad(minutes),
      '%S': pad(seconds),
    };

    const timeStr = fmt.replace(/%[YmdHMS]/g, (match) => map[match] || match);

    return JSON.stringify({
      data: {
        time: timeStr,
      },
    });
  },
  {
    name: 'get_current_time',
    description: '获取当前时间，格式为：YYYY-MM-DD HH:mm:ss',
    schema: z.object({
      fmt: z
        .string()
        .optional()
        .describe('时间格式化字符串，默认 "%Y-%m-%d %H:%M:%S"'),
      tz: z
        .string()
        .optional()
        .describe('时区，"UTC" 或 "local"，默认 "local"'),
    }),
  },
);
