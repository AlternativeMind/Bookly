'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSession, getSessionList, type SessionRecord } from '@/lib/session'

interface SessionPreview {
  sessionId: string
  createdAt: number
  preview: string   // first user message, or empty
  messageCount: number
}

const container = {
  animate: { transition: { staggerChildren: 0.05 } },
}
const item = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
}

function formatDate(ms: number) {
  const diffDays = Math.floor((Date.now() - ms) / 86_400_000)
  const d = new Date(ms)
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 0) return `Today · ${time}`
  if (diffDays === 1) return `Yesterday · ${time}`
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

async function loadPreview(sessionId: string): Promise<{ preview: string; count: number }> {
  try {
    const q = query(
      collection(db, 'sessions', sessionId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(20)
    )
    const snap = await getDocs(q)
    const msgs = snap.docs
      .map(d => ({ role: d.data().role as string, content: (d.data().content as string) ?? '' }))
      .filter(m => m.content.length > 0)

    const firstUser = msgs.find(m => m.role === 'user')?.content ?? ''
    return { preview: firstUser, count: msgs.length }
  } catch {
    return { preview: '', count: 0 }
  }
}

export default function HistoryView({ onResumeSession }: { onResumeSession: (id: string) => void }) {
  const [sessions, setSessions] = useState<SessionPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const firebaseReady = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  useEffect(() => {
    setActiveSessionId(getSession()?.sessionId ?? null)
    const list = getSessionList()
    if (!firebaseReady || list.length === 0) {
      setSessions([])
      setLoading(false)
      return
    }

    // Load preview for all sessions in parallel, newest first
    const records = [...list].reverse()
    Promise.all(
      records.map(async (r: SessionRecord) => {
        const { preview, count } = await loadPreview(r.sessionId)
        return { sessionId: r.sessionId, createdAt: r.createdAt, preview, messageCount: count }
      })
    ).then(results => {
      setSessions(results)
      setLoading(false)
    })
  }, [firebaseReady])

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-8 md:p-12">
      <div className="max-w-3xl mx-auto">
        <motion.div variants={container} initial="initial" animate="animate" className="space-y-8">

          {/* Header */}
          <motion.div variants={item}>
            <h1 className="font-headline text-4xl font-black text-on-surface tracking-tighter mb-2">Chat History</h1>
            <p className="text-on-surface-variant font-body text-sm">
              Click any session to resume that conversation.
            </p>
          </motion.div>

          {/* Session list */}
          <motion.div variants={item} className="space-y-3">
            {loading && (
              <div className="flex items-center gap-2 text-on-surface-variant font-body text-sm">
                <span className="material-symbols-outlined animate-spin text-base">autorenew</span>
                Loading sessions…
              </div>
            )}

            {!loading && sessions.length === 0 && (
              <div
                className="rounded-xl p-6 text-center"
                style={{ background: 'rgba(255,164,76,0.06)', border: '1px solid rgba(255,164,76,0.15)' }}
              >
                <span className="material-symbols-outlined text-primary text-3xl mb-3 block">chat_bubble</span>
                <p className="text-on-surface-variant font-body text-sm">No sessions yet. Start chatting to build history.</p>
              </div>
            )}

            {!loading && sessions.map((s) => {
              const isActive = s.sessionId === activeSessionId
              return (
                <motion.button
                  key={s.sessionId}
                  onClick={() => !isActive && onResumeSession(s.sessionId)}
                  whileHover={isActive ? {} : { x: 3 }}
                  whileTap={isActive ? {} : { scale: 0.99 }}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-colors"
                  style={{
                    background: '#131313',
                    border: '1px solid rgba(72,72,71,0.15)',
                    cursor: isActive ? 'default' : 'pointer',
                  }}
                >
                  {/* Icon */}
                  <span className="material-symbols-outlined text-xl shrink-0" style={{ color: '#fd9000' }}>
                    {isActive ? 'chat' : 'history'}
                  </span>

                  {/* Preview text + date */}
                  <div className="flex-1 min-w-0">
                    <p className="text-on-surface font-body text-sm font-medium truncate">
                      {s.preview || <span className="italic text-on-surface-variant">Empty session</span>}
                    </p>
                    <p className="text-on-surface-variant font-body text-xs mt-0.5">{formatDate(s.createdAt)}</p>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    {s.messageCount > 0 && (
                      <span className="text-on-surface-variant font-body text-xs">
                        {s.messageCount} msg{s.messageCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {isActive ? (
                      <span
                        className="text-[10px] font-body font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(253,144,0,0.15)', color: '#fd9000' }}
                      >
                        Current
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-on-surface-variant text-base">arrow_forward</span>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}
