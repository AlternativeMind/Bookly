import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { passcode?: string }
    const { passcode } = body

    const validPasscode = process.env.PASSCODE

    if (!validPasscode) {
      return NextResponse.json({ ok: false, error: 'Server misconfiguration' }, { status: 500 })
    }

    if (passcode === validPasscode) {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    return NextResponse.json({ ok: false }, { status: 401 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
}
