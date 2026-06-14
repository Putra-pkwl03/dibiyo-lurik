'use client'

import React, { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import Swal from 'sweetalert2'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

// Import Komponen Lokal
import ProdukCard from './ProdukCard'
import ProdukFilter from './ProdukFilter'
import ModalTambahProduk from './ModalTambahProduk'
import DetailModalKp from './DetailModalKp'

const ModalEditProduk = dynamic(() => import('./ModalEditProduk'), { ssr: false })

export default function ProdukList() {
  const router = useRouter()
  const [produks, setProduks] = useState([])
  const [categories, setCategories] = useState([])
  const [motifs, setMotifs] = useState([])
  const [raks, setRaks] = useState([])
  const [prices, setPrices] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    kategori_id: '',
    jenis_pewarna: '',
    status: ''
  })

  // State untuk Integrasi Pagination Server-Side
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 15 // Limit disesuaikan menjadi 15 sesuai rute backend

  // Memisahkan loading data master agar hanya dipanggil satu kali di awal
  const loadMasterData = async () => {
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
      console.error('Gagal memuat data master:', err)
    }
  }

  // Fungsi utama pemanggilan data produk berdasarkan halaman aktif
  const fetchProduks = async () => {
    setIsLoading(true)
    try {
      const resProd = await fetch(`/api/produk?page=${currentPage}&limit=${itemsPerPage}`, { credentials: 'include' })
      const dProd = await resProd.json()
      
      if (resProd.ok) {
        setProduks(dProd.data || [])
        setTotalItems(dProd.meta?.total || dProd.data?.length || 0)
      }
    } catch (err) {
      console.error(err)
      Swal.fire({ title: 'Error', text: 'Gagal memuat data produk.', icon: 'error', confirmButtonColor: '#1A335A' })
    } finally {
      setIsLoading(false)
    }
  }

  // Load data master sekali saat mounting komponen
  useEffect(() => {
    loadMasterData()
  }, [])

  // Picu fetch produk setiap kali currentPage berubah
  useEffect(() => {
    fetchProduks()
  }, [currentPage])

  // Handler kombinasi refresh state setelah operasi mutasi data
  const handleRefreshAll = () => {
    fetchProduks()
  }

  const normalizeStatus = (statusStr) => {
    const s = statusStr?.toLowerCase()
    if (s === 'ready' || s === 'tersedia') return 'tersedia'
    if (s === 'sold' || s === 'habis') return 'habis'
    return s
  }

  const filteredProduks = produks.filter((produk) => {
    const query = searchQuery.toLowerCase()
    const matchSearch = query === '' || 
                        produk.kode_produk?.toLowerCase().includes(query) || 
                        produk.motif?.nama?.toLowerCase().includes(query)

    const matchKategori = filters.kategori_id === '' || produk.kategori?.id === filters.kategori_id
    const matchPewarna = filters.jenis_pewarna === '' || produk.jenis_pewarna === filters.jenis_pewarna
    const matchStatus = filters.status === '' || normalizeStatus(produk.status) === normalizeStatus(filters.status)

    return matchSearch && matchKategori && matchPewarna && matchStatus
  })

  const hasActiveFilter = filters.kategori_id || filters.jenis_pewarna || filters.status

  // Hitung total halaman data produk
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        {/* Search Input Box */}
        <div className="relative flex-1 w-full">
          <Search className="absolute font-bold text-black -translate-y-1/2 left-4 top-1/2" size={20} />
          <input
            type="text"
            placeholder="nama motif/kode produk"
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

          {/* Render Dropdown Tepat Di Bawah Tombol */}
          {isFilterOpen && (
            <ProdukFilter
              categories={categories}
              currentFilters={filters}
              setFilters={setFilters}
              onClose={() => setIsFilterOpen(false)}
            />
          )}
        </div>
        
        {/* Tombol Tambah Produk */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 h-[48px] bg-[#1A335A] hover:bg-[#11223d] text-white px-10 rounded-[8px] text-sm font-semibold transition-transform active:scale-[0.98] lg:ml-auto shadow-sm"
        >
          <Plus size={18} /> Tambah Produk
        </button>
      </div>

      {/* Grid Produk */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(itemsPerPage)].map((_, index) => (
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
          {filteredProduks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-xl border-stone-200">
              <p className="text-sm font-medium text-stone-400">Tidak ada produk kain lurik ditemukan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProduks.map((produk) => (
                <ProdukCard
                  key={produk.id}
                  produk={produk}
                  onRefresh={handleRefreshAll}
                  onEditClick={(id) => { setSelectedProductId(id); setIsEditModalOpen(true); }}
                  onDetailClick={(id) => { setSelectedProductId(id); setIsDetailModalOpen(true); }}
                />
              ))}
            </div>
          )}

          {/* ================= CONTROLLER PAGINATION STOK PRODUK KP ================= */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-4 pt-6 mt-6 border-t border-stone-200 sm:flex-row">
              <div className="text-xs font-medium text-stone-500">
                Menampilkan <span className="text-[#1A335A] font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span>–{Math.min(currentPage * itemsPerPage, totalItems)} dari <span className="text-[#1A335A] font-bold">{totalItems}</span> Total Master Produk
              </div>
              
              <div className="flex items-center gap-1">
                {/* Tombol Sebelumnya */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-8 h-8 transition-all bg-white border rounded shadow-sm cursor-pointer border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white"
                >
                  <ChevronLeft size={14} strokeWidth={2.5} />
                </button>

                {/* Daftar Angka Halaman */}
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-[#1A335A] text-white shadow-md shadow-[#1A335A]/10'
                          : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 shadow-sm'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Tombol Selanjutnya */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-8 h-8 transition-all bg-white border rounded shadow-sm cursor-pointer border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white"
                >
                  <ChevronRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Tambah Produk */}
      <ModalTambahProduk
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleRefreshAll}
        categories={categories}
        motifs={motifs}
        raks={raks}
        prices={prices}
      />

      {/* Modal Edit Produk */}
      {isEditModalOpen && selectedProductId && (
        <ModalEditProduk
          isOpen={isEditModalOpen}
          productId={selectedProductId}
          onClose={() => { setIsEditModalOpen(false); setSelectedProductId(null); }}
          onSuccess={handleRefreshAll}
          categories={categories}
          motifs={motifs}
          raks={raks}
          prices={prices}
        />
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