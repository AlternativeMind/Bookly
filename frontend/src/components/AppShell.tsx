'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import ChatView from './ChatView'
import DesignView from './DesignView'
import ExamplesView from './ExamplesView'
import HistoryView from './HistoryView'
import SystemInfoView from './SystemInfoView'
import TraceOverlay from './TraceOverlay'
import SettingsPanel from './SettingsPanel'
import { TraceProvider } from '@/lib/trace-context'
import { clearSession, getSession, setSession, generateSessionId, addToSessionList } from '@/lib/session'
import { useRouter } from 'next/navigation'

type Tab = 'chat' | 'design' | 'examples' | 'history' | 'system'

const tabVariants = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, x: -8, transition: { duration: 0.15 } },
}

export default function AppShell() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [chatKey, setChatKey] = useState(0)
  const [authorized, setAuthorized] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    const session = getSession()
    if (!session?.sessionId) {
      router.replace('/')
    } else {
      // Register the current session in history if not already there
      addToSessionList(session.sessionId)
      setAuthorized(true)
    }
  }, [router])

  const handleNewChat = useCallback(() => {
    const newSessionId = generateSessionId()
    setSession(newSessionId)
    addToSessionList(newSessionId)
    setActiveTab('chat')
    setChatKey((k) => k + 1)
  }, [])

  const handleSupport = useCallback(() => {
    setActiveTab('chat')
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('bookly:send-prompt', {
        detail: { prompt: 'I would like some support and open a support ticket' },
      }))
    }, 200)
  }, [])

  const handleResumeSession = useCallback((sessionId: string) => {
    setSession(sessionId)
    setActiveTab('chat')
    setChatKey((k) => k + 1)
  }, [])

  const handleSelectExample = useCallback((prompt: string) => {
    setActiveTab('chat')
    // Small delay to let tab transition complete before the message sends
    setTimeout(() => {
      // We dispatch a custom event that ChatView listens for
      window.dispatchEvent(new CustomEvent('bookly:send-prompt', { detail: { prompt } }))
    }, 200)
  }, [])

  const handleSignOut = () => {
    clearSession()
    router.replace('/')
  }

  if (!authorized) return null

  return (
    <TraceProvider>
    <div className="flex h-screen bg-background text-on-surface font-body">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onNewChat={handleNewChat} onSettings={() => setSettingsOpen(true)} onSupport={handleSupport} />

      {/* Main area */}
      <div className="flex-1 md:ml-64 flex flex-col h-screen">
        {/* Top nav */}
        <header
          className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-6 py-4 bg-background/80 backdrop-blur-2xl"
          style={{ borderBottom: '1px solid rgba(72,72,71,0.10)' }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-2xl font-black font-headline tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #ffa44c, #fd9000)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Bookly AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="text-on-surface-variant hover:text-on-surface transition-colors active:scale-95"
              aria-label="Account"
              onClick={handleSignOut}
              title="Sign out"
            >
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col pt-16 pb-16 md:pb-0 overflow-hidden">
          {/*
            ChatView stays mounted at all times so in-memory message state survives
            tab switches. We hide/show it with CSS only — never unmount it.
            chatKey increment (New Chat) is the only way to truly reset it.
          */}
          <div
            key={chatKey}
            className="flex-1 flex flex-col overflow-hidden"
            style={{ display: activeTab === 'chat' ? 'flex' : 'none' }}
          >
            <ChatView />
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'design' && (
              <motion.div
                key="design"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col overflow-hidden"
              >
                <DesignView />
              </motion.div>
            )}

            {activeTab === 'examples' && (
              <motion.div
                key="examples"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col overflow-hidden"
              >
                <ExamplesView onSelectExample={handleSelectExample} />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col overflow-hidden"
              >
                <HistoryView onResumeSession={handleResumeSession} />
              </motion.div>
            )}

            {activeTab === 'system' && (
              <motion.div
                key="system"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col overflow-hidden"
              >
                <SystemInfoView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <TraceOverlay />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
    </TraceProvider>
  )
}
