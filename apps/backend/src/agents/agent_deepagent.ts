import { ChatOpenAI } from '@langchain/openai';
import { createDeepAgent, FilesystemBackend } from 'deepagents';
import { MemorySaver } from '@langchain/langgraph-checkpoint';
import * as path from 'path';

import { StreamEvent, StreamEventType } from './types/streamEvent';
import { DEEPAGENT_PROMPT } from './prompts';

const model = new ChatOpenAI({
  modelName: 'deepseek-chat',
  apiKey: process.env.DEEPSEEK_API_KEY,
  configuration: {
    baseURL: 'https://api.deepseek.com',
  },
});

const checkpointer = new MemorySaver();
const backend = new FilesystemBackend({
  rootDir: path.resolve(process.cwd(), 'src/agents/files'),
  virtualMode: true,
});

const agent = createDeepAgent({
  model: model,
  backend: backend,
  checkpointer: checkpointer,
  memory: ['./AGENTS.md'],
  interruptOn: {
    read_file: true,
    write_file: true,
    delete_file: true,
  },
  systemPrompt: DEEPAGENT_PROMPT,
});

/**
 * 流式调用Agent
 * @param query 用户查询
 * @param _thread_id 线程ID
 */

export async function* streamInvoke(query: string, _thread_id: string) {
  try {
    yield 'data: ' + StreamEvent.createStartEvent() + '\n\n';

    const stream = await agent.stream(
      { messages: [{ role: 'user', content: query }] },
      {
        streamMode: 'messages',
        configurable: {
          thread_id: _thread_id,
        },
      },
    );

    for await (const chunk of stream) {
      // 在JS LangGraph中，streamMode="messages" 返回的是 [BaseMessage, metadata] 格式的数组
      // 或者在某些版本中直接是 message 对象。
      // 为了稳健，我们需要检查 chunk 的结构
      //   console.log('chunk', chunk);
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
