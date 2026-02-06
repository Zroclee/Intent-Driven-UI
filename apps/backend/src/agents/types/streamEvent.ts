import {
  BaseMessage,
  ToolMessage,
  AIMessageChunk,
} from '@langchain/core/messages';

/**
 * 流式事件类型枚举
 */
export enum StreamEventType {
  LLM_START = 'llm_start', // 大模型开始生成
  LLM_CONTENT = 'llm_content', // 大模型内容片段
  LLM_END = 'llm_end', // 大模型生成结束

  TOOL_CALL_START = 'tool_call_start', // 工具调用开始
  TOOL_CALL_END = 'tool_call_end', // 工具调用结束
  TOOL_OUTPUT = 'tool_output', // 工具输出结果

  STREAM_END = 'stream_end', // 整个流结束
  ERROR = 'error', // 错误信息
}

/**
 * 统一的流式事件格式
 */
export class StreamEvent {
  event_type: StreamEventType;
  content?: string | null; // 文本内容
  tool_name?: string | null; // 工具名称
  tool_args?: Record<string, any> | null; // 工具参数
  tool_call_id?: string | null; // 工具调用ID
  metadata?: Record<string, any> | null; // 其他元数据

  constructor(data: {
    event_type: StreamEventType;
    content?: string | null;
    tool_name?: string | null;
    tool_args?: Record<string, any> | null;
    tool_call_id?: string | null;
    metadata?: Record<string, any> | null;
  }) {
    this.event_type = data.event_type;
    this.content = data.content;
    this.tool_name = data.tool_name;
    this.tool_args = data.tool_args;
    this.tool_call_id = data.tool_call_id;
    this.metadata = data.metadata;
  }

  /**
   * 转换为JSON字符串
   */
  toJson(): string {
    return JSON.stringify({
      event_type: this.event_type,
      content: this.content,
      tool_name: this.tool_name,
      tool_args: this.tool_args,
      tool_call_id: this.tool_call_id,
      metadata: this.metadata,
    });
  }

  /**
   * 从消息块创建事件流
   * 这个方法封装了chunk的处理逻辑，返回事件列表
   *
   * @param messageChunk - langgraph的消息块
   * @param metadata - 消息元数据
   * @returns List[StreamEvent] - 事件列表（一个chunk可能产生多个事件）
   */
  static fromMessageChunk(
    messageChunk: BaseMessage,
    metadata: Record<string, any> | null = null,
  ): StreamEvent[] {
    const events: StreamEvent[] = [];

    try {
      // 处理工具节点消息 (ToolMessage)
      if (
        messageChunk instanceof ToolMessage ||
        messageChunk._getType() === 'tool'
      ) {
        const toolMessage = messageChunk as ToolMessage;
        // 过滤掉子智能体的工具输出，避免将子智能体的完整回答作为工具结果返回给前端
        // 约定：所有子智能体工具名称必须以 'agent_' 开头
        const isAgentTool =
          toolMessage.name && toolMessage.name.startsWith('agent_');
        if (!isAgentTool) {
          events.push(
            new StreamEvent({
              event_type: StreamEventType.TOOL_OUTPUT,
              content:
                typeof messageChunk.content === 'string'
                  ? messageChunk.content
                  : JSON.stringify(messageChunk.content),
              tool_call_id: toolMessage.tool_call_id,
              metadata: metadata,
            }),
          );
        }
      }
      // 处理AI消息块 (AIMessageChunk)
      else if (
        messageChunk instanceof AIMessageChunk ||
        messageChunk._getType() === 'ai'
      ) {
        const aiChunk = messageChunk as AIMessageChunk;

        // 1. 处理文本内容
        const content = aiChunk.content;
        if (content && content !== '') {
          events.push(
            new StreamEvent({
              event_type: StreamEventType.LLM_CONTENT,
              content:
                typeof content === 'string' ? content : JSON.stringify(content),
              metadata: metadata,
            }),
          );
        }

        // 2. 处理工具调用（可能有多个）
        const toolCalls = aiChunk.tool_calls;
        if (toolCalls && toolCalls.length > 0) {
          for (const toolCall of toolCalls) {
            // 过滤有效的工具调用
            if (toolCall.id && toolCall.name) {
              events.push(
                new StreamEvent({
                  event_type: StreamEventType.TOOL_CALL_START,
                  tool_name: toolCall.name,
                  tool_args: toolCall.args,
                  tool_call_id: toolCall.id,
                  metadata: metadata,
                }),
              );
            }
          }
        }

        // 3. 检查响应元数据中的finish_reason（可能与其他事件共存）
        const responseMetadata = aiChunk.response_metadata;
        if (responseMetadata) {
          const finishReason = responseMetadata.finish_reason;

          if (finishReason === 'stop') {
            events.push(
              new StreamEvent({
                event_type: StreamEventType.LLM_END,
                content: '生成完成',
                metadata: metadata,
              }),
            );
          } else if (finishReason === 'tool_calls') {
            events.push(
              new StreamEvent({
                event_type: StreamEventType.TOOL_CALL_END,
                content: '工具调用准备完成',
                metadata: metadata,
              }),
            );
          }
        }
      }
    } catch (e) {
      // 错误处理
      const errorMessage = e instanceof Error ? e.message : String(e);
      const errorType =
        e instanceof Error ? e.constructor.name : 'UnknownError';

      events.push(
        new StreamEvent({
          event_type: StreamEventType.ERROR,
          content: `处理消息块时出错: ${errorMessage}`,
          metadata: {
            error_type: errorType,
            original_metadata: metadata,
          },
        }),
      );
    }

    return events;
  }

  /**
   * 创建流开始事件
   * @param content 内容
   */
  static createStartEvent(content: string = '开始处理您的请求...'): string {
    return new StreamEvent({
      event_type: StreamEventType.LLM_START,
      content: content,
    }).toJson();
  }

  /**
   * 创建流结束事件
   * @param content 内容
   */
  static createEndEvent(content: string = '请求处理完成'): string {
    return new StreamEvent({
      event_type: StreamEventType.STREAM_END,
      content: content,
    }).toJson();
  }

  /**
   * 创建错误事件
   * @param content 内容
   */
  static createErrorEvent(content: string = '请求处理出错'): string {
    return new StreamEvent({
      event_type: StreamEventType.ERROR,
      content: content,
    }).toJson();
  }
}
