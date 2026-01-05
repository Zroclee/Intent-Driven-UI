import os, operator
from pydantic import BaseModel, Field
from typing_extensions import Annotated, TypedDict
from langgraph.graph import START, END, StateGraph
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage, AIMessage, AnyMessage
from langchain_openai import ChatOpenAI

from app.agents.tools.common import get_current_time
from app.agents.tools.baidu_search import BaiduSearchTool

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
        print(f"LLM Invoke: {content}")
        streamRes = self.__agent.stream({"messages": [HumanMessage(content=content)]}, stream_mode='messages')
        for chunk in streamRes:
            # chunk 是一个元组: (AIMessageChunk, metadata_dict)
            # print(f"------------chunk------------: {chunk}")    
            message_chunk, metadata = chunk
            # print(f"------------message_chunk.type------------: {message_chunk.type}")

            if message_chunk.type == "tool":
                print(f"------------tool------------: {message_chunk}")
                yield f"tools result: {message_chunk.content}\n\n"

            if message_chunk.type == "AIMessageChunk":
                # print(f"------------message_chunk------------: {message_chunk}")
                yield f"content: {message_chunk.content}\n\n"

                tool_calls = message_chunk.get('tool_calls')
                if tool_calls and len(tool_calls) > 0:
                    filtered_names = [
                        item['name'] for item in tool_calls
                        if item.get('id') is not None  # id存在且不为None
                        and item.get('name') != ''     # name存在且不为空字符串
                    ]
                    if len(filtered_names) > 0:
                        yield f"use tools: {', '.join(filtered_names)}\n\n"
                    # print(f"------------tool_calls------------: {tool_calls}")
         
            

            # 获取 content
            content = message_chunk.content

            # 获取 response_metadata 中的参数
            response_metadata = message_chunk.response_metadata
            finish_reason = response_metadata.get('finish_reason')

            # 获取 langgraph 相关参数
            langgraph_step = metadata.get('langgraph_step')
            langgraph_node = metadata.get('langgraph_node')
        
            
    
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

    

    