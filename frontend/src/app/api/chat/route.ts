import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { getAccessToken } from '@/lib/gcp-auth'
import { retrieve } from '@/lib/rag'
import { SYSTEM_PROMPT } from '@/lib/system-prompt'

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT!
const LOCATION   = process.env.GOOGLE_CLOUD_LOCATION!
const GROK_MODEL = process.env.GROK_MODEL_ID!  // publishers/xai/models/grok-4.20-non-reasoning

export async function POST(request: NextRequest) {
  try {
    const body    = await request.json() as { message?: string; sessionId?: string }
    const message = body.message ?? ''

    if (!message.trim()) {
      return new Response('data: [DONE]\n\n', {
        headers: { 'Content-Type': 'text/event-stream' },
      })
    }

    // 1. Retrieve relevant chunks from Vertex RAG
    const context = await retrieve(message)

    // 2. Build messages
    const userContent = context
      ? `Catalog context:\n${context}\n\nUser question: ${message}`
      : message

    // 3. Fresh token for Grok call (Vertex AI uses Bearer auth, not API key)
    const token = await getAccessToken()

    const openai = new OpenAI({
      apiKey:  token,
      baseURL: `https://aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/global/endpoints/openapi`,
    })

    // 4. Stream from Grok
    const grokStream = await openai.chat.completions.create({
      model:  GROK_MODEL,
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userContent },
      ],
    })

    // 5. Forward as SSE (preserves existing frontend format)
    const encoder = new TextEncoder()
    const stream  = new ReadableStream({
      async start(controller) {
        for await (const chunk of grokStream) {
          const token = chunk.choices[0]?.delta?.content ?? ''
          if (token) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ token })}\n\n`)
            )
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
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
