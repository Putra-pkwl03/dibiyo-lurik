'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, Trash, X, ThumbsUp, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'
import dynamic from 'next/dynamic'

// Lazy load komponen modal agar rendering awal halaman super cepat
const MotifModal = dynamic(() => import('./MotifModal'), { ssr: false })
const MotifEditModal = dynamic(() => import('./MotifEditModal'), { ssr: false })

// Style backdrop disesuaikan: Navy semi-transparan (#1A335A7A) + blur
const BACKDROP_STYLE = {
  backgroundColor: '#1A335A7A',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
}

export default function MotifList() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedMotif, setSelectedMotif] = useState(null)
  
  const [motifs, setMotifs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // State Integrasi Pagination & Search Server-Side
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10 // Sesuai dengan default limit dari API route motif

  // State untuk kontrol Modal Konfirmasi Hapus Manual Modul Motif
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [motifToDelete, setMotifToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // State untuk Modal Success setelah hapus
  const [isDeleteSuccessOpen, setIsDeleteSuccessOpen] = useState(false)

  const fetchMotif = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let url = `/api/motif?page=${currentPage}&limit=${itemsPerPage}`
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`
      }

      const response = await fetch(url, { credentials: 'include' })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengambil data motif')
      }

      setMotifs(result.data?.items || [])
      setTotalItems(result.data?.meta?.totalItems || result.data?.items?.length || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Efek untuk reset ke halaman 1 jika user mengetik kata kunci pencarian baru
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Ambil ulang data jika halaman aktif atau query pencarian berubah
  useEffect(() => {
    fetchMotif()
  }, [currentPage, searchQuery])

  const handleEditClick = (motif) => {
    setSelectedMotif(motif)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (id, nama) => {
    setMotifToDelete({ id, nama })
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!motifToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/motif/${motifToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const resData = await response.json()

      if (!response.ok) {
        throw new Error(resData.message || 'Gagal menghapus motif')
      }

      fetchMotif() 
      setIsDeleteModalOpen(false)
      setMotifToDelete(null)

      setIsDeleteSuccessOpen(true)
      setTimeout(() => setIsDeleteSuccessOpen(false), 1600)

    } catch (err) {
      setIsDeleteModalOpen(false)
      Swal.fire({
        title: 'Gagal Hapus',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#1A335A'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  return (
    <div className="bg-white rounded-[10px] border border-[#1A335A]/20 min-h-[500px] flex flex-col justify-between overflow-hidden relative">
      <div>
        {/* ── Header Tabel & Penataan Kontrol Kanan ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-b border-[#1A335A]/10">
          <h3 className="text-lg font-bold text-[#000000] min-w-max">
            Daftar Motif Produk
          </h3>
          
          {/* Container dibuat rapat ke kanan (justify-end) */}
          <div className="flex flex-col justify-end flex-1 w-full gap-3 sm:flex-row sm:items-center sm:w-auto">
            {/* Input Kolom Search (Tepat di kiri button) */}
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                <Search size={15} className="text-stone-400" />
              </span>
              <input 
                type="text"
                placeholder="Cari nama motif..."
                className="w-full h-[38px] bg-[#5AE3ED0F] pl-9 pr-4 border border-[#1A335A]/20 rounded-[8px] text-xs text-stone-800 font-medium outline-none focus:border-[#1A335A] focus:ring-1 focus:ring-[#1A335A] placeholder-gray-400 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#1A335A] hover:bg-[#122440] text-white px-4 py-2.5 rounded-[10px] text-sm font-bold transition-all shadow-sm h-[38px] min-w-max w-full sm:w-auto"
            >
              <Plus size={16} />
              <span>Tambah Motif</span>
            </button>
          </div>
        </div>

        {/* ── Kontainer Tabel Utama ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#1A335A] text-white font-bold">
              <tr>
                <th className="w-20 px-6 py-4 text-center">No.</th>
                <th className="px-6 py-4">Nama Motif</th>
                <th className="px-6 py-4 text-center">Tanggal Dibuat</th>
                <th className="w-32 px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A335A]/10">
              {isLoading ? (
                /* ── SKELETON LOADING MODE SHIMMER (10 baris presisi) ── */
                [...Array(itemsPerPage)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-3 text-center">
                      <div className="w-6 h-4 mx-auto rounded bg-stone-200"></div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="w-48 h-4 rounded bg-stone-200"></div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="w-24 h-4 mx-auto rounded bg-stone-200"></div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-9 w-11 bg-stone-200 rounded-[8px]"></div>
                        <div className="h-9 w-11 bg-stone-200 rounded-[8px]"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 font-medium text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : motifs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                    Belum ada data motif.
                  </td>
                </tr>
              ) : (
                motifs.map((motif, index) => (
                  <tr key={motif.id} className="transition-colors hover:bg-[#1A335A]/5 border-b border-b-[#1A335A]/10">
                    <td className="px-6 py-2 text-center text-gray-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}.
                    </td>
                    <td className="px-6 py-2 font-semibold text-[#000000]">{motif.nama}</td>
                    <td className="px-6 py-2 text-center text-gray-500">
                      {motif.created_at ? new Date(motif.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      }) : '-'}
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex items-center justify-center gap-2 p-1">
                        <button 
                          onClick={() => handleEditClick(motif)}
                          className="flex flex-col items-center justify-center gap-0.5 aspect-square w-10 sm:w-[42px] md:w-[45px] bg-[#486A9F] hover:bg-[#486A9F]/85 text-white rounded-[8px] transition-all duration-200 shadow-sm" 
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[12px] md:h-[12px]" strokeWidth={2.2} />
                          <span className="text-[10px] sm:text-[11px] font-semibold leading-none">Edit</span>
                        </button>
                        
                        <button 
                          onClick={() => openDeleteModal(motif.id, motif.nama)}
                          className="flex flex-col items-center justify-center gap-0.5 aspect-square w-10 sm:w-[42px] md:w-[45px] bg-[#FF695E] hover:bg-[#FF695E]/85 text-white rounded-[8px] transition-all duration-200 shadow-sm" 
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[15px] md:h-[15px]" strokeWidth={2.2} />
                          <span className="text-[10px] sm:text-[11px] font-semibold leading-none">Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Baris penyeimbang estetika halaman agar layout konstan */}
      {!isLoading && motifs.length > 0 && motifs.length < itemsPerPage && (
        <div className="flex-1 bg-white divide-y divide-[#1A335A]/5">
          {[...Array(itemsPerPage - motifs.length)].map((_, i) => (
            <div key={i} className="w-full h-[57px] border-b border-[#1A335A]/5"></div>
          ))}
        </div>
      )}

      {/* ── KONTROL PAGINATION UTAMA MOTIF ── */}
      {!isLoading && totalPages > 1 && (
        <div className="z-10 flex flex-col items-center justify-between gap-4 p-6 bg-white border-t border-stone-200 sm:flex-row">
          <div className="text-xs font-medium text-stone-500">
            Menampilkan <span className="text-[#1A335A] font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span>–{Math.min(currentPage * itemsPerPage, totalItems)} dari <span className="text-[#1A335A] font-bold">{totalItems}</span> Total Data Motif
          </div>
          
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-8 h-8 transition-all bg-white border rounded shadow-sm cursor-pointer border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronLeft size={14} strokeWidth={2.5} />
            </button>

            {[...Array(totalPages)].map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-[#1A335A] text-white shadow-md'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 shadow-sm'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

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

{/* ── MODAL KONFIRMASI HAPUS MOTIF ── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={BACKDROP_STYLE}>
          <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Tombol Close Silang */}
            <button
              onClick={() => {
                setIsDeleteModalOpen(false)
                setMotifToDelete(null)
              }}
              disabled={isDeleting}
              className="absolute top-4 right-4 text-[#1A335A] hover:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            <div className="flex flex-col items-center px-6 pt-10 pb-7">
              {/* Ikon Trash (Ubah ke Biru) */}
              <div className="text-[#1A335A] mb-4">
                <Trash size={40} strokeWidth={1.8} />
              </div>

              {/* Teks Konfirmasi */}
              <p className="text-[#000000] text-[15px] font-bold text-center leading-snug mb-7">
                Apakah Anda Yakin Ingin<br />Menghapus Motif ini
              </p>

              {/* Grid Tombol Aksi */}
              <div className="flex items-center w-full gap-3">
                {/* Tombol Batal (Ubah ke Biru) */}
                <button
                  disabled={isDeleting}
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setMotifToDelete(null)
                  }}
                  className="flex-1 h-[47px] rounded-[10px] bg-[#1A335A] hover:bg-[#122440] text-white font-bold text-base transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                
                {/* Tombol Konfirmasi Hapus (Ubah ke Biru) */}
                <button
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 h-[47px] rounded-[10px] bg-[#1A335A] hover:bg-[#122440] text-white font-bold text-base transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer"
                >
                  {isDeleting ? (
                    <Loader2 size={18} className="text-white animate-spin" />
                  ) : (
                    'Ya, Hapus'
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL SUCCESS setelah Hapus ── */}
      {isDeleteSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={BACKDROP_STYLE}>
          <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsDeleteSuccessOpen(false)}
              className="absolute top-4 right-4 text-[#1A335A] hover:opacity-80 transition-opacity"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            <div className="flex flex-col items-center justify-center px-6 py-12">
              <ThumbsUp size={56} className="text-[#1A335A] mb-5" strokeWidth={1.5} />
              <p className="text-[#000000] text-[18px] font-bold tracking-[0.18px] text-center">
                Motif Berhasil Dihapus
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instance Input Modal Tambah */}
      <MotifModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchMotif} />

      {/* Instance Input Modal Edit */}
      <MotifEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedMotif(null)
        }}
        onSuccess={fetchMotif}
        motifData={selectedMotif}
      />
    </div>
  )
}