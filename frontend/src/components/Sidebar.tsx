'use client'

import { motion } from 'framer-motion'
import clsx from 'clsx'

type Tab = 'chat' | 'design' | 'examples' | 'history' | 'system' | 'insights' | 'watchtower' | 'graph'

interface SidebarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onNewChat: () => void
  onSettings: () => void
  onSupport: () => void
  keyboardOpen?: boolean
}

const navItems: { tab: Tab; label: string; icon: string }[] = [
  { tab: 'chat',       label: 'Chat',         icon: 'chat' },
  { tab: 'history',    label: 'Conversations', icon: 'history' },
  { tab: 'insights',   label: 'Insights',      icon: 'insights' },
  { tab: 'watchtower', label: 'WatchTower',    icon: 'crisis_alert' },
  { tab: 'graph',      label: 'Graph',         icon: 'account_tree' },
  { tab: 'examples',   label: 'Examples',      icon: 'auto_awesome' },
  { tab: 'design',     label: 'Design',        icon: 'design_services' },
  { tab: 'system',     label: 'System Info',   icon: 'settings_suggest' },
]

export default function Sidebar({ activeTab, onTabChange, onNewChat, onSettings, onSupport, keyboardOpen }: SidebarProps) {
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
          <button
            onClick={onSettings}
            className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface transition-all font-body text-sm text-left"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span>Settings</span>
          </button>
          <button
            onClick={onSupport}
            className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface transition-all font-body text-sm text-left"
          >
            <span className="material-symbols-outlined text-[18px]">contact_support</span>
            <span>Support</span>
          </button>
          <a
            href="https://github.com/AlternativeMind/Bookly/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface transition-all font-body text-sm"
          >
            <svg
              className="w-[18px] h-[18px] flex-shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </aside>

      {/* Mobile bottom nav — hidden when keyboard is open */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-surface-container flex items-center overflow-x-auto scrollbar-hide px-2 py-2 border-t border-outline-variant/15 ${keyboardOpen ? 'hidden' : 'md:hidden'}`}>
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
