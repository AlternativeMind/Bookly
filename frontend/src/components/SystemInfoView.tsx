'use client'

import { motion } from 'framer-motion'
import { SYSTEM_PROMPT } from '@/lib/system-prompt'

const container = {
  animate: { transition: { staggerChildren: 0.07 } },
}
const item = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
}

export default function SystemInfoView() {
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
              System Info
            </h1>
            <p className="text-on-surface-variant font-body text-sm">
              Configuration and system prompt for the Bookly AI assistant.
            </p>
          </motion.div>

          {/* System prompt */}
          <motion.div variants={item} className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-primary text-xs font-body font-bold uppercase tracking-widest">System Prompt</span>
              <span
                className="text-[10px] font-body px-2 py-0.5 rounded-full text-on-surface-variant"
                style={{ background: 'rgba(72,72,71,0.3)' }}
              >
                Live
              </span>
            </div>
            <pre
              className="font-body text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap rounded-xl p-6 overflow-y-auto"
              style={{
                background: '#131313',
                border: '1px solid rgba(72,72,71,0.15)',
                maxHeight: '40vh',
              }}
            >
              {SYSTEM_PROMPT}
            </pre>
          </motion.div>

          {/* Model config table */}
          <motion.div variants={item} className="space-y-3">
            <p className="text-primary text-xs font-body font-bold uppercase tracking-widest mb-3">Model Configuration</p>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(72,72,71,0.15)' }}
            >
              {[
                { key: 'Inference Model', value: 'Grok 4.1 Fast (Non-Reasoning)' },
                { key: 'Embedding Model', value: 'Vertex AI Text Embeddings' },
                { key: 'Vector Store', value: 'Vertex AI Vector Search — bookly-index' },
                { key: 'Indexed Documents', value: '281,736 book chunks' },
                { key: 'Retrieval Strategy', value: 'RAG — top-k semantic search' },
                { key: 'Streaming', value: 'SSE (Server-Sent Events)' },
              ].map((row, i) => (
                <div
                  key={row.key}
                  className="flex items-center px-5 py-3 font-body text-sm"
                  style={{
                    background: i % 2 === 0 ? '#131313' : '#1a1a1a',
                  }}
                >
                  <span className="text-on-surface-variant w-48 shrink-0">{row.key}</span>
                  <span className="text-on-surface">{row.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Environment */}
          <motion.div variants={item} className="space-y-3">
            <p className="text-primary text-xs font-body font-bold uppercase tracking-widest mb-3">Environment</p>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(72,72,71,0.15)' }}
            >
              {[
                { key: 'GCP Project', value: 'myk-bot' },
                { key: 'Hosting', value: 'Cloud Run (us-central1)' },
                { key: 'Database', value: 'Firebase Firestore' },
                { key: 'Domain', value: 'myk.bot' },
              ].map((row, i) => (
                <div
                  key={row.key}
                  className="flex items-center px-5 py-3 font-body text-sm"
                  style={{
                    background: i % 2 === 0 ? '#131313' : '#1a1a1a',
                  }}
                >
                  <span className="text-on-surface-variant w-48 shrink-0">{row.key}</span>
                  <span className="text-on-surface">{row.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
