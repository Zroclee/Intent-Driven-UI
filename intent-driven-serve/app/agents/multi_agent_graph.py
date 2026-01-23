# 根据LangGraph的多智能体设计 Subagents（子智能体）、Handoffs（交接）、Skills（技能）、Router（路由）

# 详细的描述文档： https://docs.langchain.com/oss/python/langchain/multi-agent#subagents
import os

from langchain.agents import create_agent
from typing import List, Optional
from typing_extensions import Annotated, TypedDict
from langgraph.graph import START, END, StateGraph
from langchain_core.messages import HumanMessage, SystemMessage, AnyMessage, AIMessage
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import InMemorySaver

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

# 车辆智能体
car_agent = create_agent(
    tools=[get_current_time, get_car_info, get_car_list, get_car_trajectory_list],
    model=model,
    system_prompt=prompts.carManager,
    # checkpointer=InMemorySaver(),
)

# 农业智能体
farm_agent = create_agent(
    tools=[get_current_time, get_weather_monitor, get_soil_monitor, get_water_quality_monitor, get_device_list ],
    model=model,
    system_prompt=prompts.agriculture_manager,
    # checkpointer=InMemorySaver(),
)


class MultiAgentState(TypedDict):
    """
    多智能体协作流程的状态定义。
    包含消息历史、用户提问、意图识别结果及子智能体回复。
    """
    # 消息历史列表，使用 add_messages reducer 自动追加新消息
    messages: Annotated[List[AnyMessage], add_messages]
    
    # 用户的原始提问
    query: str
    
    # 主管大模型提供的额外信息、回复、路由决策
    supervisor_response: str
    
    # 子智能体处理后的生成内容
    sub_agent_res: Optional[str]


def core_llm_call(state: MultiAgentState) -> MultiAgentState:
    '''
    core_llm_call
    '''

    core_prompt = prompts.create_core_prompt()
    query = state["query"]

    res = model.invoke([
        SystemMessage(content=core_prompt),
        HumanMessage(content=query)
    ])

    return {
        "messages": [res],
        "supervisor_response": res.content,
    }

def subagent_call(state: MultiAgentState) -> MultiAgentState:
    '''
    subagent_call
    '''
    query = state["query"]
    supervisor_response = state["supervisor_response"]


    if "car_agent" in supervisor_response:
        agent_res = car_agent.invoke({"messages": [HumanMessage(content=query)]})
        res = agent_res["messages"][-1]
    elif "farm_agent" in supervisor_response:
        agent_res = farm_agent.invoke({"messages": [HumanMessage(content=query)]})
        res = agent_res["messages"][-1]
    else:
        res = AIMessage(content="未知路由")

    return {
        "messages": [res],
        "sub_agent_res": res.content,
    }



def should_continue(state: MultiAgentState) -> bool:
    '''
    should_continue
    '''
    supervisor_response = state["supervisor_response"]

    if "car_agent" in supervisor_response:
        return True
    elif "farm_agent" in supervisor_response:
        return True
    else:
        return False


checkpointer = InMemorySaver()

workflow = StateGraph(MultiAgentState)  
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
        res = core_agent.stream({"query": query},
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
                # print(f"---------chunk--------:{data}")
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