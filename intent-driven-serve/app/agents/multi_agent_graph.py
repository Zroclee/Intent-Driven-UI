# 根据LangGraph的多智能体设计 Subagents（子智能体）、Handoffs（交接）、Skills（技能）、Router（路由）

# 详细的描述文档： https://docs.langchain.com/oss/python/langchain/multi-agent#subagents
import os

from langchain.agents import create_agent
from typing import List, Optional
from typing_extensions import Annotated, TypedDict
from langgraph.graph import START, END, StateGraph, MessagesState
from langchain_core.messages import HumanMessage, SystemMessage, AnyMessage, AIMessage
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import InMemorySaver

from langchain_core.messages.utils import (
    trim_messages,  
    count_tokens_approximately  
)

from app.agents.tools.common import get_current_time
from app.agents.tools.carTools import get_car_info, get_car_list, get_car_trajectory_list
from app.agents.tools.agriculture_tools import get_weather_monitor, get_soil_monitor, get_water_quality_monitor, get_device_list, get_cattle_list, get_monitor_video 


import app.agents.prompts as prompts

from app.agents.types.streamEvent import StreamEvent, StreamEventType

model = ChatOpenAI(
            model="deepseek-chat", 
            api_key=os.getenv("DEEPSEEK_API_KEY"),
            base_url="https://api.deepseek.com",
            temperature=0.7
        )


sub_agent_configs = [
    {
        "name": "car_agent",
        "desc": "车辆智能体，用于处理与车辆相关的操作，如查询车辆信息、轨迹等。",
        "tools": [get_current_time, get_car_info, get_car_list, get_car_trajectory_list],
        "system_prompt": prompts.carManager,
        "enabled": True,
    },
    {
        "name": "farm_agent",   
        "desc": "农业智能体，用于处理与农业相关的操作，如查询天气、土壤、水质、设备等。",
        "tools": [get_current_time, get_weather_monitor, get_soil_monitor, get_water_quality_monitor, get_device_list ],
        "system_prompt": prompts.agriculture_manager,
        "enabled": True,
    },
]

def create_sub_agent(tools: List, system_prompt: str):
    return create_agent(
        tools=tools,
        model=model,
        system_prompt=system_prompt,
        checkpointer=True
    )

# 动态创建子智能体映射
sub_agents = {
    config["name"]: create_agent(
        tools=config["tools"],
        model=model,
        system_prompt=config["system_prompt"],
    )
    for config in sub_agent_configs
}


# class MultiAgentState(MessagesState):
#     """
#     多智能体协作流程的状态定义。
#     包含消息历史、用户提问、意图识别结果及子智能体回复。
#     """
#     # 消息历史列表，使用 add_messages reducer 自动追加新消息
#     messages: Annotated[List[AnyMessage], add_messages]
    
#     # 用户的原始提问
#     query: str
    
#     # 主管大模型提供的额外信息、回复、路由决策
#     supervisor_response: str
    
#     # 子智能体处理后的生成内容
#     sub_agent_res: Optional[str]


def core_llm_call(state: MessagesState) -> MessagesState:
    '''
    core_llm_call
    '''

    core_prompt = prompts.create_core_prompt()
    # query = state["messages"][-1].content
    allMessages = state["messages"]
    # 需要添加消息管理机制，防止消息过长导致模型调用失败
    # 简单截断最近的5条消息
    # allMessages = allMessages[-5:]
    # 根据token数量修剪消息
    allMessages = trim_messages(  
        state["messages"],
        strategy="last",
        token_counter=count_tokens_approximately,
        max_tokens=60,
        start_on="human",
        end_on=("human", "tool"),
    )

    print(f"---------allMessages--------:{allMessages}")

    res = model.invoke([
        SystemMessage(content=core_prompt),
        # HumanMessage(content=query)
    ] + allMessages)
    print(f"res: {res}")

    return {
        "messages": [res],
    }

def subagent_call(state: MessagesState) -> MessagesState:
    """
    根据主管模型的决策动态调用子智能体。
    
    Args:
        state: 当前多智能体状态。
        
    Returns:
        更新后的状态，包含子智能体的回复。
    """
    supervisor_response = state["messages"][-1].content

    # 遍历配置寻找命中的智能体
    selected_agent_name = None
    invoke_content = supervisor_response

    for agent_name in sub_agents.keys():
        # 严格匹配 agent_name- 格式
        prefix = f"{agent_name}-"
        if prefix in supervisor_response:
            selected_agent_name = agent_name

    if selected_agent_name:
        agent_res = sub_agents[selected_agent_name].invoke({"messages": [HumanMessage(content=invoke_content)]})
        res = agent_res["messages"][-1]
    else:
        res = AIMessage(content="未知路由")

    return {
        "messages": [res],
        "sub_agent_res": res.content,
    }


def should_continue(state: MessagesState) -> bool:
    """
    判断是否需要继续调用子智能体。
    
    Args:
        state: 当前多智能体状态。
        
    Returns:
        bool: 如果命中任何配置的子智能体则返回 True。
    """
    supervisor_response = state["messages"][-1].content

    # 只要命中任何一个已配置的智能体名（且包含-），就继续执行
    return any(f"{agent_name}-" in supervisor_response for agent_name in sub_agents.keys())


checkpointer = InMemorySaver()

workflow = StateGraph(MessagesState)  
workflow.add_node("core_llm_call", core_llm_call)
workflow.add_node("subagent_call", subagent_call)
workflow.add_edge(START, "core_llm_call")
workflow.add_conditional_edges("core_llm_call", should_continue, {True: "subagent_call", False: END})
workflow.add_edge("subagent_call", END)
core_agent = workflow.compile(checkpointer=checkpointer)

# res = core_agent.invoke({"query": "帮我评估车牌号粤B12345的贷款风险"})
# print(res)

def streamInvoke(query: str, thread_id: str):
    try:
        yield "data: " + StreamEvent.create_start_event() + "\n\n"
        res = core_agent.stream({"messages": [HumanMessage(content=query)],},
                                {"configurable": {"thread_id": thread_id}},
                                stream_mode=["messages", "updates"],
                                subgraphs=True,   
                                )
        for _, stream_mode, data  in res:
             
            if stream_mode == "messages":
                # print(f"---------chunk--------:{data}")
                # yield f"messages - data:  {data} \n\n"
                message_chunk, metadata = data
                events = StreamEvent.from_message_chunk(message_chunk, metadata)
                for event in events:
                    yield "data: " + event.to_json() + "\n\n"
                # pass

            if stream_mode == "updates":
                # print(f"---------updates--------:{data}")
                # 适合做数据保存
                # yield f"updates - data:  {data} \n\n"
                pass
                
           

        yield "data: " + StreamEvent.create_end_event() + "\n\n"
    except Exception as e:
        # pass
        error_event = StreamEvent(
            event_type=StreamEventType.ERROR,
            content=f"流式处理出错: {str(e)}",
            metadata={"error_type": type(e).__name__}
        )
        yield "data: " + error_event.to_json() + "\n\n"