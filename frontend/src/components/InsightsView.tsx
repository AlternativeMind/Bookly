'use client'

import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

// ── Fake data (30-day window: Apr 1–30 2026) ─────────────────────────────────

const dailyData = [
  { date: '4/1',  total: 32, deflected: 18 },
  { date: '4/2',  total: 35, deflected: 20 },
  { date: '4/3',  total: 28, deflected: 15 },
  { date: '4/4',  total: 30, deflected: 17 },
  { date: '4/5',  total: 38, deflected: 22 },
  { date: '4/6',  total: 41, deflected: 24 },
  { date: '4/7',  total: 44, deflected: 26 },
  { date: '4/8',  total: 40, deflected: 23 },
  { date: '4/9',  total: 37, deflected: 21 },
  { date: '4/10', total: 29, deflected: 16 },
  { date: '4/11', total: 33, deflected: 19 },
  { date: '4/12', total: 45, deflected: 27 },
  { date: '4/13', total: 48, deflected: 29 },
  { date: '4/14', total: 52, deflected: 31 },
  { date: '4/15', total: 49, deflected: 29 },
  { date: '4/16', total: 43, deflected: 25 },
  { date: '4/17', total: 36, deflected: 20 },
  { date: '4/18', total: 38, deflected: 22 },
  { date: '4/19', total: 46, deflected: 28 },
  { date: '4/20', total: 50, deflected: 30 },
  { date: '4/21', total: 55, deflected: 33 },
  { date: '4/22', total: 58, deflected: 35 },
  { date: '4/23', total: 54, deflected: 32 },
  { date: '4/24', total: 47, deflected: 28 },
  { date: '4/25', total: 42, deflected: 25 },
  { date: '4/26', total: 44, deflected: 26 },
  { date: '4/27', total: 51, deflected: 31 },
  { date: '4/28', total: 56, deflected: 34 },
  { date: '4/29', total: 59, deflected: 36 },
  { date: '4/30', total: 14, deflected: 8  },
]

const csatTrendData = [
  { week: 'Apr 1',  score: 3.9 },
  { week: 'Apr 8',  score: 4.1 },
  { week: 'Apr 15', score: 4.0 },
  { week: 'Apr 22', score: 4.2 },
  { week: 'Apr 29', score: 4.1 },
]

const hourlyData = [
  { hour: '12am', count: 2  },
  { hour: '1am',  count: 1  },
  { hour: '2am',  count: 3  },
  { hour: '3am',  count: 2  },
  { hour: '4am',  count: 5  },
  { hour: '5am',  count: 8  },
  { hour: '6am',  count: 18 },
  { hour: '7am',  count: 32 },
  { hour: '8am',  count: 48 },
  { hour: '9am',  count: 61 },
  { hour: '10am', count: 74, peak: true },
  { hour: '11am', count: 68 },
  { hour: '12pm', count: 72 },
  { hour: '1pm',  count: 66 },
  { hour: '2pm',  count: 58 },
  { hour: '3pm',  count: 54 },
  { hour: '4pm',  count: 49 },
  { hour: '5pm',  count: 44 },
  { hour: '6pm',  count: 36 },
  { hour: '7pm',  count: 28 },
  { hour: '8pm',  count: 20 },
  { hour: '9pm',  count: 14 },
  { hour: '10pm', count: 9  },
  { hour: '11pm', count: 4  },
]

const userMsgsData = [
  { label: '1',   pct: 22 },
  { label: '2',   pct: 19 },
  { label: '3',   pct: 17 },
  { label: '4',   pct: 13 },
  { label: '5',   pct: 7  },
  { label: '6',   pct: 5  },
  { label: '7',   pct: 4  },
  { label: '8',   pct: 7  },
  { label: '9',   pct: 1  },
  { label: '10+', pct: 5  },
]

const topicsAll = [
  { name: 'Booking Issues',        value: 28, color: '#ff7351' },
  { name: 'Availability Questions', value: 22, color: '#4ade80' },
  { name: 'Cancellation Requests', value: 18, color: '#ffa44c' },
  { name: 'Payment Errors',        value: 12, color: '#818cf8' },
  { name: 'Schedule Changes',      value: 9,  color: '#22d3ee' },
  { name: 'Login & Access',        value: 4,  color: '#f472b6' },
  { name: 'Security Concerns',     value: 2,  color: '#a3e635' },
  { name: 'Other',                 value: 5,  color: '#9ca3af' },
]

const topicsDeflected = [
  { name: 'Availability Questions', value: 35, color: '#4ade80' },
  { name: 'Booking Issues',        value: 30, color: '#ff7351' },
  { name: 'Schedule Changes',      value: 14, color: '#22d3ee' },
  { name: 'Cancellation Requests', value: 11, color: '#ffa44c' },
  { name: 'Other',                 value: 10, color: '#9ca3af' },
]

const topicsUndeflected = [
  { name: 'Booking Issues',        value: 38, color: '#ff7351' },
  { name: 'Payment Errors',        value: 22, color: '#818cf8' },
  { name: 'Cancellation Requests', value: 18, color: '#ffa44c' },
  { name: 'Login & Access',        value: 12, color: '#f472b6' },
  { name: 'Other',                 value: 10, color: '#9ca3af' },
]

const ratingBreakdown = [
  { score: 5, label: 'Very helpful',     count: 520, color: '#4ade80' },
  { score: 4, label: 'Helpful',          count: 198, color: '#818cf8' },
  { score: 3, label: 'Somewhat helpful', count: 42,  color: '#22d3ee' },
  { score: 2, label: 'Unhelpful',        count: 28,  color: '#fbbf24' },
  { score: 1, label: 'Very unhelpful',   count: 7,   color: '#ff7351' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function KPICard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-surface-container rounded-xl p-5" style={{ border: '1px solid rgba(72,72,71,0.15)' }}>
      <p className="text-3xl font-headline font-bold text-on-surface">{value}</p>
      <p className="text-sm font-body text-on-surface-variant mt-1">{label}</p>
    </div>
  )
}

const axisStyle = { fill: '#adaaaa', fontSize: 11, fontFamily: 'Manrope' }
const gridStyle = { stroke: 'rgba(72,72,71,0.2)' }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl p-3 font-body text-xs space-y-1"
      style={{ background: '#1a1a1a', border: '1px solid rgba(72,72,71,0.3)' }}>
      {label && <p className="text-on-surface-variant mb-1">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-on-surface-variant capitalize">{p.name}:</span>
          <span className="text-on-surface font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function InsightsView() {
  const [topicsTab, setTopicsTab] = useState<'all' | 'deflected' | 'undeflected'>('all')

  const topicsData =
    topicsTab === 'deflected' ? topicsDeflected :
    topicsTab === 'undeflected' ? topicsUndeflected :
    topicsAll

  const topicsTabs = [
    { key: 'all',          label: 'All Conversations' },
    { key: 'deflected',    label: 'Deflected' },
    { key: 'undeflected',  label: 'Undeflected' },
  ] as const

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <p className="text-center text-sm font-body text-on-surface-variant tracking-widest uppercase">
        Showing the last 30 days
      </p>

      {/* ── KPI Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard value="1,240" label="Conversations in last 30 days" />
        <KPICard value="58%"   label="Deflection rate" />
        <KPICard value="3.4"   label="User messages per conversation" />
      </div>

      {/* ── Daily Conversations ─────────────────────────────────────────── */}
      <div className="bg-surface-container rounded-xl p-6" style={{ border: '1px solid rgba(72,72,71,0.15)' }}>
        <h2 className="text-2xl font-headline font-bold text-on-surface">Daily Conversations</h2>
        <p className="text-sm font-body text-on-surface-variant mt-0.5 mb-6">~41 per day</p>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={dailyData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ffa44c" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#ffa44c" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gradDeflected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.65} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" {...gridStyle} vertical={false} />
            <XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, fontFamily: 'Manrope', color: '#adaaaa', paddingTop: 12 }}
              iconType="circle"
            />
            <Area type="monotone" dataKey="total"     name="total conversations" stroke="#ffa44c" strokeWidth={2} fill="url(#gradTotal)"     />
            <Area type="monotone" dataKey="deflected" name="deflected"           stroke="#818cf8" strokeWidth={2} fill="url(#gradDeflected)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Customer Satisfaction ──────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-2xl font-headline font-bold text-on-surface">Customer Satisfaction</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard value="4.1"  label="Average CSAT" />
          <KPICard value="4.2%" label="Conversations rated poorly (1–3)" />
          <KPICard value="0.3%" label="Ask-for-human rate" />
        </div>

        <div className="bg-surface-container rounded-xl p-6" style={{ border: '1px solid rgba(72,72,71,0.15)' }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-headline font-bold text-on-surface">CSAT</h3>
              <p className="text-xs font-body text-on-surface-variant mt-0.5">795 out of 1,240 conversations have scores (64.1%)</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-body text-on-surface-variant">
              <span className="w-3 h-3 rounded-full bg-[#818cf8] inline-block" />
              Weekly average
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-8">
            {/* Rating breakdown */}
            <div className="space-y-2 min-w-[220px]">
              {ratingBreakdown.map(r => (
                <div key={r.score} className="flex items-center gap-3 text-sm font-body">
                  <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: r.color }} />
                  <span className="text-on-surface-variant w-4">{r.score}</span>
                  <span className="text-on-surface-variant flex-1">{r.label}</span>
                  <span className="text-on-surface font-semibold">{r.count}</span>
                </div>
              ))}
            </div>

            {/* CSAT trend */}
            <div className="flex-1 min-h-[180px]">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={csatTrendData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradCsat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" {...gridStyle} vertical={false} />
                  <XAxis dataKey="week" tick={axisStyle} tickLine={false} axisLine={false} />
                  <YAxis tick={axisStyle} tickLine={false} axisLine={false} domain={[1, 5]} ticks={[1,2,3,4,5]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" name="CSAT" stroke="#818cf8" strokeWidth={2} fill="url(#gradCsat)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detailed Metrics ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-2xl font-headline font-bold text-on-surface">Detailed Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Hourly Volume */}
          <div className="bg-surface-container rounded-xl p-6" style={{ border: '1px solid rgba(72,72,71,0.15)' }}>
            <h3 className="text-lg font-headline font-bold text-on-surface mb-1">Hourly Volume Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourlyData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" {...gridStyle} vertical={false} />
                <XAxis dataKey="hour" tick={{ ...axisStyle, fontSize: 9 }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="conversations" radius={[3, 3, 0, 0]}>
                  {hourlyData.map((entry, i) => (
                    <Cell key={i} fill={entry.peak ? '#ff7351' : '#818cf8'} fillOpacity={entry.peak ? 1 : 0.55} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-surface-container-high rounded-lg p-3" style={{ border: '1px solid rgba(72,72,71,0.15)' }}>
                <div className="flex items-center gap-2 text-xs font-body">
                  <span className="w-3 h-3 rounded-sm" style={{ background: '#ff7351' }} />
                  <span className="text-on-surface font-semibold">10am – 11am</span>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Peak Hour</p>
              </div>
              <div className="bg-surface-container-high rounded-lg p-3" style={{ border: '1px solid rgba(72,72,71,0.15)' }}>
                <div className="flex items-center gap-2 text-xs font-body">
                  <span className="w-3 h-3 rounded-sm" style={{ background: '#818cf8' }} />
                  <span className="text-on-surface font-semibold">1am – 2am</span>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Off Hour</p>
              </div>
            </div>
          </div>

          {/* User Messages distribution */}
          <div className="bg-surface-container rounded-xl p-6" style={{ border: '1px solid rgba(72,72,71,0.15)' }}>
            <h3 className="text-lg font-headline font-bold text-on-surface mb-1">User Messages</h3>
            <p className="text-xs font-body text-on-surface-variant mb-4">Number of user messages per conversation</p>
            <div className="space-y-2">
              {userMsgsData.map(row => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="text-xs font-body text-on-surface-variant w-5 text-right flex-shrink-0">{row.label}</span>
                  <div className="flex-1 bg-surface-container-high rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${(row.pct / 22) * 100}%`, background: 'linear-gradient(90deg, #6366f1, #818cf8)' }}
                    >
                      <span className="text-[10px] font-body text-white font-semibold">{row.pct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── What are users asking? ───────────────────────────────────────── */}
      <div className="bg-surface-container rounded-xl p-6" style={{ border: '1px solid rgba(72,72,71,0.15)' }}>
        {/* Tab selector */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">What are users asking?</h2>
            <p className="text-xs font-body text-on-surface-variant mt-0.5">AI-categorised booking intents</p>
          </div>
          <div className="flex bg-surface-container-high rounded-full p-1 gap-1" style={{ border: '1px solid rgba(72,72,71,0.2)' }}>
            {topicsTabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTopicsTab(t.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-body transition-all ${
                  topicsTab === t.key
                    ? 'bg-surface-container text-on-surface font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 min-h-[280px]">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={topicsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  label={false}
                  labelLine={false}
                >
                  {topicsData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Share']}
                  contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(72,72,71,0.3)', borderRadius: 12, fontFamily: 'Manrope', fontSize: 12 }}
                  labelStyle={{ color: '#adaaaa' }}
                  itemStyle={{ color: '#ffffff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-2 min-w-[200px]">
            {topicsData.map(t => (
              <div key={t.name} className="flex items-center gap-2 text-sm font-body">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.color }} />
                <span className="text-on-surface-variant">{t.name}</span>
                <span className="ml-auto text-on-surface font-semibold">{t.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-8" />
    </div>
  )
}
