'use client'

import React, { Suspense, useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar' 
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'

export default function DashboardLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleSidebarToggle = (e) => {
      setIsSidebarCollapsed(e.detail.isCollapsed)
    }

    window.addEventListener("sidebarToggle", handleSidebarToggle)
    return () => window.removeEventListener("sidebarToggle", handleSidebarToggle)
  }, [])

  // --- DETEKSI IDLE 1 MENIT (UNTUK TESTING) ---
  useEffect(() => {
    let idleTimer;
    const IDLE_TIMEOUT = 10 * 60 * 1000;

    const triggerLogout = async () => {
      NProgress.start()
      try {
        const res = await fetch('/api/auth/logout', { method: 'POST' })
        if (res.ok) {
          router.replace('/auth/login')
          router.refresh()
        } else {
        }
      } catch (error) {
      } finally {
        NProgress.done()
      }
    }

    const resetIdleTimer = (e) => {
      if (e) {
         } else {
      }

      clearTimeout(idleTimer)
      // Set ulang timer ke 1 menit ke depan
      idleTimer = setTimeout(triggerLogout, IDLE_TIMEOUT)
    }

    // Event listener yang menandakan user "aktif bergerak"
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetIdleTimer)
    })

    resetIdleTimer()

    // Clean up event listener saat unmount
    return () => {
      clearTimeout(idleTimer)
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer)
      })
    }
  }, [router])

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Suspense fallback={<div className="w-64 bg-[#8B5E3C] min-h-screen animate-pulse" />}>
        <Sidebar />
      </Suspense>

      <main className={`flex-1 min-h-screen p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  )
}

