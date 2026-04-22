'use client'

import { motion } from 'framer-motion'
import clsx from 'clsx'
import ReactMarkdown from 'react-markdown'

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
      className={clsx('flex gap-3 md:gap-6 items-start w-full min-w-0', !isAssistant && 'justify-end')}
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
          'p-4 md:p-6 rounded-2xl leading-relaxed font-body text-on-surface min-w-0',
          isAssistant
            ? 'bg-surface-container-low max-w-2xl border-l-2 border-primary/40'
            : 'bg-surface-container-high max-w-[85%] md:max-w-xl border border-outline-variant/10'
        )}
      >
        {isAssistant ? (
          <div className="text-sm">
            <ReactMarkdown
              components={{
                p:      ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                em:     ({ children }) => <em className="italic text-on-surface-variant">{children}</em>,
                ul:     ({ children }) => <ul className="list-disc list-outside pl-4 mb-3 space-y-1">{children}</ul>,
                ol:     ({ children }) => <ol className="list-decimal list-outside pl-4 mb-3 space-y-1">{children}</ol>,
                li:     ({ children }) => <li className="leading-relaxed">{children}</li>,
                h1:     ({ children }) => <h1 className="font-headline font-semibold text-base mb-2 mt-1">{children}</h1>,
                h2:     ({ children }) => <h2 className="font-headline font-semibold mb-2 mt-1">{children}</h2>,
                h3:     ({ children }) => <h3 className="font-semibold mb-1 mt-1">{children}</h3>,
                code:   ({ children }) => (
                  <code className="px-1 py-0.5 rounded bg-surface-container-high font-mono text-xs text-primary">
                    {children}
                  </code>
                ),
                hr:     () => <hr className="border-outline-variant/20 my-3" />,
              }}
            >
              {message.content}
            </ReactMarkdown>
            {message.isStreaming && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block ml-0.5 text-primary font-bold"
              >
                |
              </motion.span>
            )}
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm">
            {message.content}
          </p>
        )}
      </div>

      {!isAssistant && (
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-xl">person</span>
        </div>
      )}
    </motion.div>
  )
}
