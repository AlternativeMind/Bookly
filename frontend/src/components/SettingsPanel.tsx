'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTrace } from '@/lib/trace-context'
import type { Verbosity } from '@/lib/trace-context'

const VERBOSITY_OPTIONS: { value: Verbosity; label: string; description: string }[] = [
  { value: 'low',    label: 'Low',    description: 'Key pipeline events only' },
  { value: 'medium', label: 'Medium', description: 'RAG steps + inference start' },
  { value: 'high',   label: 'High',   description: 'All events including tokens' },
]

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { settings, updateSettings } = useTrace()

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed z-50 w-full max-w-md font-body"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#1a1a1a', border: '1px solid rgba(72,72,71,0.25)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-5"
                style={{ borderBottom: '1px solid rgba(72,72,71,0.15)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">settings</span>
                  <h2 className="font-headline text-lg font-black text-on-surface tracking-tight">Settings</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-on-surface-variant hover:text-on-surface transition-colors"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6 space-y-6">
                {/* Trace Overlay section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary text-xs font-bold uppercase tracking-widest mb-0.5">Trace Overlay</p>
                      <p className="text-on-surface-variant text-xs">
                        Real-time pipeline decisions as dismissible bubbles.
                      </p>
                    </div>
                    {/* Toggle */}
                    <button
                      onClick={() => updateSettings({ enabled: !settings.enabled })}
                      className="relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ml-4"
                      style={{ background: settings.enabled ? '#fd9000' : 'rgba(72,72,71,0.4)' }}
                      aria-label={settings.enabled ? 'Disable trace overlay' : 'Enable trace overlay'}
                    >
                      <span
                        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                        style={{ transform: settings.enabled ? 'translateX(20px)' : 'translateX(0)' }}
                      />
                    </button>
                  </div>

                  {/* Verbosity selector */}
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{
                      border: '1px solid rgba(72,72,71,0.15)',
                      opacity: settings.enabled ? 1 : 0.4,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {VERBOSITY_OPTIONS.map((opt, i) => (
                      <button
                        key={opt.value}
                        disabled={!settings.enabled}
                        onClick={() => updateSettings({ verbosity: opt.value })}
                        className="w-full flex items-center gap-4 px-4 py-3 text-sm text-left transition-colors"
                        style={{
                          background: settings.verbosity === opt.value
                            ? 'rgba(253,144,0,0.12)'
                            : i % 2 === 0 ? '#131313' : '#171717',
                          cursor: settings.enabled ? 'pointer' : 'default',
                        }}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 border-2 flex items-center justify-center transition-colors"
                          style={{
                            borderColor: settings.verbosity === opt.value ? '#fd9000' : 'rgba(72,72,71,0.5)',
                            background: settings.verbosity === opt.value ? '#fd9000' : 'transparent',
                          }}
                        />
                        <span className="text-on-surface font-medium w-16 shrink-0">{opt.label}</span>
                        <span className="text-on-surface-variant">{opt.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
