'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSession } from '@/lib/session'

interface MessageSnap {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const container = {
  animate: { transition: { staggerChildren: 0.06 } },
}
const item = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
}

function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function HistoryView() {
  const [messages, setMessages] = useState<MessageSnap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const session = getSession()
    if (!session?.sessionId) { setLoading(false); return }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    if (!projectId) { setLoading(false); return }

    const messagesRef = collection(db, 'sessions', session.sessionId, 'messages')
    const q = query(messagesRef, orderBy('timestamp', 'asc'))

    const unsub = onSnapshot(
      q,
      (snap) => {
        const msgs: MessageSnap[] = snap.docs
          .map((d) => {
            const data = d.data()
            return {
              id: d.id,
              role: data.role as 'user' | 'assistant',
              content: data.content as string,
              timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : Date.now(),
            }
          })
          .filter((m) => m.content?.length > 0 && m.role === 'user' || m.content?.length > 0 && m.role === 'assistant')
        setMessages(msgs)
        setLoading(false)
      },
      () => {
        setError(true)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-8 md:p-12">
      <div className="max-w-3xl mx-auto">
        <motion.div
          variants={container}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={item}>
            <h1 className="font-headline text-4xl font-black text-on-surface tracking-tighter mb-2">
              Chat History
            </h1>
            <p className="text-on-surface-variant font-body text-sm">
              This session&apos;s conversation, synced from Firestore.
            </p>
          </motion.div>

          {/* States */}
          {loading && (
            <motion.div variants={item} className="flex items-center gap-3 text-on-surface-variant font-body text-sm">
              <span className="material-symbols-outlined animate-spin text-base">autorenew</span>
              Loading history…
            </motion.div>
          )}

          {!loading && error && (
            <motion.div variants={item} className="rounded-xl p-5 font-body text-sm text-on-surface-variant"
              style={{ background: '#131313', border: '1px solid rgba(72,72,71,0.15)' }}>
              Could not load history. Check your connection and try again.
            </motion.div>
          )}

          {!loading && !error && messages.length === 0 && (
            <motion.div variants={item} className="rounded-xl p-6 text-center"
              style={{ background: 'rgba(255,164,76,0.06)', border: '1px solid rgba(255,164,76,0.15)' }}>
              <span className="material-symbols-outlined text-primary text-3xl mb-3 block">chat_bubble</span>
              <p className="text-on-surface-variant font-body text-sm">
                No messages yet. Start a conversation in the Chat tab.
              </p>
            </motion.div>
          )}

          {!loading && !error && messages.length > 0 && (
            <motion.div variants={item} className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex gap-4 px-5 py-4 rounded-xl font-body text-sm"
                  style={{
                    background: msg.role === 'user' ? '#1a1a1a' : '#131313',
                    border: '1px solid rgba(72,72,71,0.12)',
                  }}
                >
                  <span
                    className="shrink-0 text-xs font-bold uppercase tracking-widest mt-0.5 w-16"
                    style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.35)' : '#fd9000' }}
                  >
                    {msg.role === 'user' ? 'You' : 'Bookly'}
                  </span>
                  <p className="text-on-surface leading-relaxed flex-1 whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-on-surface-variant text-xs shrink-0 mt-0.5">{formatTime(msg.timestamp)}</span>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
