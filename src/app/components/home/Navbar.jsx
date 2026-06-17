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
  
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const resProfile = await fetch('/api/auth/profile', { cache: 'no-store' })
        
        if (resProfile.ok) {
          const jsonProfile = await resProfile.json()
          setUser(jsonProfile.data)

          const resCart = await fetch('/api/keranjang', { cache: 'no-store' })
          if (resCart.ok) {
            const jsonCart = await resCart.json()
            const totalItems = jsonCart.data?.length ?? 0
            setCartCount(totalItems)
          }
        } else {
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
  }, [pathname])

  useEffect(() => {
    const handleCartUpdate = (event) => {
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
      confirmButtonColor: '#2D2219', 
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Keluar!',
      cancelButtonText: 'Batal',
      background: '#F5F2EB', 
      color: '#2D2219' 
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
            background: '#F5F2EB',
            color: '#2D2219'
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

  // Perbaikan: Diubah agar mendeteksi rute /sejarah sesuai dengan href pada tautan menu dropdown Anda
  const isAboutActive = isActive('/sejarah') || isActive('/produksi')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F5F2EB]/80 backdrop-blur-lg border-b border-[#2D2219]/10">
      <div className="px-4 mx-auto max-w-7xl sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold tracking-widest text-[#C59B5F] hover:opacity-90 transition-opacity">
              DIBYO <span className="text-[#2D2219] font-light">LURIK</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="items-center hidden space-x-8 md:flex">
            <Link 
              href="/" 
              className={`font-medium text-sm tracking-wide transition-colors ${
                isActive('/') ? 'text-[#C59B5F]' : 'text-[#7A7167] hover:text-[#2D2219]'
              }`}
            >
              Home
            </Link>

            <Link 
              href="/customizer" 
              className={`font-medium text-sm tracking-wide transition-colors flex items-center gap-1.5 ${
                isActive('/customizer') ? 'text-[#C59B5F]' : 'text-[#7A7167] hover:text-[#2D2219]'
              }`}
            >
              Lurik Customizer
              <span className="text-[9px] bg-[#C59B5F] text-[#F5F2EB] px-1.5 py-0.5 rounded-full font-bold">NEW</span>
            </Link>

            <Link 
              href="/produk" 
              className={`font-medium text-sm tracking-wide transition-colors ${
                isActive('/produk') ? 'text-[#C59B5F]' : 'text-[#7A7167] hover:text-[#2D2219]'
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
                  isAboutActive ? 'text-[#C59B5F]' : 'text-[#7A7167] hover:text-[#2D2219]'
                }`}
              >
                About 
                <svg className={`w-3 h-3 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-[#EFEBE3] border border-[#2D2219]/10 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                  <Link 
                    href="/sejarah" 
                    onClick={() => setShowDropdown(false)}
                    className={`block px-4 py-2.5 text-sm transition-colors ${
                      isActive('/sejarah') 
                        ? 'bg-[#C59B5F]/10 text-[#C59B5F]' 
                        : 'text-[#7A7167] hover:bg-[#C59B5F]/5 hover:text-[#2D2219]'
                    }`}
                  >
                    Sejarah
                  </Link>
                  <Link 
                    href="/produksi" 
                    onClick={() => setShowDropdown(false)}
                    className={`block px-4 py-2.5 text-sm transition-colors ${
                      isActive('/produksi') 
                        ? 'bg-[#C59B5F]/10 text-[#C59B5F]' 
                        : 'text-[#7A7167] hover:bg-[#C59B5F]/5 hover:text-[#2D2219]'
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
                isActive('/cart') ? 'text-[#C59B5F]' : 'text-[#7A7167] hover:text-[#C59B5F]'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#C59B5F] text-[#F5F2EB] text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {loadingUser ? (
              <div className="w-20 h-8 rounded-lg bg-gray-300/50 animate-pulse"></div>
            ) : user ? (
              <div 
                className="relative py-2"
                onMouseEnter={() => setShowUserDropdown(true)}
                onMouseLeave={() => setShowUserDropdown(false)}
              >
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2D2219]/20 hover:border-[#C59B5F] transition-all bg-transparent text-[#2D2219]">
                  <div className="w-6 h-6 rounded-full bg-[#C59B5F] text-[#F5F2EB] flex items-center justify-center font-bold text-xs">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold tracking-wide truncate max-w-[100px]">
                    {user.username}
                  </span>
                  <svg className={`w-3 h-3 text-[#7A7167] transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[#EFEBE3] border border-[#2D2219]/10 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                    <div className="px-4 py-2 border-b border-[#2D2219]/5">
                      <p className="text-sm font-semibold text-[#C59B5F] truncate">{user.nama}</p>
                    </div>
                    {user.role !== 'customer' && (
                      <Link href="/dashboard" className="block px-4 py-2.5 text-xs text-[#7A7167] hover:bg-[#C59B5F]/5 hover:text-[#2D2219] transition-colors">
                        Dashboard Sistem
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full text-left block px-4 py-2.5 text-xs text-red-600 hover:bg-red-500/5 transition-colors disabled:opacity-50"
                    >
                      {isLoggingOut ? 'Mengeluarkan...' : 'Keluar / Logout'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="px-5 py-2.5 bg-transparent border border-[#2D2219] text-[#2D2219] hover:bg-[#2D2219] hover:text-[#F5F2EB] rounded-lg text-xs font-semibold tracking-wider transition-all duration-300">
                MASUK
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-[#C59B5F] p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#EFEBE3] border-b border-[#2D2219]/10 px-4 pt-2 pb-4 space-y-2">
          <Link href="/" className={`block py-2 font-medium ${isActive('/') ? 'text-[#C59B5F]' : 'text-[#7A7167]'}`} onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link href="/customizer" className={`block py-2 font-medium ${isActive('/customizer') ? 'text-[#C59B5F]' : 'text-[#7A7167]'}`} onClick={() => setIsOpen(false)}>
            Lurik Customizer
          </Link>
          <Link href="/produk" className={`block py-2 font-medium ${isActive('/produk') ? 'text-[#C59B5F]' : 'text-[#7A7167]'}`} onClick={() => setIsOpen(false)}>
            Produk
          </Link>
          <div className="border-t border-[#2D2219]/5 my-2 pt-2">
            <Link href="/sejarah" className={`block py-1.5 text-sm pl-4 ${isActive('/sejarah') ? 'text-[#C59B5F] font-medium' : 'text-[#7A7167]'}`} onClick={() => setIsOpen(false)}>
              Sejarah
            </Link>
            <Link href="/produksi" className={`block py-1.5 text-sm pl-4 ${isActive('/produksi') ? 'text-[#C59B5F] font-medium' : 'text-[#7A7167]'}`} onClick={() => setIsOpen(false)}>
              Proses Produksi
            </Link>
          </div>
          
          <div className="pt-2 border-t border-[#2D2219]/5">
            {loadingUser ? (
              <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            ) : user ? (
              <div className="space-y-2">
                <div className="px-4 py-2 bg-[#F5F2EB] rounded-lg border border-[#2D2219]/10 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#C59B5F] text-[#F5F2EB] flex items-center justify-center font-bold text-sm">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Hai, @{user.username}</p>
                    <p className="text-sm font-bold text-[#C59B5F]">{user.nama}</p>
                  </div>
                </div>
                {user.role !== 'customer' && (
                  <Link href="/dashboard" className="block w-full text-center py-2 bg-transparent border border-[#2D2219]/20 text-[#2D2219] font-medium rounded-lg text-sm" onClick={() => setIsOpen(false)}>
                    Dashboard Sistem
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="block w-full text-center py-2.5 bg-red-500/10 text-red-600 font-bold rounded-lg text-sm transition-colors border border-red-500/10 disabled:opacity-50"
                >
                  {isLoggingOut ? 'Mengeluarkan...' : 'Keluar / Logout'}
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="block w-full text-center py-2.5 bg-[#2D2219] text-[#F5F2EB] font-bold rounded-lg text-sm" onClick={() => setIsOpen(false)}>
                Masuk Sistem
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}