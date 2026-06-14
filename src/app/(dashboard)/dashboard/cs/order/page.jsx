'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import { Plus, SlidersHorizontal, AlertTriangle, X, ChevronLeft, ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useOrderStore } from '../../../../store/useOrderStore';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom'

const ProductCard = dynamic(() => import('../../../../components/cs/produk/ProductCard'), { ssr: false })
const ProdukSearchBar = dynamic(() => import('../../../../components/cs/produk/ProdukSearchBar'), { ssr: false })
const FilterPanel = dynamic(() => import('../../../../components/cs/produk/FilterPanel'), { ssr: false })
const PilihGulunganModal = dynamic(() => import('../../../../components/cs/produk/PilihGulunganModal'), { ssr: false });

export default function CsProdukPage() {
  const router = useRouter();
  const { setOrderData } = useOrderStore();
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    kategori: 'All',
    pewarna: 'All',
    status: 'All'
  })

  // State untuk Pagination & Meta dari Backend
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 15 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertProduct, setAlertProduct] = useState(null);

  // Integrasi state halaman (currentPage) ke dalam fetch parameter API
  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/produk?page=${currentPage}&limit=${itemsPerPage}`)
      const result = await res.json()
      setProducts(result.data || [])
      setTotalItems(result.meta?.total || result.data?.length || 0)
    } catch (error) { 
      console.error(error) 
    } finally { 
      setLoading(false) 
    }
  }

  // Trigger ulang fetch data setiap kali halaman bergeser
  useEffect(() => {
    fetchData()
  }, [currentPage])

  const getUniqueValues = (key) => {
    const values = products.map(p => {
      if (key === 'kategori') return p.kategori?.nama;
      if (key === 'pewarna') return p.jenis_pewarna;
      return null;
    });
    return [...new Set(values.filter(Boolean))];
  };

  const filterOptions = {
    Kategori: getUniqueValues('kategori'),
    Pewarna: getUniqueValues('pewarna'),
    Status: ['Ready', 'Sold']
  };

  const dapatkanTotalStokAktif = (produk) => {
    if (Array.isArray(produk?.gulungan)) {
      return produk.gulungan.filter(g => (g.panjang_sisa ?? 0) > 0).length
    }
    return produk?.stok ?? 0
  }

  const filteredProducts = products.filter((p) => {
    const currentStokAktif = dapatkanTotalStokAktif(p)

    const matchesSearch = p.kode_produk?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.motif?.nama?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesKategori = filters.kategori === 'All' || p.kategori?.nama === filters.kategori
    const matchesPewarna = filters.pewarna === 'All' || p.jenis_pewarna === filters.pewarna
    const matchesStatus = filters.status === 'All' || (filters.status === 'Ready' ? currentStokAktif > 0 : currentStokAktif === 0)
    
    return matchesSearch && matchesKategori && matchesPewarna && matchesStatus
  })

  // Kalkulasi total halaman berdasarkan item yang tersaring
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
      // Scroll smooth ke bagian atas daftar produk saat ganti halaman
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleAddReguler = (product) => {
    setOrderData({
      customer: { nama: "", telpon: "", tgl: "", alamat: "" },
      items: [{
        id: Date.now(),
        ...product, 
        qty: 1,
        panjang: "",
        harga_per_meter: product.harga || 0, 
        totalHargaItem: 0 
      }],
      paymentData: null
    });
    router.push('/dashboard/cs/order/por');
  };

  const handleOpenBuyModal = (product) => {
    if (dapatkanTotalStokAktif(product) <= 0) {
      setAlertProduct(product);
      setIsAlertModalOpen(true);
      return; 
    }
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Container judul */}
      <div className="overflow-x-visible">
        <h2 className="px-4 pb-2 sm:pb-5 -mx-4 text-lg sm:text-[24px] font-medium tracking-wide border-b border-gray-500 text-stone-800 sm:-mx-6 sm:px-6">
          Daftar Produk Kain
        </h2>
      </div>

      {/* Baris Search, Filter, dan Tambah */}
      <div className="flex flex-col items-center w-full gap-3 sm:flex-row">
        <div className="flex-1 w-full">
          <ProdukSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>

        <div className="flex w-full gap-3 sm:w-auto shrink-0">
          <div className="relative flex-1 sm:w-[280px]"> 
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-start gap-2 w-full px-6 py-2.5 text-sm transition-colors bg-[#5AE3ED1C] border border-[#1A335A] rounded-lg text-gray-500 hover:bg-blue-50"
            >
              <SlidersHorizontal size={16} /> <span>Filter</span>
            </button>

            {isFilterOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-white border border-stone-200 rounded-2xl shadow-xl">
                <FilterPanel 
                  options={filterOptions} 
                  filters={filters} 
                  setFilters={setFilters} 
                  onClose={() => setIsFilterOpen(false)} 
                />
              </div>
            )}
          </div>

          <Link 
            href="/dashboard/cs/order/poc"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1A335A] text-white rounded-lg text-sm font-medium hover:bg-[#284e86] transition-all whitespace-nowrap"
          >
            <Plus size={18} className="text-white shrink-0" /> 
            <span>Tambah Pre Order Custom</span>
          </Link>
        </div>
      </div>

      {/* List Produk */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[...Array(itemsPerPage)].map((_, i) => (
            <div key={i} className="p-5 bg-white border border-stone-200/80 rounded-2xl space-y-4 h-[280px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-1/4 h-5 rounded-lg bg-stone-200"></div>
                  <div className="w-1/5 h-5 rounded-lg bg-stone-200"></div>
                </div>
                <div className="w-3/4 h-6 mt-4 rounded-lg bg-stone-200"></div>
                <div className="pt-2 space-y-2">
                  <div className="w-1/2 h-4 rounded bg-stone-200"></div>
                  <div className="w-2/3 h-4 rounded bg-stone-200"></div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 mt-auto border-t border-stone-100">
                <div className="flex-1 h-9 bg-stone-200 rounded-xl"></div>
                <div className="flex-1 h-9 bg-stone-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
              <p className="text-sm font-medium text-stone-400">Tidak ada data kain ditemukan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((p) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onAddReguler={handleAddReguler} 
                  onBuy={() => handleOpenBuyModal(p)}
                />
              ))}
            </div>
          )}

          {/* ================= BAR PAGINATION MODERN ================= */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-4 pt-6 mt-8 border-t border-stone-200 sm:flex-row">
              <div className="text-xs font-medium text-stone-500">
                Menampilkan <span className="text-[#1A335A] font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span>-{Math.min(currentPage * itemsPerPage, totalItems)} dari <span className="text-[#1A335A] font-bold">{totalItems}</span> Total Produk
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center transition-all bg-white border shadow-sm cursor-pointer w-9 h-9 border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white"
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>

                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 flex items-center justify-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-[#1A335A] text-white shadow-md shadow-[#1A335A]/20'
                          : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 shadow-sm'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center transition-all bg-white border shadow-sm cursor-pointer w-9 h-9 border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white"
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Pilih Gulungan Tradisional */}
      {selectedProduct && (
        <PilihGulunganModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          product={selectedProduct}
          onConfirm={() => {
            setIsModalOpen(false);
          }}
        />
      )}

      {/* MODAL KUSTOM STOK HABIS */}
      {isAlertModalOpen && alertProduct && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#1A335A7A] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsAlertModalOpen(false)} />
          <div className="relative z-10 w-full max-w-xs p-6 duration-200 bg-white border shadow-2xl border-stone-200 rounded-xl font-inter animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsAlertModalOpen(false)}
              className="absolute p-1 transition-colors rounded-lg top-3 right-3 text-stone-400 hover:text-[#8B5E3C] hover:bg-stone-100 focus:outline-none"
            >
              <X size={16} />
            </button>
            <div className="flex flex-col items-center mt-2 space-y-2.5 text-center">
              <div className="p-4 text-red-600 bg-red-100 rounded-full">
                <AlertTriangle size={28} className="stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-bold text-stone-800">
                Stok Kain Habis!
              </h3>
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs font-medium leading-relaxed text-stone-600">
                Produk <span className="text-[#8B5E3C] font-semibold">
                  {alertProduct?.motif?.nama || alertProduct?.kode_produk || 'Kain ini'}
                </span> saat ini tidak tersedia untuk pembelian langsung. Silakan lakukan Pre-Order Reguler.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}