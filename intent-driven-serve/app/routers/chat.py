from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse, StreamingResponse

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/")
def read_chat_root():
    return {"message": "Chat router is working!"}


from app.agents.default import DefaultAgent
@router.get("/agent")
def read_chat_agent(query: str):
    agent = DefaultAgent()
    agent.llm_invoke(query)
    return {"message": f"Chat agent {query} is working!"}