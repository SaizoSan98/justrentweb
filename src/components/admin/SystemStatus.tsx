
"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export function SystemStatus() {
  const [status, setStatus] = useState<'loading' | 'operational' | 'degraded' | 'down'>('loading')
  const [latency, setLatency] = useState<number | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      const start = Date.now()
      try {
        // We'll use a simple fetch to the home page or an API endpoint to check latency
        const res = await fetch('/api/health', { cache: 'no-store' })
        const end = Date.now()
        setLatency(end - start)
        
        if (res.ok) {
          setStatus('operational')
        } else {
          setStatus('degraded')
        }
      } catch (error) {
        setStatus('down')
      }
    }

    checkStatus()
    // Poll every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (status === 'loading') {
    return (
      <div className="px-4 py-2 bg-white rounded-full border border-zinc-200 text-zinc-500 text-sm flex items-center gap-2 shadow-sm">
        <Loader2 className="w-3 h-3 animate-spin" />
        Checking Systems...
      </div>
    )
  }

  if (status === 'down') {
    return (
      <div className="px-4 py-2 bg-red-50 rounded-full border border-red-200 text-red-700 text-sm flex items-center gap-2 shadow-sm animate-pulse">
        <div className="w-2 h-2 rounded-full bg-red-500"></div>
        System Offline
      </div>
    )
  }

  if (status === 'degraded') {
    return (
      <div className="px-4 py-2 bg-yellow-50 rounded-full border border-yellow-200 text-yellow-700 text-sm flex items-center gap-2 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
        Performance Degraded {latency && `(${latency}ms)`}
      </div>
    )
  }

  return (
    <div className="px-4 py-2 bg-white rounded-full border border-zinc-200 text-zinc-500 text-sm flex items-center gap-2 shadow-sm transition-all hover:border-green-200 hover:text-green-700 hover:bg-green-50">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      System Operational {latency && <span className="text-xs text-zinc-400 font-mono ml-1">{latency}ms</span>}
    </div>
  )
}
