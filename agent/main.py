"""
Bookly Agent Service — FastAPI + LangGraph.
Exposes POST /chat as an SSE stream consumed by the Next.js frontend proxy.

Request:  { "message": str, "session_id": str }
Response: text/event-stream  data: {"token":"..."} | data: {"trace":true,...} | data: [DONE]

Phase 5: session history is managed by FirestoreCheckpointer inside the graph.
         No manual history fetching needed here.
"""
import json

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from graph import agent

app = FastAPI(title="Bookly Agent")


# ── SSE helpers ───────────────────────────────────────────────────────────────

def _sse_token(text: str) -> str:
    return f"data: {json.dumps({'token': text})}\n\n"


def _sse_trace(level: str, message: str, detail: str | None = None) -> str:
    payload: dict = {"trace": True, "level": level, "message": message}
    if detail:
        payload["detail"] = detail
    return f"data: {json.dumps(payload)}\n\n"


# ── Routes ────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message:    str
    session_id: str = ""


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/chat")
async def chat(req: ChatRequest) -> StreamingResponse:
    async def event_stream():
        try:
            # LangGraph config — thread_id links this run to its Firestore checkpoint
            config = {"configurable": {"thread_id": req.session_id}} if req.session_id else {}

            # Minimal input — history is restored from checkpoint automatically
            initial_state = {"message": req.message}

            async for event in agent.astream_events(initial_state, config, version="v2"):
                kind = event["event"]
                name = event.get("name", "")

                # RAG node traces
                if kind == "on_chain_start" and name == "rag":
                    yield _sse_trace("medium", "RAG · embedding query…")

                elif kind == "on_chain_end" and name == "rag":
                    output = event["data"].get("output") or {}
                    count  = output.get("chunks_found", 0)
                    if count:
                        ctx = output.get("context", "")
                        yield _sse_trace(
                            "medium",
                            f"RAG · retrieved {count} chunk{'s' if count != 1 else ''}",
                            ctx[:120] + ("…" if len(ctx) > 120 else ""),
                        )
                    else:
                        yield _sse_trace("low", "RAG · no relevant chunks — using model knowledge only")

                # Generate node start trace
                elif kind == "on_chain_start" and name == "generate":
                    yield _sse_trace("low", "Inference · streaming LangGraph → Grok")

                # LLM token stream
                elif kind == "on_chat_model_stream":
                    chunk   = event["data"]["chunk"]
                    content = chunk.content
                    if isinstance(content, str) and content:
                        yield _sse_token(content)
                    elif isinstance(content, list):
                        for block in content:
                            if isinstance(block, dict) and block.get("type") == "text":
                                text = block.get("text", "")
                                if text:
                                    yield _sse_token(text)

            yield "data: [DONE]\n\n"

        except Exception as e:
            print(f"[/chat] error: {e}")
            yield "data: [ERROR]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":     "no-cache",
            "Connection":        "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
