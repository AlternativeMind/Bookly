'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from 'recharts'

// ── Fake daily data (Apr 1–30) ────────────────────────────────────────────────

const dates = [
  '4/1','4/2','4/3','4/4','4/5','4/6','4/7','4/8','4/9','4/10',
  '4/11','4/12','4/13','4/14','4/15','4/16','4/17','4/18','4/19','4/20',
  '4/21','4/22','4/23','4/24','4/25','4/26','4/27','4/28','4/29','4/30',
]

// Negative Sentiment — frustrated (flagged) vs calm
const negSentimentData = dates.map((date, i) => ({
  date,
  Frustrated: Math.round(8 + i * 0.6 + Math.sin(i * 0.7) * 5),
  Neutral:    Math.round(14 + i * 0.4 + Math.cos(i * 0.5) * 4),
}))

// Policy Complaints — breakdown by policy type
const policyData = dates.map((date, i) => ({
  date,
  'Cancellation':   Math.round(4 + i * 0.2 + Math.sin(i * 0.9) * 3),
  'Refund':         Math.round(3 + i * 0.15 + Math.cos(i * 0.6) * 2),
  'Booking Terms':  Math.round(2 + Math.sin(i * 1.1) * 2),
  'Other':          Math.round(1 + Math.cos(i * 0.8) * 1),
}))

// Upgrade Opportunity — breakdown by opportunity type
const upgradeData = dates.map((date, i) => ({
  date,
  'Premium Listing': Math.round(3 + i * 0.25 + Math.sin(i * 0.6) * 3),
  'Extended Stay':   Math.round(2 + i * 0.15 + Math.cos(i * 0.8) * 2),
  'Add-ons':         Math.round(1 + Math.sin(i * 1.2) * 1),
}))

// ── Types ─────────────────────────────────────────────────────────────────────

type Breakdown = 'daily' | 'weekly'

interface WatchCardProps {
  title: string
  analyzed: string
  flaggedRate: string
  data: Record<string, string | number>[]
  categories: { key: string; color: string }[]
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const axisStyle = { fill: '#adaaaa', fontSize: 10, fontFamily: 'Manrope' }
const gridStyle = { stroke: 'rgba(72,72,71,0.2)' }

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ color: string; name: string; value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl p-3 font-body text-xs space-y-1"
      style={{ background: '#1a1a1a', border: '1px solid rgba(72,72,71,0.3)' }}>
      {label && <p className="text-on-surface-variant mb-1">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-on-surface-variant">{p.name}:</span>
          <span className="text-on-surface font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── WatchCard ─────────────────────────────────────────────────────────────────

function WatchCard({ title, analyzed, flaggedRate, data, categories }: WatchCardProps) {
  const [breakdown, setBreakdown] = useState<Breakdown>('daily')

  const displayData = breakdown === 'weekly'
    ? data.filter((_, i) => i % 7 === 0)
    : data.filter((_, i) => i % 3 === 0) // thin out daily for readability

  return (
    <div className="bg-surface-container rounded-xl p-5 flex flex-col gap-4"
      style={{ border: '1px solid rgba(72,72,71,0.15)' }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-headline font-bold text-on-surface">{title}</h3>
        <button className="text-on-surface-variant hover:text-on-surface transition-colors mt-0.5">
          <span className="material-symbols-outlined text-[18px]">more_vert</span>
        </button>
      </div>

      {/* KPI mini-cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface-container-high rounded-lg p-3" style={{ border: '1px solid rgba(72,72,71,0.15)' }}>
          <p className="text-[10px] font-body text-on-surface-variant">Conversations Analyzed</p>
          <p className="text-xl font-headline font-bold text-on-surface mt-0.5">{analyzed}</p>
        </div>
        <div className="bg-surface-container-high rounded-lg p-3" style={{ border: '1px solid rgba(72,72,71,0.15)' }}>
          <p className="text-[10px] font-body text-on-surface-variant">Flagged Rate</p>
          <p className="text-xl font-headline font-bold text-on-surface mt-0.5">{flaggedRate}</p>
        </div>
      </div>

      {/* Breakdown selector */}
      <div className="flex items-center justify-end">
        <select
          value={breakdown}
          onChange={e => setBreakdown(e.target.value as Breakdown)}
          className="text-xs font-body text-on-surface-variant bg-surface-container-high rounded-lg px-3 py-1.5 outline-none cursor-pointer"
          style={{ border: '1px solid rgba(72,72,71,0.2)' }}
        >
          <option value="daily">Daily Breakdown</option>
          <option value="weekly">Weekly Breakdown</option>
        </select>
      </div>

      {/* Stacked bar chart */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={displayData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={18}>
          <CartesianGrid strokeDasharray="3 3" {...gridStyle} vertical={false} />
          <XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Manrope', color: '#adaaaa', paddingTop: 8 }} iconType="square" iconSize={8} />
          {categories.map((cat, i) => (
            <Bar
              key={cat.key}
              dataKey={cat.key}
              stackId="a"
              fill={cat.color}
              radius={i === categories.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function WatchTowerView() {
  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-headline font-bold text-on-surface">WatchTower</h1>
        <p className="text-sm font-body text-on-surface-variant mt-1">
          Automated monitoring across all conversations — last 30 days
        </p>
      </div>

      {/* Alert summary strip */}
      <div className="flex flex-wrap gap-3">
        {[
          { icon: 'sentiment_very_dissatisfied', label: 'Negative Sentiment', value: '42.3%', color: '#ff7351' },
          { icon: 'policy',                      label: 'Policy Complaints',  value: '18.6%', color: '#ffa44c' },
          { icon: 'trending_up',                 label: 'Upgrade Opportunity', value: '5.2%', color: '#4ade80' },
        ].map(a => (
          <div key={a.label}
            className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3"
            style={{ border: `1px solid rgba(72,72,71,0.15)` }}>
            <span className="material-symbols-outlined text-[20px]" style={{ color: a.color }}>{a.icon}</span>
            <div>
              <p className="text-xs font-body text-on-surface-variant">{a.label}</p>
              <p className="text-base font-headline font-bold" style={{ color: a.color }}>{a.value} flagged</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WatchCard
          title="Negative Sentiment"
          analyzed="1,186"
          flaggedRate="42.3%"
          data={negSentimentData}
          categories={[
            { key: 'Neutral',    color: '#4ade80' },
            { key: 'Frustrated', color: '#ff7351' },
          ]}
        />
        <WatchCard
          title="Policy Complaints"
          analyzed="1,175"
          flaggedRate="18.6%"
          data={policyData}
          categories={[
            { key: 'Other',         color: '#818cf8' },
            { key: 'Booking Terms', color: '#4ade80' },
            { key: 'Refund',        color: '#f472b6' },
            { key: 'Cancellation',  color: '#22d3ee' },
          ]}
        />
        <WatchCard
          title="Upgrade Opportunity"
          analyzed="1,152"
          flaggedRate="5.2%"
          data={upgradeData}
          categories={[
            { key: 'Add-ons',         color: '#fbbf24' },
            { key: 'Extended Stay',   color: '#ffa44c' },
            { key: 'Premium Listing', color: '#ff7351' },
          ]}
        />
      </div>

      {/* Explainer */}
      <div className="bg-surface-container rounded-xl p-5" style={{ border: '1px solid rgba(72,72,71,0.15)' }}>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px] mt-0.5">info</span>
          <div className="space-y-1">
            <p className="text-sm font-body font-semibold text-on-surface">How WatchTower works</p>
            <p className="text-xs font-body text-on-surface-variant leading-relaxed">
              Every conversation is scored by the classify node in real time. Hard triggers (frustrated tone, legal language,
              all-caps messages) are flagged immediately. Upgrade signals are detected when users ask about premium options,
              extended availability, or add-on services. Flagged conversations are surfaced here for review.
            </p>
          </div>
        </div>
      </div>

      <div className="h-8" />
    </div>
  )
}
