'use client';

import React, { useState } from "react";
import { X, Trash, Loader2, ThumbsUp } from "lucide-react";
import Swal from "sweetalert2";

export default function PoCustomHapus({ isOpen, onClose, item, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen || !item) return null;

  const handleDeleteSubmit = async () => {
    setLoading(true);

    try {
      // Mengirim request DELETE langsung ke endpoint dynamic URL /api/pre-order-custom/[id]
      const response = await fetch(`/api/pre-order-custom/${item.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus data pre-order");
      }

      // Set state sukses untuk menampilkan Modal Success dan menyembunyikan Form Utama
      setShowSuccess(true);
    } catch (error) {
      // Notifikasi error tetap menggunakan SweetAlert2 agar info teknis terlihat jelas
      Swal.fire("Gagal Menghapus", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── MODAL SUCCESS SETELAH HAPUS ──
  if (showSuccess) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px]"
      >
        <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] relative animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={() => {
              setShowSuccess(false);
              onClose(); // Menutup modal penampung secara keseluruhan
              if (onSuccess) {
                onSuccess(item.id); // Callback update data di sisi parent
              } else {
                window.location.reload(); // Fallback reload halaman
              }
            }}
            className="absolute top-4 right-4 text-[#1A335A] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          <div className="flex flex-col items-center justify-center px-6 py-12">
            <ThumbsUp size={56} className="text-[#1A335A] mb-5" strokeWidth={1.5} />
            <p className="text-[#000000] text-[18px] font-bold text-center">
              Pre-Order Berhasil Dihapus
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── MODAL KONFIRMASI HAPUS UTAMA ──
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-inter backdrop-blur-[1px]">
      <div className="bg-white rounded-[20px] shadow-2xl w-[372px] overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150 relative">
        
        {/* Tombol Close Silang di Pojok Kanan Atas */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-[#1A335A] hover:opacity-80 transition-opacity cursor-pointer"
          disabled={loading}
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
          <p className="text-[#000000] text-[15px] font-bold text-center leading-snug mb-1">
            Apakah Anda Yakin Ingin<br />Menghapus Pre-Order ini
          </p>
          
          {/* Informasi Tambahan Object Customer (Agar User Tidak Salah Hapus) */}
          <p className="text-gray-400 text-[11px] text-center mb-7 max-w-[260px] truncate">
            Customer: <span className="font-semibold text-gray-700">{item.nama_customer || "-"}</span>
          </p>

          {/* Tombol Batal & Ya, Hapus */}
          <div className="flex items-center w-full gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex-1 h-[47px] rounded-[10px] bg-[#1A335A] hover:bg-[#122440] text-white font-bold text-base transition-colors disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleDeleteSubmit}
              className="flex-1 h-[47px] rounded-[10px] bg-[#1A335A] hover:bg-[#122440] text-white font-bold text-base transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer"
            >
              {loading ? (
                <Loader2 size={18} className="text-white animate-spin" />
              ) : (
                'Ya, Hapus'
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}