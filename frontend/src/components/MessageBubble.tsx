'use client'

import { motion } from 'framer-motion'
import clsx from 'clsx'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
  isStreaming?: boolean
  isComplete?: boolean
}

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={clsx('flex gap-6 items-start', !isAssistant && 'justify-end')}
    >
      {isAssistant && (
        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0"
          style={{ border: '1px solid rgba(72,72,71,0.15)' }}
        >
          <span
            className="material-symbols-outlined text-primary text-xl"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            auto_awesome
          </span>
        </div>
      )}

      <div
        className={clsx(
          'p-6 rounded-2xl leading-relaxed font-body text-on-surface',
          isAssistant
            ? 'bg-surface-container-low max-w-2xl border-l-2 border-primary/40'
            : 'bg-surface-container-high max-w-xl border border-outline-variant/10'
        )}
      >
        <p className="whitespace-pre-wrap">
          {message.content}
          {message.isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block ml-0.5 text-primary font-bold"
            >
              |
            </motion.span>
          )}
        </p>
      </div>

      {!isAssistant && (
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-xl">person</span>
        </div>
      )}
    </motion.div>
  )
}
