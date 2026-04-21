'use client'

import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
}

const STACK_TABLE = [
  { layer: 'Frontend', tech: 'Next.js 15 + React 19', purpose: 'App Router SSR + CSR hybrid' },
  { layer: 'Backend API', tech: 'Next.js Route Handlers', purpose: 'SSE streaming endpoints' },
  { layer: 'Vector Store', tech: 'Vertex AI Matching Engine', purpose: 'Semantic search over books' },
  { layer: 'Embeddings', tech: 'text-embedding-004', purpose: 'Dense vector representations' },
  { layer: 'Inference', tech: 'Gemini 1.5 Pro', purpose: 'RAG-augmented generation' },
  { layer: 'Database', tech: 'Firebase Firestore', purpose: 'Session + message persistence' },
]

const PIPELINE_STEPS = [
  'Firecrawl scrapes Scholastic bookstore pages into structured markdown',
  'Metadata extraction: title, author, ISBN, grade level, genre, awards',
  'text-embedding-004 encodes each book record into a 768-dim vector',
  'Vectors upserted to Vertex AI Vector Search index with metadata filters',
  'At query time: user message encoded → nearest-neighbor retrieval (top-k=8)',
  'Retrieved book records injected into Gemini prompt as grounding context',
  'Streaming response delivered via SSE to the frontend chat interface',
]

const COLOR_SWATCHES = [
  { name: 'Background', hex: '#0e0e0e' },
  { name: 'Surface', hex: '#1a1a1a' },
  { name: 'Surface High', hex: '#20201f' },
  { name: 'Surface Highest', hex: '#262626' },
  { name: 'Primary', hex: '#ffa44c' },
  { name: 'Primary Fixed', hex: '#fd9000' },
  { name: 'Secondary', hex: '#feb64c' },
  { name: 'On Surface', hex: '#ffffff' },
  { name: 'On Surface Var', hex: '#adaaaa' },
  { name: 'Outline', hex: '#767575' },
  { name: 'Outline Variant', hex: '#484847' },
]

export default function DesignView() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <motion.div
        className="max-w-3xl mx-auto p-8 md:p-12 space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Title */}
        <motion.div variants={itemVariants}>
          <h1
            className="font-headline text-5xl md:text-6xl font-black tracking-tighter mb-4"
            style={{
              background: 'linear-gradient(135deg, #ffa44c, #fd9000)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Bookly
          </h1>
          <p className="font-headline text-2xl text-on-surface-variant font-bold mb-4">
            Technical Implementation
          </p>
          <p className="font-body text-on-surface-variant leading-relaxed">
            Bookly is an AI-powered bookstore assistant built on a RAG (Retrieval-Augmented
            Generation) pipeline. It ingests the Scholastic catalog, embeds every volume into a
            vector store, and grounds Gemini responses in real bibliographic data — delivering
            precise, hallucination-resistant book recommendations at conversational speed.
          </p>
        </motion.div>

        {/* Architecture table */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 rounded-full bg-primary inline-block"></span>
            <h2 className="font-headline text-xl font-bold text-on-surface">
              Architecture Overview
            </h2>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(72,72,71,0.15)' }}>
            <table className="w-full font-body text-sm">
              <thead>
                <tr className="bg-surface-container-high">
                  <th className="text-left px-5 py-3 text-on-surface-variant font-semibold tracking-wide">Layer</th>
                  <th className="text-left px-5 py-3 text-on-surface-variant font-semibold tracking-wide">Technology</th>
                  <th className="text-left px-5 py-3 text-on-surface-variant font-semibold tracking-wide hidden md:table-cell">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {STACK_TABLE.map((row, i) => (
                  <tr
                    key={row.layer}
                    className="border-t border-outline-variant/15 hover:bg-surface-container-low transition-colors"
                  >
                    <td className="px-5 py-3.5 text-primary font-semibold">{row.layer}</td>
                    <td className="px-5 py-3.5 text-on-surface font-mono text-xs">{row.tech}</td>
                    <td className="px-5 py-3.5 text-on-surface-variant hidden md:table-cell">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Data pipeline */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 rounded-full bg-secondary inline-block"></span>
            <h2 className="font-headline text-xl font-bold text-on-surface">Data Pipeline</h2>
          </div>
          <ol className="space-y-3">
            {PIPELINE_STEPS.map((step, i) => (
              <li key={i} className="flex gap-4 font-body text-sm text-on-surface-variant">
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-on-primary text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #ffa44c, #fd9000)' }}
                >
                  {i + 1}
                </span>
                <span className="leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </motion.section>

        {/* Image placeholder */}
        <motion.section variants={itemVariants}>
          <div className="aspect-video rounded-xl bg-surface-container-high flex flex-col items-center justify-center gap-3"
            style={{ border: '1px solid rgba(72,72,71,0.15)' }}
          >
            <span className="material-symbols-outlined text-on-surface-variant text-5xl">photo_camera</span>
            <p className="text-on-surface-variant font-body text-sm tracking-wide">
              Architecture Diagram — Coming Soon
            </p>
          </div>
        </motion.section>

        {/* Design system */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 rounded-full bg-primary inline-block"></span>
            <h2 className="font-headline text-xl font-bold text-on-surface">Design System</h2>
          </div>
          <p className="font-body text-on-surface-variant text-sm mb-5">
            &ldquo;The Illuminated Archive&rdquo; &mdash; dark obsidian surfaces with vibrant orange accents.
            Background shifts replace borders for visual hierarchy.
          </p>
          <div className="flex flex-wrap gap-3">
            {COLOR_SWATCHES.map((swatch) => (
              <div key={swatch.name} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-10 h-10 rounded-lg"
                  style={{ backgroundColor: swatch.hex, border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <span className="font-body text-[10px] text-on-surface-variant text-center leading-tight max-w-[48px]">
                  {swatch.name}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* API Reference placeholder */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 rounded-full bg-secondary inline-block"></span>
            <h2 className="font-headline text-xl font-bold text-on-surface">API Reference</h2>
          </div>
          <div className="space-y-3">
            {[
              { method: 'POST', path: '/api/validate-passcode', desc: 'Authenticate with session passcode' },
              { method: 'POST', path: '/api/chat', desc: 'Stream AI response via SSE (text/event-stream)' },
            ].map((endpoint) => (
              <div
                key={endpoint.path}
                className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low font-body text-sm"
                style={{ border: '1px solid rgba(72,72,71,0.10)' }}
              >
                <span className="flex-shrink-0 px-2.5 py-1 rounded text-xs font-bold bg-primary/20 text-primary">
                  {endpoint.method}
                </span>
                <span className="font-mono text-on-surface text-xs flex-1">{endpoint.path}</span>
                <span className="text-on-surface-variant hidden sm:block">{endpoint.desc}</span>
              </div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  )
}
