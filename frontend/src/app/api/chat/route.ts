import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { getAccessToken } from '@/lib/gcp-auth'
import { retrieve } from '@/lib/rag'
import { SYSTEM_PROMPT } from '@/lib/system-prompt'

const PROJECT_ID    = process.env.GOOGLE_CLOUD_PROJECT!
const GROK_MODEL    = process.env.GROK_MODEL_ID!  // xai/grok-4.20-non-reasoning
const HISTORY_LIMIT = 10  // last N completed messages sent as conversation context

// ── Session history ───────────────────────────────────────────────────────────

interface HistoryMessage {
  role:    'user' | 'assistant'
  content: string
}

async function fetchSessionHistory(sessionId: string, token: string): Promise<HistoryMessage[]> {
  const parent = `projects/${PROJECT_ID}/databases/default/documents/sessions/${sessionId}`
  const url    = `https://firestore.googleapis.com/v1/${parent}:runQuery`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      structuredQuery: {
        from:    [{ collectionId: 'messages' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'isComplete' },
            op:    'EQUAL',
            value: { booleanValue: true },
          },
        },
        orderBy: [{ field: { fieldPath: 'timestamp' }, direction: 'ASCENDING' }],
      },
    }),
  })

  if (!res.ok) {
    console.warn(`[history] Firestore query failed ${res.status}: ${await res.text().catch(() => '')}`)
    return []
  }

  const results = await res.json() as Array<{
    document?: {
      fields: {
        role?:    { stringValue?: string }
        content?: { stringValue?: string }
      }
    }
  }>

  const messages = results
    .filter(r => r.document)
    .map(r => ({
      role:    (r.document!.fields.role?.stringValue    ?? '') as 'user' | 'assistant',
      content:  r.document!.fields.content?.stringValue ?? '',
    }))
    .filter(m => (m.role === 'user' || m.role === 'assistant') && m.content.length > 0)

  return messages.slice(-HISTORY_LIMIT)
}

type TraceLevel = 'low' | 'medium' | 'high'

function traceEvent(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  level: TraceLevel,
  message: string,
  detail?: string
) {
  const payload = JSON.stringify({ trace: true, level, message, ...(detail ? { detail } : {}) })
  controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  try {
    const body    = await request.json() as { message?: string; sessionId?: string }
    const message = body.message ?? ''

    if (!message.trim()) {
      return new Response('data: [DONE]\n\n', {
        headers: { 'Content-Type': 'text/event-stream' },
      })
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 1. RAG retrieval
          traceEvent(controller, encoder, 'medium', 'RAG · embedding query…')
          const { context, chunkCount } = await retrieve(message)
          if (chunkCount > 0) {
            traceEvent(controller, encoder, 'medium', `RAG · retrieved ${chunkCount} chunk${chunkCount !== 1 ? 's' : ''}`, context.slice(0, 120) + (context.length > 120 ? '…' : ''))
          } else {
            traceEvent(controller, encoder, 'low', 'RAG · no relevant chunks found — using model knowledge only')
          }

          // 2. Build user content (RAG context + question)
          const userContent = context
            ? `Catalog context:\n${context}\n\nUser question: ${message}`
            : message

          // 3. Auth token
          traceEvent(controller, encoder, 'high', 'Auth · fetching GCP access token')
          const token = await getAccessToken()

          // 4. Fetch session history
          const sessionId = body.sessionId
          const history   = sessionId ? await fetchSessionHistory(sessionId, token) : []
          if (history.length > 0) {
            traceEvent(controller, encoder, 'medium', `History · ${history.length} prior message${history.length !== 1 ? 's' : ''} loaded`)
          }

          const openai = new OpenAI({
            apiKey:  token,
            baseURL: `https://aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/global/endpoints/openapi`,
          })

          // 5. Stream from Grok (system + history + current turn)
          traceEvent(controller, encoder, 'low', `Inference · streaming ${GROK_MODEL}`)
          const grokStream = await openai.chat.completions.create({
            model:  GROK_MODEL,
            stream: true,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...history,
              { role: 'user',   content: userContent },
            ],
          })

          // 6. Forward tokens as SSE
          let tokenCount = 0
          for await (const chunk of grokStream) {
            const token = chunk.choices[0]?.delta?.content ?? ''
            if (token) {
              tokenCount++
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ token })}\n\n`)
              )
            }
          }

          traceEvent(controller, encoder, 'high', `Inference · complete (${tokenCount} tokens)`)
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          console.error('[/api/chat stream]', err)
          controller.enqueue(encoder.encode('data: [ERROR]\n\n'))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type':                'text/event-stream',
        'Cache-Control':               'no-cache',
        'Connection':                  'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    console.error('[/api/chat]', err)
    return new Response('data: [ERROR]\n\n', {
      headers: { 'Content-Type': 'text/event-stream' },
      status:  500,
    })
  }
}
