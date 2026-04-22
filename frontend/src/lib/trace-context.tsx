'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'

export type Verbosity = 'low' | 'medium' | 'high'

export interface TraceEvent {
  id: string
  message: string
  detail?: string
  minLevel: Verbosity
  timestamp: number
}

export interface TraceSettings {
  enabled: boolean
  verbosity: Verbosity
}

interface TraceContextValue {
  settings: TraceSettings
  updateSettings: (patch: Partial<TraceSettings>) => void
  traces: TraceEvent[]
  addTrace: (event: Omit<TraceEvent, 'id' | 'timestamp'>) => void
  dismissTrace: (id: string) => void
}

const LEVEL_ORDER: Record<Verbosity, number> = { low: 0, medium: 1, high: 2 }
const STORAGE_KEY = 'bookly_trace_settings'
const AUTO_DISMISS_MS = 10000
const DEFAULT_SETTINGS: TraceSettings = { enabled: true, verbosity: 'high' }

const TraceContext = createContext<TraceContextValue | null>(null)

export function TraceProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TraceSettings>(DEFAULT_SETTINGS)
  const [traces, setTraces] = useState<TraceEvent[]>([])
  const settingsRef = useRef(settings)

  // Keep ref in sync so addTrace always sees latest settings without being in deps
  useEffect(() => { settingsRef.current = settings }, [settings])

  // Hydrate from localStorage on mount; disable trace by default on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<TraceSettings>
        setSettings(prev => ({ ...prev, ...parsed }))
      } else if (isMobile) {
        setSettings(prev => ({ ...prev, enabled: false }))
      }
    } catch { /* ignore */ }
  }, [])

  const updateSettings = useCallback((patch: Partial<TraceSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  const dismissTrace = useCallback((id: string) => {
    setTraces(prev => prev.filter(t => t.id !== id))
  }, [])

  const addTrace = useCallback((event: Omit<TraceEvent, 'id' | 'timestamp'>) => {
    const { enabled, verbosity } = settingsRef.current
    if (!enabled) return
    if (LEVEL_ORDER[event.minLevel] > LEVEL_ORDER[verbosity]) return

    const id = crypto.randomUUID()
    const newTrace: TraceEvent = { ...event, id, timestamp: Date.now() }

    setTraces(prev => [...prev, newTrace])
    setTimeout(() => dismissTrace(id), AUTO_DISMISS_MS)
  }, [dismissTrace])

  return (
    <TraceContext.Provider value={{ settings, updateSettings, traces, addTrace, dismissTrace }}>
      {children}
    </TraceContext.Provider>
  )
}

export function useTrace() {
  const ctx = useContext(TraceContext)
  if (!ctx) throw new Error('useTrace must be used within TraceProvider')
  return ctx
}
