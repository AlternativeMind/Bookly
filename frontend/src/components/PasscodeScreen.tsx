'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { setSession, generateSessionId } from '@/lib/session'

export default function PasscodeScreen() {
  const router = useRouter()
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passcode || loading) return

    setLoading(true)
    setError(false)
    setErrorMessage('')

    try {
      const res = await fetch('/api/validate-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      })

      if (res.ok) {
        const sessionId = generateSessionId()
        setSession(sessionId)
        router.replace('/chat')
      } else {
        setError(true)
        setErrorMessage('Access denied. Invalid passcode.')
        setPasscode('')
        setTimeout(() => setError(false), 600)
      }
    } catch {
      setError(true)
      setErrorMessage('Connection error. Please try again.')
      setTimeout(() => setError(false), 600)
    } finally {
      setLoading(false)
    }
  }

  const shakeVariants = {
    idle: { x: 0 },
    shake: {
      x: [0, -10, 10, -10, 10, -6, 6, -3, 3, 0],
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.h1
            className="font-headline text-5xl font-black mb-3"
            style={{
              background: 'linear-gradient(135deg, #ffa44c, #fd9000)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
          >
            Bookly AI
          </motion.h1>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            animate={error ? 'shake' : 'idle'}
            variants={shakeVariants}
            className="mb-6"
          >
            <motion.input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode"
              maxLength={10}
              className="w-full bg-surface-container-low text-on-surface placeholder-on-surface-variant text-center text-xl tracking-widest font-headline rounded-xl px-6 py-4 outline-none transition-all duration-200"
              style={{
                border: '1px solid rgba(72,72,71,0.15)',
              }}
              whileFocus={{
                scale: 1.01,
                borderColor: 'rgba(255,164,76,0.5)',
                boxShadow: '0 0 0 2px rgba(255,164,76,0.15)',
              }}
              disabled={loading}
              autoFocus
            />
          </motion.div>

          <AnimatePresence>
            {errorMessage && (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-error text-sm text-center mb-4 font-body"
              >
                {errorMessage}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading || passcode.length === 0}
            className="w-full py-4 px-6 rounded-full font-body font-bold text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: '#1a0a00', background: 'linear-gradient(135deg, #ffa44c, #fd9000)' }}
            whileHover={{ opacity: 0.9 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm animate-spin">autorenew</span>
                Verifying...
              </span>
            ) : (
              'Enter The Archive'
            )}
          </motion.button>
        </motion.form>

        <motion.p
          className="text-center text-on-surface-variant text-xs mt-8 font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          281,736 volumes indexed and ready
        </motion.p>
      </motion.div>
    </div>
  )
}
