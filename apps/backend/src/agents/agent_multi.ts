import { ChatOpenAI } from '@langchain/openai';
import { createAgent } from 'langchain';
import { HumanMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import {
  CAR_MANAGER_PROMPT,
  AGRICULTURE_MANAGER_PROMPT,
  SUPERVISOR_PROMPT,
} from './prompts';
import {
  getCarInfoTool,
  getCarListTool,
  getCarTrajectoryListTool,
} from './tools/carTool';
import {
  getWeatherMonitorTool,
  getSoilMonitorTool,
  getWaterQualityMonitorTool,
  getDeviceListTool,
} from './tools/agricultureTool';
import { getCurrentTimeTool } from './tools/common';
import { StreamEvent, StreamEventType } from './types/streamEvent';

const model = new ChatOpenAI({
  modelName: 'deepseek-chat',
  apiKey: process.env.DEEPSEEK_API_KEY,
  configuration: {
    baseURL: 'https://api.deepseek.com',
  },
  temperature: 0.7,
});

const carTools = [
  getCarInfoTool,
  getCarListTool,
  getCarTrajectoryListTool,
  getCurrentTimeTool,
];

const agricultureTools = [
  getWeatherMonitorTool,
  getSoilMonitorTool,
  getWaterQualityMonitorTool,
  getDeviceListTool,
  getCurrentTimeTool,
];

const agent_car = createAgent({
  model: model,
  tools: carTools,
  systemPrompt: CAR_MANAGER_PROMPT,
});
const agent_agriculture = createAgent({
  model: model,
  tools: agricultureTools,
  systemPrompt: AGRICULTURE_MANAGER_PROMPT,
});

const agent_car_tool = tool(
  async ({ query }: { query: string }) => {
    const result = await agent_car.invoke({
      messages: [new HumanMessage(query)],
    });
    console.log('car result:', result);
    return result['messages'][result['messages'].length - 1].content;
  },
  {
    name: 'agent_car_tool',
    description:
      '一名专业的**车辆金融风险管控智能体**，主要负责**贷前风险预测**和**贷后风险监管**分析工作。具备深厚的汽车金融风控专业知识，能够通过车辆位置、轨迹等数据进行智能风险分析和预警。参数：query - 用户查询，例如：分析车牌：xxxx的车辆风险；分析客户xxx有限公司下的贷款车辆风险；',
    schema: z.object({
      query: z
        .string()
        .describe(
          '用户查询，例如：分析车牌：xxxx的车辆风险；分析客户xxx有限公司下的贷款车辆风险；',
        ),
    }),
  },
);

const agent_agriculture_tool = tool(
  async ({ query }: { query: string }) => {
    const result = await agent_agriculture.invoke({
      messages: [new HumanMessage(query)],
    });
    return result['messages'][result['messages'].length - 1].content;
  },
  {
    name: 'agent_agriculture_tool',
    description:
      '一名专业的**智慧农业贷后风险管控智能体**，主要负责**农业资产贷前风险预测**和**贷后风险监管**分析工作。你具备深厚的农业金融风控专业知识，能够通过智慧农业监测设备的数据（气象、土壤、水质等）进行智能风险分析和预警。参数：query - 用户查询，例如：分析xxx农业园的金融风险；',
    schema: z.object({
      query: z.string().describe('用户查询，例如：分析xxx农业园的金融风险'),
    }),
  },
);

const agent_core = createAgent({
  model: model,
  tools: [agent_car_tool, agent_agriculture_tool],
  systemPrompt: SUPERVISOR_PROMPT,
});

/**
 * 流式调用Agent
 * @param query 用户查询
 * @param _thread_id 线程ID
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function* streamInvoke(query: string, _thread_id: string) {
  try {
    yield 'data: ' + StreamEvent.createStartEvent() + '\n\n';

    const stream = await agent_core.stream(
      { messages: [new HumanMessage(query)] },
      { streamMode: ['messages', 'updates'] },
    );

    for await (const [stream_mode, chunk] of stream) {
      // 在JS LangGraph中，streamMode="messages" 返回的是 [BaseMessage, metadata] 格式的数组
      // 或者在某些版本中直接是 message 对象。
      // 为了稳健，我们需要检查 chunk 的结构
      //   console.log('stream_mode', stream_mode);
      if (stream_mode === 'messages') {
        const [messageChunk, metadata] = chunk;
        const events = StreamEvent.fromMessageChunk(messageChunk, metadata);
        for (const event of events) {
          yield 'data: ' + event.toJson() + '\n\n';
        }
      }
      if (stream_mode === 'updates') {
        // 后续这里做数据保存
        continue;
      }

      //   console.log('chunk', chunk);
    }

    yield 'data: ' + StreamEvent.createEndEvent() + '\n\n';
  } catch (e) {
    const errorEvent = new StreamEvent({
      event_type: StreamEventType.ERROR,
      content: `流式处理出错: ${String(e)}`,
      metadata: { error_type: e instanceof Error ? e.name : 'UnknownError' },
    });
    yield 'data: ' + errorEvent.toJson() + '\n\n';
  }
}
