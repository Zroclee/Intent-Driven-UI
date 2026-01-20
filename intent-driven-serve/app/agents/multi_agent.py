import os
from langchain.agents import create_agent
from langchain_core.tools import tool
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

car_agent = create_agent(
    tools=[get_current_time, get_car_info, get_car_list, get_car_trajectory_list],
    model=model,
    name='car_agent',
    system_prompt=prompts.carManager,
    # checkpointer=InMemorySaver(),
)

@tool('car_risk_control_agent', description='一名专业的**车辆金融风险管控智能体**，主要负责**贷前风险预测**和**贷后风险监管**分析工作。你具备深厚的汽车金融风控专业知识，能够通过车辆位置、轨迹等数据进行智能风险分析和预警。')
def car_tool(query: str):
    result = car_agent.invoke({
        "messages": [
                HumanMessage(content=query)
            ]})
    return result["messages"][-1].text
        

farm_agent = create_agent(
    tools=[get_current_time, get_weather_monitor, get_soil_monitor, get_water_quality_monitor, get_device_list ],
    model=model,
    name='farm_agent',
    system_prompt=prompts.agriculture_manager,
    # checkpointer=InMemorySaver(),
)

@tool('agriculture_risk_control_agent', description='一名专业的**智慧农业贷后风险管控智能体**，主要负责**农业资产贷前风险预测**和**贷后风险监管**分析工作。你具备深厚的农业金融风控专业知识，能够通过智慧农业监测设备的数据（气象、土壤、水质等）进行智能风险分析和预警。')
def farm_tool(query: str):
    result =  farm_agent.invoke({"messages": [
            HumanMessage(content=query)
        ]})
    return result["messages"][-1].text



core_agent = create_agent(
    model,
    tools=[farm_tool, car_tool],
    name="supervisor",  
    system_prompt=prompts.core_manager,
)


def streamInvoke(query: str, thread_id: str):
    try:
        yield "data: " + StreamEvent.create_start_event() + "\n\n"
        for _, stream_mode, data in core_agent.stream(
            {"messages": [query]},
            stream_mode=["messages", "updates"],
            subgraphs=True,  
        ):
            if stream_mode == "messages":
                # print(f"---------chunk--------:{data}")
                yield f"messages - data:  {data} \n\n"

            if stream_mode == "updates":
                # print(f"---------chunk--------:{data}")
                yield f"updates - data:  {data} \n\n"
    except Exception as e:
        # pass
        error_event = StreamEvent(
            event_type=StreamEventType.ERROR,
            content=f"流式处理出错: {str(e)}",
            metadata={"error_type": type(e).__name__}
        )
        yield "data: " + error_event.to_json() + "\n\n"