"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Footer from "../components/home/Footer.jsx"
import SkeletonPesananSaya from "../components/home/pesanan/SkeletonPesananSaya.jsx" 
import ListPesananSaya from "../components/home/pesanan/ListPesananSaya.jsx" 
import Swal from "sweetalert2" 

export default function PesananSayaPage() {
  const [pesanan, setPesanan] = useState([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)

  // 1. Fetching Data Utama saat Mount
  useEffect(() => {
    async function fetchPesananUser() {
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
          const resTransaksi = await fetch(`/api/transaksi?user_id=${user.id}`, { cache: 'no-store' })
          if (resTransaksi.ok) {
            const jsonTx = await resTransaksi.json()
            setPesanan(jsonTx || []) // API transaksi mengembalikan array langsung [{...}]
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

  // 2. INTEGRASI LIVE REAL-TIME CLIENT (Upstash Realtime)
  useEffect(() => {
    if (pesanan.length === 0) return;

    const eventSource = new EventSource('/api/realtime')

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        
        if (message.event === 'notification.status_changed') {
          const { id_order, status_baru, pesan: pesanNotif } = message.data

          const apakahPesananSaya = pesanan.some(p => p.order_id === id_order)

          if (apakahPesananSaya) {
            // ✨ SINKRONISASI: Ubah properti status menjadi status_pengiriman
            setPesanan(prevPesanan => 
              prevPesanan.map(p => 
                p.order_id === id_order ? { ...p, status_pengiriman: status_baru } : p
              )
            )

            Swal.fire({
              title: 'Update Pesanan!',
              text: pesanNotif,
              icon: 'info',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 5000,
              timerProgressBar: true
            })
          }
        }
      } catch (error) {
        console.error("Gagal memproses data real-time:", error)
      }
    }

    return () => {
      eventSource.close()
    }
  }, [pesanan])

  return (
    <>
      <div className="bg-[#ffffff] text-[#000000] min-h-screen pt-40 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* SECTION 1: HERO HEADER */}
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
            <SkeletonPesananSaya />
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
            
            /* STATE 4: DATA BERHASIL DITEMUKAN */
            <ListPesananSaya pesanan={pesanan} />
          )}

        </div>
      </div>
      <Footer />
    </>
  )
}