"""
RAG pipeline for the Bookly agent service.
Mirrors rag.ts: embed → Vertex Vector Search → Firestore batchGet.
All calls use REST (no gRPC) to avoid DNS resolver issues.
"""
import os
import httpx
import google.auth
import google.auth.transport.requests

PROJECT_ID    = os.environ["GOOGLE_CLOUD_PROJECT"]
PROJECT_NUM   = os.environ["GOOGLE_CLOUD_PROJECT_NUMBER"]
LOCATION      = os.environ["GOOGLE_CLOUD_LOCATION"]
ENDPOINT_ID   = os.environ["VERTEX_ENDPOINT_ID"]
PUBLIC_DOMAIN = os.environ["VERTEX_PUBLIC_DOMAIN"]
DEPLOYED_ID   = os.environ["VERTEX_DEPLOYED_INDEX_ID"]
EMBED_MODEL   = "text-embedding-004"
EMBED_DIMS    = 768
TOP_K         = 8

_creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])


def _token() -> str:
    req = google.auth.transport.requests.Request()
    _creds.refresh(req)
    return _creds.token


async def _embed(text: str, client: httpx.AsyncClient) -> list[float]:
    url = (
        f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}"
        f"/locations/{LOCATION}/publishers/google/models/{EMBED_MODEL}:predict"
    )
    resp = await client.post(
        url,
        json={
            "instances":  [{"content": text, "task_type": "RETRIEVAL_QUERY"}],
            "parameters": {"outputDimensionality": EMBED_DIMS},
        },
        headers={"Authorization": f"Bearer {_token()}"},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["predictions"][0]["embeddings"]["values"]


async def _vector_search(vector: list[float], client: httpx.AsyncClient) -> list[str]:
    url = (
        f"https://{PUBLIC_DOMAIN}/v1/projects/{PROJECT_NUM}"
        f"/locations/{LOCATION}/indexEndpoints/{ENDPOINT_ID}:findNeighbors"
    )
    resp = await client.post(
        url,
        json={
            "deployed_index_id": DEPLOYED_ID,
            "queries": [{
                "datapoint":      {"feature_vector": vector},
                "neighbor_count": TOP_K,
            }],
        },
        headers={"Authorization": f"Bearer {_token()}"},
        timeout=30,
    )
    resp.raise_for_status()
    neighbors = resp.json().get("nearestNeighbors", [{}])[0].get("neighbors", [])
    return [n["datapoint"]["datapointId"] for n in neighbors]


async def _fetch_chunks(ids: list[str], client: httpx.AsyncClient) -> list[str]:
    if not ids:
        return []
    url = (
        f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}"
        f"/databases/default/documents:batchGet"
    )
    documents = [
        f"projects/{PROJECT_ID}/databases/default/documents/chunks/{id_}"
        for id_ in ids
    ]
    resp = await client.post(
        url,
        json={"documents": documents},
        headers={"Authorization": f"Bearer {_token()}"},
        timeout=30,
    )
    resp.raise_for_status()
    texts = []
    for r in resp.json():
        if "found" in r:
            text = r["found"]["fields"].get("text", {}).get("stringValue", "")
            if text:
                texts.append(text)
    return texts


async def retrieve(query: str) -> tuple[str, int]:
    """Returns (context_string, chunk_count)."""
    async with httpx.AsyncClient() as client:
        vector = await _embed(query, client)
        ids    = await _vector_search(vector, client)
        texts  = await _fetch_chunks(ids, client)

    if not texts:
        return "", 0

    context = "\n\n".join(f"[{i + 1}] {t}" for i, t in enumerate(texts))
    return context, len(texts)
