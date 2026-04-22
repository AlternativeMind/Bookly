'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionHeader({ title, accent = 'primary' }: { title: string; accent?: 'primary' | 'secondary' }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span
        className="w-1 h-6 rounded-full inline-block flex-shrink-0"
        style={{ background: accent === 'primary' ? 'linear-gradient(180deg, #ffa44c, #fd9000)' : '#feb64c' }}
      />
      <h2 className="font-headline text-xl font-bold text-on-surface">{title}</h2>
    </div>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="border-l-2 border-primary pl-4 py-3 my-4 rounded-r-lg"
      style={{ backgroundColor: 'rgba(255,164,76,0.06)' }}
    >
      <p className="text-[10px] font-bold text-primary mb-2 uppercase tracking-widest font-body">My thinking</p>
      <div className="text-sm text-on-surface-variant font-body leading-relaxed">{children}</div>
    </div>
  )
}

function FlowArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-1">
      <div className="w-px h-3 bg-outline-variant/30" />
      {label && (
        <span className="font-mono text-[9px] text-on-surface-variant px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant/15">
          {label}
        </span>
      )}
      <div className="w-px h-3 bg-outline-variant/30" />
      <span className="text-primary text-xs leading-none">▼</span>
    </div>
  )
}

// ── Architecture Diagram ──────────────────────────────────────────────────────

function ArchitectureDiagram() {
  return (
    <div
      className="rounded-xl p-6 space-y-2 border border-outline-variant/15"
      style={{ backgroundColor: 'rgba(26,26,26,0.5)' }}
    >
      <div className="flex justify-center">
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-surface-container-high border border-outline-variant/20 w-80">
          <span className="material-symbols-outlined text-on-surface-variant">language</span>
          <div>
            <p className="font-mono text-xs font-bold text-on-surface">Browser</p>
            <p className="font-body text-[10px] text-on-surface-variant">React · Next.js App Router · Framer Motion</p>
          </div>
        </div>
      </div>

      <FlowArrow label="SSE stream" />

      <div className="flex justify-center">
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-xl border w-80"
          style={{ backgroundColor: 'rgba(255,164,76,0.07)', borderColor: 'rgba(255,164,76,0.2)' }}
        >
          <span className="material-symbols-outlined text-primary">cloud</span>
          <div>
            <p className="font-mono text-xs font-bold text-primary">Next.js 15 · Cloud Run</p>
            <p className="font-body text-[10px] text-on-surface-variant">/api/chat · thin SSE proxy · no logic</p>
          </div>
        </div>
      </div>

      <FlowArrow label="POST /chat" />

      <div className="flex justify-center">
        <div
          className="rounded-xl border w-80 overflow-hidden"
          style={{ backgroundColor: 'rgba(255,164,76,0.04)', borderColor: 'rgba(255,164,76,0.15)' }}
        >
          <div className="px-5 py-3 border-b border-outline-variant/15 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">smart_toy</span>
            <div>
              <p className="font-mono text-xs font-bold text-primary">Python Agent · Cloud Run</p>
              <p className="font-body text-[10px] text-on-surface-variant">FastAPI + LangGraph · FirestoreCheckpointer</p>
            </div>
          </div>
          <div className="px-4 py-3 flex items-center justify-center gap-2 flex-wrap">
            {[
              { label: 'classify_node', sub: 'pre-LLM routing' },
              { label: 'rag_node', sub: 'optional' },
              { label: 'generate_node', sub: 'Grok + tools', highlight: true },
            ].map((n, i) => (
              <div key={n.label} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-on-surface-variant text-xs">→</span>}
                <div
                  className="px-2.5 py-1.5 rounded-lg border text-center"
                  style={{
                    backgroundColor: n.highlight ? 'rgba(255,164,76,0.12)' : 'rgba(38,38,38,0.8)',
                    borderColor: n.highlight ? 'rgba(255,164,76,0.3)' : 'rgba(72,72,71,0.2)',
                  }}
                >
                  <p className={`font-mono text-[9px] font-bold ${n.highlight ? 'text-primary' : 'text-on-surface'}`}>
                    {n.label}
                  </p>
                  <p className="font-body text-[8px] text-on-surface-variant">{n.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <FlowArrow />

      <div className="flex justify-center gap-2 flex-wrap">
        {[
          { icon: 'storage', label: 'Firestore', sub: 'sessions · chunks · checkpoints' },
          { icon: 'manage_search', label: 'Vertex AI Vector Search', sub: 'text-embedding-004' },
          { icon: 'psychology', label: 'Grok 4.20', sub: 'Vertex AI Model Garden' },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/20"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-sm">{s.icon}</span>
            <div>
              <p className="font-mono text-[9px] font-bold text-on-surface">{s.label}</p>
              <p className="font-body text-[9px] text-on-surface-variant">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── State Machine Diagram ─────────────────────────────────────────────────────

function StateMachineDiagram() {
  return (
    <div
      className="rounded-xl p-6 border border-outline-variant/15"
      style={{ backgroundColor: 'rgba(26,26,26,0.5)' }}
    >
      <div className="flex justify-center mb-1">
        <div className="px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30">
          <span className="font-mono text-[10px] text-on-surface-variant font-bold tracking-widest">START</span>
        </div>
      </div>

      <FlowArrow />

      <div className="flex justify-center mb-4">
        <div
          className="px-6 py-3 rounded-xl border text-center"
          style={{ backgroundColor: 'rgba(255,164,76,0.08)', borderColor: 'rgba(255,164,76,0.25)' }}
        >
          <p className="font-mono text-sm font-bold text-primary">classify_node</p>
          <p className="font-body text-[10px] text-on-surface-variant mt-1">deterministic · pre-LLM · no model call</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="flex flex-col items-center gap-1">
          <p className="font-mono text-[9px] text-on-surface-variant text-center leading-tight">legal keywords<br />all-caps · frustration</p>
          <span className="text-red-400 text-xs">▼</span>
          <div
            className="w-full px-2 py-2 rounded-lg border text-center"
            style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}
          >
            <p className="font-mono text-[9px] font-bold text-red-400">escalate_immediately</p>
            <p className="font-body text-[8px] text-on-surface-variant mt-0.5">forces escalate_to_human</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="font-mono text-[9px] text-on-surface-variant text-center leading-tight">order · shipping<br />return · refund</p>
          <span className="text-primary text-xs">▼</span>
          <div className="w-full px-2 py-2 rounded-lg bg-surface-container-high border border-outline-variant/20 text-center">
            <p className="font-mono text-[9px] font-bold text-on-surface">skip_rag=true</p>
            <p className="font-body text-[8px] text-on-surface-variant mt-0.5">saves ~500ms</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="font-mono text-[9px] text-on-surface-variant text-center leading-tight">book discovery<br />general inquiry</p>
          <span className="text-primary text-xs">▼</span>
          <div
            className="w-full px-2 py-2 rounded-lg border text-center"
            style={{ backgroundColor: 'rgba(255,164,76,0.07)', borderColor: 'rgba(255,164,76,0.2)' }}
          >
            <p className="font-mono text-[9px] font-bold text-primary">rag_node</p>
            <p className="font-body text-[8px] text-on-surface-variant mt-0.5">Vector Search + Firestore</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-2 mb-2">
        <div className="h-px bg-outline-variant/20 w-20" />
        <span className="font-body text-[9px] text-on-surface-variant italic">all paths converge</span>
        <div className="h-px bg-outline-variant/20 w-20" />
      </div>

      <div className="flex justify-center mb-1">
        <span className="text-primary text-xs">▼</span>
      </div>

      <div className="flex justify-center mb-2">
        <div
          className="px-6 py-3 rounded-xl border text-center"
          style={{ backgroundColor: 'rgba(255,164,76,0.08)', borderColor: 'rgba(255,164,76,0.25)' }}
        >
          <p className="font-mono text-sm font-bold text-primary">generate_node</p>
          <p className="font-body text-[10px] text-on-surface-variant mt-1">Grok 4.20 · system prompt + history + RAG context</p>
        </div>
      </div>

      <div className="flex justify-center items-start gap-3 mb-2">
        <div className="flex flex-col items-center gap-0.5 pt-1">
          <div className="w-px h-3 bg-outline-variant/30" />
          <span className="text-primary text-xs">▼</span>
        </div>
        <div className="px-4 py-2.5 rounded-lg bg-surface-container-high border border-outline-variant/20 text-center">
          <p className="font-mono text-[9px] font-bold text-on-surface">tool loop · max 5 iterations</p>
          <p className="font-body text-[8px] text-on-surface-variant mt-1 leading-relaxed">
            catalog_search · get_order · lookup_policy<br />
            similar_readers · submit_return · escalate_to_human
          </p>
        </div>
        <div className="flex items-center justify-center pt-4">
          <span className="font-mono text-sm text-on-surface-variant">↺</span>
        </div>
      </div>

      <FlowArrow />

      <div className="flex justify-center mb-2">
        <div className="px-5 py-2 rounded-xl bg-surface-container-high border border-outline-variant/20 text-center">
          <p className="font-mono text-[10px] font-bold text-on-surface-variant">_safe_response()</p>
          <p className="font-body text-[8px] text-on-surface-variant mt-0.5">PII scan · prompt injection detection · safe fallback</p>
        </div>
      </div>

      <FlowArrow />

      <div className="flex justify-center">
        <div
          className="px-5 py-2 rounded-full border"
          style={{ backgroundColor: 'rgba(255,164,76,0.08)', borderColor: 'rgba(255,164,76,0.25)' }}
        >
          <span className="font-mono text-[10px] text-primary font-bold tracking-widest">SSE STREAM → END</span>
        </div>
      </div>
    </div>
  )
}

// ── Transparency prompts ───────────────────────────────────────────────────────

const TRANSPARENCY_PROMPTS = [
  {
    n: 1,
    text: `Clear the contents of design section and help me build the following, the theme for this section is to highlight my design decisions, some key aspects learned [Image #1] need to answer these questions, and overall explain the build structure, architecture and interesting notes. For this, I will start by giving you what I want to talk about and your job is to organize the information in an easy to read, understand and follow. It needs to be simple, visual and I will give you personal thoughts and examples (which we will mark as such) for certain sections. To begin, understand what we have done and build so far. There are several memory files and notes. Then wait for me to start putting my thoughts down, do not change the page yet, but start by collecting the information and think about best ways to display it. Only change the code when I tell you I am ready, then, do not commit or deploy code, I will test it locally first.`,
  },
  {
    n: 2,
    text: `First section will be Introduction, do not change much here other than editing and formatting: Welcome to Myk's Bookly AI support chat, this is an exercise to showcase my ability to architect, design, implement and deliver a solution for the requested exercise. This is the response for the Solutions Engineering Take-Home Assignment design challenge by Decagon. In this document I will address some of the questions asked as well as walk you through my thinking and results. This entire output demo is completely standalone and all of it is part of the response (plus some extras). This is all my work, and while there is a lot of code generated and document generation, you will find that I have made all of the design decisions and stand by them. If you'd like a follow-up call to go through it nothing would excite me more.`,
  },
  {
    n: 3,
    text: `A bit about my thinking: For the past year I have been hard at work designing and deploying applications in the cloud, so I already had the framework, CLAUDE.MD files as well as the experience for quickly deploying Next.JS prototypes on GCP. I also decided to mix-up a few technologies, some for fun, others by design. Initially, I thought of using Vercel to quickly design and deliver the app, it's perfectly positioned with its AI tooling to get me there, however, Vercel requires you attach many services, ex. Supabase SaaS, Claude, Vector DB, and back-end components. GCP is really complex, however, little secret, it's all designed for developers, so you can actually build out the whole infrastructure as code, with Claude ;). myk.bot, I actually was building an Altro.me bot, which was a representation of myself, something I was going to publish to help myself (send myself messages etc...) but then ClawBot came into existence and killed that project. I chose Grok for it called out customer service as one of its design skills as opposed to Claude, LLama, etc... Having said that, I initially thought about using a Fine tuned model but then thought, I will have a System Prompt as well as guardrails etc... not only did it feel like overkill, but i wonder if it would actually perform worse. LangGraph vs LLM tool-calling, this one I did as a bit of a personal experiment, I have been building n8n automations, with decision trees as well as offloading initial categorization to non-LLM nodes. They would be written in Claude, then pasted into n8n. I wanted to test a fully Claude managed state-machine and flow. Given my coding knowledge, I won't go back to n8n as this can be a LOT more efficient if you own the e2e code. Sure it's not initially visual, but you can ask claude to visualize for you (like this document). Why did I scrape scholastic website you ask? This one was for sport, I recently scraped my linked in profile and had the account on the ready, sorta wanted an authentic feel for the chatbot, also wanted to muck around with chunking and vectorization.`,
  },
  {
    n: 4,
    text: `Another design consideration, I wanted this exercise output to be completely self contained and answer all the questions set out in the exercise naturally. Ex. Code is in a github link, technical messages are logged and visualized (like tool use, RAG), complex use-cases easy to define. Information such as architecture and design easy to navigate and understand. This document and all the answers are located here.`,
  },
  {
    n: 5,
    text: `What would I need to do to productize this: First there is a ton of code debt, while I orchestrated the outcomes, architecture and process, ultimately it was generated, code cleanup and standardization required. I would also break the application further into self contained and scalable components, we did separate front-end from agent, but there are other components that should be containerized. I don't really have prompt injection detection, I would either use a product like Lakera or a prompt injection-trained llm (this is why it's password protected). There is currently no observability and my logging is actually not great, errors are info messages in some cases and i have no idea about the state of the conversations, who logged in, who had issues etc... observability is my background, so no compromise here. I would also want to add a layer of abstraction, I would want to have versioned paths and some way to visualize how the paths are working. But if I did that, I would have built Decagon, and that would have been just showing off :). Tooling is currently not connected, so I would connect that to real tools. Intent is currently used for routing, I would probably add a better intent layer. Scaling, there is no scaling here, i can potentially let GCP handle some of it, but I don't know which components are going to be hotter than others. Routing, I would add open router to have model backup and to start using cheaper smaller models for things that are less important. Security, i really didn't secure anything, other than the passcode. I did an ok job with local session store, but it works so well, the firestore session store is broken haha. Doesn't matter for POC, but would sync those.`,
  },
  {
    n: 6,
    text: `Architecture overview, generate a visualization for our architecture from a component tech stack view. Then generate a visualization of how our langraph state machine works. Make diagrams using mermaid or something else that creates good visualizations.`,
  },
  {
    n: 7,
    text: `ok use tailwind for flow diagrams. For example system prompt: If you want to see my system prompt, <<link to system info>> can be seen here. How I came up with it? Well I started with the chatGPT system prompt template as a starting point, i looked for customer support specific system prompts, but they were hard to find, so I added CustomerSupportTicketIncidence.png to the context to extract realistic and most used paths to define both system prompt as well as graph states.`,
  },
  {
    n: 8,
    text: `The Hallucination section: There is quite frankly a lot of improvement here. We moved some branching and tool usage away from LLM so it won't hallucinate tool use, however, it's not robust, also I hard coded some decision trees. Also my chunking and embedding is very amateurish so i don't know if the results are good or llm will make things up. I have not done any grounding either. This is probably a sprint of its own.`,
  },
  {
    n: 9,
    text: `For the conversation & decision design. I did in fact try to make this a bit more than just a straight through LLM design, which gave me control over looping and state, storing the conversations into firestore also allows me to pass on greater context. However, my graph design is a bit lazy, so it's pretty simple. Intent is fairly shallow, but i did attempt to pick out some obvious ones. There is also not a lot of loop protection. Overall, this bot needs a bit more work, and, here's the truth, the more complex it gets, the scarier it is to update the code. Eventually, your dependencies are larger than the context and you will start breaking things... luckily this is small, but in practice, need to harden it.`,
  },
  {
    n: 10,
    text: `Ready, put it into the website and I will run dev server to see if it looks good.`,
  },
]

// ── Main component ────────────────────────────────────────────────────────────

export default function DesignView() {
  const [transparencyOpen, setTransparencyOpen] = useState(false)

  function switchToSystemTab() {
    window.dispatchEvent(new CustomEvent('bookly:switch-tab', { detail: { tab: 'system' } }))
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <motion.div
        className="max-w-3xl mx-auto p-8 md:p-12 space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* ── Introduction ──────────────────────────────────────────── */}
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
            Bookly AI
          </h1>
          <p className="font-headline text-xl text-on-surface-variant font-bold mb-6">
            Agent Design Document
          </p>
          <div className="space-y-3 font-body text-on-surface-variant leading-relaxed">
            <p>
              Welcome to Myk&apos;s Bookly AI, a working customer support chat assistant built to
              showcase my ability to architect, design, implement, and deliver a complete solution.
            </p>
            <p>
              This is my response to the{' '}
              <span className="text-on-surface font-semibold">
                Solutions Engineering Take-Home Assignment
              </span>{' '}
              design challenge by Decagon. In this document I&apos;ll address the questions asked and
              walk you through my thinking and results. This entire demo is completely standalone.
              All of it is part of my response (plus some extras).
            </p>
            <p>
              This is all my own work. While there is a lot of code and document generation involved,
              every design decision was made by me, and I stand by each one. If you&apos;d like a
              follow-up call to walk through it, nothing would excite me more.
            </p>
          </div>
        </motion.div>

        {/* ── Transparency ───────────────────────────────────────────── */}
        <motion.section variants={itemVariants}>
          <div className="rounded-xl border border-outline-variant/15 overflow-hidden">
            <button
              onClick={() => setTransparencyOpen((o) => !o)}
              className="w-full flex items-center justify-between px-6 py-4 bg-surface-container-low hover:bg-surface-container-high transition-colors text-left"
            >
              <div>
                <p className="font-headline text-sm font-bold text-on-surface">Transparency</p>
                <p className="font-body text-xs text-on-surface-variant mt-0.5">
                  This final document was generated by AI. Here are the raw commands used to generate it.
                </p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0 ml-4">
                {transparencyOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            <AnimatePresence>
              {transparencyOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 py-4 space-y-4 border-t border-outline-variant/15">
                    {TRANSPARENCY_PROMPTS.map((p) => (
                      <div key={p.n}>
                        <p className="font-mono text-[9px] text-primary mb-1.5 font-bold tracking-widest">
                          PROMPT {p.n}
                        </p>
                        <div className="font-body text-xs text-on-surface-variant leading-relaxed p-3 rounded-lg bg-surface-container-high border border-outline-variant/10 whitespace-pre-wrap">
                          {p.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* ── Self-Contained Philosophy ──────────────────────────────── */}
        <motion.section variants={itemVariants}>
          <div
            className="rounded-xl p-6 border"
            style={{ backgroundColor: 'rgba(255,164,76,0.05)', borderColor: 'rgba(255,164,76,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-xl">hub</span>
              <h3 className="font-headline text-base font-bold text-on-surface">A Self-Contained Submission</h3>
            </div>
            <p className="font-body text-sm text-on-surface-variant mb-4 leading-relaxed">
              Every question in this exercise has an answer somewhere in this application. Not in a
              separate document, not in a slide deck.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { icon: 'architecture', label: 'Architecture & design decisions', sub: 'This tab' },
                { icon: 'monitor_heart', label: 'Agent thinking in real time', sub: 'Trace panel during any chat' },
                { icon: 'auto_stories', label: 'Complex use-cases', sub: 'Examples tab, ready to run' },
                { icon: 'code', label: 'The code', sub: 'GitHub repository' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low">
                  <span className="material-symbols-outlined text-primary text-base mt-0.5">{item.icon}</span>
                  <div>
                    <p className="font-body text-xs font-semibold text-on-surface">{item.label}</p>
                    <p className="font-body text-[11px] text-on-surface-variant">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="font-body text-xs text-on-surface-variant mt-4 italic">
              The intent was to make the submission feel like a product demonstration, not a write-up about a product.
            </p>
          </div>
        </motion.section>

        {/* ── My Thinking ───────────────────────────────────────────── */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="My Thinking: Five Decisions" />
          <div className="space-y-4">

            <div className="rounded-xl p-5 bg-surface-container-low border border-outline-variant/15">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-base">cloud</span>
                <h3 className="font-headline text-sm font-bold text-on-surface">Why GCP over Vercel</h3>
              </div>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                For the past year I&apos;ve been designing and deploying cloud applications, so I already had the
                framework, CLAUDE.md files, and hands-on experience shipping Next.js prototypes on GCP
                quickly. Vercel was the obvious first instinct since it&apos;s perfectly positioned with AI
                tooling. The tradeoff is that Vercel pulls you toward a satellite orbit of SaaS dependencies:
                Supabase, external vector DBs, separate backend services.
              </p>
              <Callout>
                GCP is genuinely complex, but here&apos;s the thing: it&apos;s designed for developers. You can build
                the entire infrastructure as code. With Claude. <em>(Yes, really.)</em>
              </Callout>
            </div>

            <div className="rounded-xl p-5 bg-surface-container-low border border-outline-variant/15">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-base">domain</span>
                <h3 className="font-headline text-sm font-bold text-on-surface">
                  myk.bot: Prior Experience Building This Type of Project
                </h3>
              </div>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                The domain wasn&apos;t built for this. I was previously building a digital bot, a
                self-representation I was going to publish for personal use. Then OpenClaw launched and
                made the whole thing redundant overnight. The infrastructure, domain, and deployment
                experience were already there, so I pointed it all at Bookly instead. This kind of
                project wasn&apos;t new territory for me.
              </p>
            </div>

            <div className="rounded-xl p-5 bg-surface-container-low border border-outline-variant/15">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-base">psychology</span>
                <h3 className="font-headline text-sm font-bold text-on-surface">Why Grok, and Why Not a Fine-Tuned Model</h3>
              </div>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                I chose Grok because it explicitly calls out customer service as a core design skill,
                something Claude, LLaMA, and others don&apos;t lead with. I also seriously considered{' '}
                <a
                  href="https://huggingface.co/praneethposina/customer_support_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  this fine-tuned HuggingFace model
                </a>{' '}
                specifically trained for customer support, but stepped back from it.
              </p>
              <Callout>
                With a well-designed system prompt, guardrails, and RAG grounding already in place, a
                fine-tuned base felt like overkill. I genuinely wondered whether it might perform{' '}
                <em>worse</em> by being too narrow for the variety of requests a real support bot handles.
              </Callout>
            </div>

            <div className="rounded-xl p-5 bg-surface-container-low border border-outline-variant/15">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-base">account_tree</span>
                <h3 className="font-headline text-sm font-bold text-on-surface">
                  LangGraph vs. LLM Tool-Calling: A Personal Experiment
                </h3>
              </div>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                I&apos;ve been building n8n automations with decision trees and non-LLM classification nodes,
                logic written in Claude then pasted into n8n. I wanted to test whether a fully code-owned
                state machine could replace that workflow entirely.
              </p>
              <Callout>
                It can, and it&apos;s more efficient when you own the end-to-end code. It&apos;s not visual out of
                the box, but you can ask Claude to visualize it for you. <em>Like this document.</em> Having
                done it, I won&apos;t go back to n8n for anything I control.
              </Callout>
            </div>

            <div className="rounded-xl p-5 bg-surface-container-low border border-outline-variant/15">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-base">dataset</span>
                <h3 className="font-headline text-sm font-bold text-on-surface">Why Scrape Scholastic?</h3>
              </div>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                Honestly? For sport. I&apos;d recently scraped my LinkedIn profile and had the Firecrawl account
                ready. I wanted the chatbot to feel authentic: real catalog data, real chunking, real
                vectorization. Not a demo with made-up books. It also gave me an excuse to work through the
                full embedding pipeline end-to-end, which was the whole point.
              </p>
            </div>

          </div>
        </motion.section>

        {/* ── Architecture Overview ──────────────────────────────────── */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Architecture Overview" accent="secondary" />
          <p className="font-body text-sm text-on-surface-variant mb-6 leading-relaxed">
            Two Cloud Run services communicate over HTTP. The Next.js frontend is a thin SSE proxy with
            no inference logic. All RAG, history, routing, and generation runs inside the Python agent service.
          </p>

          <h3 className="font-headline text-sm font-semibold text-on-surface mb-3">Component Stack</h3>
          <ArchitectureDiagram />

          <div className="mt-8 mb-3">
            <h3 className="font-headline text-sm font-semibold text-on-surface mb-1">LangGraph State Machine</h3>
            <p className="font-body text-xs text-on-surface-variant mb-3">
              Every customer message runs through this graph. Routing is deterministic at classify_node.
              The LLM is only invoked inside generate_node.
            </p>
          </div>
          <StateMachineDiagram />
        </motion.section>

        {/* ── Conversation & Decision Design ────────────────────────── */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Conversation & Decision Design" />
          <p className="font-body text-sm text-on-surface-variant mb-4 leading-relaxed">
            Rather than piping every message directly to the LLM, the agent runs through a LangGraph
            state machine. Decisions happen in code, not in the model&apos;s imagination. Conversation
            history is persisted to Firestore so context accumulates across turns and survives
            reconnections. The tool-calling loop inside{' '}
            <code className="font-mono text-xs text-primary">generate_node</code> has a hard cap of
            5 iterations.
          </p>
          <Callout>
            I built n8n automations the same way: non-LLM nodes for initial classification, LLM nodes only
            where reasoning is actually needed. LangGraph let me own that pattern fully in code. The
            difference is I now control the entire state machine end-to-end.
          </Callout>

          <h3 className="font-headline text-sm font-semibold text-on-surface mb-3 mt-4">Honest Assessment</h3>
          <div className="space-y-2">
            {[
              {
                label: 'Graph is simple',
                text: "Three nodes. classify → (rag?) → generate. No branching back, no retry logic, no multi-agent handoff. It works, but it's not sophisticated.",
                warn: false,
              },
              {
                label: 'Intent is shallow',
                text: 'Keyword matching catches obvious cases. Anything ambiguous falls through to the default RAG path. A real intent layer would handle multi-intent messages and confidence scoring.',
                warn: true,
              },
              {
                label: 'Loop protection is thin',
                text: "The tool iteration cap exists, but there's limited protection against other failure modes: repeated unclear turns or the model getting stuck in a clarification loop.",
                warn: true,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex gap-3 p-4 rounded-lg bg-surface-container-low border border-outline-variant/15"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: item.warn ? '#ffa44c' : '#767575' }}
                />
                <div>
                  <p className="font-body text-xs font-semibold text-on-surface mb-0.5">{item.label}</p>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <Callout>
            The harder truth: the more complex this graph gets, the scarier it becomes to change. Dependencies
            grow faster than context windows. At a certain size, you start breaking things you can&apos;t see.
            This codebase is still small enough to manage, but hardening it for production means test coverage,
            versioned graph paths, and observability before complexity compounds.
          </Callout>
        </motion.section>

        {/* ── Hallucination & Safety Controls ───────────────────────── */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Hallucination & Safety Controls" accent="secondary" />
          <p className="font-body text-sm text-on-surface-variant mb-6 leading-relaxed">
            It uses a 3-layer approach: behavioral, deterministic, and post-generation. Honest caveat —
            the foundation is solid but this area needs the most future investment.
          </p>

          <div className="space-y-3 mb-6">
            {[
              {
                layer: '1',
                title: 'System Prompt',
                type: 'Behavioral · baked in',
                items: [
                  'Explicit anti-hallucination rules: never fabricate orders, ISBNs, prices, or policy details',
                  'Tool use is mandatory before any factual claim. No assumptions.',
                  'If unsure, say so and offer escalation. Fabrication is the worst failure mode.',
                ],
              },
              {
                layer: '2',
                title: 'classify_node',
                type: 'Deterministic · pre-LLM · no model call',
                items: [
                  'Legal keywords, frustration signals, all-caps → escalate_immediately=true without LLM deliberation',
                  "Order/return intent → skip RAG so the model can't hallucinate catalog results it never receives",
                  'Hard-coded keyword sets, fast and predictable, but not exhaustive',
                ],
              },
              {
                layer: '3',
                title: '_safe_response()',
                type: 'Post-LLM · regex scan',
                items: [
                  'Scans output for credit card patterns, SSNs, and prompt injection phrases',
                  'Matched output replaced with a safe fallback before leaving the graph',
                  'Catches known attack patterns but not robust against novel injection attempts',
                ],
              },
            ].map((card) => (
              <div key={card.layer} className="rounded-xl border border-outline-variant/15 overflow-hidden">
                <div className="px-5 py-3 bg-surface-container-high flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black font-mono flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #ffa44c, #fd9000)', color: '#0e0e0e' }}
                  >
                    {card.layer}
                  </div>
                  <div>
                    <p className="font-headline text-sm font-bold text-on-surface">{card.title}</p>
                    <p className="font-mono text-[9px] text-on-surface-variant">{card.type}</p>
                  </div>
                </div>
                <ul className="px-5 py-3 space-y-1.5">
                  {card.items.map((item, i) => (
                    <li key={i} className="flex gap-2 font-body text-xs text-on-surface-variant">
                      <span className="text-primary flex-shrink-0 mt-0.5">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h3 className="font-headline text-sm font-semibold text-on-surface mb-3">What&apos;s Missing</h3>
          <div className="space-y-2">
            {[
              {
                label: 'RAG quality is unvalidated',
                text: "Chunking and embedding were built to work, not to be optimal. No eval harness means I can't measure retrieval precision or hallucination rate.",
              },
              {
                label: 'No grounding verification',
                text: "Nothing cross-checks whether the model's response is actually supported by what was retrieved. A real grounding layer would do this.",
              },
              {
                label: 'No adversarial injection detection',
                text: '_safe_response() catches known patterns. A tool like Lakera Guard or a prompt-injection-trained classifier would catch novel attacks. The passcode is the primary current barrier.',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex gap-3 p-4 rounded-lg border"
                style={{ backgroundColor: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.15)' }}
              >
                <span className="text-red-400 text-xs mt-0.5 flex-shrink-0 font-bold">!</span>
                <div>
                  <p className="font-body text-xs font-semibold text-on-surface mb-0.5">{item.label}</p>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <Callout>
            This is probably a sprint of its own. RAG quality alone (eval harness, chunking strategy review,
            retrieval tuning, grounding verification) is meaningful work before I&apos;d trust this with real customers.
          </Callout>
        </motion.section>

        {/* ── System Prompt ──────────────────────────────────────────── */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="System Prompt" />
          <p className="font-body text-sm text-on-surface-variant mb-4 leading-relaxed">
            The full live system prompt can be viewed in the{' '}
            <button
              onClick={switchToSystemTab}
              className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity font-semibold"
            >
              System Info tab →
            </button>
          </p>
          <Callout>
            I started with the ChatGPT system prompt template as a baseline, then searched for
            customer support-specific prompts. They&apos;re surprisingly hard to find in the wild. The
            breakthrough was adding a customer support ticket incidence diagram to the context window to
            extract the most realistic and frequently used support paths. That diagram directly informed both
            the system prompt structure and the LangGraph graph states. The scope, fallback ladder, escalation
            triggers, and tool descriptions all came from it.
          </Callout>

          <div className="rounded-xl overflow-hidden border border-outline-variant/15 mb-6">
            <div className="px-4 py-2.5 bg-surface-container-high border-b border-outline-variant/15">
              <p className="font-mono text-[10px] text-on-surface-variant font-semibold">CustomerSupportTicketIncidence.png — used as context input</p>
            </div>
            <div className="relative w-full bg-surface-container-low">
              <Image
                src="/CustomerSupportTicketIncidence.png"
                alt="Customer Support Ticket Incidence diagram used to inform system prompt design"
                width={800}
                height={500}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          <div className="space-y-2">
            {[
              { section: 'IDENTITY & SCOPE', desc: 'What Bookly is, what it handles, what it redirects. Explicit in/out-of-scope lists.' },
              { section: 'CONVERSATION MANAGEMENT', desc: 'One clarifying question max per turn, topic-switch handling, 120-word reply target' },
              { section: 'ANTI-HALLUCINATION RULES', desc: 'Never fabricate. Tool use mandatory for all factual claims. If unsure, say so.' },
              { section: 'FALLBACK LADDER', desc: '3-strike escalation: unclear → surface capabilities → human handoff' },
              { section: 'HARD GUARDRAILS', desc: 'No payments, no credentials, no PII collection, no persona overrides' },
              { section: 'TOOL USE INSTRUCTIONS', desc: 'When to call each tool, what to say before/after, how to handle failures' },
            ].map((row) => (
              <div
                key={row.section}
                className="flex gap-4 p-3 rounded-lg bg-surface-container-low border border-outline-variant/15 items-start"
              >
                <span className="font-mono text-[9px] text-primary font-bold flex-shrink-0 pt-0.5 w-40">
                  {row.section}
                </span>
                <p className="font-body text-xs text-on-surface-variant">{row.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Production Readiness ───────────────────────────────────── */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Production Readiness: What I'd Change" accent="secondary" />
          <p className="font-body text-sm text-on-surface-variant mb-6 italic">
            This is a working prototype. Here&apos;s an honest account of what production would actually require.
          </p>

          {[
            {
              group: 'Code & Architecture',
              icon: 'construction',
              items: [
                { label: 'Code debt', text: 'Orchestrated by me, generated at speed. A real productization pass requires cleanup, standardization, and consistent patterns throughout.' },
                { label: 'Further componentization', text: 'Frontend and agent are separated. Several other components (RAG pipeline, checkpointer, tool layer) should be independently containerized and deployable.' },
                { label: 'Session store sync', text: 'localStorage session works so well that the Firestore session store is currently broken. For a POC, irrelevant. For production, they need to be in sync.' },
              ],
            },
            {
              group: 'Security & Safety',
              icon: 'security',
              items: [
                { label: 'Prompt injection detection', text: "No dedicated injection layer. I'd add Lakera Guard or a prompt-injection-trained classifier at the gateway. The passcode is the only current gate, which is why it's password protected." },
                { label: 'Security hardening', text: 'Almost nothing is secured beyond the passcode. Service-to-service auth, Firestore security rules, and secrets rotation all required before real users.' },
              ],
            },
            {
              group: 'Observability',
              icon: 'monitor_heart',
              items: [
                { label: 'No compromise here, this is my background', text: "Errors are logged as info messages in places, no visibility into conversation state, no alerting. Full structured logging, distributed tracing, and dashboards before anything goes live." },
              ],
            },
            {
              group: 'Intelligence & Routing',
              icon: 'alt_route',
              items: [
                { label: 'Better intent layer', text: 'Keyword matching catches obvious cases. A real intent layer handles ambiguous and multi-intent messages with confidence scoring.' },
                { label: 'OpenRouter for model routing', text: 'Add OpenRouter for model failover, route smaller models to low-stakes tasks, reserve Grok for complex generation. Cost optimization and resilience in one move.' },
                { label: 'Real tool connections', text: 'All 6 tools are mock implementations returning randomized responses. Connecting to real order management, catalog, and CRM systems is the obvious next step.' },
              ],
            },
            {
              group: 'Scaling',
              icon: 'expand',
              items: [
                { label: 'No scaling strategy today', text: "Cloud Run gives automatic scaling, but I don't know which components will be under the most load. That requires load testing before committing to a scaling architecture." },
              ],
            },
          ].map((group) => (
            <div key={group.group} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-on-surface-variant text-base">{group.icon}</span>
                <h3 className="font-headline text-sm font-bold text-on-surface">{group.group}</h3>
              </div>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex gap-3 p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/15"
                  >
                    <span className="text-primary text-xs mt-0.5 flex-shrink-0">·</span>
                    <div>
                      <p className="font-body text-xs font-semibold text-on-surface mb-0.5">{item.label}</p>
                      <p className="font-body text-xs text-on-surface-variant leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Callout>
            I considered adding versioned agent paths and a visual way to see how those paths perform in
            production. Then I realized I would have essentially built Decagon, and that felt like showing off.
          </Callout>
        </motion.section>

      </motion.div>
    </div>
  )
}
