import os
from pydantic import BaseModel, Field
from typing_extensions import TypedDict
from langgraph.graph import START, END, StateGraph
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

# 定义状态

class DefaultAgent(BaseModel):
    """
    Default Agent
    """
    def __init__(self, **kwargs):
        super().__init__(**kwargs)


    def streamInvoke(self, prompt: str) -> str:
        print(f"LLM Invoke: {prompt}")
        llm = self._get_llm()
        messages = [
            SystemMessage(content="You are a helpful assistant."),
            HumanMessage(content=prompt)
        ]
        response = llm.invoke(messages)
        print(f"LLM Response: {response.content}")
        return response.content
    
    def _get_llm(self):
        return ChatOpenAI(
            model="qwen3-max", 
            api_key=os.getenv("DASHSCOPE_API_KEY"),
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",)

    

    