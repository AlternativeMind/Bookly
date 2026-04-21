'use client'

import dynamic from 'next/dynamic'

const AppShell = dynamic(() => import('@/components/AppShell'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#0e0e0e]" />,
})

export default function ChatPage() {
  return <AppShell />
}
