"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Footer from "../components/home/Footer.jsx"

export default function PesananSayaPage() {
  const [pesanan, setPesanan] = useState([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    async function fetchPesananUser() {
      try {
        // 1. Cek sesi profil user yang sedang aktif login
        const resProfile = await fetch('/api/auth/profile', { cache: 'no-store' })
        
        if (!resProfile.ok) {
          setUnauthorized(true)
          setLoading(false)
          return
        }

        const jsonProfile = await resProfile.json()
        const user = jsonProfile.data

        if (user && user.id) {
          // 2. Ambil data dari tabel transaksi berdasarkan user_id
          const resTransaksi = await fetch(`/api/transaksi?user_id=${user.id}`, { cache: 'no-store' })
          if (resTransaksi.ok) {
            const jsonTx = await resTransaksi.json()
            setPesanan(jsonTx.data || [])
          }
        } else {
          setUnauthorized(true)
        }
      } catch (err) {
        console.error("Gagal memuat data transaksi:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPesananUser()
  }, [])

  // 🔥 PERBAIKAN 1: Fungsi pembantu format rupiah yang anti-crash (jika angka bernilai undefined/null)
  const formatRupiah = (angka) => {
    const nominal = Number(angka) || 0
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(nominal)
  }

  // Fungsi format tanggal lokal Indonesia
  const formatTanggal = (isoString) => {
    if (!isoString) return "-"
    return new Date(isoString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Fungsi penentu badge status transaksi
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase()
    if (s === "settlement" || s === "success" || s === "capture") {
      return <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Berhasil</span>
    }
    if (s === "pending") {
      return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Menunggu Pembayaran</span>
    }
    return <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{status || 'Batal'}</span>
  }

  return (
    <>
      <div className="bg-[#ffffff] text-[#000000] min-h-screen pt-40 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* SECTION 1: HERO HEADER HERO */}
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest text-[#d9a05b] uppercase bg-[#d9a05b]/10 px-4 py-1.5 rounded-full">
              Sistem Transaksi Pelanggan
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-black mt-4 mb-6 tracking-wide">
              Daftar <span className="text-[#d9a05b] italic font-normal">Pesanan Saya</span>
            </h1>
            <div className="w-24 h-[1px] bg-[#d9a05b] mx-auto mb-6" />
            <p className="text-[#6a5848] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Pantau seluruh riwayat pengerjaan kain tenun lurik ATBM, status pembayaran midtrans, dan nomor resi pengiriman Anda secara berkala.
            </p>
          </div>

          {/* STATE 1: SEDANG LOADING */}
          {loading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : unauthorized ? (
            
            /* STATE 2: JIKA USER BELUM LOGIN */
            <div className="max-w-md mx-auto text-center border border-gray-200 bg-[#ffffff] p-8 rounded-2xl shadow-sm">
              <h3 className="text-lg font-serif font-bold text-black mb-2">Sesi Tidak Ditemukan</h3>
              <p className="text-sm text-[#6a5848] mb-6">Silakan masuk ke akun Anda terlebih dahulu untuk melihat histori pesanan.</p>
              <Link href="/auth/login" className="inline-block bg-[#2D2219] text-white px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider hover:bg-[#d9a05b] transition-colors">
                LOGIN SEKARANG
              </Link>
            </div>
          ) : pesanan.length === 0 ? (
            
            /* STATE 3: JIKA DATA TRANSAKSI KOSONG */
            <div className="bg-[#ffffff] border border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-[#d9a05b]/10 text-[#d9a05b] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
              </div>
              <h3 className="text-lg font-serif font-bold text-black">Belum Ada Riwayat Transaksi</h3>
              <p className="text-sm text-[#6a5848] max-w-sm mx-auto mt-2 mb-6">
                Anda belum pernah mengeksekusi pesanan kain atau kustomisasi lurik di aplikasi kami.
              </p>
              <Link href="/produk" className="inline-block bg-[#000000] text-[#ffffff] px-6 py-3 rounded-xl text-xs font-bold tracking-widest hover:bg-[#d9a05b] transition-colors">
                LIHAT KOLEKSI PRODUK
              </Link>
            </div>
          ) : (
            
            /* STATE 4: DATA BERHASIL DITEMUKAN (LIST RENDER) */
            <div className="space-y-6">
              {pesanan.map((tx) => (
                <div 
                  key={tx.order_id} 
                  className="bg-[#ffffff] border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Top Bar Card */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#6a5848]">ID Transaksi / Order ID</p>
                      <p className="text-sm font-mono font-bold text-black">{tx.order_id}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-[#6a5848]">Tanggal Pembelian</p>
                      <p className="text-sm font-semibold text-black">{formatTanggal(tx.created_at)}</p>
                    </div>
                  </div>

                  {/* Body Isi Item Transaksi */}
                  <div className="p-6 space-y-4">
                    {Array.isArray(tx.items_transaksi) && tx.items_transaksi.length > 0 ? (
                      tx.items_transaksi.map((item, idx) => {
                        // 🔥 PERBAIKAN 2: Normalisasi properti secara cerdas (mendukung multi-format data keranjang)
                        const namaProduk = item.name || item.nama || item.produk?.kode_produk || "Kain Lurik Eksklusif";
                        const kuantitas = item.quantity || item.jumlah_order || 1;
                        const hargaItem = item.price || item.harga || 0;

                        return (
                          <div key={idx} className="flex items-start justify-between border-b border-gray-50 pb-3 last:border-b-0 last:pb-0">
                            <div>
                              <h4 className="text-sm font-bold text-black">{namaProduk}</h4>
                              <p className="text-xs text-[#6a5848] mt-0.5">Jumlah kuantitas: {kuantitas} Pcs / Gulung</p>
                            </div>
                            <p className="text-sm font-medium text-black">{formatRupiah(hargaItem)}</p>
                          </div>
                        )
                      })
                    ) : (
                      // Fallback visual jika kolom items_transaksi di DB kosong atau null
                      <p className="text-xs text-gray-400 italic">Detail produk tidak terlampir</p>
                    )}
                  </div>

                  {/* Footer Card Ringkasan Total */}
                  <div className="bg-[#917c4b]/5 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-black">Status:</span>
                      {getStatusBadge(tx.status_transaksi)}
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-xs text-[#6a5848] block">Total Pembayaran</span>
                        <span className="text-base font-serif font-black text-[#d9a05b]">
                          {formatRupiah(tx.total_nominal)}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  )
}