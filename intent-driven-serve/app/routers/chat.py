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
    agent.invoke(query)
    return {"message": f"Chat agent {query} is working!"}

@router.get("/agentSSE")
def read_chat_agentSSE(query: str):
    agent = DefaultAgent()
    return StreamingResponse(
            agent.streamInvoke(query),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            })

from app.agents.quickStart import streamInvoke as CarStreamInvoke
@router.get("/quickStart")
def read_chat_quickStart(query: str):
    return StreamingResponse(
            CarStreamInvoke(query, "1"),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            })

from app.agents.quick_start_agriculture import streamInvoke as agricultureStreamInvoke
@router.get("/agriculture")
def read_chat_agriculture(query: str):
    return StreamingResponse(
            agricultureStreamInvoke(query, "1"),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            })