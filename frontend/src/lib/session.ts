const SESSION_KEY  = 'bookly_session'
const SESSIONS_KEY = 'bookly_sessions'

export interface Session {
  sessionId: string
  timestamp: number
}

export interface SessionRecord {
  sessionId: string
  createdAt: number
}

// ── Active session ─────────────────────────────────────────────────────────────

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
  const session: Session = { sessionId, timestamp: Date.now() }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

export function generateSessionId(): string {
  return crypto.randomUUID()
}

// ── Session history list ───────────────────────────────────────────────────────

export function getSessionList(): SessionRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SessionRecord[]
  } catch {
    return []
  }
}

export function addToSessionList(sessionId: string): void {
  if (typeof window === 'undefined') return
  const list = getSessionList().filter(s => s.sessionId !== sessionId)
  list.push({ sessionId, createdAt: Date.now() })
  // Keep last 50 sessions
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(list.slice(-50)))
}
