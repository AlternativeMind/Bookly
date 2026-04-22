'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, disabled, onSend])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      const maxHeight = 4 * 24 + 32
      el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div
        className="max-w-4xl mx-auto rounded-3xl bg-surface-container transition-all duration-200 focus-within:border-primary/40"
        style={{ border: '1px solid rgba(72,72,71,0.35)', boxShadow: '0 4px 32px rgba(0,0,0,0.35)' }}
      >
        <div className="flex items-end gap-3 px-5 py-4">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about orders, returns, book recommendations, or open a support ticket..."
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent text-on-surface placeholder-on-surface-variant resize-none outline-none font-body text-sm leading-6 py-1 scrollbar-hide"
            style={{ minHeight: '24px', maxHeight: `${4 * 24 + 32}px` }}
          />

          <div className="flex items-center gap-2 flex-shrink-0 mb-1">
            <button
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Voice input"
            >
              <span className="material-symbols-outlined text-[22px]">mic</span>
            </button>

            <motion.button
              onClick={handleSend}
              disabled={disabled || !value.trim()}
              className="w-9 h-9 rounded-full flex items-center justify-center text-on-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #ffa44c, #fd9000)' }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 16px rgba(255,164,76,0.4)' }}
              whileTap={{ scale: 0.95 }}
              aria-label="Send message"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            </motion.button>
          </div>
        </div>

        <div className="flex items-center gap-4 px-5 pb-3 text-[11px] text-on-surface-variant font-body">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
            Bookly Agent Online
          </span>
        </div>
      </div>
    </div>
  )
}
