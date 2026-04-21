'use client'

import { motion } from 'framer-motion'

const container = {
  animate: { transition: { staggerChildren: 0.06 } },
}
const item = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
}

export default function HistoryView() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-8 md:p-12">
      <div className="max-w-3xl mx-auto">
        <motion.div
          variants={container}
          initial="initial"
          animate="animate"
          className="space-y-10"
        >
          {/* Header */}
          <motion.div variants={item}>
            <h1 className="font-headline text-4xl font-black text-on-surface tracking-tighter mb-2">
              Chat History
            </h1>
            <p className="text-on-surface-variant font-body text-sm">
              Your previous sessions will appear here once Firebase is connected.
            </p>
          </motion.div>

          {/* Placeholder sessions */}
          <motion.div variants={item} className="space-y-3">
            {[
              { title: 'Book recommendations for ages 8–10', date: 'Today', preview: 'Can you suggest some adventure books...' },
              { title: 'Award-winning books 2023', date: 'Yesterday', preview: 'What books won the most awards last year...' },
              { title: 'Return request — Order #48821', date: '2 days ago', preview: 'I would like to return a damaged copy of...' },
            ].map((session) => (
              <motion.div
                key={session.title}
                whileHover={{ x: 4 }}
                className="flex items-start justify-between p-5 rounded-xl cursor-pointer transition-colors"
                style={{ background: '#131313', border: '1px solid rgba(72,72,71,0.15)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-on-surface font-body font-semibold text-sm truncate mb-1">
                    {session.title}
                  </p>
                  <p className="text-on-surface-variant font-body text-xs truncate">
                    {session.preview}
                  </p>
                </div>
                <span className="text-on-surface-variant font-body text-xs ml-4 mt-0.5 shrink-0">
                  {session.date}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Coming soon callout */}
          <motion.div
            variants={item}
            className="rounded-xl p-6 text-center"
            style={{ background: 'rgba(255,164,76,0.06)', border: '1px solid rgba(255,164,76,0.15)' }}
          >
            <span className="material-symbols-outlined text-primary text-3xl mb-3 block">history</span>
            <p className="text-on-surface-variant font-body text-sm">
              Live session history will sync here from Firestore once Firebase credentials are configured.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
