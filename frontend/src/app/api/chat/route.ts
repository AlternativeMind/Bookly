import { NextRequest } from 'next/server'

const AGENT_URL = process.env.AGENT_SERVICE_URL!  // http://localhost:8000 | Cloud Run URL

const SSE_HEADERS = {
  'Content-Type':                'text/event-stream',
  'Cache-Control':               'no-cache',
  'Connection':                  'keep-alive',
  'Access-Control-Allow-Origin': '*',
}

export async function POST(request: NextRequest) {
  try {
    const body    = await request.json() as { message?: string; sessionId?: string }
    const message = body.message ?? ''

    if (!message.trim()) {
      return new Response('data: [DONE]\n\n', { headers: SSE_HEADERS })
    }

    const agentRes = await fetch(`${AGENT_URL}/chat`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message, session_id: body.sessionId ?? '' }),
    })

    if (!agentRes.ok) {
      console.error(`[/api/chat] agent returned ${agentRes.status}`)
      return new Response('data: [ERROR]\n\n', { headers: SSE_HEADERS, status: 502 })
    }

    // Pipe the agent SSE stream directly to the client — no re-encoding needed
    return new Response(agentRes.body, { headers: SSE_HEADERS })

  } catch (err) {
    console.error('[/api/chat]', err)
    return new Response('data: [ERROR]\n\n', { headers: SSE_HEADERS, status: 500 })
  }
}
