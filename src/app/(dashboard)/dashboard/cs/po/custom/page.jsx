'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Search, Filter } from 'lucide-react'

const POCustomTable = dynamic(() => import('../../../../../components/cs/po/poc/POCustomTable'), { ssr: false })

// Komponen Skeleton Loader untuk Tabel PO Custom
function TableSkeleton() {
  return (
    <div className="w-full overflow-x-auto border rounded-sm border-stone-100 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-[#1A335A]/90 h-11 w-full flex items-center px-4 justify-between gap-4">
        <div className="w-12 h-4 rounded bg-stone-300/30"></div>
        <div className="flex-1 w-32 h-4 rounded bg-stone-300/30"></div>
        <div className="flex-1 hidden h-4 rounded bg-stone-300/30 w-28 sm:block"></div>
        <div className="flex-1 h-4 rounded bg-stone-300/30 w-36"></div>
        <div className="flex-1 hidden w-24 h-4 rounded bg-stone-300/30 md:block"></div>
        <div className="flex-1 w-24 h-4 rounded bg-stone-300/30"></div>
        <div className="w-16 h-4 rounded bg-stone-300/30"></div>
      </div>
      
      {/* Rows Skeleton (5 Baris) */}
      <div className="bg-white divide-y divide-stone-100">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center justify-between h-16 gap-4 px-4 py-4">
            <div className="w-8 h-4 rounded bg-stone-200"></div>
            <div className="flex-1 w-32 h-4 rounded bg-stone-200"></div>
            <div className="flex-1 hidden h-4 rounded bg-stone-200 w-28 sm:block"></div>
            <div className="flex-1 h-4 rounded bg-stone-200 w-36"></div>
            <div className="flex-1 hidden w-24 h-4 rounded bg-stone-200 md:block"></div>
            <div className="flex-1 w-24 h-4 rounded bg-stone-200"></div>
            <div className="w-16 rounded-lg h-7 bg-stone-200 shrink-0"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PreOrderCustomPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusProduksi, setStatusProduksi] = useState('')
  const [statusPembayaran, setStatusPembayaran] = useState('')

  useEffect(() => {
    fetchData(true) 
  }, [])

 const fetchData = async (isInitial = false) => {
  if (isInitial) setLoading(true)
  try {
    const res = await fetch('/api/pre-order-custom') 
    const json = await res.json()
    
    // ========================================================
    // LOG UNTUK PASKA-DEBUGGING MULTI-ITEM
    // ========================================================
    console.group("🔍 [DEBUG] FETCH PRE-ORDER CUSTOM");
    console.log("Raw JSON Response:", json);
    if (json.data && json.data.length > 0) {
      console.log("Contoh Struktur Item Pertama:", json.data[0]);
      console.log("Apakah ada array produk di dalam item[0]?:", {
        detail_produk: json.data[0].detail_produk,
        items: json.data[0].items
      });
    } else {
      console.warn("Response sukses tapi 'json.data' kosong atau tidak ditemukan.");
    }
    console.groupEnd();
    // ========================================================

    setData(Array.isArray(json.data) ? json.data : [])
  } catch (err) {
    console.error("❌ [FETCH-ERROR] Gagal mengambil data PO Custom:", err)
    setData([])
  } finally {
    if (isInitial) setLoading(false)
  }
}

  const handleConfirmReceiptSuccess = (confirmedId) => {
    setData((prevData) => prevData.filter((item) => item.id !== confirmedId))
    
    fetchData(false)
  }

  const filteredData = data.filter((item) => {
    const matchesSearch = 
      item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nama_customer?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesProduksi = statusProduksi 
      ? item.status === statusProduksi 
      : true

    const matchesPembayaran = statusPembayaran 
      ? item.status_pembayaran?.toLowerCase() === statusPembayaran.toLowerCase() 
      : true

    return matchesSearch && matchesProduksi && matchesPembayaran
  })

  return (
    <div className="w-full mx-auto space-y-4 text-black font-inter">
      <div className="relative overflow-x-visible">
        <h2 className="text-lg sm:text-[24px] font-medium text-black pb-2 sm:pb-5 border-b border-gray-500 tracking-wide -mx-4 px-4 sm:-mx-6 sm:px-6">
          Pre Order Custom
        </h2>
      </div>
      
      <div className="p-6 bg-white border rounded-lg shadow-sm border-stone-200">
        <div className="flex flex-col justify-between gap-4 mb-6 md:flex-row md:items-center">
          <h2 className="text-sm font-bold text-black min-w-max">
            List Pre Order Custom
          </h2>
          
          <div className="flex flex-col items-center justify-end flex-1 w-full gap-3 sm:flex-row md:w-auto">
            <div className="relative w-full sm:max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Cari ID atau nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[38px] bg-[#5AE3ED1C] pl-9 pr-4 border border-[#1A335A]/20 rounded-md text-xs text-stone-800 font-medium outline-none placeholder-gray-400"
              />
            </div>

            <div className="relative flex items-center w-full sm:w-auto">
              <span className="absolute text-black pointer-events-none left-3">
                <Filter size={12} />
              </span>
              <select
                value={statusProduksi}
                onChange={(e) => setStatusProduksi(e.target.value)}
                className="w-full h-[38px] sm:w-auto pl-8 pr-8 bg-[#5AE3ED1C] border border-[#1A335A]/20 rounded-md text-xs text-black font-bold outline-none appearance-none cursor-pointer"
              >
                <option value="">Semua Prosedur</option>
                <option value="sedang_diproses">Sedang Diproses</option>
                <option value="dalam_proses">Dalam Proses</option>
                <option value="selesai_diproses">Selesai Diproses</option>
              </select>
              <span className="absolute right-3 pointer-events-none text-black text-[10px]">▼</span>
            </div>

            <div className="relative flex items-center w-full sm:w-auto">
              <span className="absolute text-black pointer-events-none left-3">
                <Filter size={12} />
              </span>
              <select
                value={statusPembayaran}
                onChange={(e) => setStatusPembayaran(e.target.value)}
                className="w-full h-[38px] sm:w-auto pl-8 pr-8 bg-[#5AE3ED1C] border border-[#1A335A]/20 rounded-md text-xs text-black font-bold outline-none appearance-none cursor-pointer"
              >
                <option value="">Semua Pembayaran</option>
                <option value="dp">DP</option>
                <option value="lunas">LUNAS</option>
              </select>
              <span className="absolute right-3 pointer-events-none text-black text-[10px]">▼</span>
            </div>
          </div>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : (
          <POCustomTable 
            data={filteredData} 
            onConfirmReceipt={handleConfirmReceiptSuccess} 
          />
        )}
      </div>
    </div>
  )
}