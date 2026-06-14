'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Plus, Edit3, Trash2, Loader2, Trash, X, ThumbsUp } from 'lucide-react'
import Swal from 'sweetalert2'

const KategoriModal = dynamic(() => import('../kategori/KategoriModal'), { ssr: false })
const KategoriEditModal = dynamic(() => import('../kategori/KategoriEditModal'), { ssr: false })

// Style backdrop disesuaikan: Navy semi-transparan (#1A335A7A) + blur
const BACKDROP_STYLE = {
  backgroundColor: '#1A335A7A',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
}

// KELOMPOK SKELETON LOADER (Disinkronkan dengan tema Navy, meniru struktur baris tabel)
function KategoriSkeleton({ rows = 4 }) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} className="border-b border-[#1A335A]/10 animate-pulse">
          {/* No. */}
          <td className="px-6 py-4 text-center">
            <div className="w-5 h-4 mx-auto rounded bg-[#1A335A]/10" />
          </td>
          {/* Nama Kategori */}
          <td className="px-6 py-4">
            <div className="w-40 h-4 rounded bg-[#1A335A]/10" />
          </td>
          {/* Tanggal Dibuat */}
          <td className="px-6 py-4 text-center">
            <div className="w-24 h-4 mx-auto rounded bg-[#1A335A]/10" />
          </td>
          {/* Aksi */}
          <td className="px-6 py-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-[8px] bg-[#1A335A]/10" />
              <div className="w-10 h-10 rounded-[8px] bg-[#1A335A]/10" />
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}

export default function KategoriList() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // State untuk Modal Konfirmasi Hapus Manual
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // State untuk Modal Success setelah hapus
  const [isDeleteSuccessOpen, setIsDeleteSuccessOpen] = useState(false)

  // Ambil data utama dari API backend
  const fetchKategori = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/kategori', { credentials: 'include' })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengambil data kategori')
      }

      setCategories(result.data?.items || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchKategori()
  }, [])

  // Buka modal edit dengan mengirim object data terpilih
  const handleEditClick = (kategori) => {
    setSelectedCategory(kategori)
    setIsEditModalOpen(true)
  }

  // Pemicu awal modal hapus kustom terbuka
  const openDeleteModal = (id, nama) => {
    setCategoryToDelete({ id, nama })
    setIsDeleteModalOpen(true)
  }

  // Aksi Hapus Menggunakan Modal Kustom & Eksekusi API Backend
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/kategori/${categoryToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const resData = await response.json()

      if (!response.ok) {
        throw new Error(resData.message || 'Gagal menghapus kategori')
      }

      // 1. Sinkronisasi data di tabel state React
      setCategories(current => current.filter(item => item.id !== categoryToDelete.id))

      // 2. Tutup modal kustom
      setIsDeleteModalOpen(false)
      setCategoryToDelete(null)

      // 3. Tampilkan custom success modal (auto-close 1.6s)
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

  return (
    <div className="bg-white rounded-[10px] border border-[#1A335A]/20 min-h-[500px] flex flex-col justify-between overflow-hidden relative">
      <div>
        {/* ── Header Tabel ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1A335A]/10">
          <h3 className="text-lg font-bold text-[#1A335A]">Daftar Kategori Produk</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1A335A] hover:bg-[#122440] text-white px-4 py-2.5 rounded-[10px] text-sm font-semibold transition-all shadow-sm"
          >
            <Plus size={16} />
            <span>Tambah Kategori</span>
          </button>
        </div>

        {/* ── Tabel Utama ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#1A335A] text-white font-medium">
              <tr>
                <th className="w-20 px-6 py-4 text-center">No.</th>
                <th className="px-6 py-4">Nama Kategori</th>
                <th className="px-6 py-4 text-center">Tanggal Dibuat</th>
                <th className="w-32 px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A335A]/10">
              {isLoading ? (
                <KategoriSkeleton rows={4} />
              ) : error ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 font-medium text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                    Belum ada data kategori.
                  </td>
                </tr>
              ) : (
                categories.map((kategori, index) => (
                  <tr key={kategori.id} className="transition-colors hover:bg-[#1A335A]/5 border-b border-b-[#1A335A]/10">
                    <td className="px-6 py-2 text-center text-gray-500">{index + 1}.</td>
                    <td className="px-6 py-2 font-bold text-[#000000]">{kategori.nama}</td>
                    <td className="px-6 py-2 text-center text-gray-500">
                      {kategori.created_at ? new Date(kategori.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : '-'}
                    </td>
                    <td className="px-6 py-0.5">
                      <div className="flex items-center justify-center gap-2 p-1">
                        {/* Tombol Edit (#486A9F) */}
                        <button
                          onClick={() => handleEditClick(kategori)}
                          className="flex flex-col items-center justify-center gap-0.5 
                                    aspect-square w-10 sm:w-[40px] md:w-[40px]
                                    bg-[#486A9F] hover:bg-[#486A9F]/85 text-white 
                                    rounded-[8px] transition-all duration-200 shadow-sm"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[12px] md:h-[12px]" strokeWidth={2.2} />
                          <span className="text-[10px] sm:text-[10px] font-semibold leading-none">Edit</span>
                        </button>

                        {/* Tombol Hapus (#FF695E) */}
                        <button
                          onClick={() => openDeleteModal(kategori.id, kategori.nama)}
                          className="flex flex-col items-center justify-center gap-0.5 
                                    aspect-square w-10 sm:w-[40px] md:w-[40px]
                                    bg-[#FF695E] hover:bg-[#FF695E]/85 text-white 
                                    rounded-[8px] transition-all duration-200 shadow-sm"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[12px] md:h-[12px]" strokeWidth={2.2} />
                          <span className="text-[10px] sm:text-[10px] font-semibold leading-none">Hapus</span>
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

      {/* Baris kosong penyeimbang estetika halaman */}
      {!isLoading && categories.length < 4 && (
        <div className="flex-1 bg-white divide-y divide-[#1A335A]/5">
          {[...Array(4 - categories.length)].map((_, i) => (
            <div key={i} className="w-full h-[60px] border-b border-[#1A335A]/5"></div>
          ))}
        </div>
      )}

      {/* ── MODAL KONFIRMASI HAPUS ── */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={BACKDROP_STYLE}
        >
          <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">

            {/* Tombol X */}
            <button
              onClick={() => {
                setIsDeleteModalOpen(false)
                setCategoryToDelete(null)
              }}
              disabled={isDeleting}
              className="absolute top-4 right-4 text-[#1A335A] hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            {/* Konten */}
            <div className="flex flex-col items-center px-6 pt-10 pb-7">
              {/* Ikon Trash */}
              <div className="text-[#1A335A] mb-4">
                <Trash size={40} strokeWidth={1.8} />
              </div>

              {/* Teks Konfirmasi */}
              <p className="text-[#000000] text-[15px] font-bold text-center leading-snug mb-7">
                Apakah Anda Yakin Ingin<br />Menghapus Kategori ini
              </p>

              {/* Tombol Batal & Ya, Hapus */}
              <div className="flex items-center w-full gap-3">
                <button
                  disabled={isDeleting}
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setCategoryToDelete(null)
                  }}
                  className="flex-1 h-[47px] rounded-[10px] bg-[#1A335A] hover:bg-[#122440] text-white font-bold text-base transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 h-[47px] rounded-[10px] bg-[#1A335A] hover:bg-[#122440] text-white font-bold text-base transition-colors disabled:opacity-50 flex items-center justify-center"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={BACKDROP_STYLE}
        >
          <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsDeleteSuccessOpen(false)}
              className="absolute top-4 right-4 text-[#1A335A] hover:opacity-80 transition-opacity"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            <div className="flex flex-col items-center justify-center px-6 py-12">
              <ThumbsUp size={56} className="text-[#1A335A] mb-5" strokeWidth={1.5} />
              <p className="text-[#000000] text-[18px] font-bold text-center">
                Kategori Berhasil Dihapus
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Input Tambah */}
      <KategoriModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchKategori}
      />

      {/* Modal Input Edit */}
      <KategoriEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedCategory(null)
        }}
        onSuccess={fetchKategori}
        categoryData={selectedCategory}
      />
    </div>
  )
}