import { getAccessToken } from './gcp-auth'

const PROJECT_ID      = process.env.GOOGLE_CLOUD_PROJECT!
const PROJECT_NUM     = process.env.GOOGLE_CLOUD_PROJECT_NUMBER!
const LOCATION        = process.env.GOOGLE_CLOUD_LOCATION!
const ENDPOINT_ID     = process.env.VERTEX_ENDPOINT_ID!
const PUBLIC_DOMAIN   = process.env.VERTEX_PUBLIC_DOMAIN!
const DEPLOYED_INDEX  = process.env.VERTEX_DEPLOYED_INDEX_ID!
const EMBED_MODEL     = 'text-embedding-004'
const EMBED_DIMS      = 768
const TOP_K           = 8

// ── Embed ─────────────────────────────────────────────────────────────────────

async function embedQuery(text: string, token: string): Promise<number[]> {
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${EMBED_MODEL}:predict`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instances:  [{ content: text, task_type: 'RETRIEVAL_QUERY' }],
      parameters: { outputDimensionality: EMBED_DIMS },
    }),
  })

  if (!res.ok) throw new Error(`Embed failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.predictions[0].embeddings.values as number[]
}

// ── Vector search ─────────────────────────────────────────────────────────────

async function vectorSearch(vector: number[], token: string): Promise<string[]> {
  const url = `https://${PUBLIC_DOMAIN}/v1/projects/${PROJECT_NUM}/locations/${LOCATION}/indexEndpoints/${ENDPOINT_ID}:findNeighbors`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deployed_index_id: DEPLOYED_INDEX,
      queries: [{
        datapoint:      { feature_vector: vector },
        neighbor_count: TOP_K,
      }],
    }),
  })

  if (!res.ok) throw new Error(`Vector search failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  const neighbors = data.nearestNeighbors?.[0]?.neighbors ?? []
  return neighbors.map((n: { datapoint: { datapointId: string } }) => n.datapoint.datapointId)
}

// ── Firestore chunk fetch ─────────────────────────────────────────────────────

interface ChunkDoc {
  text:   string
  title:  string
  author: string
  type:   string
}

async function fetchChunkTexts(ids: string[], token: string): Promise<ChunkDoc[]> {
  if (ids.length === 0) return []

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/default/documents:batchGet`

  const documents = ids.map(
    id => `projects/${PROJECT_ID}/databases/default/documents/chunks/${id}`
  )

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ documents }),
  })

  if (!res.ok) throw new Error(`Firestore batchGet failed: ${res.status} ${await res.text()}`)

  const results = await res.json() as Array<{
    found?: { fields: Record<string, { stringValue: string }> }
  }>

  return results
    .filter(r => r.found)
    .map(r => ({
      text:   r.found!.fields.text?.stringValue   ?? '',
      title:  r.found!.fields.title?.stringValue  ?? '',
      author: r.found!.fields.author?.stringValue ?? '',
      type:   r.found!.fields.type?.stringValue   ?? '',
    }))
    .filter(c => c.text.length > 0)
}

// ── Public: retrieve context for a query ─────────────────────────────────────

export async function retrieve(query: string): Promise<string> {
  const token   = await getAccessToken()
  const vector  = await embedQuery(query, token)
  const ids     = await vectorSearch(vector, token)
  const chunks  = await fetchChunkTexts(ids, token)

  if (chunks.length === 0) return ''

  return chunks
    .map((c, i) => `[${i + 1}] ${c.text}`)
    .join('\n\n')
}
