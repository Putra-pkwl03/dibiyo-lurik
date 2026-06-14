'use client'

import React, { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'

// Import Komponen Lokal
import ProdukCard from './ProdukCard'
import ProdukFilter from './ProdukFilter'
import DetailModalKp from './DetailModalOwner'

export default function ProdukList() {
  const router = useRouter()
  const [produks, setProduks] = useState([])
  const [categories, setCategories] = useState([])
  const [motifs, setMotifs] = useState([])
  const [raks, setRaks] = useState([])
  const [prices, setPrices] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [isProdLoading, setIsProdLoading] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    kategori_id: '',
    jenis_pewarna: '',
    status: ''
  })

  // State Pagination Baru
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total_items: 0,
    total_pages: 1
  })

  // Load Data Master Pendukung (Hanya Sekali di Awal)
  const initLoadData = async () => {
    setIsLoading(true)
    try {
      const [resKat, resMot, resRak, resHarga] = await Promise.all([
        fetch('/api/kategori?limit=100', { credentials: 'include' }),
        fetch('/api/motif?limit=100', { credentials: 'include' }),
        fetch('/api/rak?limit=100', { credentials: 'include' }),
        fetch('/api/daftar-harga', { credentials: 'include' })
      ])

      const [dKat, dMot, dRak, dHarga] = await Promise.all([
        resKat.json(), resMot.json(), resRak.json(), resHarga.json()
      ])

      setCategories(dKat.data?.items || dKat.data || [])
      setMotifs(dMot.data?.items || dMot.data || [])
      setRaks(dRak.data?.items || dRak.data || [])
      setPrices(dHarga.data || [])
    } catch (err) {
      console.error(err)
      Swal.fire({ title: 'Error', text: 'Gagal memuat data master.', icon: 'error', confirmButtonColor: '#1A335A' })
    } finally {
      setIsLoading(false)
    }
  }

  // Fungsi Khusus Tarik Data Produk Terpaginasi dari Backend
  const fetchProduks = async (showLoadingBar = false) => {
    if (showLoadingBar) setIsProdLoading(true)
    try {
      let url = `/api/produk?page=${page}&limit=15`
      
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`
      if (filters.kategori_id) url += `&kategori_id=${filters.kategori_id}`
      if (filters.jenis_pewarna) url += `&jenis_pewarna=${filters.jenis_pewarna}`
      if (filters.status) url += `&status=${filters.status}`

      const res = await fetch(url, { credentials: 'include' })
      const resJson = await res.json()

      setProduks(resJson.data || [])
      if (resJson.pagination) {
        setPagination(resJson.pagination)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsProdLoading(false)
    }
  }

  useEffect(() => {
    initLoadData()
  }, [])

  // Reset Halaman ke 1 jika Filter atau Query Pencarian Berubah
  useEffect(() => {
    setPage(1)
  }, [searchQuery, filters])

  // Fetch ulang produk jika page, pencarian, atau filter berubah (Debounce 400ms)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProduks(true)
    }, 400)

    return () => clearTimeout(delayDebounce)
  }, [page, searchQuery, filters])

  const hasActiveFilter = filters.kategori_id || filters.jenis_pewarna || filters.status

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1)
  }

  const handleNextPage = () => {
    if (page < pagination.total_pages) setPage((prev) => prev + 1)
  }

  return (
    <div className="space-y-6 font-inter">
      {/* Toolbar */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        {/* Search Input Box */}
        <div className="relative flex-1 w-full">
          <Search className="absolute font-bold text-black -translate-y-1/2 left-4 top-1/2" size={20} />
          <input
            type="text"
            placeholder="Cari nama motif / kode produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 h-[48px] rounded-[8px] border border-gray-300 bg-[#EBF5FA] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1A335A] focus:border-[#1A335A] text-sm"
          />
        </div>

        {/* Action Buttons: Filter */}
        <div className="relative w-fit">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center gap-2 w-[225px] h-[48px] rounded-[8px] border text-sm font-bold transition-colors ${
              hasActiveFilter ? 'bg-[#1A335A] text-white border-[#1A335A]' : 'border-gray-300 bg-[#EBF5FA] text-gray-700 hover:bg-gray-100'
            }`}
          >
            <SlidersHorizontal size={18} /> Filter
          </button>

          {/* Render Dropdown Dropdown Filter */}
          {isFilterOpen && (
            <ProdukFilter
              categories={categories}
              currentFilters={filters}
              setFilters={setFilters}
              onClose={() => setIsFilterOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Grid Produk & Skeleton Loader */}
      {isLoading || isProdLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="p-5 space-y-4 overflow-hidden bg-white border shadow-xs border-stone-200/60 rounded-xl animate-pulse">
              <div className="w-full h-48 rounded-lg bg-stone-200"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-4 rounded bg-stone-200"></div>
                  <div className="h-4 rounded bg-stone-200"></div>
                  <div className="h-4 rounded bg-stone-200"></div>
                </div>
                <div className="w-3/4 h-5 rounded bg-stone-200"></div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <div className="h-12 rounded-lg w-14 bg-stone-200"></div>
                <div className="h-12 rounded-lg w-14 bg-stone-200"></div>
                <div className="h-12 rounded-lg w-14 bg-stone-200"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {produks.length === 0 ? (
            <div className="py-12 text-sm font-medium text-center text-gray-500 border border-dashed rounded-lg bg-stone-50">
              Tidak ada produk yang ditemukan.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {produks.map((produk) => (
                <ProdukCard
                  key={produk.id}
                  produk={produk}
                  onRefresh={() => fetchProduks(false)}
                  onEditClick={(id) => { setSelectedProductId(id); }}
                  onDetailClick={(id) => { setSelectedProductId(id); setIsDetailModalOpen(true); }}
                />
              ))}
            </div>
          )}

          {/* ================= CONTROLLER UI PAGINATION BAR ================= */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-white border rounded-lg shadow-sm border-stone-200">
              <p className="text-xs font-medium text-stone-500">
                Menampilkan <span className="font-bold text-stone-800">{produks.length}</span> dari{' '}
                <span className="font-bold text-stone-800">{pagination.total_items}</span> produk
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="flex items-center justify-center w-8 h-8 transition-colors bg-white border rounded-md border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <span className="px-2 text-xs font-bold text-stone-800">
                  Halaman {page} dari {pagination.total_pages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={page === pagination.total_pages}
                  className="flex items-center justify-center w-8 h-8 transition-colors bg-white border rounded-md border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Detail Produk */}
      <DetailModalKp
        isOpen={isDetailModalOpen}
        productId={selectedProductId}
        onClose={() => { setIsDetailModalOpen(false); setSelectedProductId(null); }}
        raks={raks}
        prices={prices}
      />
    </div>
  )
}