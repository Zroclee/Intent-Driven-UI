"""
流式事件统一返回格式
"""
import json
from typing import Optional, Dict, Any, List
from enum import Enum
from pydantic import BaseModel


class StreamEventType(str, Enum):
    """流式事件类型枚举"""
    LLM_START = "llm_start"              # 大模型开始生成
    LLM_CONTENT = "llm_content"           # 大模型内容片段
    LLM_END = "llm_end"                   # 大模型生成结束

    TOOL_CALL_START = "tool_call_start"   # 工具调用开始
    TOOL_CALL_END = "tool_call_end"       # 工具调用结束
    TOOL_OUTPUT = "tool_output"           # 工具输出结果

    STREAM_END = "stream_end"             # 整个流结束
    ERROR = "error"                       # 错误信息


class StreamEvent(BaseModel):
    """统一的流式事件格式"""
    event_type: StreamEventType
    content: Optional[str] = None              # 文本内容
    tool_name: Optional[str] = None            # 工具名称
    tool_args: Optional[Dict[str, Any]] = None # 工具参数
    tool_call_id: Optional[str] = None         # 工具调用ID
    metadata: Optional[Dict[str, Any]] = None  # 其他元数据

    def to_json(self) -> str:
        """转换为JSON字符串"""
        return json.dumps({
            "event_type": self.event_type.value,
            "content": self.content,
            "tool_name": self.tool_name,
            "tool_args": self.tool_args,
            "tool_call_id": self.tool_call_id,
            "metadata": self.metadata
        }, ensure_ascii=False)

    @classmethod
    def from_message_chunk(cls, message_chunk, metadata: dict = None):
        """
        从消息块创建事件流
        这个方法封装了chunk的处理逻辑，返回事件列表

        Args:
            message_chunk: langgraph的消息块
            metadata: 消息元数据

        Returns:
            List[StreamEvent]: 事件列表（一个chunk可能产生多个事件）
        """
        events = []

        try:
            # 处理工具节点消息 (ToolMessage)
            if message_chunk.type == "tool":
                events.append(cls(
                    event_type=StreamEventType.TOOL_OUTPUT,
                    content=message_chunk.content,
                    tool_call_id=message_chunk.tool_call_id,
                    metadata=metadata
                ))

            # 处理AI消息块 (AIMessageChunk)
            elif message_chunk.type == "AIMessageChunk":
                # 1. 处理文本内容
                content = message_chunk.content
                if content and content != "":
                    events.append(cls(
                        event_type=StreamEventType.LLM_CONTENT,
                        content=content,
                        metadata=metadata
                    ))

                # 2. 处理工具调用（可能有多个）
                tool_calls = message_chunk.tool_calls
                if tool_calls and len(tool_calls) > 0:
                    for tool_call in tool_calls:
                        # 过滤有效的工具调用
                        if tool_call.get('id') is not None and tool_call.get('name'):
                            events.append(cls(
                                event_type=StreamEventType.TOOL_CALL_START,
                                tool_name=tool_call['name'],
                                tool_args=tool_call.get('args', {}),
                                tool_call_id=tool_call['id'],
                                metadata=metadata
                            ))

            # 3. 检查响应元数据中的finish_reason（可能与其他事件共存）
            response_metadata = message_chunk.response_metadata
            if response_metadata:
                finish_reason = response_metadata.get("finish_reason", "")

                if finish_reason == "stop":
                    events.append(cls(
                        event_type=StreamEventType.LLM_END,
                        content="生成完成",
                        metadata=metadata
                    ))

                elif finish_reason == "tool_calls":
                    events.append(cls(
                        event_type=StreamEventType.TOOL_CALL_END,
                        content="工具调用准备完成",
                        metadata=metadata
                    ))

        except Exception as e:
            # 错误处理
            events.append(cls(
                event_type=StreamEventType.ERROR,
                content=f"处理消息块时出错: {str(e)}",
                metadata={"error_type": type(e).__name__, "original_metadata": metadata}
            ))

        return events


    @classmethod
    def create_start_event(cls, content: str = "开始处理您的请求..."):
        """创建流开始事件"""
        return cls(
            event_type=StreamEventType.LLM_START,
            content=content
        ).to_json() + "\n"

    @classmethod
    def create_end_event(cls, content: str = "请求处理完成"):
        """创建流结束事件"""
        return cls(
            event_type=StreamEventType.STREAM_END,
            content=content
        ).to_json() + "\n"

