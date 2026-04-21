'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSession, getSessionList, type SessionRecord } from '@/lib/session'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const container = {
  animate: { transition: { staggerChildren: 0.05 } },
}
const item = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
}

function formatDate(ms: number) {
  const d = new Date(ms)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - ms) / 86_400_000)
  if (diffDays === 0) return `Today · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function SessionRow({
  record,
  isActive,
  onResume,
}: {
  record: SessionRecord
  isActive: boolean
  onResume: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const loadMessages = useCallback(async () => {
    if (loaded) return
    setLoading(true)
    try {
      const messagesRef = collection(db, 'sessions', record.sessionId, 'messages')
      const q = query(messagesRef, orderBy('timestamp', 'asc'))
      const snap = await getDocs(q)
      const msgs: ChatMessage[] = snap.docs
        .map((d) => {
          const data = d.data()
          return {
            id: d.id,
            role: data.role as 'user' | 'assistant',
            content: (data.content as string) ?? '',
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : record.createdAt,
          }
        })
        .filter((m) => m.content.length > 0)
      setMessages(msgs)
    } catch {
      // silently fail — network issue
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }, [record.sessionId, record.createdAt, loaded])

  const handleToggle = () => {
    if (!expanded) loadMessages()
    setExpanded((v) => !v)
  }

  const preview = messages.find((m) => m.role === 'user')?.content ?? '—'

  return (
    <motion.div
      layout
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(72,72,71,0.15)' }}
    >
      {/* Header row */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
        style={{ background: '#131313' }}
      >
        <span
          className="material-symbols-outlined text-base transition-transform"
          style={{
            color: '#fd9000',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          chevron_right
        </span>

        <div className="flex-1 min-w-0">
          {loaded && messages.length > 0 ? (
            <p className="text-on-surface font-body text-sm truncate">{preview}</p>
          ) : (
            <p className="text-on-surface-variant font-body text-sm italic">Session {record.sessionId.slice(0, 8)}…</p>
          )}
          <p className="text-on-surface-variant font-body text-xs mt-0.5">{formatDate(record.createdAt)}</p>
        </div>

        {isActive ? (
          <span
            className="shrink-0 text-[10px] font-body font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(253,144,0,0.15)', color: '#fd9000' }}
          >
            Current
          </span>
        ) : (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onResume(record.sessionId) }}
            className="shrink-0 text-[10px] font-body font-bold uppercase tracking-widest px-2 py-0.5 rounded-full transition-colors cursor-pointer"
            style={{ background: 'rgba(72,72,71,0.25)', color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(253,144,0,0.15)'; (e.currentTarget as HTMLElement).style.color = '#fd9000' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(72,72,71,0.25)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}
          >
            Resume
          </span>
        )}

        {loaded && (
          <span className="shrink-0 text-on-surface-variant font-body text-xs">
            {messages.length} msg{messages.length !== 1 ? 's' : ''}
          </span>
        )}
      </button>

      {/* Expanded messages */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="messages"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div
              className="divide-y"
              style={{ borderTop: '1px solid rgba(72,72,71,0.12)', borderColor: 'rgba(72,72,71,0.12)' }}
            >
              {loading && (
                <div className="flex items-center gap-2 px-5 py-4 text-on-surface-variant font-body text-sm">
                  <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>
                  Loading…
                </div>
              )}
              {!loading && messages.length === 0 && (
                <div className="px-5 py-4 text-on-surface-variant font-body text-sm italic">No messages found.</div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex gap-4 px-5 py-3"
                  style={{ background: msg.role === 'user' ? '#171717' : '#111' }}
                >
                  <span
                    className="shrink-0 text-[10px] font-bold uppercase tracking-widest mt-1 w-14"
                    style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.3)' : '#fd9000' }}
                  >
                    {msg.role === 'user' ? 'You' : 'Bookly'}
                  </span>
                  <p className="text-on-surface font-body text-sm leading-relaxed whitespace-pre-wrap flex-1">{msg.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function HistoryView({ onResumeSession }: { onResumeSession: (id: string) => void }) {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const firebaseReady = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  useEffect(() => {
    const list = getSessionList()
    // Show newest first
    setSessions([...list].reverse())
    setActiveSessionId(getSession()?.sessionId ?? null)
  }, [])

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-8 md:p-12">
      <div className="max-w-3xl mx-auto">
        <motion.div variants={container} initial="initial" animate="animate" className="space-y-8">
          {/* Header */}
          <motion.div variants={item}>
            <h1 className="font-headline text-4xl font-black text-on-surface tracking-tighter mb-2">Chat History</h1>
            <p className="text-on-surface-variant font-body text-sm">
              All sessions from this browser. Click a session to expand the full conversation.
            </p>
          </motion.div>

          {/* Session list */}
          <motion.div variants={item} className="space-y-3">
            {!firebaseReady && (
              <p className="text-on-surface-variant font-body text-sm">Firebase not configured — history unavailable.</p>
            )}

            {firebaseReady && sessions.length === 0 && (
              <div
                className="rounded-xl p-6 text-center"
                style={{ background: 'rgba(255,164,76,0.06)', border: '1px solid rgba(255,164,76,0.15)' }}
              >
                <span className="material-symbols-outlined text-primary text-3xl mb-3 block">chat_bubble</span>
                <p className="text-on-surface-variant font-body text-sm">No sessions yet. Start chatting to build history.</p>
              </div>
            )}

            {firebaseReady &&
              sessions.map((record) => (
                <SessionRow
                  key={record.sessionId}
                  record={record}
                  isActive={record.sessionId === activeSessionId}
                  onResume={onResumeSession}
                />
              ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
