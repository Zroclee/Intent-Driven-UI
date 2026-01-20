# 根据LangGraph的多智能体设计 Subagents（子智能体）、Handoffs（交接）、Skills（技能）、Router（路由）

# 详细的描述文档： https://docs.langchain.com/oss/python/langchain/multi-agent#subagents
import os
from langchain.agents import create_agent
from pydantic import BaseModel, Field
from typing_extensions import Annotated, TypedDict
from langgraph.graph import START, END, StateGraph
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage, AIMessage, AnyMessage
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

class MessageState(TypedDict):
    query: str
    route: str
    sub_agent_res: str


def core_llm_call(state: str):
    pass
    

