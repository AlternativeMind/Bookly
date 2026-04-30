'use client'

import { useState } from 'react'

// ── Version definitions ───────────────────────────────────────────────────────

interface Version {
  id: string
  label: string
  date: string
  tag?: string
  nodes: number
  tools: number
  logic: string
}

const VERSIONS: Version[] = [
  {
    id: 'v2.1-beta',
    label: 'v2.1 — beta',
    date: 'Apr 28 2026',
    tag: 'beta',
    nodes: 4,
    tools: 7,
    logic: `CONVERSATION LOGIC — Bookly Agent v2.1 (beta)
════════════════════════════════════════════════════════════════════════

  PROPOSED CHANGE IN THIS VERSION
  A new "summarise" step has been added between the book search and the
  AI response. When a conversation is very long, this step condenses the
  history before passing it to the AI — reducing cost and improving focus.


STEP 1 — CLASSIFY  (unchanged from v2.0)
─────────────────────────────────────────
Read the incoming message and decide what to do next.

  IF the message contains legal language  →  hand off to human immediately (HIGH priority)
     Triggers: sue, lawsuit, lawyer, court, chargeback, dispute, attorney, ombudsman

  IF the message is ALL CAPS or sounds angry  →  hand off to human (MEDIUM priority)
     Triggers: scam, fraud, useless, ridiculous, incompetent, outrageous

  IF the message is about an order or delivery  →  skip book search, go to summarise
     Triggers: order, shipping, tracking, delivery, dispatch, package

  IF the message is about returns or refunds  →  skip book search, go to summarise
     Triggers: return, refund, exchange, wrong item, damaged, defective

  EVERYTHING ELSE  →  run book search, then summarise


STEP 2 — BOOK SEARCH  (only when needed)
──────────────────────────────────────────
Search the book catalog for titles and passages relevant to the user's question.
Skipped for order / return / escalation paths to save time (~500ms).


STEP 3 — SUMMARISE  ★ NEW IN v2.1
────────────────────────────────────
If the conversation history is longer than 10 exchanges, condense it into
a short summary before passing it to the AI. This keeps the AI focused and
reduces the cost of each response.

  Skip this step if: the conversation is fewer than 10 exchanges old.


STEP 4 — GENERATE RESPONSE
────────────────────────────
The AI composes a reply and may use any of these tools:

  • Check order status          — look up shipping / delivery info
  • Search book catalog         — find titles, authors, or passages
  • Look up store policy        — returns, refunds, memberships
  • Find similar readers        — reading group suggestions
  • Submit a return request     — initiate a return on behalf of the user
  • Escalate to human agent     — hand off with a summary
  • Check venue availability    — ★ NEW: real-time seat / slot availability

  The AI will try up to 5 tool rounds before giving a final answer.
  All responses are scanned for sensitive data before being sent.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WANT TO MAKE A CHANGE?  Fill in the relevant section below and
  hand it to engineering. You don't need to touch any code.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


[ ADD A NEW STEP ]
───────────────────────────────────────────────────────────────────────
A "step" is a box in the flow diagram. Adding one means the agent does
something new before or after an existing step.

  1. What should this step do?
     Write it in one sentence.
     e.g. "Check if the user is a premium member before responding"

  2. When should it run?
     ○  Always, for every conversation
     ○  Only when the previous step produces a specific result — describe it:
        e.g. "Only when the conversation history is more than 10 messages long"
     ○  Only for a specific type of question — describe it:
        e.g. "Only when the user is asking about events or venues"

  3. Where does it sit in the flow?
     ○  Between CLASSIFY and BOOK SEARCH
     ○  Between BOOK SEARCH and GENERATE
     ○  Between SUMMARISE and GENERATE    (v2.1+ only)
     ○  Other — describe: ________________________________

  4. What information does it need to do its job?
     e.g. "The user's account ID and the current date"

  5. What does it hand off to the next step?
     e.g. "A yes/no flag: is the user premium?"

  Your answer:
  ┌─────────────────────────────────────────────────────────────────┐
  │                                                                 │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘


[ ADD A NEW TOOL ]
───────────────────────────────────────────────────────────────────────
A "tool" is something the AI can reach for mid-response — like looking
up an order or checking a policy. Adding one means the AI can now take
a new action or look something up when it decides it needs to.

  1. What is the tool called?
     Use a short, plain name.
     e.g. "Check membership status"  or  "Look up venue capacity"

  2. What does it do — in one sentence?
     e.g. "Looks up whether the user has an active premium membership"

  3. What information does it need to run?
     These are the inputs the AI must have before it can use this tool.
     e.g. "The user's email address"  or  "A booking reference number"

  4. What does it give back?
     Describe the result in plain English.
     e.g. "Active / Expired / Not found"
     e.g. "A list of available time slots for that day"

  5. When should the AI decide to use it?
     Describe the situation, not the code.
     e.g. "When a user asks about member discounts or premium access"
     e.g. "When a user wants to know if a specific date is available"

  Your answer:
  ┌─────────────────────────────────────────────────────────────────┐
  │                                                                 │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘


[ ADD A TRIGGER WORD ]
───────────────────────────────────────────────────────────────────────
Trigger words cause the agent to skip normal processing and act
immediately — usually to hand off to a human.

  Which list should the word go in?
  ○  Legal language  (immediately escalates — HIGH priority)
     Current words: sue, lawsuit, lawyer, court, chargeback, dispute, ombudsman
     Word(s) to add: ________________________________

  ○  Frustration signals  (escalates — MEDIUM priority)
     Current words: scam, fraud, useless, ridiculous, incompetent, outrageous
     Word(s) to add: ________________________________


[ CHANGE A LIMIT ]
───────────────────────────────────────────────────────────────────────
  Max tool rounds per response   →  currently 5   change to: ____
     (higher = can do more complex tasks, but slower)

  Summarise after N exchanges    →  currently 10  change to: ____
     (lower = summarises sooner; higher = keeps more raw history)`,
  },
  {
    id: 'v2.0',
    label: 'v2.0 — current',
    date: 'Apr 10 2026',
    tag: 'live',
    nodes: 3,
    tools: 6,
    logic: `CONVERSATION LOGIC — Bookly Agent v2.0  ← CURRENT LIVE VERSION
════════════════════════════════════════════════════════════════════════

STEP 1 — CLASSIFY
──────────────────
Read the incoming message and decide what to do next.

  IF the message contains legal language  →  hand off to human immediately (HIGH priority)
     Triggers: sue, lawsuit, lawyer, court, chargeback, dispute, attorney, legal action

  IF the message is ALL CAPS or sounds angry  →  hand off to human (MEDIUM priority)
     Triggers: scam, fraud, useless, ridiculous, incompetent, outrageous

  IF the message is about an order or delivery  →  skip book search, answer directly
     Triggers: order, shipping, tracking, delivery, dispatch, package, "where's my"

  IF the message is about returns or refunds  →  skip book search, answer directly
     Triggers: return, refund, exchange, wrong item, damaged, defective, send back

  EVERYTHING ELSE  →  run the book search first, then answer


STEP 2 — BOOK SEARCH  (only when needed)
──────────────────────────────────────────
Search the book catalog for titles and passages relevant to the user's question.
Skipped for order / return / escalation paths to save ~500ms per request.


STEP 3 — GENERATE RESPONSE
────────────────────────────
The AI (Grok) composes a reply. During this step it may use tools:

  • Check order status          — look up shipping and delivery information
  • Search book catalog         — find titles, authors, or specific passages
  • Look up store policy        — returns, refunds, membership terms
  • Find similar readers        — suggest reading groups or peer recommendations
  • Submit a return request     — initiate a return on behalf of the user
  • Escalate to human agent     — transfer with a summary of the conversation

  Maximum 5 tool rounds per response. After that, the AI gives its best answer.
  All outgoing responses are scanned for card numbers, SSNs, and injection attempts.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WANT TO MAKE A CHANGE?  Fill in the relevant section below and
  hand it to engineering. You don't need to touch any code.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


[ ADD A NEW STEP ]
───────────────────────────────────────────────────────────────────────
A "step" is a box in the flow diagram. Adding one means the agent does
something new before or after an existing step.

  1. What should this step do?
     Write it in one sentence.
     e.g. "Check if the user is a premium member before responding"

  2. When should it run?
     ○  Always, for every conversation
     ○  Only when the previous step produces a specific result — describe it:
        e.g. "Only when the conversation history is more than 10 messages long"
     ○  Only for a specific type of question — describe it:
        e.g. "Only when the user is asking about events or venues"

  3. Where does it sit in the flow?
     ○  Between CLASSIFY and BOOK SEARCH
     ○  Between BOOK SEARCH and GENERATE
     ○  Other — describe: ________________________________

  4. What information does it need to do its job?
     e.g. "The user's account ID and the current date"

  5. What does it hand off to the next step?
     e.g. "A yes/no flag: is the user premium?"

  Your answer:
  ┌─────────────────────────────────────────────────────────────────┐
  │                                                                 │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘


[ ADD A NEW TOOL ]
───────────────────────────────────────────────────────────────────────
A "tool" is something the AI can reach for mid-response — like looking
up an order or checking a policy. Adding one means the AI can now take
a new action or look something up when it decides it needs to.

  1. What is the tool called?
     Use a short, plain name.
     e.g. "Check membership status"  or  "Look up venue capacity"

  2. What does it do — in one sentence?
     e.g. "Looks up whether the user has an active premium membership"

  3. What information does it need to run?
     These are the inputs the AI must have before it can use this tool.
     e.g. "The user's email address"  or  "A booking reference number"

  4. What does it give back?
     Describe the result in plain English.
     e.g. "Active / Expired / Not found"
     e.g. "A list of available time slots for that day"

  5. When should the AI decide to use it?
     Describe the situation, not the code.
     e.g. "When a user asks about member discounts or premium access"
     e.g. "When a user wants to know if a specific date is available"

  Your answer:
  ┌─────────────────────────────────────────────────────────────────┐
  │                                                                 │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘


[ ADD A TRIGGER WORD ]
───────────────────────────────────────────────────────────────────────
Trigger words cause the agent to skip normal processing and act
immediately — usually to hand off to a human.

  Which list should the word go in?
  ○  Legal language  (immediately escalates — HIGH priority)
     Current words: sue, lawsuit, lawyer, court, chargeback, dispute, attorney
     Word(s) to add: ________________________________

  ○  Frustration signals  (escalates — MEDIUM priority)
     Current words: scam, fraud, useless, ridiculous, incompetent, outrageous
     Word(s) to add: ________________________________


[ CHANGE A LIMIT ]
───────────────────────────────────────────────────────────────────────
  Max tool rounds per response      →  currently 5   change to: ____
     (higher = can handle more complex tasks, but each response is slower)

  Conversation history remembered   →  currently 10 exchanges  change to: ____
     (higher = AI remembers more of the conversation; lower = saves memory)`,
  },
  {
    id: 'v1.2',
    label: 'v1.2',
    date: 'Mar 3 2026',
    nodes: 3,
    tools: 4,
    logic: `CONVERSATION LOGIC — Bookly Agent v1.2
════════════════════════════════════════════════════════════════════════

  WHAT CHANGED FROM v1.1
  Tool calling was introduced in this version. The AI can now look things
  up and take actions mid-response rather than only generating text.


STEP 1 — CLASSIFY
──────────────────
Read the incoming message and decide what to do next.

  IF the message contains legal language  →  hand off to human immediately
     Triggers: sue, lawsuit, lawyer, court, chargeback

  IF the message is ALL CAPS  →  hand off to human (frustration signal)

  IF the message is about an order or delivery  →  skip book search
  IF the message is about returns or refunds    →  skip book search

  EVERYTHING ELSE  →  run book search first


STEP 2 — BOOK SEARCH  (only when needed)
──────────────────────────────────────────
Search the book catalog for relevant context before responding.


STEP 3 — GENERATE RESPONSE
────────────────────────────
The AI composes a reply and may now use tools:

  • Check order status        — shipping and delivery lookup
  • Look up store policy      — returns, refunds, membership
  • Submit a return request   — initiate on behalf of the user
  • Escalate to human agent   — hand off with context

  Maximum 3 tool rounds (raised to 5 in v2.0).
  No output scanning yet — added in v2.0.`,
  },
  {
    id: 'v1.1',
    label: 'v1.1',
    date: 'Feb 14 2026',
    nodes: 3,
    tools: 1,
    logic: `CONVERSATION LOGIC — Bookly Agent v1.1
════════════════════════════════════════════════════════════════════════

  WHAT CHANGED FROM v1.0
  A book search step was added between classification and response.
  The AI now has context about the catalog before answering.


STEP 1 — CLASSIFY
──────────────────
Read the incoming message and decide what to do next.

  IF the message is about an order  →  skip book search, answer directly
  IF the message is about a return  →  skip book search, answer directly
  EVERYTHING ELSE                   →  run book search first


STEP 2 — BOOK SEARCH  ★ NEW IN v1.1
──────────────────────────────────────
Search the book catalog for titles and passages that match the user's question.
Pass the results to the AI as context before it generates a response.

  Skipped for order and return questions (not relevant to those intents).


STEP 3 — GENERATE RESPONSE
────────────────────────────
The AI composes a reply using the catalog context (if any) and the conversation
history. No tools available yet — the AI only generates text.

  Escalation to a human is handled by the AI saying so in its reply,
  not by a dedicated tool (tool-based escalation added in v1.2).`,
  },
  {
    id: 'v1.0',
    label: 'v1.0 — initial',
    date: 'Jan 30 2026',
    nodes: 2,
    tools: 0,
    logic: `CONVERSATION LOGIC — Bookly Agent v1.0  (initial release)
════════════════════════════════════════════════════════════════════════

  This was the first working version of the agent. Two steps only.
  No routing, no book search, no tools. The AI reads the message
  and replies — nothing more.


STEP 1 — CLASSIFY
──────────────────
Minimal intent detection. No keyword triggers yet.

  Read the message.
  Decide if it is a general question or an order/return question.
  (No escalation logic — the AI handles all cases on its own.)


STEP 2 — GENERATE RESPONSE
────────────────────────────
The AI reads the conversation history and composes a reply.

  No book search. No tools. No output scanning.
  The AI relies entirely on its training knowledge about books.

  Limitations discovered in testing:
    - Cannot look up real order status
    - Cannot search the actual book catalog
    - No guardrails for sensitive data or prompt injection
    → All addressed in v1.1 and v1.2`,
  },
]

// ── Inline SVG diagram ────────────────────────────────────────────────────────

function GraphDiagram() {
  return (
    <svg viewBox="0 0 860 260" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ maxHeight: 260 }}>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#adaaaa" />
        </marker>
        <marker id="arrow-orange" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#ffa44c" />
        </marker>
        <marker id="arrow-purple" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#818cf8" />
        </marker>
        <linearGradient id="nodeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a1a" /><stop offset="100%" stopColor="#131313" />
        </linearGradient>
        <linearGradient id="nodeGradActive" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#262626" /><stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      {/* Edges */}
      <line x1="80" y1="110" x2="155" y2="110" stroke="#adaaaa" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <path d="M 305 96 C 380 60, 520 60, 598 96" fill="none" stroke="#ffa44c" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#arrow-orange)" />
      <text x="440" y="52" textAnchor="middle" style={{ fontSize: 10, fill: '#ffa44c', fontFamily: 'Manrope' }}>skip book search</text>
      <path d="M 305 124 C 350 170, 400 185, 448 185" fill="none" stroke="#818cf8" strokeWidth="1.5" markerEnd="url(#arrow-purple)" />
      <text x="358" y="200" textAnchor="middle" style={{ fontSize: 10, fill: '#818cf8', fontFamily: 'Manrope' }}>search catalog</text>
      <path d="M 572 185 C 600 185, 612 145, 612 130" fill="none" stroke="#adaaaa" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <line x1="722" y1="110" x2="800" y2="110" stroke="#adaaaa" strokeWidth="1.5" markerEnd="url(#arrow)" />
      {/* Nodes */}
      <circle cx="52" cy="110" r="28" fill="url(#nodeGrad)" stroke="rgba(72,72,71,0.4)" strokeWidth="1" />
      <text x="52" y="114" textAnchor="middle" style={{ fontSize: 11, fill: '#adaaaa', fontFamily: 'Manrope', fontWeight: 600 }}>START</text>
      <rect x="155" y="82" width="150" height="56" rx="10" fill="url(#nodeGradActive)" stroke="rgba(255,164,76,0.45)" strokeWidth="1.5" />
      <text x="230" y="104" textAnchor="middle" style={{ fontSize: 11, fill: '#ffa44c', fontFamily: 'Manrope', fontWeight: 700 }}>CLASSIFY</text>
      <text x="230" y="120" textAnchor="middle" style={{ fontSize: 9, fill: '#adaaaa', fontFamily: 'Manrope' }}>intent · escalation triggers</text>
      <text x="230" y="132" textAnchor="middle" style={{ fontSize: 9, fill: '#adaaaa', fontFamily: 'Manrope' }}>Step 1</text>
      <rect x="448" y="157" width="124" height="56" rx="10" fill="url(#nodeGradActive)" stroke="rgba(129,140,248,0.45)" strokeWidth="1.5" />
      <text x="510" y="179" textAnchor="middle" style={{ fontSize: 11, fill: '#818cf8', fontFamily: 'Manrope', fontWeight: 700 }}>BOOK SEARCH</text>
      <text x="510" y="195" textAnchor="middle" style={{ fontSize: 9, fill: '#adaaaa', fontFamily: 'Manrope' }}>catalog lookup</text>
      <text x="510" y="207" textAnchor="middle" style={{ fontSize: 9, fill: '#adaaaa', fontFamily: 'Manrope' }}>Step 2</text>
      <rect x="598" y="82" width="124" height="56" rx="10" fill="url(#nodeGradActive)" stroke="rgba(74,222,128,0.35)" strokeWidth="1.5" />
      <text x="660" y="104" textAnchor="middle" style={{ fontSize: 11, fill: '#4ade80', fontFamily: 'Manrope', fontWeight: 700 }}>GENERATE</text>
      <text x="660" y="120" textAnchor="middle" style={{ fontSize: 9, fill: '#adaaaa', fontFamily: 'Manrope' }}>AI reply · tools · safety</text>
      <text x="660" y="132" textAnchor="middle" style={{ fontSize: 9, fill: '#adaaaa', fontFamily: 'Manrope' }}>Step 3</text>
      <circle cx="828" cy="110" r="28" fill="url(#nodeGrad)" stroke="rgba(72,72,71,0.4)" strokeWidth="1" />
      <text x="828" y="114" textAnchor="middle" style={{ fontSize: 11, fill: '#adaaaa', fontFamily: 'Manrope', fontWeight: 600 }}>END</text>
      {/* Legend */}
      <rect x="20" y="222" width="820" height="1" fill="rgba(72,72,71,0.2)" />
      <circle cx="40" cy="244" r="4" fill="#ffa44c" />
      <text x="50" y="248" style={{ fontSize: 9, fill: '#adaaaa', fontFamily: 'Manrope' }}>fast path — order / return / escalation (skips book search)</text>
      <circle cx="340" cy="244" r="4" fill="#818cf8" />
      <text x="350" y="248" style={{ fontSize: 9, fill: '#adaaaa', fontFamily: 'Manrope' }}>full path — book discovery / general questions</text>
    </svg>
  )
}

// ── Tag badge ─────────────────────────────────────────────────────────────────

function Tag({ tag }: { tag?: string }) {
  if (!tag) return null
  const styles: Record<string, string> = {
    live: 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20',
    beta: 'bg-[#ffa44c]/10 text-[#ffa44c] border-[#ffa44c]/20',
  }
  return (
    <span className={`text-[9px] font-body font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded border ${styles[tag] ?? ''}`}>
      {tag}
    </span>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function GraphView() {
  const [selectedId, setSelectedId] = useState('v2.0')
  const [localEdit, setLocalEdit] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  const version = VERSIONS.find(v => v.id === selectedId) ?? VERSIONS[1]
  const displayText = localEdit[selectedId] ?? version.logic

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleChange = (text: string) => {
    setLocalEdit(prev => ({ ...prev, [selectedId]: text }))
  }

  const handleVersionChange = (id: string) => {
    setSelectedId(id)
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-headline font-bold text-on-surface">Agent Graph</h1>
        <p className="text-sm font-body text-on-surface-variant mt-1">
          The decision logic powering every Bookly conversation
        </p>
      </div>

      {/* Diagram card */}
      <div className="bg-surface-container rounded-xl p-6" style={{ border: '1px solid rgba(72,72,71,0.15)' }}>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-headline font-bold text-on-surface">Conversation Flow</h2>
            <p className="text-xs font-body text-on-surface-variant mt-0.5">
              Every message passes through these steps in order
            </p>
          </div>
          <div className="flex gap-2">
            {[
              { label: 'Steps', value: '3', color: '#4ade80' },
              { label: 'Tools', value: '6', color: '#818cf8' },
              { label: 'Paths', value: '2', color: '#ffa44c' },
            ].map(s => (
              <div key={s.label} className="bg-surface-container-high rounded-lg px-3 py-1.5 text-center"
                style={{ border: '1px solid rgba(72,72,71,0.15)' }}>
                <p className="text-base font-headline font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] font-body text-on-surface-variant">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-background rounded-xl p-4" style={{ border: '1px solid rgba(72,72,71,0.12)' }}>
          <GraphDiagram />
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              name: 'Step 1 — Classify',
              color: '#ffa44c',
              icon: 'alt_route',
              desc: 'Reads the message and decides the path. Flags legal language or frustration immediately. Routes orders and returns past the book search.',
            },
            {
              name: 'Step 2 — Book Search',
              color: '#818cf8',
              icon: 'search',
              desc: 'Searches the book catalog for relevant titles and passages. Only runs when the question is about books — skipped otherwise to save time.',
            },
            {
              name: 'Step 3 — Generate',
              color: '#4ade80',
              icon: 'psychology',
              desc: 'The AI writes a reply, using tools as needed (order lookup, policies, returns, escalation). Scans the response for sensitive data before sending.',
            },
          ].map(n => (
            <div key={n.name} className="bg-surface-container-high rounded-lg p-4"
              style={{ border: '1px solid rgba(72,72,71,0.15)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[16px]" style={{ color: n.color }}>{n.icon}</span>
                <span className="text-xs font-body font-semibold" style={{ color: n.color }}>{n.name}</span>
              </div>
              <p className="text-[11px] font-body text-on-surface-variant leading-relaxed">{n.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Logic editor */}
      <div className="bg-surface-container rounded-xl overflow-hidden" style={{ border: '1px solid rgba(72,72,71,0.15)' }}>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 flex-wrap gap-3"
          style={{ borderBottom: '1px solid rgba(72,72,71,0.15)', background: '#131313' }}>

          {/* Left: dots + version picker */}
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff7351] opacity-70" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffa44c] opacity-70" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80] opacity-70" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-body text-on-surface-variant">Version</span>
              <div className="relative">
                <select
                  value={selectedId}
                  onChange={e => handleVersionChange(e.target.value)}
                  className="text-xs font-body text-on-surface bg-surface-container rounded-lg pl-3 pr-7 py-1.5 outline-none cursor-pointer appearance-none"
                  style={{ border: '1px solid rgba(72,72,71,0.3)' }}
                >
                  {VERSIONS.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.label}  ·  {v.date}  ·  {v.nodes} steps  ·  {v.tools} tools
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  expand_more
                </span>
              </div>
              <Tag tag={version.tag} />
            </div>
          </div>

          {/* Right: hint + copy */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-body text-on-surface-variant italic hidden sm:block">
              editable · changes are not saved
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-body text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Editable text area */}
        <textarea
          value={displayText}
          onChange={e => handleChange(e.target.value)}
          spellCheck={false}
          className="w-full bg-background font-mono text-xs leading-relaxed resize-none outline-none p-6 text-on-surface-variant"
          style={{ height: 480, tabSize: 2 }}
        />
      </div>

      <div className="h-8" />
    </div>
  )
}
