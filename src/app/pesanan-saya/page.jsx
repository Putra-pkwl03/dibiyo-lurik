"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Footer from "../components/home/Footer.jsx"
import SkeletonPesananSaya from "../components/home/pesanan/SkeletonPesananSaya.jsx" 
import ListPesananSaya from "../components/home/pesanan/ListPesananSaya.jsx" 
import Swal from "sweetalert2" 

function OrderTracker({ status }) {
  const steps = ["pesanan di proses", "pesanan bisa diambil di toko sekarang", "pesanan di terima"]
  const currentIdx = steps.indexOf(status?.toLowerCase()) !== -1 ? steps.indexOf(status?.toLowerCase()) : 0

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-100 z-0">
          <div 
            className="h-full bg-[#d9a05b] transition-all duration-500" 
            style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
          />
        </div>
        
        {steps.map((step, idx) => (
          <div key={step} className="relative z-10 flex flex-col items-center px-3 bg-white">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              idx <= currentIdx ? "bg-[#2D2219] text-white shadow-sm" : "bg-neutral-100 text-neutral-400"
            }`}>
              {idx + 1}
            </div>
            <span className={`text-[10px] font-medium mt-2 uppercase tracking-widest ${
              idx <= currentIdx ? "text-[#2D2219] font-bold" : "text-neutral-400"
            }`}>
              {step.replace("pesanan ", "")}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PesananSayaPage() {
  const [pesanan, setPesanan] = useState([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [role, setRole] = useState("customer")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  
  // State filter status aktif
  const [filterStatus, setFilterStatus] = useState("semua")

  useEffect(() => {
    async function initPesananData() {
      try {
        const resProfile = await fetch('/api/auth/profile', { cache: 'no-store' })
        if (!resProfile.ok) {
          setUnauthorized(true)
          setLoading(false)
          return
        }

        const jsonProfile = await resProfile.json()
        const user = jsonProfile.data

        if (user && user.id) {
          setRole(user.role || "customer")
          setUsername(user.username || "")
          setEmail(user.email || "")

          const endpointUrl = user.role === 'customer_service' ? '/api/transaksi' : `/api/transaksi?user_id=${user.id}`
          const resTransaksi = await fetch(endpointUrl, { cache: 'no-store' })
          if (resTransaksi.ok) {
            const jsonTx = await resTransaksi.json()
            setPesanan(jsonTx || [])
          }
        } else {
          setUnauthorized(true)
        }
      } catch (err) {
        console.error("Gagal memuat data pesanan:", err)
      } finally {
        setLoading(false)
      }
    }
    initPesananData()
  }, [])

  const handleUpdateStatusPesanan = async (orderId, statusBaru) => {
    try {
      const res = await fetch(`/api/transaksi`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          order_id: orderId, 
          status_pengiriman: statusBaru 
        }),
      })

      if (!res.ok) throw new Error("Gagal memperbarui status pesanan")

      setPesanan(prev => prev.map(p => p.order_id === orderId ? { ...p, status_pengiriman: statusBaru } : p))

      Swal.fire({
        title: "Status Diperbarui!",
        text: `Pesanan #${orderId} berhasil diubah menjadi: ${statusBaru}`,
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000
      })
    } catch (err) {
      Swal.fire("Gagal!", err.message, "error")
    }
  }

  // Fungsi memfilter list data pesanan berdasarkan tab aktif yang baru
  const pesananTerfilter = pesanan.filter(p => {
    const statusBayar = p.status_transaksi?.toLowerCase() || ""
    const statusKirim = p.status_pengiriman?.toLowerCase() || "pesanan di proses"
    const isBelumBayar = statusBayar === "pending"

    if (filterStatus === "belum_bayar") {
      return isBelumBayar
    }
    if (filterStatus === "diproses") {
      return !isBelumBayar && statusKirim === "pesanan di proses"
    }
    if (filterStatus === "dikirim") {
      return !isBelumBayar && statusKirim === "pesanan bisa diambil di toko sekarang"
    }
    if (filterStatus === "selesai") {
      return !isBelumBayar && statusKirim === "pesanan di terima"
    }
    return true // 'semua'
  })

  if (!loading && unauthorized) {
    return (
      <div className="bg-[#fcfbf9] text-black min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 text-center bg-white border shadow-sm border-neutral-200 rounded-2xl">
          <h3 className="text-xl font-serif font-bold text-[#2D2219] mb-2">Sesi Tidak Ditemukan</h3>
          <p className="text-sm text-[#6a5848] mb-6">Silakan masuk terlebih dahulu untuk mengakses pesanan Anda.</p>
          <Link href="/auth/login" className="inline-block bg-[#2D2219] text-white px-8 py-3 rounded-xl text-xs font-bold tracking-wider hover:bg-[#d9a05b] transition-colors w-full">
            LOGIN SEKARANG
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#fcfbf9] text-black min-h-screen flex flex-col pt-24 md:pt-28">
      <div className="flex flex-col items-start flex-1 w-full md:flex-row">
        
        {/* SIDEBAR */}
        <aside className="flex flex-col w-full p-6 bg-white border-b md:w-80 md:sticky md:top-28 md:h-[calc(100vh-7rem)] md:border-b-0 md:border-r border-neutral-200/80 md:p-8 shrink-0 justify-between overflow-y-auto">
          <div className="w-full">
            {!loading && (
              <div className="flex items-center pb-6 mb-8 space-x-4 border-b border-neutral-100">
                <div className="w-12 h-12 rounded-full bg-[#2D2219] text-[#fcfbf9] flex items-center justify-center font-serif text-lg font-bold">
                  {username ? username.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold truncate text-neutral-800">{username || "Pengguna"}</h4>
                  <p className="text-[11px] text-neutral-400 font-mono truncate">{email}</p>
                  <span className="inline-block text-[9px] font-bold font-mono bg-amber-50 text-[#d9a05b] px-2 py-0.5 rounded mt-1 uppercase border border-[#d9a05b]/20">
                    {role}
                  </span>
                </div>
              </div>
            )}

            <nav className="space-y-1.5 mb-8">
              <Link href="/pesanan-saya" className="w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl text-xs font-bold tracking-wider bg-[#2D2219] text-white shadow-sm shadow-[#2D2219]/10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                <span>{role === 'customer_service' ? "PESANAN MASUK (CS)" : "PESANAN SAYA"}</span>
              </Link>

              <Link href="/kelola-akun-saya" className="w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl text-xs font-bold tracking-wider text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span>KELOLA AKUN</span>
              </Link>
            </nav>
          </div>

          <div className="pt-6 mt-auto border-t border-neutral-100 space-y-2.5">
            <div>
              <span className="text-[9px] bg-[#2D2219] text-white font-bold px-2 py-0.5 rounded font-mono tracking-wider">LOKASI WORKSHOP</span>
              <h4 className="mt-1 font-serif text-xs font-bold text-black">Griya Kain Lurik Dibiyo</h4>
              <p className="text-[11px] leading-relaxed text-neutral-400 mt-1">
                Jl. Pangeran Wirosobo, Kel. Gg. Kakaktua No.80, Sorosutan, Kec. Umbulharjo, Kota Yogyakarta, DI Yogyakarta 55162
              </p>
            </div>
            <a href="http://maps.google.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-[#d9a05b] hover:underline">
              <span>🗺️ Buka Rute di Google Maps</span>
            </a>
          </div>
        </aside>

        {/* AREA UTAMA */}
        <main className="flex-1 w-full p-2 md:p-4 lg:p-4 bg-[#faf9f6]">
          {loading ? (
            <div className="w-full">
              <SkeletonPesananSaya />
            </div>
          ) : (
            <div className="w-full -mt-5 animate-fadeIn">
              <div className="w-full space-y-6">
                
                {/* Header Judul */}
                <div className="flex flex-col justify-between gap-4 border-b lg:flex-row lg:items-center border-neutral-200/60">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-[#2D2219]">
                      {role === 'customer_service' ? "Manajemen Pesanan Masuk" : "Daftar Riwayat Pesanan"}
                    </h2>
                    <p className="mt-1 text-xs text-neutral-400">Pantau status pengerjaan kain lurik secara real-time</p>
                  </div>
                  
                  {/* 🌟 GRUP BUTTON FILTER (TAB) SEKARANG TERPISAH: DIPROSES, DIKIRIM, SELESAI */}
                  <div className="flex flex-wrap p-1 bg-neutral-200/60 rounded-xl gap-1 self-start lg:self-center text-[11px] font-bold tracking-wider">
                    <button 
                      onClick={() => setFilterStatus("semua")}
                      className={`px-3 py-2 rounded-lg transition-all ${filterStatus === "semua" ? "bg-[#2D2219] text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800"}`}
                    >
                      SEMUA ({pesanan.length})
                    </button>
                    <button 
                      onClick={() => setFilterStatus("belum_bayar")}
                      className={`px-3 py-2 rounded-lg transition-all ${filterStatus === "belum_bayar" ? "bg-[#2D2219] text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800"}`}
                    >
                      BELUM BAYAR ({pesanan.filter(p => p.status_transaksi?.toLowerCase() === "pending").length})
                    </button>
                    <button 
                      onClick={() => setFilterStatus("diproses")}
                      className={`px-3 py-2 rounded-lg transition-all ${filterStatus === "diproses" ? "bg-[#2D2219] text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800"}`}
                    >
                      DIPROSES ({pesanan.filter(p => p.status_transaksi?.toLowerCase() !== "pending" && (p.status_pengiriman?.toLowerCase() === "pesanan di proses" || !p.status_pengiriman)).length})
                    </button>
                    <button 
                      onClick={() => setFilterStatus("dikirim")}
                      className={`px-3 py-2 rounded-lg transition-all ${filterStatus === "dikirim" ? "bg-[#2D2219] text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800"}`}
                    >
                      SIAP AMBIL ({pesanan.filter(p => p.status_transaksi?.toLowerCase() !== "pending" && p.status_pengiriman?.toLowerCase() === "pesanan bisa diambil di toko sekarang").length})
                    </button>
                    <button 
                      onClick={() => setFilterStatus("selesai")}
                      className={`px-3 py-2 rounded-lg transition-all ${filterStatus === "selesai" ? "bg-[#2D2219] text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800"}`}
                    >
                      SELESAI ({pesanan.filter(p => p.status_transaksi?.toLowerCase() !== "pending" && p.status_pengiriman?.toLowerCase() === "pesanan di terima").length})
                    </button>
                  </div>
                </div>

                {/* Konten Utama */}
                {pesananTerfilter.length === 0 ? (
                  <div className="w-full p-16 text-center bg-white border border-dashed shadow-sm border-neutral-300 rounded-2xl">
                    <h3 className="font-serif text-lg font-bold text-black">Tidak Ada Transaksi</h3>
                    <p className="text-sm text-[#6a5848] mt-1">Tidak ada pesanan dengan kategori filter ini.</p>
                  </div>
                ) : (
                  <div className="w-full space-y-6">
                    {pesananTerfilter.map((p, index) => (
                      <div key={p.order_id || index} className="w-full p-6 transition-all duration-300 bg-white border shadow-sm border-neutral-200/60 rounded-2xl hover:shadow-md">
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-neutral-100">
                          <div className="flex items-center space-x-3">
                            <span className="px-3 py-1 font-mono text-xs font-bold rounded-lg text-neutral-700 bg-neutral-100">ID ORDER: #{p.order_id}</span>
                            <span className="text-[11px] text-emerald-500 flex items-center space-x-1 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                              <span>Live Monitor</span>
                            </span>
                          </div>
                          
                          {role === 'customer_service' ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-mono text-neutral-400 font-bold">AKSI STATUS CS:</span>
                              <select
                                value={p.status_pengiriman || 'pesanan di proses'}
                                onChange={(e) => handleUpdateStatusPesanan(p.order_id, e.target.value)}
                                className="text-xs font-bold bg-amber-50/60 border border-[#d9a05b]/40 rounded-xl px-3 py-1.5 text-[#2D2219] focus:outline-none focus:ring-1 focus:ring-[#d9a05b] cursor-pointer shadow-sm transition-colors"
                              >
                                <option value="pesanan di proses">🔄 pesanan di proses</option>
                                <option value="pesanan bisa diambil di toko sekarang">📦 pesanan bisa diambil di toko sekarang</option>
                                <option value="pesanan di terima">✅ pesanan di terima</option>
                              </select>
                            </div>
                          ) : (
                            <span className="text-[11px] font-bold text-[#2D2219] uppercase bg-[#d9a05b]/10 px-4 py-1.5 rounded-full tracking-wider font-mono border border-[#d9a05b]/20">
                              {p.status_pengiriman || 'pesanan di proses'}
                            </span>
                          )}
                        </div>
                        
                        <OrderTracker status={p.status_pengiriman || 'pesanan di proses'} />
                        
                        <div className="pt-5 mt-6 border-t border-neutral-100">
                          <ListPesananSaya pesanan={[p]} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}