'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress' 
import { User, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    NProgress.start()

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Username atau password salah')
      }
      
      setSuccess('Login berhasil! Mengalihkan...')
      NProgress.done() 
      router.replace('/dashboard')
      
    } catch (err) {
      setError(err.message)
      NProgress.done() 
      setLoading(false)
    }
  }

  // Variasi animasi untuk container form (mengatur delay anak-anak elemennya)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Jeda antar elemen masuk (0.1 detik)
        delayChildren: 0.2
      }
    }
  }

  // Animasi seragam untuk memunculkan input field & tombol di form
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  }

  return (
    <div className="w-screen h-screen m-0 p-0 flex bg-[#F8F9FA] font-sans select-none items-stretch overflow-hidden">
      
      {/* ================= SISI KIRI: BANNER INFORMASI (BIRU) ================= */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#1A335A] to-[#376DC0] p-16 flex-col justify-between relative overflow-hidden h-full">
        
        {/* Kontainer atas yang membungkus Logo + Deskripsi */}
        <div className="z-20 pt-16 space-y-10">
          
          {/* Top Header Brand (Animasi slide-in dari kiri) */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center justify-center w-18 h-18 shrink-0">
              <img 
                src="/images/logo.png" 
                alt="Logo Dibyo Lurik" 
                className="object-contain w-full h-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23F2B600'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z'/%3E%3C/svg%3E"
                }}
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold tracking-wide text-white">Dibyo Lurik</h2>
              <p className="text-sm font-medium text-white/80">Sistem Manajemen Produk Kain</p>
            </div>
          </motion.div>

          {/* Tagline & Deskripsi Tengah (Animasi slide-in dari kiri dengan delay sedikit lebih lambat) */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, type: 'spring' }}
            className="max-w-md space-y-4"
          >
            <h1 className="text-3xl font-bold leading-tight tracking-wide text-white">
              Kelola Produk Kain Lurik <br /> 
              dengan <span className="text-[#F2B600] underline decoration-2 underline-offset-4">Mudah</span> & <span className="text-[#F2B600]">Terintegrasi</span>
            </h1>
            <p className="text-sm leading-relaxed text-white/70">
              Sistem manajemen produk kain lurik untuk mengelola stok, pesanan, penjualan, dan laporan secara efisien.
            </p>
          </motion.div>

        </div>

        {/* BACKGROUND GAMBAR KAIN (Animasi muncul mendatar dari pojok kiri bawah) */}
        <motion.div 
          initial={{ opacity: 0, x: -100, y: 50 }}
          animate={{ opacity: 0.95, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, type: 'spring', stiffness: 60 }}
          className="absolute bottom-[40px] left-0 w-64 pointer-events-none z-10"
        >
          <img 
            src="/images/kain-lurik-mockup.png" 
            alt="Gulungan Kain Lurik" 
            className="block object-contain w-full h-auto"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </motion.div>

        {/* 3 Grid Fitur Utama Kotak-Kotak Bawah (Animasi staggered dari bawah ke atas) */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.4 } }
          }}
          className="relative z-20 grid grid-cols-3 gap-4 pt-2 bg-transparent"
        >
          {[
            { bg: '#2900A6', title: 'Kelola Stok', desc: 'Lebih Efisien', svg: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/> },
            { bg: '#FF7F7F', title: 'Pantau Pesanan', desc: 'Lebih Mudah', svg: <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></> },
            { bg: '#4F8A3F', title: 'Laporan Akurat', desc: 'Kapan Saja', svg: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></> }
          ].map((item, index) => (
            <motion.div 
              key={index}
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
              className="flex items-center gap-2.5"
            >
              <div className="p-2 text-white shadow-xs rounded-xl shrink-0" style={{ backgroundColor: item.bg }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{item.svg}</svg>
              </div>
              <p className="text-[11px] font-medium text-white leading-tight">{item.title}<br/><span className="text-white/60">{item.desc}</span></p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ================= SISI KANAN: FORM LOGIN (PUTIH) ================= */}
      <div className="relative flex flex-col items-center justify-center w-full h-full px-8 overflow-y-auto bg-white lg:w-1/2 sm:px-16 lg:px-24">
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-[420px] flex flex-col py-8"
        >
          
          {success && (
            <div className="flex items-center gap-2 px-4 py-3 mb-6 text-sm font-medium border shadow-xs rounded-xl bg-emerald-50 text-emerald-700 border-emerald-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {success}
            </div>
          )}

          {/* Avatar Ikon Profil (Animasi Pop-up mengembang dari tengah) */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, scale: 0.6 },
              visible: { opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.4, duration: 0.6 } }
            }}
            className="flex flex-col items-center mb-8"
          >
            <div className="w-28 h-28 bg-[#1E4373] text-white rounded-full flex items-center justify-center shadow-xs mb-4">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="currentColor" />
                <path d="M5.338 18.32C5.994 15.528 8.776 13.5 12 13.5c3.224 0 6.006 2.028 6.662 4.82.132.56-.32 1.18-.898 1.18H6.236c-.578 0-1.03-.62-.898-1.18Z" fill="currentColor" />
              </svg>
            </div>
            <h3 className="text-xl font-bold tracking-wide text-gray-900">Selamat Datang Kembali!</h3>
            <p className="mt-1 text-xs font-medium text-gray-400">Silahkan masuk untuk melanjutkan</p>
          </motion.div>

          {/* Form Utama (Elemen di dalamnya masuk berurutan satu per satu) */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {error && (
              <div className="px-4 py-3 text-sm font-medium text-red-700 border border-red-200 rounded-xl bg-red-50">
                {error}
              </div>
            )}

            {/* Input Field: Username */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username Anda"
                  className="w-full h-14 px-5 text-gray-900 border border-gray-300 rounded-md bg-[#EDF7FC]/50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-[#2A5C9A]/20 focus:border-[#2A5C9A] font-medium placeholder:text-gray-400"
                  autoComplete="username"
                  required
                  autoFocus
                />
                <User size={18} className="absolute text-gray-500 -translate-y-1/2 right-5 top-1/2" />
              </div>
            </motion.div>

            {/* Input Field: Password */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  className="w-full h-14 px-5 pr-12 text-gray-900 border border-gray-300 rounded-md bg-[#EDF7FC]/50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-[#2A5C9A]/20 focus:border-[#2A5C9A] font-medium placeholder:text-gray-400"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-500 -translate-y-1/2 right-5 top-1/2 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            {/* Lupa Password */}
            <motion.div variants={itemVariants} className="flex justify-end pt-1">
              <Link 
                href="/auth/forgot-password" 
                className="text-xs font-bold text-gray-600 transition-colors hover:text-black"
              >
                Lupa Password?
              </Link>
            </motion.div>

            {/* Tombol Submit Utama */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#F2B600] hover:bg-[#D9A300] text-white font-bold text-base rounded-md transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed mt-4 flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                'Masuk Sekarang'
              )}
            </motion.button>
          </form>

        </motion.div>

        {/* Hak Cipta */}
        <p className="absolute text-xs font-medium text-center text-gray-400 bottom-6">
          &copy; 2026 Dibyo Lurik. All rights reserved.
        </p>
      </div>

    </div>
  )
}