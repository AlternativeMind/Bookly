# Bookly AI

**Live demo:** https://bookly-frontend-283467385921.us-central1.run.app

A proof-of-concept AI customer service assistant for a bookstore, built as a standalone showcase for the Decagon Solutions Engineering Take-Home Assignment. The application is intentionally self-contained — every design decision, architectural choice, and honest trade-off is documented inside the app itself, not in a separate write-up.

---

## What this is

Bookly is a working customer support chatbot backed by a real book catalog (281k titles), a RAG pipeline, and an AI agent with tool-calling capability. It handles order inquiries, returns, book recommendations, and policy questions — and escalates to a human when it should.

This is a POC. It is fully functional and deployed, but several components are intentionally stubbed out (tool integrations return mock data) and a number of production concerns are acknowledged but not yet resolved. The goal was to demonstrate design thinking and end-to-end delivery, not production-readiness.

---

## How to explore it

The app is the documentation. Log in with the passcode and use the tabs:

| Tab | What it's for |
|-----|---------------|
| **Chat** | Talk to the agent. Ask about books, orders, returns. Try edge cases. |
| **Design** | The full agent design document — architecture, decisions, guardrails, system prompt, and production trade-offs. Start here if you're reviewing the submission. |
| **Examples** | Pre-loaded prompts covering the main support scenarios. One click to run any of them. |
| **History** | Past sessions, resumable. |
| **System Info** | The live system prompt, current session state, and agent configuration. |

The trace panel (available during any chat) shows the agent pipeline in real time: classification routing, RAG retrieval, tool calls, and response generation as they happen.

---

## Implementation details

Architecture, design decisions, guardrail layers, LangGraph state machine, and production readiness notes are all covered in the **Design tab** of the live app.

For the code itself, this repository is structured as two independent services:

```
Bookly/
├── frontend/   # Next.js 15, deployed to Cloud Run
└── agent/      # Python FastAPI + LangGraph, deployed to Cloud Run
```

---

## Build stats

Built entirely with Claude Code (Sonnet 4.6) as the autonomous engineering agent.

| | |
|---|---|
| **Calendar time** | 2 days, 6 hours (Apr 20–23, 2026) |
| **Commits** | 35 |
| **Pull requests** | 17 |
| **Files created/modified** | 63 |
| **Lines of code added** | 17,771 |
| **Claude sessions** | 9 |
| **Tokens processed** | ~165M (input + output + cache) |
| **Estimated API cost** | ~$90 |

The high token count is dominated by prompt cache reads (~155M) — large context windows reused across turns as the codebase grew. Net generative output was ~590K tokens.

---

## Access

The app is password protected. Passcode available on request.
