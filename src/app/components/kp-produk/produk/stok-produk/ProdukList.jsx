// D:\dibiyo-lurik\src\app\components\kp-produk\produk\stok-produk\ProdukList.jsx
'use client'

import React, { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, Plus, Loader2 } from 'lucide-react'
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

  const initLoadData = async () => {
    setIsLoading(true)
    try {
      const [resProd, resKat, resMot, resRak, resHarga] = await Promise.all([
        fetch('/api/produk?limit=500', { credentials: 'include' }),
        fetch('/api/kategori?limit=100', { credentials: 'include' }),
        fetch('/api/motif?limit=100', { credentials: 'include' }),
        fetch('/api/rak?limit=100', { credentials: 'include' }),
        fetch('/api/daftar-harga', { credentials: 'include' })
      ])

      const [dProd, dKat, dMot, dRak, dHarga] = await Promise.all([
        resProd.json(), resKat.json(), resMot.json(), resRak.json(), resHarga.json()
      ])

      setProduks(dProd.data || [])
      setCategories(dKat.data?.items || dKat.data || [])
      setMotifs(dMot.data?.items || dMot.data || [])
      setRaks(dRak.data?.items || dRak.data || [])
      setPrices(dHarga.data || [])
    } catch (err) {
      console.error(err)
      Swal.fire({ title: 'Error', text: 'Gagal memuat data.', icon: 'error', confirmButtonColor: '#a47352' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    initLoadData()
  }, [])

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

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search Input Box */}
        <div className="relative flex-1 lg:max-w-[calc(60%-12px)]">
          <Search className="absolute text-[#a47352] left-4 top-1/2 -translate-y-1/2" size={20} />
          <input
            type="text"
            placeholder="nama motif/kode produk"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 h-[56px] rounded-[10px] border border-[#a47352] text-[#a47352] focus:outline-none focus:ring-1 focus:ring-[#a47352]"
            style={{ backgroundColor: 'rgba(227, 194, 172, 0.35)' }}
          />
        </div>

        {/* Action Buttons */}
        <div className="relative w-fit">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center gap-2 w-[120px] h-[56px] rounded-[10px] border transition-colors ${
              hasActiveFilter ? 'bg-[#a47352] text-white' : 'border-[#a47352] text-[#a47352]'
            }`}
          >
            <SlidersHorizontal size={20} /> Filter
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
          className="flex items-center justify-center gap-2 h-[56px] bg-[#a47352] text-white px-6 rounded-[10px] font-medium transition-transform active:scale-[0.98]"
        >
          <Plus size={20} /> Tambah Produk
        </button>
      </div> {/* Tag ini menutup Toolbar dengan benar */}

      {/* Grid Produk */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="p-5 space-y-4 overflow-hidden bg-white border shadow-xs border-stone-200/60 rounded-xl animate-pulse">
              <div className="w-full h-48 rounded-lg bg-stone-200"></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-24 h-4 rounded bg-stone-200"></div>
                  <div className="w-16 h-5 rounded-full bg-stone-200"></div>
                </div>
                <div className="w-3/4 h-6 rounded bg-stone-200"></div>
                <div className="pt-1 space-y-2">
                  <div className="w-1/2 h-3 rounded bg-stone-200"></div>
                  <div className="w-2/3 h-3 rounded bg-stone-200"></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <div className="w-20 h-4 rounded bg-stone-200"></div>
                <div className="flex gap-2">
                  <div className="w-16 h-8 rounded-lg bg-stone-200"></div>
                  <div className="w-8 h-8 rounded-lg bg-stone-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProduks.map((produk) => (
            <ProdukCard
              key={produk.id}
              produk={produk}
              onRefresh={initLoadData}
              onEditClick={(id) => { setSelectedProductId(id); setIsEditModalOpen(true); }}
              onDetailClick={(id) => { setSelectedProductId(id); setIsDetailModalOpen(true); }}
            />
          ))}
        </div>
      )}

      {/* Modal Tambah Produk */}
      <ModalTambahProduk
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={initLoadData}
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
          onSuccess={initLoadData}
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