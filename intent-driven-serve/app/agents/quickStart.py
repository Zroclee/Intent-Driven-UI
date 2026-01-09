import os
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage, AIMessage, AnyMessage
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import InMemorySaver

from app.agents.tools.common import get_current_time
from app.agents.tools.carTools import get_car_info, get_car_list, get_car_trajectory_list

import app.agents.prompts as prompts

from app.agents.types.streamEvent import StreamEvent, StreamEventType

model = ChatOpenAI(
            model="deepseek-chat", 
            api_key=os.getenv("DEEPSEEK_API_KEY"),
            base_url="https://api.deepseek.com",
            temperature=0.7
        )

agent = create_agent(
    tools=[get_current_time, get_car_info, get_car_list, get_car_trajectory_list],
    model=model,
    system_prompt=prompts.carManager,
    # checkpointer=InMemorySaver(),
)


def streamInvoke(query: str, thread_id: str):
    try:
        yield "data: " + StreamEvent.create_start_event() + "\n\n"
        res = agent.stream({"messages": [
                HumanMessage(content=query)
            ]},
            stream_mode='messages'
            # {"configurable": {"thread_id": thread_id}}
        )
        for chunk in res:
            # print(f"---------chunk--------:{chunk}")
            message_chunk, metadata = chunk
            events = StreamEvent.from_message_chunk(message_chunk, metadata)
            for event in events:
                yield "data: " + event.to_json() + "\n\n"
            # yield "data: " + StreamEvent.create_end_event() + "\n\n"
    except Exception as e:
        # pass
        error_event = StreamEvent(
            event_type=StreamEventType.ERROR,
            content=f"流式处理出错: {str(e)}",
            metadata={"error_type": type(e).__name__}
        )
        yield "data: " + error_event.to_json() + "\n\n"