"""
LangGraph agent graph for Bookly.

Phase 3 graph:
  START → rag_node → generate_node → END

rag_node:      embed query → vector search → Firestore chunk fetch
generate_node: build messages (system + history + rag context) → stream Grok response

Phase 4 will insert a tool_node between generate and END with conditional routing.
"""
import os
from typing import TypedDict, Annotated

from langgraph.graph import StateGraph, START, END
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_openai import ChatOpenAI

from rag import retrieve, _token
from system_prompt import get_system_prompt

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
GROK_MODEL = os.environ["GROK_MODEL_ID"]

VERTEX_BASE_URL = (
    f"https://aiplatform.googleapis.com/v1/projects/{PROJECT_ID}"
    f"/locations/global/endpoints/openapi"
)


# ── State ─────────────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    message:      str
    history:      list[dict]   # [{"role": "user"|"assistant", "content": "..."}]
    context:      str          # RAG context string
    chunks_found: int
    response:     str          # final assistant response (for checkpointing in Phase 5)


# ── Nodes ─────────────────────────────────────────────────────────────────────

async def rag_node(state: AgentState) -> dict:
    context, count = await retrieve(state["message"])
    return {"context": context, "chunks_found": count}


async def generate_node(state: AgentState) -> dict:
    # Fresh token per request — GCP tokens expire after ~1 hour
    token = _token()
    llm = ChatOpenAI(
        model=GROK_MODEL,
        api_key=token,
        base_url=VERTEX_BASE_URL,
        streaming=True,
        temperature=0.3,
    )

    messages = [SystemMessage(content=get_system_prompt())]

    for turn in state.get("history", []):
        role    = turn.get("role", "")
        content = turn.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))

    user_content = (
        f"Catalog context:\n{state['context']}\n\nUser question: {state['message']}"
        if state.get("context")
        else state["message"]
    )
    messages.append(HumanMessage(content=user_content))

    response = await llm.ainvoke(messages)
    return {"response": response.content}


# ── Graph ─────────────────────────────────────────────────────────────────────

def build_graph() -> object:
    g = StateGraph(AgentState)
    g.add_node("rag",      rag_node)
    g.add_node("generate", generate_node)
    g.add_edge(START,      "rag")
    g.add_edge("rag",      "generate")
    g.add_edge("generate", END)
    return g.compile()


# Compile once at module load — reused across requests
agent = build_graph()
