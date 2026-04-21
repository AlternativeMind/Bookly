const SESSION_KEY = 'bookly_session'

export interface Session {
  sessionId: string
  timestamp: number
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    if (!parsed.sessionId || !parsed.timestamp) return null
    return parsed
  } catch {
    return null
  }
}

export function setSession(sessionId: string): void {
  if (typeof window === 'undefined') return
  const session: Session = {
    sessionId,
    timestamp: Date.now(),
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

export function generateSessionId(): string {
  return crypto.randomUUID()
}
