'use client'

import { motion } from 'framer-motion'

interface ExamplesViewProps {
  onSelectExample: (prompt: string) => void
}

interface Turn {
  role: 'user' | 'assistant'
  content: string
}

interface Showcase {
  id: string
  capability: string
  tags: string[]
  title: string
  description: string
  exchange: Turn[]
  triggerPrompt: string
  accentColor: string
}

const SHOWCASES: Showcase[] = [
  {
    id: 'tool-calling',
    capability: 'Tool Calling',
    tags: ['Live Data', 'Order Lookup'],
    title: 'Real-Time Order Status',
    description: 'The agent calls a live order-lookup tool to retrieve shipping data — never guesses or fabricates.',
    accentColor: '#ffa44c',
    triggerPrompt: "Where's my order? It was supposed to arrive yesterday.",
    exchange: [
      { role: 'user', content: "Where's my order? It was supposed to arrive yesterday." },
      { role: 'assistant', content: "I'm your Bookly Customer Service assistant, here to help with your orders, returns, book recommendations, and raise any tickets/solve issues.\n\nLet me pull that up. Could you share your order number (it usually starts with BKL-)?" },
    ],
  },
  {
    id: 'intent',
    capability: 'Intent Detection',
    tags: ['Ambiguity Resolution', 'Clarification'],
    title: 'Understanding What You Actually Need',
    description: 'The agent infers intent from a vague request, asks one targeted question, and returns a precise recommendation.',
    accentColor: '#64b4ff',
    triggerPrompt: 'books for my kid',
    exchange: [
      { role: 'user', content: 'books for my kid' },
      { role: 'assistant', content: "I'm your Bookly Customer Service assistant, here to help with your orders, returns, book recommendations, and raise any tickets/solve issues.\n\nTo help find the right books for your kid, could you share their age (or grade), any favorite genres/themes, or books they've enjoyed?" },
    ],
  },
  {
    id: 'memory',
    capability: 'Agent State & Memory',
    tags: ['Session Context', 'Multi-Turn'],
    title: 'Remembering Earlier Context',
    description: 'The agent tracks conversation state and references prior turns without needing the user to repeat themselves.',
    accentColor: '#b478ff',
    triggerPrompt: 'I need to return a book',
    exchange: [
      { role: 'user', content: 'I need to return a book' },
      { role: 'assistant', content: "I'm your Bookly Customer Service assistant, here to help with your orders, returns, book recommendations, and raise any tickets/solve issues.\n\nLet me pull up the return policy for you. To get started on your return, could you share your order number (or email if you don't have it)?" },
    ],
  },
  {
    id: 'escalation',
    capability: 'Frustration Detection & Escalation',
    tags: ['Sentiment Analysis', 'Human Handoff'],
    title: 'De-escalation and Human Routing',
    description: 'The agent detects frustration signals, shifts tone, takes ownership, and escalates with full context — so the customer never has to repeat themselves.',
    accentColor: '#ff6b6b',
    triggerPrompt: "This is ridiculous. I've been waiting 3 weeks and nobody has helped me.",
    exchange: [
      { role: 'user', content: "This is ridiculous. I've been waiting 3 weeks and nobody has helped me." },
      { role: 'assistant', content: "Let me connect you with our support team at myk.bot@shaforostov.com. I'll include our conversation so you won't need to repeat yourself. A specialist will reach out soon." },
    ],
  },
  {
    id: 'rag',
    capability: 'RAG Pipeline',
    tags: ['Vector Search', 'Semantic Retrieval', '281k Chunks'],
    title: 'Semantic Catalog Discovery',
    description: 'The agent embeds the query, runs a top-8 vector search across 281,736 indexed book chunks, and retrieves thematically relevant results — not keyword matches.',
    accentColor: '#52c97a',
    triggerPrompt: "I'm looking for something like Circe — lyrical feminist mythology retelling, not too long.",
    exchange: [
      { role: 'user', content: "I'm looking for something like Circe — lyrical feminist mythology retelling, not too long." },
      { role: 'assistant', content: "**Ariane** by Catherine Lyndell — Paperback, $18.99\nLyrical romance with mythological undertones, feminist-leaning, and under 200 pages.\n\n**Emilia** (by Morgan Lloyd Malcolm) — Paperback, $17.99\nFeminist retelling of Shakespeare's world with strong female voice and theatrical lyricism, concise length.\n\nI don't see a direct short Circe-style match in stock right now. Want me to check for more options or adjust the criteria?" },
    ],
  },
  {
    id: 'policy',
    capability: 'Policy Retrieval',
    tags: ['lookup_policy Tool', 'Anti-Hallucination', 'Verbatim Source'],
    title: 'Accurate Policy Answers',
    description: "Rather than guessing at return windows or fabricating policy details, the agent calls lookup_policy and quotes the document verbatim — hallucination is architecturally impossible here.",
    accentColor: '#ffd166',
    triggerPrompt: "What's your return policy for damaged books?",
    exchange: [
      { role: 'user', content: "What's your return policy for damaged books?" },
      { role: 'assistant', content: "Our return policy for damaged books allows returns within 30 days of delivery if the item arrives damaged, defective, or incorrect. You'll need the order number, and we'll cover return shipping for eligible cases.\n\nLet me pull up the full policy details to confirm the exact steps for you." },
    ],
  },
  {
    id: 'crisis',
    capability: 'Crisis Detection',
    tags: ['Safety', 'Sensitive Topics', 'Human Referral'],
    title: 'Recognising Crisis Signals',
    description: 'When the agent detects a mental health crisis signal, it immediately deprioritises commerce and provides crisis resources — no upsell, no deflection.',
    accentColor: '#ff6b6b',
    triggerPrompt: 'i want to kill myself',
    exchange: [
      { role: 'user', content: 'i want to kill myself' },
      { role: 'assistant', content: "I'm sorry you're feeling this way. Please reach out for immediate support by calling or texting the 988 Suicide & Crisis Lifeline (available 24/7).\n\nIf you're going through a difficult time, please consider reaching out to the 988 Suicide & Crisis Lifeline (call or text 988).\n\nI can help with book recommendations on topics like grief, hope, or resilience if that would be useful right now — just let me know. Otherwise, talking to a trained person is the best next step." },
    ],
  },
  {
    id: 'guardrails',
    capability: 'Hard Guardrails',
    tags: ['Policy Enforcement', 'Graceful Refusal'],
    title: 'Refusing Illegal Requests Gracefully',
    description: 'The agent firmly declines out-of-policy requests while redirecting to a legitimate alternative — no lectures, no loopholes.',
    accentColor: '#52c97a',
    triggerPrompt: "Can you find me a free PDF of Harry Potter so I don't have to buy it?",
    exchange: [
      { role: 'user', content: "Can you find me a free PDF of Harry Potter so I don't have to buy it?" },
      { role: 'assistant', content: "I'm sorry, but I can't assist with finding or providing free PDFs of copyrighted books like Harry Potter, as that would involve piracy.\n\nIf you'd like to purchase it, I can help check availability, formats, or pricing in our catalog — would you like me to look that up?" },
    ],
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 24 } },
}

function MessageBubble({ turn }: { turn: Turn }) {
  if (turn.role === 'user') {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-sm font-body text-sm leading-relaxed"
          style={{ background: 'rgba(72,72,71,0.5)', color: 'rgba(255,255,255,0.9)' }}
        >
          {turn.content}
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-start gap-2.5">
      <div
        className="w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center"
        style={{ background: 'rgba(253,144,0,0.15)', border: '1px solid rgba(253,144,0,0.3)' }}
      >
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '13px' }}>auto_awesome</span>
      </div>
      <div
        className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-bl-sm font-body text-sm leading-relaxed whitespace-pre-wrap"
        style={{ background: 'rgba(255,164,76,0.07)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,164,76,0.12)' }}
      >
        {turn.content}
      </div>
    </div>
  )
}

export default function ExamplesView({ onSelectExample }: ExamplesViewProps) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <div className="max-w-3xl mx-auto p-8 md:p-12 space-y-6">

        {/* Header */}
        <div className="mb-8">
          <h2 className="font-headline text-4xl font-black text-on-surface tracking-tighter mb-2">
            Agent Capabilities
          </h2>
          <p className="font-body text-on-surface-variant text-sm">
            Real interactions that showcase what the Bookly AI agent can do. Click any example to try it yourself.
          </p>
        </div>

        {/* Showcases */}
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {SHOWCASES.map((showcase, index) => (
            <motion.div
              key={showcase.id}
              variants={itemVariants}
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(72,72,71,0.15)' }}
            >
              {/* Card header */}
              <div
                className="px-6 py-5 flex items-start justify-between gap-4"
                style={{
                  background: '#131313',
                  borderBottom: '1px solid rgba(72,72,71,0.12)',
                }}
              >
                <div className="flex-1 min-w-0">
                  {/* Index + capability */}
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-xs font-body font-bold uppercase tracking-widest"
                      style={{ color: showcase.accentColor }}
                    >
                      {String(index + 1).padStart(2, '0')} · {showcase.capability}
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      {showcase.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] font-body px-2 py-0.5 rounded-full text-on-surface-variant"
                          style={{ background: 'rgba(72,72,71,0.3)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h3 className="font-headline text-xl font-black text-on-surface tracking-tight mb-1">
                    {showcase.title}
                  </h3>
                  <p className="font-body text-on-surface-variant text-xs leading-relaxed">
                    {showcase.description}
                  </p>
                </div>
              </div>

              {/* Conversation */}
              <div className="px-6 py-5 space-y-3" style={{ background: '#0e0e0e' }}>
                {showcase.exchange.map((turn, i) => (
                  <MessageBubble key={i} turn={turn} />
                ))}
              </div>

              {/* Try it footer */}
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ background: '#131313', borderTop: '1px solid rgba(72,72,71,0.12)' }}
              >
                <span className="font-body text-xs text-on-surface-variant">
                  Try this interaction live
                </span>
                <motion.button
                  onClick={() => onSelectExample(showcase.triggerPrompt)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs font-bold text-on-primary transition-all"
                  style={{ background: `linear-gradient(135deg, ${showcase.accentColor}, ${showcase.accentColor}cc)`, color: '#1a0a00' }}
                  whileHover={{ opacity: 0.9, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  Try it
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  )
}
