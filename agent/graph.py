"""
LangGraph agent graph for Bookly.

Graph topology:
  START → classify_node → [skip_rag=True]  → generate_node → END
                        ↘ [skip_rag=False] → rag_node → generate_node → END

classify_node (Layer 2 guardrail):
  - Keyword-based hard escalation triggers (legal language, frustration signals)
    set escalate_immediately=True → generate_node is directed to call
    escalate_to_human without deliberating.
  - Soft intent routing sets skip_rag=True for order/return intents so the
    vector search over book chunks is skipped (saves ~500ms, reduces noise).

generate_node (Layer 3 guardrail):
  - _safe_response() scans LLM output for PII patterns and injection attempts
    before the response leaves the graph.

Layer 1 guardrails live in the system prompt (system_prompt.py).
"""
import os
import re
from typing import TypedDict

from langgraph.graph import StateGraph, START, END
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
from langchain_openai import ChatOpenAI

from rag import retrieve, _token
from system_prompt import get_system_prompt
from checkpointer import FirestoreCheckpointer
from tools import TOOLS, TOOL_MAP

PROJECT_ID    = os.environ["GOOGLE_CLOUD_PROJECT"]
GROK_MODEL    = os.environ["GROK_MODEL_ID"]
HISTORY_LIMIT = 20   # max messages kept in checkpoint (10 exchanges)
MAX_TOOL_ITER = 5    # max tool-call rounds per turn (prevents infinite loops)

VERTEX_BASE_URL = (
    f"https://aiplatform.googleapis.com/v1/projects/{PROJECT_ID}"
    f"/locations/global/endpoints/openapi"
)


# ── State ─────────────────────────────────────────────────────────────────────

class AgentState(TypedDict, total=False):
    """
    total=False: all keys optional — safe when checkpoint partially restores state.
    tool_calls_made is transient (not added to history) — used for trace events.
    intent / skip_rag / escalate_immediately are set fresh by classify_node each turn.
    """
    message:              str
    history:              list[dict]   # [{role, content}] — persisted across turns
    context:              str          # RAG chunks — recomputed each turn, not persisted
    chunks_found:         int
    response:             str          # latest assistant reply — overwritten each turn
    tool_calls_made:      list[dict]   # [{tool, args, result}] for trace panel
    # ── classify_node outputs (transient per turn) ──────────────────────────
    intent:               str          # "order_status" | "return" | "book_discovery" |
                                       # "escalate_legal" | "escalate_frustrated" | "general"
    skip_rag:             bool         # True → bypass rag_node this turn
    escalate_immediately: bool         # True → generate_node directed to call escalate_to_human


# ── Layer 2: classify_node ────────────────────────────────────────────────────

# Hard escalation triggers — LLM should not decide on these
_LEGAL_KEYWORDS    = {"lawyer", "sue", "suing", "lawsuit", "bbb", "dispute",
                       "court", "chargeback", "attorney", "legal", "legal action"}
_FRUSTRATION_WORDS = {"wtf", "useless", "scam", "fraud", "terrible", "ridiculous",
                       "incompetent", "pathetic", "disgusting", "outrageous"}

# Soft routing — skip RAG for intents that don't need book catalog context
_ORDER_KEYWORDS    = {"order", "shipping", "shipped", "tracking", "delivery",
                       "deliver", "dispatch", "package", "where's my", "where is my"}
_RETURN_KEYWORDS   = {"return", "refund", "exchange", "wrong item", "wrong book",
                       "wrong edition", "damaged", "broken", "defective", "send back"}


async def classify_node(state: AgentState) -> dict:
    msg   = state.get("message", "")
    low   = msg.lower()
    words = set(re.findall(r"\w+", low))

    # Hard: legal language → immediate escalation, high priority
    if words & _LEGAL_KEYWORDS:
        return {"intent": "escalate_legal",      "skip_rag": True, "escalate_immediately": True}

    # Hard: all-caps message (shouting / strong frustration signal)
    stripped = msg.strip()
    if stripped.isupper() and len(stripped) > 10:
        return {"intent": "escalate_frustrated", "skip_rag": True, "escalate_immediately": True}

    # Hard: known frustration words
    if words & _FRUSTRATION_WORDS:
        return {"intent": "escalate_frustrated", "skip_rag": True, "escalate_immediately": True}

    # Soft: order / shipping inquiry — book catalog not needed
    if words & _ORDER_KEYWORDS:
        return {"intent": "order_status",        "skip_rag": True, "escalate_immediately": False}

    # Soft: return / refund / exchange — book catalog not needed
    if words & _RETURN_KEYWORDS:
        return {"intent": "return",              "skip_rag": True, "escalate_immediately": False}

    # Default: book discovery or general — run full RAG pipeline
    return     {"intent": "book_discovery",      "skip_rag": False, "escalate_immediately": False}


def _route_after_classify(state: AgentState) -> str:
    """Conditional edge: route to rag_node or directly to generate_node."""
    return "generate" if state.get("skip_rag") else "rag"


# ── Layer 3: output validation ────────────────────────────────────────────────

_BLOCKED_PATTERNS = [
    re.compile(r"\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b"),    # credit card number
    re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),                               # SSN
    re.compile(r"ignore\s+(your|previous|all)\s+instructions", re.I),   # prompt injection
    re.compile(r"new\s+persona", re.I),                                  # persona override
    re.compile(r"reveal\s+(your\s+)?(system\s+)?prompt", re.I),         # prompt leak
    re.compile(r"disregard\s+(previous|prior|all)", re.I),               # injection variant
]

_BLOCKED_RESPONSE = (
    "I'm not able to help with that. "
    "Is there something else I can assist you with?"
)


def _safe_response(text: str) -> str:
    """Return text unchanged, or a safe fallback if a blocked pattern is detected."""
    for pattern in _BLOCKED_PATTERNS:
        if pattern.search(text):
            return _BLOCKED_RESPONSE
    return text


# ── Nodes ─────────────────────────────────────────────────────────────────────

async def rag_node(state: AgentState) -> dict:
    context, count = await retrieve(state["message"])
    return {"context": context, "chunks_found": count}


async def generate_node(state: AgentState) -> dict:
    token = _token()
    llm = ChatOpenAI(
        model=GROK_MODEL,
        api_key=token,
        base_url=VERTEX_BASE_URL,
        streaming=True,
        temperature=0.3,
    )
    llm_with_tools = llm.bind_tools(TOOLS)

    # Build message array: system prompt + history + current user message
    messages: list = [SystemMessage(content=get_system_prompt())]

    for turn in state.get("history", []):
        role    = turn.get("role", "")
        content = turn.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))

    # If classify_node flagged immediate escalation, prepend a directive so the
    # LLM calls escalate_to_human on its first response without deliberating.
    user_msg = state["message"]
    if state.get("escalate_immediately"):
        intent   = state.get("intent", "")
        priority = "high" if intent == "escalate_legal" else "medium"
        user_msg = (
            f"[SYSTEM DIRECTIVE: This message has triggered an automatic escalation "
            f"({intent}, priority={priority}). You MUST call escalate_to_human "
            f"immediately with a brief issue summary. Do not attempt to resolve the "
            f"issue yourself.]\n\nCustomer message: {user_msg}"
        )

    user_content = (
        f"Catalog context:\n{state['context']}\n\nUser question: {user_msg}"
        if state.get("context")
        else user_msg
    )
    messages.append(HumanMessage(content=user_content))

    # ── Tool calling loop ──────────────────────────────────────────────────────
    tool_calls_made: list[dict] = []
    response = None

    for _ in range(MAX_TOOL_ITER):
        response = await llm_with_tools.ainvoke(messages)

        if not response.tool_calls:
            break  # no more tool calls — response.content is the final answer

        # Some models (Grok) stream text BEFORE the tool call in the same message.
        # Strip content so the history message is a clean tool-call-only AIMessage;
        # the prefixed text was already streamed to the user via on_chat_model_stream.
        messages.append(AIMessage(content="", tool_calls=response.tool_calls))
        for tc in response.tool_calls:
            name   = tc["name"]
            args   = tc["args"]
            result = TOOL_MAP[name].invoke(args) if name in TOOL_MAP else f"Unknown tool: {name}"
            tool_calls_made.append({"tool": name, "args": args, "result": result})
            messages.append(ToolMessage(content=result, tool_call_id=tc["id"]))

    # Layer 3: validate output before it leaves the graph
    final_text = _safe_response(response.content if response else "")

    # Persist conversation to history (plain dicts — checkpointer-safe)
    updated_history = list(state.get("history", [])) + [
        {"role": "user",      "content": state["message"]},
        {"role": "assistant", "content": final_text},
    ]
    if len(updated_history) > HISTORY_LIMIT:
        updated_history = updated_history[-HISTORY_LIMIT:]

    return {
        "response":        final_text,
        "history":         updated_history,
        "tool_calls_made": tool_calls_made,
    }


# ── Graph ─────────────────────────────────────────────────────────────────────

def build_graph() -> object:
    checkpointer = FirestoreCheckpointer()
    g = StateGraph(AgentState)

    g.add_node("classify", classify_node)
    g.add_node("rag",      rag_node)
    g.add_node("generate", generate_node)

    g.add_edge(START, "classify")
    g.add_conditional_edges(
        "classify",
        _route_after_classify,
        {"rag": "rag", "generate": "generate"},
    )
    g.add_edge("rag",      "generate")
    g.add_edge("generate", END)

    return g.compile(checkpointer=checkpointer)


# Compiled once at module load — reused across requests
agent = build_graph()
