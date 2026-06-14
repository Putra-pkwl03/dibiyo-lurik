'use client';

import React, { useState } from "react";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export default function PoRegulerHapus({ isOpen, onClose, item, onSuccess }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !item) return null;

  const handleDeleteSubmit = async () => {
    setLoading(true);

    try {
      // Menghapus request DELETE langsung ke endpoint dynamic URL Pre-Order Reguler
      const response = await fetch(`/api/pre-order-reguler/${item.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus data pre-order");
      }

      // Notifikasi sukses menggunakan SweetAlert2
      Swal.fire({
        title: "Berhasil Dihapus!",
        text: `Data pre-order reguler atas nama ${item.nama_customer || 'Customer'} telah dihapus.`,
        icon: "success",
        confirmButtonColor: "#1A335A"
      });

      // Jalankan fungsi callback sukses jika dilempar dari komponen parent
      if (onSuccess) {
        onSuccess(item.id);
      } else {
        // Fallback jika tidak ada callback: reload halaman otomatis
        window.location.reload();
      }

      onClose(); // Tutup modal
    } catch (error) {
      Swal.fire("Gagal Menghapus", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-inter">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-red-50">
          <div className="flex items-center gap-2 text-red-700 font-bold text-xs tracking-wide">
            <AlertTriangle size={16} />
            <span>Konfirmasi Hapus Data</span>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* KONTEN UTAMA */}
        <div className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus data <span className="font-semibold">Pre-Order Reguler</span> ini? Tindakan ini 
              <span className="text-red-600 font-bold"> tidak dapat dibatalkan</span>.
            </p>
          </div>

          {/* RINGKASAN DATA YANG AKAN DIHAPUS */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-[11px] space-y-1.5 text-stone-700">
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">ID Pre-Order:</span>
              <span className="font-mono font-bold text-gray-800">{item.id?.slice(0, 8).toUpperCase() || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Nama Customer:</span>
              <span className="font-bold text-gray-800">{item.nama_customer || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Total Tagihan:</span>
              <span className="font-bold text-cyan-900">Rp {(item.total_harga || 0).toLocaleString('id-ID')},00</span>
            </div>
          </div>
        </div>

        {/* AKSI TOMBOL */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 py-2 rounded-md bg-white border border-gray-300 text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleDeleteSubmit}
            className={`flex-1 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            <Trash2 size={13} />
            {loading ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>

      </div>
    </div>
  );
}