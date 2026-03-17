import { ChatOpenAI } from '@langchain/openai';
import { createAgent, createMiddleware } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';
import { HumanMessage } from '@langchain/core/messages';
import { PLAYWRIGHT_PROMPT } from './prompts';
import { getCurrentTimeTool } from './tools/common';
import {
  executePlaywrightActionsTool,
  extractPageStateTool,
} from './tools/playwright';
import {
  createFileTool,
  deleteFileTool,
  readFileTool,
  writeFileTool,
} from './tools/fileManager';

import { StreamEvent, StreamEventType } from './types/streamEvent';

const model = new ChatOpenAI({
  modelName: 'deepseek-chat',
  apiKey: process.env.DEEPSEEK_API_KEY,
  configuration: {
    baseURL: 'https://api.deepseek.com',
  },
  temperature: 0.1,
});

const toolMonitoringMiddleware = createMiddleware({
  name: 'ToolMonitoringMiddleware',
  wrapToolCall: (request, handler) => {
    // console.log(`Executing tool: ${request.toolCall.name}`);
    // console.log(`Arguments: ${JSON.stringify(request.toolCall.args)}`);
    try {
      const result = handler(request);
      // console.log('Tool completed successfully');
      return result;
    } catch (e) {
      console.log(`Tool failed: ${e}`);
      throw e;
    }
  },
});

const checkpointer = new MemorySaver();

const agent = createAgent({
  model: model,
  tools: [
    getCurrentTimeTool,
    executePlaywrightActionsTool,
    extractPageStateTool,
    createFileTool,
    deleteFileTool,
    readFileTool,
    writeFileTool,
  ],
  checkpointer,
  systemPrompt: PLAYWRIGHT_PROMPT,
  middleware: [toolMonitoringMiddleware],
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

    const stream = await agent.stream(
      { messages: [new HumanMessage(query)] },
      { streamMode: 'messages', configurable: { thread_id: _thread_id } },
    );

    for await (const chunk of stream) {
      // 在JS LangGraph中，streamMode="messages" 返回的是 [BaseMessage, metadata] 格式的数组
      // 或者在某些版本中直接是 message 对象。
      // 为了稳健，我们需要检查 chunk 的结构
      // console.log('chunk', chunk);
      const [messageChunk, metadata] = chunk;
      const events = StreamEvent.fromMessageChunk(messageChunk, metadata);
      for (const event of events) {
        yield 'data: ' + event.toJson() + '\n\n';
      }
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
