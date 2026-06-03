'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Swal from 'sweetalert2'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import NotificationBell from '../../../../../components/NotificationBell'

const PORegulerTable = dynamic(() => import('../../../../../components/cs/po/por/PORegulerTable'), {
  ssr: false,
})

const PORegulerEditModal = dynamic(() => import('../../../../../components/cs/po/por/PoRegulerEditModal'), {
  ssr: false,
})

// Komponen Skeleton Loader untuk Baris Tabel PO Reguler
function TableSkeleton({ limit = 10 }) {
  return (
    <div className="w-full overflow-x-auto border rounded-sm border-stone-100 animate-pulse">
      <div className="bg-[#1A335A]/90 h-11 w-full flex items-center px-4 justify-between gap-4">
        <div className="w-12 h-4 rounded bg-stone-300/30"></div>
        <div className="flex-1 w-32 h-4 rounded bg-stone-300/30"></div>
        <div className="flex-1 hidden h-4 rounded bg-stone-300/30 w-28 sm:block"></div>
        <div className="flex-1 h-4 rounded bg-stone-300/30 w-36"></div>
        <div className="flex-1 hidden w-24 h-4 rounded bg-stone-300/30 md:block"></div>
        <div className="flex-1 w-24 h-4 rounded bg-stone-300/30"></div>
        <div className="w-16 h-4 rounded bg-stone-300/30"></div>
      </div>

      {/* Rows Skeleton */}
      <div className="bg-white divide-y divide-stone-100">
        {[...Array(limit)].map((_, index) => (
          <div key={index} className="flex items-center justify-between h-16 gap-4 px-4 py-4">
            <div className="w-8 h-4 rounded bg-stone-200"></div>
            <div className="flex-1 w-32 h-4 rounded bg-stone-200"></div>
            <div className="flex-1 hidden h-4 rounded bg-stone-200 w-28 sm:block"></div>
            <div className="flex-1 h-4 rounded bg-stone-200 w-36"></div>
            <div className="flex-1 hidden w-24 h-4 rounded bg-stone-200 md:block"></div>
            <div className="flex-1 w-24 h-4 rounded bg-stone-200"></div>
            <div className="w-16 rounded-lg h-7 bg-stone-200 shrink-0"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PreOrderRegulerPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedItemToEdit, setSelectedItemToEdit] = useState(null)

  // State Baru untuk Pagination & Metadata dari Backend
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  const fetchData = async (isInitial = false) => {
    if (isInitial) setLoading(true)
    try {
      const res = await fetch(`/api/pre-order-reguler?page=${currentPage}&limit=${itemsPerPage}`)
      if (!res.ok) throw new Error('Gagal mengambil data')
      const json = await res.json()
      
      console.log("=== DEBUG PARENT: DATA DARI BACKEND ===", json.data)

      if (json && Array.isArray(json.data)) {
        setData(json.data)
        setTotalItems(json.meta?.total || json.data.length || 0)
      } else {
        setData([])
        setTotalItems(0)
      }
    } catch (err) {
      console.error("Error fetchData:", err)
      setData([])
      setTotalItems(0)
    } finally {
      if (isInitial) setLoading(false)
    }
  }

  // Setiap kali halaman berganti, picu pemanggilan ulang data ke backend
  useEffect(() => {
    fetchData(true)
  }, [currentPage])

  // --- PERBAIKAN DI SINI ---
  const handleConfirmReceiptSuccess = (confirmedId) => {
    // 1. Update state data lokal secara reaktif agar tombol langsung terkunci (berubah abu-abu)
    setData((prevData) => 
      prevData.map((item) => 
        item.id === confirmedId 
          ? { ...item, status_pengambilan: 'sudah_diambil', status_penerimaan: 'sudah_diambil' } 
          : item
      )
    )
    
    // 2. Sinkronisasi data ulang dengan database di background (tanpa memicu loading spinner)
    fetchData(false)
  }

  const handleEditClick = (item) => {
    setSelectedItemToEdit(item)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (item) => {
    Swal.fire({
      title: 'Hapus Pre-Order?',
      text: `Apakah Anda yakin ingin menghapus data pre-order atas nama "${item.nama_customer}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#A63636',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus Data',
      cancelButtonText: 'Batal',
      fontFamily: 'Inter',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const res = await fetch(`/api/pre-order-reguler/${item.id}`, {
            method: 'DELETE',
          })
          const json = await res.json()
          if (!res.ok) throw new Error(json.message || 'Gagal menghapus data')
          return true
        } catch (error) {
          Swal.showValidationMessage(`Error: ${error.message}`)
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Terhapus!',
          text: 'Data Pre-Order Reguler berhasil dihapus dari sistem.',
          icon: 'success',
          confirmButtonColor: '#1A335A'
        })
        fetchData(false)
      }
    })
  }

  const filteredData = data.filter(item => {
    const matchSearch = (item.nama_customer || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'all' || item.status === statusFilter
    return matchSearch && matchStatus
  })

  // Kalkulasi total halaman berdasarkan respon total item keseluruhan database
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full mx-auto space-y-4 text-black font-inter">
      <div className="relative overflow-x-visible">
        <h2 className="text-lg sm:text-[24px] font-medium text-black pb-2 sm:pb-5 border-b border-gray-500 tracking-wide -mx-4 px-4 sm:-mx-6 sm:px-6">
          Pre Order Reguler
        </h2>
      </div>

      <div className="border border-gray-100 rounded-lg p-6 bg-white shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] space-y-5">
        <div className="flex flex-col justify-between gap-4 pb-4 border-b border-gray-400 sm:flex-row sm:items-center">
          <h2 className="text-sm font-bold text-black min-w-max">List Pre Order Reguler</h2>
          
          <div className="flex items-center flex-1 w-full max-w-2xl gap-3 sm:justify-end">
            <div className="relative flex-1 max-w-md">
              <input 
                type="text"
                placeholder="Nama Pelanggan"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[38px] pl-9 pr-3 bg-[#5AE3ED1C] border border-[#1A335A]/20 rounded-md text-xs font-medium outline-none placeholder-gray-400 text-stone-800"
              />
              <Search size={14} className="absolute text-black -translate-y-1/2 left-3 top-1/2" />
            </div>

            <div className="relative max-w-[160px] w-full">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-[38px] pl-9 pr-3 bg-[#5AE3ED1C] border border-[#1A335A]/20 rounded-md text-xs font-bold outline-none text-black cursor-pointer appearance-none"
              >
                <option value="all">Semua Status</option>
                <option value="dalam_proses">Dalam Proses</option>
                <option value="sedang_diproses">Sedang diproses</option>
                <option value="selesai_diproses">Selesai diproses</option>
              </select>
              <SlidersHorizontal size={14} className="absolute text-black -translate-y-1/2 pointer-events-none left-3 top-1/2" />
            </div>
            <NotificationBell role="cs" currentType="reguler" />
          </div>
        </div>

        {/* Render Tabel Konten / Skeleton */}
        {loading ? (
          <TableSkeleton limit={itemsPerPage} />
        ) : (
          <>
            {filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-sm border-stone-200 bg-stone-50/50">
                <p className="text-xs font-medium text-stone-400">Tidak ada antrean pre-order ditemukan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <PORegulerTable 
                  data={filteredData} 
                  onConfirmReceipt={handleConfirmReceiptSuccess}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              </div>
            )}

            {/* ================= CONTROLLER PAGINATION MODERN ================= */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-between gap-4 pt-4 mt-4 border-t border-stone-100 sm:flex-row">
                <div className="text-xs font-medium text-stone-500">
                  Menampilkan <span className="text-[#1A335A] font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span>–{Math.min(currentPage * itemsPerPage, totalItems)} dari <span className="text-[#1A335A] font-bold">{totalItems}</span> Total Antrean
                </div>
                
                <div className="flex items-center gap-1">
                  {/* Tombol Halaman Sebelumnya */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-8 h-8 transition-all bg-white border rounded shadow-sm cursor-pointer border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white"
                  >
                    <ChevronLeft size={14} strokeWidth={2.5} />
                  </button>

                  {/* Looping Nomor Halaman */}
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

                  {/* Tombol Halaman Selanjutnya */}
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
      </div>

      <PORegulerEditModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedItemToEdit(null)
        }}
        item={selectedItemToEdit}
        onRefresh={() => fetchData(false)}
      />
    </div>
  )
}