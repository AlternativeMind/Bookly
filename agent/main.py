"""
Bookly Agent Service — FastAPI + LangGraph.
Exposes POST /chat as an SSE stream consumed by the Next.js frontend proxy.

Request:  { "message": str, "session_id": str }
Response: text/event-stream  data: {"token":"..."} | data: {"trace":true,...} | data: [DONE]
"""
import json
import os
import httpx
import google.auth
import google.auth.transport.requests

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from graph import agent, AgentState

app = FastAPI(title="Bookly Agent")

PROJECT_ID    = os.environ["GOOGLE_CLOUD_PROJECT"]
HISTORY_LIMIT = 10

_creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])


def _token() -> str:
    req = google.auth.transport.requests.Request()
    _creds.refresh(req)
    return _creds.token


# ── Firestore session history ─────────────────────────────────────────────────

async def fetch_history(session_id: str) -> list[dict]:
    """Query the last HISTORY_LIMIT completed messages for a session."""
    if not session_id:
        return []
    parent = f"projects/{PROJECT_ID}/databases/default/documents/sessions/{session_id}"
    url    = f"https://firestore.googleapis.com/v1/{parent}:runQuery"
    payload = {
        "structuredQuery": {
            "from":    [{"collectionId": "messages"}],
            "where": {
                "fieldFilter": {
                    "field": {"fieldPath": "isComplete"},
                    "op":    "EQUAL",
                    "value": {"booleanValue": True},
                }
            },
            "orderBy": [{"field": {"fieldPath": "timestamp"}, "direction": "ASCENDING"}],
        }
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                url,
                json=payload,
                headers={"Authorization": f"Bearer {_token()}"},
                timeout=10,
            )
        if not resp.is_success:
            print(f"[history] Firestore query failed {resp.status_code}")
            return []
        messages = []
        for r in resp.json():
            if "document" in r:
                fields  = r["document"]["fields"]
                role    = fields.get("role",    {}).get("stringValue", "")
                content = fields.get("content", {}).get("stringValue", "")
                if role in ("user", "assistant") and content:
                    messages.append({"role": role, "content": content})
        return messages[-HISTORY_LIMIT:]
    except Exception as e:
        print(f"[history] error: {e}")
        return []


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
            # 1. Session history
            yield _sse_trace("high", "History · loading session…")
            history = await fetch_history(req.session_id)
            if history:
                yield _sse_trace("medium", f"History · {len(history)} prior message{'s' if len(history) != 1 else ''} loaded")

            # 2. Run LangGraph agent — stream events
            initial_state: AgentState = {
                "message":      req.message,
                "history":      history,
                "context":      "",
                "chunks_found": 0,
                "response":     "",
            }

            async for event in agent.astream_events(initial_state, version="v2"):
                kind = event["event"]
                name = event.get("name", "")

                # RAG node lifecycle traces
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
                        # Some providers return list of content blocks
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
            "Cache-Control": "no-cache",
            "Connection":    "keep-alive",
            "X-Accel-Buffering": "no",  # disable nginx buffering for SSE
        },
    )
