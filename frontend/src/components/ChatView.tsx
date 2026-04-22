'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSession } from '@/lib/session'
import MessageBubble, { Message } from './MessageBubble'
import ChatInput from './ChatInput'
import { useTrace } from '@/lib/trace-context'
import type { Verbosity } from '@/lib/trace-context'

const EXAMPLE_CHIPS = [
  'Where is my order?',
  'I want to return a book',
  'Find me a mystery novel for teens',
  'Open a support ticket',
  'What are my loyalty points?',
  'Recommend something like The Martian',
]

export default function ChatView() {
  const { addTrace } = useTrace()
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [firebaseReady, setFirebaseReady] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const historyLoadedRef = useRef(false)

  // Helpers for local (non-Firebase) message state
  const addMessageLocal = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message])
  }, [])

  const updateMessageLocal = useCallback((id: string, content: string, streaming: boolean) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content, isStreaming: streaming } : m))
    )
  }, [])

  const streamLocalResponse = useCallback(
    async (text: string, assistantMsgId: string, currentSessionId: string | null) => {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, sessionId: currentSessionId }),
        })

        let accumulated = ''
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6).trim()
              if (data === '[DONE]' || data === '[ERROR]') continue

              try {
                const parsed = JSON.parse(data) as { token: string }
                accumulated += parsed.token
                updateMessageLocal(assistantMsgId, accumulated, true)
              } catch {
                // skip malformed SSE lines
              }
            }
          }
          updateMessageLocal(assistantMsgId, accumulated, false)
        }
      } catch {
        updateMessageLocal(
          assistantMsgId,
          'I encountered an error processing your request. Please try again.',
          false
        )
      }
    },
    [updateMessageLocal]
  )

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return

      const userMsgId = crypto.randomUUID()
      const assistantMsgId = crypto.randomUUID()

      const userMessage: Message = {
        id: userMsgId,
        role: 'user',
        content: text,
        timestamp: Date.now(),
      }

      const assistantPlaceholder: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now() + 1,
        isStreaming: true,
      }

      setIsStreaming(true)

      // Block any pending Firebase onSnapshot from overwriting in-flight state.
      // If the first snapshot fires after this point, we don't want it clobbering
      // the userMsg + assistantPlaceholder we're about to add.
      historyLoadedRef.current = true

      // Always show messages locally immediately — never rely on onSnapshot for display
      addMessageLocal(userMessage)
      addMessageLocal(assistantPlaceholder)

      // Persist user message to Firestore — fire-and-forget
      if (firebaseReady && sessionId) {
        const messagesRef = collection(db, 'sessions', sessionId, 'messages')
        addDoc(messagesRef, {
          role: 'user',
          content: text,
          timestamp: serverTimestamp(),
          isComplete: true,
        }).catch(() => null)
      }

      // Stream the response — always against local assistantMsgId
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, sessionId }),
        })

        let accumulated = ''
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6).trim()
              if (data === '[DONE]' || data === '[ERROR]') continue

              try {
                const parsed = JSON.parse(data) as { token?: string; trace?: boolean; level?: Verbosity; message?: string; detail?: string }
                if (parsed.trace && parsed.level && parsed.message) {
                  addTrace({ message: parsed.message, detail: parsed.detail, minLevel: parsed.level })
                } else if (parsed.token) {
                  accumulated += parsed.token
                  updateMessageLocal(assistantMsgId, accumulated, true)
                }
              } catch {
                // skip malformed SSE lines
              }
            }
          }
          updateMessageLocal(assistantMsgId, accumulated, false)
          setIsStreaming(false)

          // Persist completed assistant message as a single write — no placeholder/updateDoc
          if (firebaseReady && sessionId && accumulated) {
            const messagesRef = collection(db, 'sessions', sessionId, 'messages')
            addDoc(messagesRef, {
              role: 'assistant',
              content: accumulated,
              timestamp: serverTimestamp(),
              isComplete: true,
            }).catch(() => null)
          }
        }
      } catch {
        updateMessageLocal(
          assistantMsgId,
          'I encountered an error processing your request. Please try again.',
          false
        )
        setIsStreaming(false)
      }
    },
    [isStreaming, firebaseReady, sessionId, addMessageLocal, updateMessageLocal, addTrace]
  )

  // Resolve sessionId on mount
  useEffect(() => {
    const session = getSession()
    if (session?.sessionId) {
      setSessionId(session.sessionId)
    }
  }, [])

  // Set up Firestore listener when sessionId is available
  useEffect(() => {
    if (!sessionId) return

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    if (!projectId) {
      setFirebaseReady(false)
      return
    }

    setFirebaseReady(true)

    const messagesRef = collection(db, 'sessions', sessionId, 'messages')
    const q = query(messagesRef, orderBy('timestamp', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Only hydrate from Firestore once on initial load (prior session history).
        // After that, local state is authoritative to avoid stomping on active streams.
        if (historyLoadedRef.current) return
        historyLoadedRef.current = true

        const msgs: Message[] = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data()
            return {
              id: docSnap.id,
              role: data.role as 'user' | 'assistant',
              content: data.content as string,
              timestamp:
                data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : Date.now(),
              isStreaming: false,
              isComplete: data.isComplete as boolean | undefined,
            }
          })
          .filter((m) => m.content.length > 0)

        if (msgs.length > 0) setMessages(msgs)
      },
      () => {
        setFirebaseReady(false)
      }
    )

    unsubscribeRef.current = unsubscribe
    return () => unsubscribe()
  }, [sessionId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Listen for prompt events from ExamplesView (dispatched via AppShell)
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt: string }>
      if (customEvent.detail?.prompt) {
        sendMessage(customEvent.detail.prompt)
      }
    }
    window.addEventListener('bookly:send-prompt', handler)
    return () => window.removeEventListener('bookly:send-prompt', handler)
  }, [sendMessage])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-hide p-8 md:p-12 max-w-4xl mx-auto w-full pb-4">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="text-center py-8 md:py-16"
            >
              <h1 className="font-headline text-4xl md:text-5xl font-black text-on-surface tracking-tighter mb-6">
                Welcome to <em className="not-italic text-primary">Myk&apos;s</em> Bookly Customer Service AI Bot!
              </h1>
              <p className="text-on-surface-variant text-base max-w-2xl mx-auto font-body mb-3">
                Track orders, process returns, check loyalty points, get book recommendations, or raise a support ticket — all in one place.
              </p>
              <div className="hidden md:block">
                <p className="text-on-surface-variant text-sm max-w-2xl mx-auto font-body mb-10">
                  Try one of these or ask anything:
                </p>

                <div className="flex flex-wrap gap-3 justify-center">
                  {EXAMPLE_CHIPS.map((chip) => (
                    <motion.button
                      key={chip}
                      onClick={() => sendMessage(chip)}
                      className="px-5 py-2.5 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface text-sm font-body transition-all"
                      style={{ border: '1px solid rgba(72,72,71,0.15)' }}
                      whileHover={{ scale: 1.02, backgroundColor: '#262626' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {chip}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  )
}
