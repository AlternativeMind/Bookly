'use client'

import { motion } from 'framer-motion'
import clsx from 'clsx'

type Tab = 'chat' | 'design' | 'examples' | 'history' | 'system'

interface SidebarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onNewChat: () => void
}

const navItems: { tab: Tab; label: string; icon: string }[] = [
  { tab: 'chat', label: 'Chat', icon: 'chat' },
  { tab: 'history', label: 'History', icon: 'history' },
  { tab: 'examples', label: 'Examples', icon: 'auto_awesome' },
  { tab: 'design', label: 'Design', icon: 'design_services' },
  { tab: 'system', label: 'System Info', icon: 'settings_suggest' },
]

export default function Sidebar({ activeTab, onTabChange, onNewChat }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-[57px] h-[calc(100vh-57px)] p-6 w-64 bg-background"
        style={{ borderRight: '1px solid rgba(72,72,71,0.15)' }}
      >
        <button
          onClick={onNewChat}
          className="mb-8 w-full py-3 px-4 rounded-full text-on-primary font-bold font-body text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #ffa44c, #fd9000)' }}
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Chat
        </button>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ tab, label, icon }) => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 text-sm font-body transition-all text-left',
                  isActive
                    ? 'text-primary border-r-4 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                )}
                style={
                  isActive
                    ? { background: 'linear-gradient(to right, rgba(255,164,76,0.10), transparent)' }
                    : {}
                }
              >
                <span
                  className="material-symbols-outlined"
                  style={
                    isActive
                      ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
                      : {}
                  }
                >
                  {icon}
                </span>
                <span className="uppercase tracking-widest text-xs">{label}</span>
              </button>
            )
          })}
        </nav>

        <div
          className="mt-auto space-y-1 pt-6"
          style={{ borderTop: '1px solid rgba(72,72,71,0.15)' }}
        >
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface transition-all font-body text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span>Settings</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface transition-all font-body text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">contact_support</span>
            <span>Support</span>
          </a>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container flex items-center justify-around px-2 py-2 border-t border-outline-variant/15">
        {navItems.map(({ tab, label, icon }) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={clsx(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all font-body',
                isActive ? 'text-primary bg-surface-container-high' : 'text-on-surface-variant'
              )}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={
                  isActive
                    ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
                    : {}
                }
              >
                {icon}
              </span>
              <span className="text-[10px] uppercase tracking-widest">{label}</span>
            </button>
          )
        })}
        <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-on-surface-variant transition-all font-body">
          <span className="material-symbols-outlined text-xl">account_circle</span>
          <span className="text-[10px] uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </>
  )
}
