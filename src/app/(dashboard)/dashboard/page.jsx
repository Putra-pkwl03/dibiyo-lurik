'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Package, ShoppingBag, RefreshCw, ClipboardList } from 'lucide-react'

// Pemuatan dinamis (Dynamic Import)
const StatCards = dynamic(() => import('@/app/components/kp-produk/StatCards'), { ssr: false })
const LatestProductsTable = dynamic(() => import('@/app/components/kp-produk/LatestProductsTable'), { ssr: false })
const LatestPreOrdersTable = dynamic(() => import('@/app/components/kp-produk/LatestPreOrdersTable'), { ssr: false })
const RevenueChart = dynamic(() => import('@/app/components/owner/RevenueChart'), { ssr: false })

export default function DashboardPage() {
  // Main Data (Summary & Terlaris)
  const [mainData, setMainData] = useState(null)
  const [loadingMain, setLoadingMain] = useState(true)

  // Lazy Data (Pre-order & Revenue)
  const [preOrders, setPreOrders] = useState([])
  const [loadingPO, setLoadingPO] = useState(true)
  
  // Perubahan: Mengubah state awal menjadi objek yang sesuai dengan struktur data API baru
  const [revenue, setRevenue] = useState({
    graphData: Array(12).fill(0),
    totals: { orders: 0, por: 0, poc: 0 }
  })
  const [loadingRevenue, setLoadingRevenue] = useState(false)

  useEffect(() => {
    const fetchMainData = async () => {
      try {
        const res = await fetch('/api/dashboard')
        const result = await res.json()
        if (res.ok) {
          setMainData(result)
          if (result.isOwner) {
            fetchRevenueData()
          }
        }
      } catch (err) {
        console.error('Gagal memuat data inti dashboard:', err)
      } finally {
        setLoadingMain(false)
      }
    }

    const fetchPOData = async () => {
      try {
        const res = await fetch('/api/dashboard/pre-order')
        const result = await res.json()
        if (res.ok) setPreOrders(result)
      } catch (err) {
        console.error('Gagal memuat data pre-order:', err)
      } finally {
        setLoadingPO(false)
      }
    }

    const fetchRevenueData = async () => {
      setLoadingRevenue(true)
      try {
        const res = await fetch('/api/dashboard/revenue')
        const result = await res.json()
        if (res.ok) setRevenue(result)
      } catch (err) {
        console.error('Gagal memuat data omzet:', err)
      } finally {
        setLoadingRevenue(false)
      }
    }

    fetchMainData()
    fetchPOData()
  }, [])

  const stats = [
    { label: 'Produk Tersedia', value: mainData?.summary?.produkTersedia || 0, color: 'text-[#A47352] bg-[#F4EAE1] border-[#DDB892]/50', icon: Package },
    { label: 'Produk Terjual', value: mainData?.summary?.produkSold || 0, color: 'text-[#A47352] bg-[#F4EAE1] border-[#DDB892]/50', icon: ShoppingBag },
    { label: 'Produk Dalam Proses', value: mainData?.summary?.poDalamProses || 0, color: 'text-[#A47352] bg-[#F4EAE1] border-[#DDB892]/50', icon: RefreshCw },
    { label: 'Produk Sedang di Proses', value: mainData?.summary?.poSedangDiproses || 0, color: 'text-[#A47352] bg-[#F4EAE1] border-[#DDB892]/50', icon: ClipboardList },
  ]

  return (
    <div className="w-full mx-auto space-y-6"> 
      
      <header className="mb-2 overflow-x-visible">
        <h2 className="text-lg sm:text-[24px] font-medium text-black pb-2 sm:pb-5 border-b border-gray-500 tracking-wide -mx-4 px-4 sm:-mx-6 sm:px-6">
          Dashboard
        </h2>
      </header>

      {/* 1. BAGIAN STAT CARDS (SUMMARY) */}
      {loadingMain ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col justify-between h-24 sm:h-28 p-4 sm:p-5 bg-[#F4EAE1]/40 border rounded-xl border-[#DDB892]/30">
              <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
              <div className="w-1/3 mt-2 bg-gray-200 rounded h-7 sm:h-8"></div>
            </div>
          ))}
        </div>
      ) : (
        <StatCards stats={stats} />
      )}

      {/* 2. BAGIAN GRAFIK PENDAPATAN */}
      {loadingMain ? (
        <div className="flex flex-col justify-between p-4 sm:p-6 bg-[#F4EAE1]/40 border h-64 sm:h-80 animate-pulse rounded-2xl border-[#DDB892]/30">
          <div className="w-1/4 h-5 bg-gray-200 rounded"></div>
          <div className="w-full mt-4 bg-gray-200 rounded h-36 sm:h-44"></div>
        </div>
      ) : (
        mainData?.isOwner && (
          <div className="space-y-3">
            <span className="inline-block pl-1 text-base font-semibold text-black sm:text-lg">
              Grafik Pendapatan
            </span>
            {loadingRevenue ? (
              <div className="flex flex-col justify-between p-4 sm:p-6 bg-[#F4EAE1]/40 border h-64 sm:h-80 animate-pulse rounded-2xl border-[#DDB892]/30">
                <div className="w-1/4 h-5 bg-gray-200 rounded"></div>
                <div className="w-full mt-4 bg-gray-200 rounded h-36 sm:h-44"></div>
              </div>
            ) : (
              <div className="bg-white border border-[#F4EAE1]/40 rounded-2xl p-2 sm:p-4 shadow-sm w-full overflow-hidden">
                {/* Perubahan: Mengirimkan objek state baru lewat prop 'data' */}
                <RevenueChart data={revenue} />
              </div>
            )}
          </div>
        )
      )}

      {/* 3. TABEL DATA UTAMA */}
      <div className="grid grid-cols-1 gap-6 space-y-2 xl:grid-cols-1 xl:gap-8 xl:space-y-0">
        {loadingMain ? (
          <div className="p-4 sm:p-6 space-y-4 bg-[#F4EAE1]/20 border animate-pulse rounded-2xl border-[#DDB892]/30">
            <div className="w-1/5 h-5 bg-gray-200 rounded"></div>
            <div className="mt-4 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full h-10 bg-gray-200 rounded sm:h-12"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#DDB892]/30 rounded-2xl shadow-sm transition-all duration-300 w-full overflow-hidden">
            <LatestProductsTable products={mainData?.produkTerlaris || []} />
          </div>
        )}

        {loadingPO ? (
          <div className="p-4 sm:p-6 space-y-4 bg-[#F4EAE1]/20 border animate-pulse rounded-2xl border-[#DDB892]/30">
            <div className="w-1/5 h-5 bg-gray-200 rounded"></div>
            <div className="mt-4 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full h-10 bg-gray-200 rounded sm:h-12"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#DDB892]/30 rounded-2xl shadow-sm transition-all duration-300 w-full overflow-hidden">
            <LatestPreOrdersTable preOrders={preOrders} />
          </div>
        )}
      </div>
    </div>
  )
}