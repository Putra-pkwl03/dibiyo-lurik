'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import Swal from 'sweetalert2'
import ProductAccordionRow from './ProductAccordionRow'
import PopupTambahGulungan from './ModalTambahGulungan'

// KELOMPOK SKELETON LOADER (Disinkronkan dengan tema Navy & Muted Cyan Tint)
function GulunganSkeleton() {
  return (
    <div className="space-y-3.5 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div 
          key={i} 
          className="bg-gray-50/80 border border-gray-200 rounded-[10px] p-3.5 flex items-center justify-between shadow-[0px_2px_4px_rgba(0,0,0,0.05)]"
        >
          {/* Sisi Kiri: Gambar & Info Utama */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 bg-gray-200 rounded-[8px]" />
            <div className="space-y-2">
              <div className="h-3 bg-[#1A335A]/15 rounded w-16" />
              <div className="h-4 bg-gray-300/60 rounded w-32" />
            </div>
          </div>
          {/* Sisi Kanan: Placeholder Tombol Tambah */}
          <div className="w-28 h-9 bg-[#1A335A]/15 rounded-[8px]" />
        </div>
      ))}
    </div>
  )
}

export default function GulunganList() {
  const [productsData, setProductsData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  // State filter utama instant
  const [filterActive, setFilterActive] = useState('all') 
  const [filterLebar, setFilterLebar] = useState('all')  

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProductCtx, setSelectedProductCtx] = useState(null)

  const popoverRef = useRef(null)

  // Efek Debounce Kolom Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Tutup popover otomatis jika klik di luar area
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fungsi Ambil Data
  const fetchGroupedGulungan = async (searchStr, activeStatus, lebarStatus) => {
    setIsLoading(true)
    try {
      let url = `/api/gulungan?search=${encodeURIComponent(searchStr)}`
      if (activeStatus !== 'all') url += `&is_active=${activeStatus}`
      if (lebarStatus !== 'all') url += `&lebar=${lebarStatus}`

      const res = await fetch(url)
      const json = await res.json()
      setProductsData(json.data || [])
    } catch (err) {
      console.error(err)
      Swal.fire('Error ❌', 'Gagal memuat list gulungan kain.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-fetch data saat kriteria pencarian/filter berubah
  useEffect(() => {
    fetchGroupedGulungan(debouncedSearch, filterActive, filterLebar)
  }, [debouncedSearch, filterActive, filterLebar])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchGroupedGulungan(searchQuery, filterActive, filterLebar)
  }

  const handleResetFilters = () => {
    setFilterActive('all')
    setFilterLebar('all')
  }

  const openTambahModalForProduct = (product) => {
    const defaultRakId = product.items && product.items.length > 0 ? product.items[0].rak_id : ""
    setSelectedProductCtx({
      id: product.id,
      kode_produk: product.kode_produk,
      motif_id: product.motif_id || product.motif?.id,
      motif_nama: product.motif_nama || product.motif?.nama,
      jenis_pewarna: product.jenis_pewarna,
      gambar_url: product.gambar_url,
      rak_id: defaultRakId, 
    })
    setIsModalOpen(true)
  }

  const getFilteredProducts = () => {
    if (filterLebar === 'all' && filterActive === 'all') return productsData

    return productsData
      .map((prod) => {
        const keyGulungan = prod.gulungan ? 'gulungan' : prod.items ? 'items' : 'gulungan_kain'
        const rawList = prod[keyGulungan] || []

        const filteredGulungan = rawList.filter((g) => {
          const matchesLebar = filterLebar === 'all' || String(g.lebar) === String(filterLebar)
          let matchesActive = true
          if (filterActive === 'true') {
            matchesActive = g.is_active === true || (g.panjang_sisa !== undefined && Number(g.panjang_sisa) > 0)
          } else if (filterActive === 'false') {
            matchesActive = g.is_active === false || (g.panjang_sisa !== undefined && Number(g.panjang_sisa) <= 0)
          }
          return matchesLebar && matchesActive
        })

        return { ...prod, [keyGulungan]: filteredGulungan }
      })
      .filter((prod) => {
        const keyGulungan = prod.gulungan ? 'gulungan' : prod.items ? 'items' : 'gulungan_kain'
        return prod[keyGulungan]?.length > 0
      })
  }

  const processedProducts = getFilteredProducts()

  return (
    <div className="space-y-3.5">
      
      {/* BAR TOOLBAR UTAMA */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pt-1 relative">
        <form onSubmit={handleSearchSubmit} className="flex items-center flex-1 w-full gap-3">
          <div className="relative flex-1">
            <Search className="absolute text-[#1A335A]/60 -translate-y-1/2 left-4 top-1/2" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#EEF7F9] border border-[#1A335A]/15 rounded-[10px] text-sm focus:outline-none focus:border-[#1A335A] shadow-[1px_2px_4px_rgba(0,0,0,0.03)] text-gray-800 font-semibold placeholder-[#1A335A]/40"
            />
          </div>
        </form>
        
        {/* Kontainer Popover Filter */}
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center bg-[#EEF7F9] border border-[#1A335A]/15 rounded-[10px] px-5 py-3 shadow-[1px_2px_4px_rgba(0,0,0,0.03)] text-sm font-bold text-[#1A335A] hover:bg-[#E2F0F3] transition-all whitespace-nowrap"
          >
            <SlidersHorizontal size={16} className="text-[#1A335A] mr-2" />
            Filter
            {(filterLebar !== 'all' || filterActive !== 'all') && (
              <span className="ml-1.5 w-2 h-2 rounded-full bg-[#1A335A]" />
            )}
          </button>

          {/* CARD POPOVER FILTERS */}
          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-[10px] shadow-[2px_4px_12px_rgba(0,0,0,0.1)] p-4 z-50 text-gray-700 animate-in fade-in slide-in-from-top-1 duration-150">
              <h3 className="text-xs font-bold text-[#1A335A] mb-2.5 uppercase tracking-wide">Pilih Filter</h3>
              
              {/* Opsi Lebar Kain */}
              <div className="mb-4">
                <span className="text-[11px] font-bold text-[#1A335A]/70 block mb-1.5 uppercase tracking-wider">Lebar Kain</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { val: 'all', label: 'Semua' },
                    { val: '110', label: '110 cm' },
                    { val: '70', label: '70 cm' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setFilterLebar(item.val)}
                      className={`py-2 px-1 text-xs font-bold rounded-[6px] text-center transition-all ${
                        filterLebar === item.val
                          ? 'bg-[#1A335A] text-white shadow-sm'
                          : 'bg-[#EEF7F9]/60 text-[#1A335A] hover:bg-[#EEF7F9]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opsi Status Stok */}
              <div className="mb-4">
                <span className="text-[11px] font-bold text-[#1A335A]/70 block mb-1.5 uppercase tracking-wider">Status Stok</span>
                <div className="space-y-1.5">
                  {[
                    { val: 'all', label: 'Semua Status' },
                    { val: 'true', label: 'Tersedia' },
                    { val: 'false', label: 'Habis' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setFilterActive(item.val)}
                      className={`w-full py-2 px-3 text-left text-xs font-bold rounded-[6px] transition-all ${
                        filterActive === item.val
                          ? 'bg-[#1A335A] text-white'
                          : 'bg-[#EEF7F9]/60 text-[#1A335A] hover:bg-[#EEF7F9]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TOMBOL RESET FILTER */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold py-2.5 rounded-[8px] hover:bg-gray-200 transition-colors text-center block mt-1 shadow-sm"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RENDER UTAMA DATA / SKELETON */}
      {isLoading ? (
        <GulunganSkeleton />
      ) : processedProducts.length === 0 ? (
        <div className="p-16 text-sm text-center font-bold text-gray-500 bg-white border border-gray-200 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] rounded-[10px]">
          Tidak ada data gulungan kain yang sesuai dengan kriteria pencarian atau filter.
        </div>
      ) : (
        <div className="space-y-3.5 pt-1">
          {processedProducts.map((prod) => (
            <ProductAccordionRow 
              key={`${prod.id}-${filterLebar}-${filterActive}`} 
              product={prod} 
              onTambahGulunganKlik={() => openTambahModalForProduct(prod)}
              onRefresh={() => fetchGroupedGulungan(debouncedSearch, filterActive, filterLebar)} 
            />
          ))}
        </div>
      )}

      {/* POPUP MODAL ADD DATA */}
      {isModalOpen && (
        <PopupTambahGulungan
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedProductCtx(null)
          }}
          onSuccess={() => {
            setIsModalOpen(false)
            setSelectedProductCtx(null)
            fetchGroupedGulungan(debouncedSearch, filterActive, filterLebar)
          }}
          currentProduct={selectedProductCtx}
        />
      )}
    </div>
  )
}