// src/app/components/home/Navbar.jsx
"use client"

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation' 

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  
  const pathname = usePathname() 

  if (
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/auth') || 
    pathname.startsWith('/admin')
  ) {
    return null
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A1715]/80 backdrop-blur-lg border-b border-[#E5BA73]/10">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold tracking-widest text-[#E5BA73] hover:opacity-90 transition-opacity">
              BIYO <span className="text-[#F9F6F0] font-light">LURIK</span>
            </Link>
          </div>

          {/* Desktop Nav - href diubah ke real route */}
          <div className="items-center hidden space-x-8 md:flex">
            <Link href="/" className="text-[#E5BA73] font-medium text-sm tracking-wide">Home</Link>
            <Link href="/customizer" className="text-[#A3A19E] hover:text-[#F9F6F0] font-medium text-sm tracking-wide transition-colors flex items-center gap-1.5">
              Lurik Customizer
              <span className="text-[9px] bg-[#E5BA73] text-[#12110F] px-1.5 py-0.5 rounded-full font-bold">NEW</span>
            </Link>
            <Link href="/produk" className="text-[#A3A19E] hover:text-[#F9F6F0] font-medium text-sm tracking-wide transition-colors">Produk</Link>
            
            {/* Dropdown About */}
            <div 
            className="relative py-2" 
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
            >
            <button 
                onClick={() => setShowDropdown(!showDropdown)} 
                className="text-[#A3A19E] hover:text-[#F9F6F0] font-medium text-sm tracking-wide transition-colors flex items-center gap-1"
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
                    className="block px-4 py-2.5 text-sm text-[#A3A19E] hover:bg-[#E5BA73]/10 hover:text-[#E5BA73] transition-colors"
                >
                    Artikel & Edukasi
                </Link>
                <Link 
                    href="/produksi" 
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-2.5 text-sm text-[#A3A19E] hover:bg-[#E5BA73]/10 hover:text-[#E5BA73] transition-colors"
                >
                    Proses Produksi
                </Link>
                </div>
            )}
            </div>
          </div>

          {/* Right Menu (Cart & Sign In) */}
          <div className="items-center hidden space-x-6 md:flex">
            <Link href="/cart" className="relative p-2 text-[#A3A19E] hover:text-[#E5BA73] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              <span className="absolute top-1 right-1 bg-[#E5BA73] text-[#12110F] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </Link>
            <Link href="/auth/login" className="px-5 py-2.5 bg-transparent border border-[#E5BA73] text-[#E5BA73] hover:bg-[#E5BA73] hover:text-[#12110F] rounded-lg text-xs font-semibold tracking-wider transition-all duration-300">
              MASUK
            </Link>
          </div>

          {/* Mobile Button */}
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
          <Link href="/" className="block py-2 text-[#E5BA73] font-medium" onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/customizer" className="block py-2 text-[#A3A19E]" onClick={() => setIsOpen(false)}>Lurik Customizer</Link>
          <Link href="/produk" className="block py-2 text-[#A3A19E]" onClick={() => setIsOpen(false)}>Produk</Link>
          <div className="border-t border-[#E5BA73]/10 my-2 pt-2">
            <Link href="/artikel" className="block py-1.5 text-sm text-[#A3A19E] pl-4" onClick={() => setIsOpen(false)}>Artikel & Edukasi</Link>
            <Link href="/produksi" className="block py-1.5 text-sm text-[#A3A19E] pl-4" onClick={() => setIsOpen(false)}>Proses Produksi</Link>
          </div>
          <Link href="/auth/login" className="block w-full text-center py-2.5 bg-[#E5BA73] text-[#12110F] font-bold rounded-lg text-sm" onClick={() => setIsOpen(false)}>Masuk Sistem</Link>
        </div>
      )}
    </nav>
  )
}