"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation' 
import Swal from 'sweetalert2' 

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname() 
  
  const [isOpen, setIsOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  // STATE JUMLAH ITEM KERANJANG (Bukan total panjang/qty)
  const [cartCount, setCartCount] = useState(0)

  // 1. Ambil Profile & Hitung Jumlah Baris/Item Keranjang Awal (Mendukung Guest & Login)
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const resProfile = await fetch('/api/auth/profile', { cache: 'no-store' })
        
        if (resProfile.ok) {
          const jsonProfile = await resProfile.json()
          setUser(jsonProfile.data)

          // Jika user login, ambil data keranjang dari database
          const resCart = await fetch('/api/keranjang', { cache: 'no-store' })
          if (resCart.ok) {
            const jsonCart = await resCart.json()
            
            // Menghitung jumlah item/baris unik, bukan total meter
            const totalItems = jsonCart.data?.length ?? 0
            setCartCount(totalItems)
          }
        } else {
          // ====================================================================
          // JALUR GUEST: Jika tidak login, hitung item unik dari Local Storage
          // ====================================================================
          setUser(null)
          const localData = localStorage.getItem("biyo_guest_cart")
          if (localData) {
            const parsedCart = JSON.parse(localData) || []
            setCartCount(parsedCart.length)
          } else {
            setCartCount(0)
          }
        }
      } catch (err) {
        console.error("Gagal memuat data awal navbar:", err)
        setUser(null)
      } finally {
        setLoadingUser(false)
      }
    }
    fetchInitialData()
  }, [pathname]) // Memicu pengecekan ulang setiap kali rute halaman (pathname) berubah

  // 2. Pasang Event Listener saat Ada Item Baru Ditambahkan
  useEffect(() => {
    const handleCartUpdate = (event) => {
      // Event listener kustom untuk memanipulasi badge counter secara fleksibel jika diperlukan
      const addedItemCount = event.detail?.itemCount || 1
      setCartCount((prevCount) => prevCount + addedItemCount)
    }

    window.addEventListener("updateCartCount", handleCartUpdate)
    return () => {
      window.removeEventListener("updateCartCount", handleCartUpdate)
    }
  }, [])

  const handleLogout = async () => {
    setShowUserDropdown(false)
    setIsOpen(false)
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda akan keluar dari sesi aktif saat ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1A335A',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Keluar!',
      cancelButtonText: 'Batal',
      background: '#1A1917', 
      color: '#F9F6F0'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoggingOut(true)
        
        try {
          const res = await fetch('/api/auth/logout', { method: 'POST' })
          
          if (res.ok) {
            localStorage.removeItem("biyo_guest_cart");

            setUser(null)
            setCartCount(0) 
            window.location.href = '/auth/login'
          } else {
            throw new Error("Gagal menghapus sesi di server")
          }
        } catch (error) {
          console.error("Gagal melakukan proses keluar:", error)
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Gagal melakukan logout, coba lagi!',
          })
        } finally {
          setIsLoggingOut(false)
        }
      }
    })
  }

  if (
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/auth') || 
    pathname.startsWith('/admin')
  ) {
    return null
  }

  const isActive = (url) => {
    if (url === '/') return pathname === '/'
    return pathname.startsWith(url)
  }

  const isAboutActive = isActive('/artikel') || isActive('/produksi')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A1715]/80 backdrop-blur-lg border-b border-[#E5BA73]/10">
      {/* KUNCI PERBAIKAN LEBAR: Mengganti px-2 ke px-4 agar lurus simetris dengan halaman utama */}
      <div className="px-2 mx-auto max-w-7xl sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold tracking-widest text-[#E5BA73] hover:opacity-90 transition-opacity">
              BIYO <span className="text-[#F9F6F0] font-light">LURIK</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="items-center hidden space-x-8 md:flex">
            <Link 
              href="/" 
              className={`font-medium text-sm tracking-wide transition-colors ${
                isActive('/') ? 'text-[#E5BA73]' : 'text-[#A3A19E] hover:text-[#F9F6F0]'
              }`}
            >
              Home
            </Link>

            <Link 
              href="/customizer" 
              className={`font-medium text-sm tracking-wide transition-colors flex items-center gap-1.5 ${
                isActive('/customizer') ? 'text-[#E5BA73]' : 'text-[#A3A19E] hover:text-[#F9F6F0]'
              }`}
            >
              Lurik Customizer
              <span className="text-[9px] bg-[#E5BA73] text-[#12110F] px-1.5 py-0.5 rounded-full font-bold">NEW</span>
            </Link>

            <Link 
              href="/produk" 
              className={`font-medium text-sm tracking-wide transition-colors ${
                isActive('/produk') ? 'text-[#E5BA73]' : 'text-[#A3A19E] hover:text-[#F9F6F0]'
              }`}
            >
              Produk
            </Link>
            
            {/* Dropdown About */}
            <div 
              className="relative py-2" 
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <button 
                onClick={() => setShowDropdown(!showDropdown)} 
                className={`font-medium text-sm tracking-wide transition-colors flex items-center gap-1 ${
                  isAboutActive ? 'text-[#E5BA73]' : 'text-[#A3A19E] hover:text-[#F9F6F0]'
                }`}
              >
                About 
                <svg className={`w-3 h-3 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-[#1A1917] border border-[#E5BA73]/20 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                  <Link 
                    href="/artikel" 
                    onClick={() => setShowDropdown(false)}
                    className={`block px-4 py-2.5 text-sm transition-colors ${
                      isActive('/artikel') 
                        ? 'bg-[#E5BA73]/20 text-[#E5BA73]' 
                        : 'text-[#A3A19E] hover:bg-[#E5BA73]/10 hover:text-[#E5BA73]'
                    }`}
                  >
                    Artikel & Edukasi
                  </Link>
                  <Link 
                    href="/produksi" 
                    onClick={() => setShowDropdown(false)}
                    className={`block px-4 py-2.5 text-sm transition-colors ${
                      isActive('/produksi') 
                        ? 'bg-[#E5BA73]/20 text-[#E5BA73]' 
                        : 'text-[#A3A19E] hover:bg-[#E5BA73]/10 hover:text-[#E5BA73]'
                    }`}
                  >
                    Proses Produksi
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Menu */}
          <div className="items-center hidden space-x-6 md:flex">
            <Link 
              href="/cart" 
              className={`relative p-2 transition-colors ${
                isActive('/cart') ? 'text-[#E5BA73]' : 'text-[#A3A19E] hover:text-[#E5BA73]'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#E5BA73] text-[#12110F] text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center animate-scale-up">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {loadingUser ? (
              <div className="w-20 h-8 rounded-lg bg-gray-700/50 animate-pulse"></div>
            ) : user ? (
              <div 
                className="relative py-2"
                onMouseEnter={() => setShowUserDropdown(true)}
                onMouseLeave={() => setShowUserDropdown(false)}
              >
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5BA73]/30 hover:border-[#E5BA73] transition-all bg-transparent text-[#F9F6F0]">
                  <div className="w-6 h-6 rounded-full bg-[#E5BA73] text-[#12110F] flex items-center justify-center font-bold text-xs">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold tracking-wide truncate max-w-[100px]">
                    {user.username}
                  </span>
                  <svg className={`w-3 h-3 text-[#A3A19E] transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[#1A1917] border border-[#E5BA73]/20 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                    <div className="px-4 py-2 border-b border-[#E5BA73]/10">
                      <p className="text-sm font-semibold text-[#E5BA73] truncate">{user.nama}</p>
                    </div>
                    {user.role !== 'customer' && (
                      <Link href="/dashboard" className="block px-4 py-2.5 text-xs text-[#A3A19E] hover:bg-[#E5BA73]/10 hover:text-[#E5BA73] transition-colors">
                        Dashboard Sistem
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full text-left block px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      {isLoggingOut ? 'Mengeluarkan...' : 'Keluar / Logout'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="px-5 py-2.5 bg-transparent border border-[#E5BA73] text-[#E5BA73] hover:bg-[#E5BA73] hover:text-[#12110F] rounded-lg text-xs font-semibold tracking-wider transition-all duration-300">
                MASUK
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-[#E5BA73] p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#1A1917] border-b border-[#E5BA73]/10 px-4 pt-2 pb-4 space-y-2">
          <Link href="/" className={`block py-2 font-medium ${isActive('/') ? 'text-[#E5BA73]' : 'text-[#A3A19E]'}`} onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link href="/customizer" className={`block py-2 font-medium ${isActive('/customizer') ? 'text-[#E5BA73]' : 'text-[#A3A19E]'}`} onClick={() => setIsOpen(false)}>
            Lurik Customizer
          </Link>
          <Link href="/produk" className={`block py-2 font-medium ${isActive('/produk') ? 'text-[#E5BA73]' : 'text-[#A3A19E]'}`} onClick={() => setIsOpen(false)}>
            Produk
          </Link>
          <div className="border-t border-[#E5BA73]/10 my-2 pt-2">
            <Link href="/artikel" className={`block py-1.5 text-sm pl-4 ${isActive('/artikel') ? 'text-[#E5BA73] font-medium' : 'text-[#A3A19E]'}`} onClick={() => setIsOpen(false)}>
              Artikel & Edukasi
            </Link>
            <Link href="/produksi" className={`block py-1.5 text-sm pl-4 ${isActive('/produksi') ? 'text-[#E5BA73] font-medium' : 'text-[#A3A19E]'}`} onClick={() => setIsOpen(false)}>
              Proses Produksi
            </Link>
          </div>
          
          <div className="pt-2 border-t border-[#E5BA73]/10">
            {loadingUser ? (
              <div className="w-full h-10 bg-gray-800 rounded-lg animate-pulse"></div>
            ) : user ? (
              <div className="space-y-2">
                <div className="px-4 py-2 bg-[#12110F] rounded-lg border border-[#E5BA73]/10 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#E5BA73] text-[#12110F] flex items-center justify-center font-bold text-sm">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Hai, @{user.username}</p>
                    <p className="text-sm font-bold text-[#E5BA73]">{user.nama}</p>
                  </div>
                </div>
                {user.role !== 'customer' && (
                  <Link href="/dashboard" className="block w-full text-center py-2 bg-transparent border border-[#E5BA73]/30 text-[#E5BA73] font-medium rounded-lg text-sm" onClick={() => setIsOpen(false)}>
                    Dashboard Sistem
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="block w-full text-center py-2.5 bg-red-600/20 text-red-400 font-bold rounded-lg text-sm transition-colors border border-red-500/20 disabled:opacity-50"
                >
                  {isLoggingOut ? 'Mengeluarkan...' : 'Keluar / Logout'}
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="block w-full text-center py-2.5 bg-[#E5BA73] text-[#12110F] font-bold rounded-lg text-sm" onClick={() => setIsOpen(false)}>
                Masuk Sistem
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}