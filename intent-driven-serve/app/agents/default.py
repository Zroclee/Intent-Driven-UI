import os, operator
from pydantic import BaseModel, Field
from typing_extensions import Annotated, TypedDict
from langgraph.graph import START, END, StateGraph
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage, AIMessage, AnyMessage
from langchain_openai import ChatOpenAI

from app.agents.tools.common import get_current_time
from app.agents.tools.baidu_search import BaiduSearchTool
from app.agents.types.streamEvent import StreamEvent

all_tools = [get_current_time, BaiduSearchTool()]
tools_by_name = {tool.name: tool for tool in all_tools}  

# 定义状态
class MessageState(TypedDict):
    """
    State
    """
    messages: Annotated[list[AnyMessage], operator.add, Field(..., description="Message")]
    name: Annotated[str,Field(..., description="Name")]

# default agent
class DefaultAgent(BaseModel):
    """
    Default Agent
    """
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.__llm = self.__get_llm().bind_tools(all_tools)
        self.__agent = self.__get_agent()


    def invoke(self, content: str) -> str:
        print(f"LLM Invoke: {content}")
        res = self.__agent.invoke({"messages": [HumanMessage(content=content)]})
        print(f"res: {res}")
           
        

    def streamInvoke(self, content: str):
        """
        流式调用智能体，返回统一格式的事件流

        事件类型:
        - llm_start: 大模型开始生成
        - llm_content: 大模型生成的内容片段
        - llm_end: 大模型生成结束
        - tool_call_start: 开始调用工具
        - tool_output: 工具执行结果
        - tool_call_end: 工具调用结束
        - stream_end: 整个流结束
        - error: 错误信息
        """
        print(f"LLM Invoke: {content}")

        try:
            # 发送开始事件
            yield StreamEvent.create_start_event()

            stream_res = self.__agent.stream(
                {"messages": [HumanMessage(content=content)]},
                stream_mode='messages'
            )

            for chunk in stream_res:
                # chunk 是一个元组: (message_chunk, metadata_dict)
                message_chunk, metadata = chunk

                # 使用 StreamEvent 处理 chunk，返回事件列表
                events = StreamEvent.from_message_chunk(message_chunk, metadata)

                # 逐个yield事件
                for event in events:
                    yield event.to_json() + "\n"
                   

            # 发送结束事件
            yield StreamEvent.create_end_event()

        except Exception as e:
            # 错误处理
            error_event = StreamEvent(
                event_type=StreamEvent.StreamEventType.ERROR,
                content=f"流式处理出错: {str(e)}",
                metadata={"error_type": type(e).__name__}
            )
            yield error_event.to_json() + "\n"
                    
         
        
            
    
    # 大模型
    def __get_llm(self) -> ChatOpenAI:
        return ChatOpenAI(
            model="deepseek-chat", 
            api_key=os.getenv("DEEPSEEK_API_KEY"),
            base_url="https://api.deepseek.com",
            temperature=0.7)

        # return ChatOpenAI(
        #     model="qwen3-max", 
        #     api_key=os.getenv("DASHSCOPE_API_KEY"),
        #     base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        #     temperature=0.7)

        # return ChatOpenAI(
        #     model="glm-4.7", 
        #     api_key=os.getenv("ZAI_API_KEY"),
        #     base_url="https://open.bigmodel.cn/api/paas/v4/",
        #     temperature=0.7)
    
    # 节点 - 大模型调用节点
    def __call_llm(self, state: MessageState) -> MessageState:
        '''
        __call_llm
        '''
        
        res = self.__llm.invoke([
            SystemMessage(content="你是一个智能助理，可以调用工具来帮助用户完成任务。"),
            ]+state["messages"])
        return {
            "messages":[res],
        }

    # 节点 - 工具调用节点
    def __call_tools(self, state: MessageState) -> MessageState:
        result = []
        for tool_call in state["messages"][-1].tool_calls:
            tool = tools_by_name[tool_call["name"]]
            observation = tool.invoke(tool_call["args"])
            result.append(ToolMessage(content=observation, tool_call_id=tool_call["id"]))
        return {"messages": state["messages"] + result}

    # 节点 - 条件边节点
    def __should_continue(self, state: MessageState) -> str:
        messages = state["messages"]
        last_message = messages[-1]

        if last_message.tool_calls:
            return "tool_node"

        return END
    
    def __get_agent(self):
        workflow = StateGraph(MessageState)
        workflow.add_node("call_llm", self.__call_llm)
        workflow.add_node("tool_node", self.__call_tools)
        workflow.add_edge(START, "call_llm")
        workflow.add_conditional_edges("call_llm", self.__should_continue, {
            "tool_node": "tool_node",
            END: END
        })
        workflow.add_edge("tool_node", "call_llm")  
        agent = workflow.compile()
        return agent

    

    