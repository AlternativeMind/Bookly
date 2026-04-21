import { NextRequest } from 'next/server'

const MOCK_RESPONSES: Record<string, string> = {
  mystery: 'I found several compelling mystery novels matching your query. Let me highlight the top recommendations from our archive of 281,736 volumes. For teen readers with a strong female lead, "The Mystery of Hollow Hill" by Sarah Chen and "Shadows in the Stacks" by Mira Patel stand out. Both feature resourceful protagonists who rely on wit over brawn. "The Mystery of Hollow Hill" in particular has won the Young Adult Library Association award two years running.',
  scholastic: 'Searching through our Scholastic catalog index now. In 2023, several Scholastic titles received prestigious recognition. The Newbery Medal went to "The Eyes and the Impossible" by Dave Eggers, while Caldecott honors were awarded to multiple picture books in the collection. The National Book Award for Young People\'s Literature featured three Scholastic-published finalists. Shall I pull the full citation details for any of these titles?',
  default: 'I have searched our archive of 281,736 volumes for your query. The Illuminated Archive contains an extensive collection spanning literary fiction, young adult, children\'s literature, and academic texts. Based on your request, I can identify several highly relevant titles. Our recommendation algorithm weighs critical reception, reader reviews, thematic alignment, and grade-level appropriateness. Would you like me to narrow the results by age group, genre, or award status?',
}

function getMockResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('mystery') || lower.includes('detective') || lower.includes('thriller')) {
    return MOCK_RESPONSES.mystery
  }
  if (lower.includes('scholastic') || lower.includes('award') || lower.includes('2023')) {
    return MOCK_RESPONSES.scholastic
  }
  return MOCK_RESPONSES.default
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { message?: string; sessionId?: string }
    const message = body.message ?? ''

    const responseText = getMockResponse(message)
    const words = responseText.split(' ')

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        for (let i = 0; i < words.length; i++) {
          const word = i === words.length - 1 ? words[i] : words[i] + ' '
          const data = `data: ${JSON.stringify({ token: word })}\n\n`
          controller.enqueue(encoder.encode(data))

          await new Promise<void>((resolve) => setTimeout(resolve, 80))
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch {
    return new Response('data: [ERROR]\n\n', {
      headers: { 'Content-Type': 'text/event-stream' },
      status: 500,
    })
  }
}
