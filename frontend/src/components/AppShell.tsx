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
  const [keyboardOpen, setKeyboardOpen] = useState(false)

  // Hide mobile bottom nav when virtual keyboard is open
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const handler = () => setKeyboardOpen(vv.height < window.innerHeight * 0.75)
    vv.addEventListener('resize', handler)
    return () => vv.removeEventListener('resize', handler)
  }, [])

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

  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const tab = (e as CustomEvent<{ tab: Tab }>).detail?.tab
      if (tab) setActiveTab(tab)
    }
    window.addEventListener('bookly:switch-tab', handleSwitchTab)
    return () => window.removeEventListener('bookly:switch-tab', handleSwitchTab)
  }, [])

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
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onNewChat={handleNewChat} onSettings={() => setSettingsOpen(true)} onSupport={handleSupport} keyboardOpen={keyboardOpen} />

      {/* Main area */}
      <div className="flex-1 md:ml-64 flex flex-col h-screen">
        {/* Top nav */}
        <header
          className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-6 py-4 bg-background/80 backdrop-blur-2xl"
          style={{ borderBottom: '1px solid rgba(72,72,71,0.10)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={handleNewChat}
              className="text-2xl font-black font-headline tracking-tight transition-opacity hover:opacity-80 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #ffa44c, #fd9000)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Bookly AI
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile-only utility icons */}
            <button
              className="md:hidden text-on-surface-variant hover:text-on-surface transition-colors active:scale-95"
              aria-label="Settings"
              onClick={() => setSettingsOpen(true)}
              title="Settings"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
            <button
              className="md:hidden text-on-surface-variant hover:text-on-surface transition-colors active:scale-95"
              aria-label="Support"
              onClick={handleSupport}
              title="Support"
            >
              <span className="material-symbols-outlined">contact_support</span>
            </button>
            <a
              href="https://github.com/AlternativeMind/Bookly/"
              target="_blank"
              rel="noopener noreferrer"
              className="md:hidden text-on-surface-variant hover:text-on-surface transition-colors active:scale-95"
              aria-label="GitHub"
              title="GitHub"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
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
        <div className={`flex-1 flex flex-col pt-16 md:pb-0 overflow-hidden ${keyboardOpen ? 'pb-0' : 'pb-16'}`}>
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
