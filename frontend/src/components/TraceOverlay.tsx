'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTrace } from '@/lib/trace-context'
import type { TraceEvent } from '@/lib/trace-context'

const LEVEL_COLOR: Record<string, string> = {
  low:    'rgba(255,164,76,0.85)',   // primary amber
  medium: 'rgba(100,180,255,0.85)', // blue
  high:   'rgba(180,120,255,0.85)', // purple
}

const LEVEL_DOT: Record<string, string> = {
  low:    '#ffa44c',
  medium: '#64b4ff',
  high:   '#b478ff',
}

function TraceBubble({ event, onDismiss }: { event: TraceEvent; onDismiss: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="flex items-start gap-3 rounded-xl px-4 py-3 font-body text-sm max-w-xs w-full"
      style={{
        background: 'rgba(19,19,19,0.92)',
        border: `1px solid ${LEVEL_COLOR[event.minLevel]}`,
        backdropFilter: 'blur(12px)',
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px ${LEVEL_COLOR[event.minLevel]}22`,
      }}
    >
      {/* Level dot */}
      <span
        className="mt-0.5 shrink-0 w-2 h-2 rounded-full"
        style={{ background: LEVEL_DOT[event.minLevel], boxShadow: `0 0 6px ${LEVEL_DOT[event.minLevel]}` }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-on-surface leading-snug">{event.message}</p>
        {event.detail && (
          <p className="text-on-surface-variant text-xs mt-0.5 leading-snug truncate" title={event.detail}>
            {event.detail}
          </p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={onDismiss}
        className="shrink-0 text-on-surface-variant hover:text-on-surface transition-colors mt-0.5"
        aria-label="Dismiss"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
      </button>
    </motion.div>
  )
}

export default function TraceOverlay() {
  const { traces, dismissTrace, settings } = useTrace()

  if (!settings.enabled || traces.length === 0) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-2 items-end pointer-events-none"
      style={{ maxWidth: '320px' }}
    >
      <AnimatePresence mode="popLayout">
        {traces.map((event) => (
          <div key={event.id} className="pointer-events-auto w-full">
            <TraceBubble event={event} onDismiss={() => dismissTrace(event.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
