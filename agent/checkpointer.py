"""
Firestore-backed LangGraph checkpointer for Bookly agent.

Stores one checkpoint per thread_id (latest only — sufficient for linear
conversations). Uses plain JSON serialization since AgentState contains only
Python primitives (str, int, list[dict]).

Firestore collection: checkpoints/{thread_id}
Fields stored: checkpoint (JSON str), metadata (JSON str)
"""
import json
import os
from typing import Any, AsyncIterator, Optional

import httpx
from langgraph.checkpoint.base import (
    BaseCheckpointSaver,
    Checkpoint,
    CheckpointMetadata,
    CheckpointTuple,
)
from langchain_core.runnables import RunnableConfig

from rag import _token  # shared GCP token helper

PROJECT_ID   = os.environ["GOOGLE_CLOUD_PROJECT"]
_FIRESTORE   = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/default/documents"
_COLLECTION  = "checkpoints"


# ── Firestore helpers ─────────────────────────────────────────────────────────

async def _fs_get(doc_id: str) -> Optional[dict[str, str]]:
    """Fetch a flat string-valued Firestore document. Returns None if not found."""
    url = f"{_FIRESTORE}/{_COLLECTION}/{doc_id}"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers={"Authorization": f"Bearer {_token()}"}, timeout=10)
    if resp.status_code == 404:
        return None
    resp.raise_for_status()
    doc = resp.json()
    return {k: v.get("stringValue", "") for k, v in doc.get("fields", {}).items()}


async def _fs_set(doc_id: str, fields: dict[str, str]) -> None:
    """Create or overwrite a Firestore document with string fields."""
    url  = f"{_FIRESTORE}/{_COLLECTION}/{doc_id}"
    body = {
        "fields": {k: {"stringValue": v} for k, v in fields.items()}
    }
    async with httpx.AsyncClient() as client:
        resp = await client.patch(
            url,
            json=body,
            headers={"Authorization": f"Bearer {_token()}"},
            timeout=10,
        )
    resp.raise_for_status()


def _dumps(obj: Any) -> str:
    return json.dumps(obj, default=str)


def _loads(s: str) -> Any:
    return json.loads(s)


# ── Checkpointer ──────────────────────────────────────────────────────────────

class FirestoreCheckpointer(BaseCheckpointSaver):
    """
    Minimal async Firestore checkpointer.
    Stores only the latest checkpoint per session — no checkpoint history.
    """

    async def aget_tuple(self, config: RunnableConfig) -> Optional[CheckpointTuple]:
        thread_id = (config.get("configurable") or {}).get("thread_id", "")
        if not thread_id:
            return None
        try:
            data = await _fs_get(thread_id)
        except Exception as e:
            print(f"[checkpointer] get failed: {e}")
            return None
        if not data or "checkpoint" not in data:
            return None
        checkpoint: Checkpoint      = _loads(data["checkpoint"])
        metadata:   CheckpointMetadata = _loads(data.get("metadata", "{}"))
        return CheckpointTuple(
            config=config,
            checkpoint=checkpoint,
            metadata=metadata,
            parent_config=None,
        )

    async def aput(
        self,
        config: RunnableConfig,
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
        new_versions: Any,
    ) -> RunnableConfig:
        thread_id = (config.get("configurable") or {}).get("thread_id", "")
        if thread_id:
            try:
                await _fs_set(thread_id, {
                    "checkpoint": _dumps(checkpoint),
                    "metadata":   _dumps(metadata),
                })
            except Exception as e:
                print(f"[checkpointer] put failed: {e}")
        return {
            "configurable": {
                "thread_id":     thread_id,
                "checkpoint_id": checkpoint.get("id", ""),
            }
        }

    async def alist(
        self,
        config: Optional[RunnableConfig],
        *,
        filter:  Optional[dict[str, Any]] = None,
        before:  Optional[RunnableConfig] = None,
        limit:   Optional[int] = None,
    ) -> AsyncIterator[CheckpointTuple]:
        # Not required for basic sequential use — return empty
        return
        yield  # makes this an async generator
