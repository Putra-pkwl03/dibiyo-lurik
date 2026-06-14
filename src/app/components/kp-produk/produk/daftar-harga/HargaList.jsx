'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ThumbsUp } from 'lucide-react'
import Swal from 'sweetalert2'
import dynamic from 'next/dynamic'

// Import Sub-components lokal
import HargaFormAdd from './HargaFormAdd'
import HargaTable from './HargaTable'
import HargaModalDelete from './HargaModalDelete'

// Lazy load modal edit
const HargaEditModal = dynamic(() => import('./HargaEditModal'), { ssr: false })

// Style backdrop disesuaikan: Navy semi-transparan (#1A335A7A) + blur
const BACKDROP_STYLE = {
  backgroundColor: '#1A335A7A',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
}

export default function HargaList() {
  const [hargas, setHargas] = useState([])
  const [motifs, setMotifs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // State Kontrol Dialog/Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedHarga, setSelectedHarga] = useState(null)
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [hargaToDelete, setHargaToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // State Kontrol Modal Sukses Hapus Global
  const [isDeleteSuccessOpen, setIsDeleteSuccessOpen] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const resHarga = await fetch('/api/daftar-harga', { credentials: 'include' })
      const resHargaJson = await resHarga.json()
      if (!resHarga.ok) throw new Error(resHargaJson.message || 'Gagal memuat harga')

      const resMotif = await fetch('/api/motif?limit=100', { credentials: 'include' })
      const resMotifJson = await resMotif.json()

      setHargas(resHargaJson.data || [])

      if (resMotifJson && resMotifJson.data && Array.isArray(resMotifJson.data.items)) {
        setMotifs(resMotifJson.data.items)
      } else if (Array.isArray(resMotifJson)) {
        setMotifs(resMotifJson)
      } else {
        setMotifs([]) 
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handler Hapus Data
  const handleConfirmDelete = async () => {
    if (!hargaToDelete) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/daftar-harga/${hargaToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const resData = await response.json()

      if (!response.ok) throw new Error(resData.message || 'Gagal menghapus data harga')

      // 1. Amankan update UI tabel data
      setHargas(current => current.filter(item => item.id !== hargaToDelete.id))
      
      // 2. Tutup modal konfirmasi hapus anak
      setIsDeleteModalOpen(false)
      setHargaToDelete(null)

      // 3. Nyalakan Portal Notifikasi Sukses Kustom (Auto-close 1.6 detik)
      setIsDeleteSuccessOpen(true)
      setTimeout(() => {
        setIsDeleteSuccessOpen(false)
      }, 1600)

    } catch (err) {
      setIsDeleteModalOpen(false)
      setHargaToDelete(null)
      Swal.fire({
        title: 'Gagal Hapus ❌',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#1A335A' // Tombol Swal diubah ke warna Navy utama
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <HargaFormAdd motifs={motifs} onRefresh={fetchData} swal={Swal} />

      <HargaTable
        hargas={hargas}
        isLoading={isLoading}
        error={error}
        onEdit={(harga) => {
          setSelectedHarga(harga)
          setIsEditModalOpen(true)
        }}
        onDelete={(harga) => {
          setHargaToDelete(harga)
          setIsDeleteModalOpen(true)
        }}
      />

      <HargaModalDelete
        isOpen={isDeleteModalOpen}
        hargaItem={hargaToDelete}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setHargaToDelete(null)
        }}
      />
      
      <HargaEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedHarga(null)
        }}
        onSuccess={fetchData}
        hargaData={selectedHarga}
        swal={Swal}
        motifOptions={motifs.map(m => ({
          id: m.id ?? m.id_motif, 
          nama: m.nama ?? m.nama_motif 
        }))}
      />

      {/* ── NOTIFIKASI KUSTOM SUKSES HAPUS INDUK — Tema Baru ── */}
      {isDeleteSuccessOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={BACKDROP_STYLE}>
          <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setIsDeleteSuccessOpen(false)}
              className="absolute top-4 right-4 text-[#1A335A] hover:opacity-80 transition-opacity"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            <div className="flex flex-col items-center justify-center py-12 px-6">
              <ThumbsUp size={56} className="text-[#1A335A] mb-5" strokeWidth={1.5} />
              <p className="text-[#000000] text-[18px] font-bold text-center leading-snug">
                Daftar Harga Berhasil di<br />Hapus
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}