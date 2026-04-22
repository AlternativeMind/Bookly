'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSession, getSessionList, type SessionRecord } from '@/lib/session'

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

interface SessionSummary {
  title: string
  preview: string
  messageCount: number
  loaded: boolean
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
  const [summary, setSummary] = useState<SessionSummary>({
    title: '',
    preview: '',
    messageCount: 0,
    loaded: false,
  })

  const loadSummary = useCallback(async () => {
    try {
      const messagesRef = collection(db, 'sessions', record.sessionId, 'messages')
      const q = query(messagesRef, orderBy('timestamp', 'asc'))
      const snap = await getDocs(q)
      const msgs = snap.docs
        .map((d) => {
          const data = d.data()
          return {
            role: data.role as 'user' | 'assistant',
            content: (data.content as string) ?? '',
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : record.createdAt,
          }
        })
        .filter((m) => m.content.length > 0)

      const firstUser = msgs.find((m) => m.role === 'user')?.content ?? ''
      const firstAssistant = msgs.find((m) => m.role === 'assistant')?.content ?? ''

      setSummary({
        title: firstUser || `Session ${record.sessionId.slice(0, 8)}…`,
        preview: firstAssistant,
        messageCount: msgs.length,
        loaded: true,
      })
    } catch {
      setSummary({ title: `Session ${record.sessionId.slice(0, 8)}…`, preview: '', messageCount: 0, loaded: true })
    }
  }, [record.sessionId, record.createdAt])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  return (
    <motion.div layout variants={item}>
      <button
        onClick={() => onResume(record.sessionId)}
        className="w-full flex items-start gap-4 px-5 py-4 rounded-xl text-left transition-all hover:bg-white/[0.04] active:scale-[0.99] group"
        style={{ border: '1px solid rgba(72,72,71,0.15)', background: '#131313' }}
      >
        <div className="flex-1 min-w-0">
          {/* Title: first user message */}
          {summary.loaded ? (
            <p className="text-on-surface font-body text-sm font-medium truncate group-hover:text-primary transition-colors">
              {summary.title}
            </p>
          ) : (
            <div className="h-4 w-48 rounded bg-surface-container-high animate-pulse" />
          )}

          {/* Preview: first assistant reply */}
          {summary.loaded && summary.preview ? (
            <p className="text-on-surface-variant font-body text-xs mt-1 line-clamp-2 leading-relaxed">
              {summary.preview}
            </p>
          ) : null}

          <div className="flex items-center gap-3 mt-2">
            <span className="text-on-surface-variant font-body text-xs">{formatDate(record.createdAt)}</span>
            {summary.loaded && summary.messageCount > 0 && (
              <span className="text-on-surface-variant font-body text-xs">
                · {summary.messageCount} message{summary.messageCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          {isActive ? (
            <span
              className="text-[10px] font-body font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(253,144,0,0.15)', color: '#fd9000' }}
            >
              Current
            </span>
          ) : (
            <span className="material-symbols-outlined text-base text-on-surface-variant group-hover:text-primary transition-colors">
              arrow_forward
            </span>
          )}
        </div>
      </button>
    </motion.div>
  )
}

export default function HistoryView({ onResumeSession }: { onResumeSession: (id: string) => void }) {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const firebaseReady = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  useEffect(() => {
    const list = getSessionList()
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
              Click any session to resume the conversation.
            </p>
          </motion.div>

          {/* Session list */}
          <motion.div variants={container} animate="animate" className="space-y-3">
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
