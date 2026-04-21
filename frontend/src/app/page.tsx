'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/session'
import dynamic from 'next/dynamic'

const PasscodeScreen = dynamic(() => import('@/components/PasscodeScreen'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#0e0e0e]" />,
})

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const session = getSession()
    if (session?.sessionId) {
      router.replace('/chat')
    }
  }, [router])

  return <PasscodeScreen />
}
