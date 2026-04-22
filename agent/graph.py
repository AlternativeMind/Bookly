"""
LangGraph agent graph for Bookly.

Phase 5 graph (with checkpointer):
  START → rag_node → generate_node → END

State is persisted to Firestore after each run via FirestoreCheckpointer.
History accumulates inside AgentState — no manual Firestore reads needed.

Phase 4 will insert a tool_node between generate and END with conditional routing.
"""
import os
from typing import TypedDict

from langgraph.graph import StateGraph, START, END
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_openai import ChatOpenAI

from rag import retrieve, _token
from system_prompt import get_system_prompt
from checkpointer import FirestoreCheckpointer

PROJECT_ID    = os.environ["GOOGLE_CLOUD_PROJECT"]
GROK_MODEL    = os.environ["GROK_MODEL_ID"]
HISTORY_LIMIT = 20  # max messages kept in checkpoint (10 exchanges)

VERTEX_BASE_URL = (
    f"https://aiplatform.googleapis.com/v1/projects/{PROJECT_ID}"
    f"/locations/global/endpoints/openapi"
)


# ── State ─────────────────────────────────────────────────────────────────────

class AgentState(TypedDict, total=False):
    """
    total=False makes all keys optional — safe when checkpoint only partially
    restores state (e.g. first call has no history yet).
    """
    message:      str
    history:      list[dict]   # [{role, content}] — persisted across turns
    context:      str          # RAG chunks — recomputed each turn
    chunks_found: int
    response:     str          # latest assistant reply — overwritten each turn


# ── Nodes ─────────────────────────────────────────────────────────────────────

async def rag_node(state: AgentState) -> dict:
    context, count = await retrieve(state["message"])
    return {"context": context, "chunks_found": count}


async def generate_node(state: AgentState) -> dict:
    token = _token()  # fresh GCP token — expires after ~1h
    llm = ChatOpenAI(
        model=GROK_MODEL,
        api_key=token,
        base_url=VERTEX_BASE_URL,
        streaming=True,
        temperature=0.3,
    )

    # Build message array: system + prior history + current user message
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

    # Accumulate history in state — checkpointer persists this between turns
    updated_history = list(state.get("history", [])) + [
        {"role": "user",      "content": state["message"]},
        {"role": "assistant", "content": response.content},
    ]
    # Cap to avoid unbounded growth
    if len(updated_history) > HISTORY_LIMIT:
        updated_history = updated_history[-HISTORY_LIMIT:]

    return {"response": response.content, "history": updated_history}


# ── Graph ─────────────────────────────────────────────────────────────────────

def build_graph() -> object:
    checkpointer = FirestoreCheckpointer()
    g = StateGraph(AgentState)
    g.add_node("rag",      rag_node)
    g.add_node("generate", generate_node)
    g.add_edge(START,      "rag")
    g.add_edge("rag",      "generate")
    g.add_edge("generate", END)
    return g.compile(checkpointer=checkpointer)


# Compiled once at module load — reused across requests
agent = build_graph()
