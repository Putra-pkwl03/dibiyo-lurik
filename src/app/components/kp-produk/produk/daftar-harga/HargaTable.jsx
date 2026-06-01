'use client'

import React from 'react'
import { Edit3, Trash2 } from 'lucide-react'

export default function HargaTable({ hargas, isLoading, error, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-[10px] border border-[#1A335A]/20 overflow-hidden relative">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#1A335A] text-white font-bold">
            <tr>
              <th className="w-20 px-6 py-4 text-center">No.</th>
              <th className="px-6 py-4 text-center">Jenis Pewarna</th>
              <th className="px-6 py-4 text-center">Lebar</th>
              <th className="px-6 py-4 text-center">Motif (Spesifik)</th>
              <th className="px-6 py-4 text-center">Harga / Meter</th>
              <th className="w-32 px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A335A]/10">
            {isLoading ? (
              /* ── SKELETON LOADING TEMPLATE (3 BARIS PULSE CELL) ── */
              [1, 2, 3].map((n) => (
                <tr key={n} className="animate-pulse bg-gray-50/50">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-6 mx-auto" /></td>
                  <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-full w-16 mx-auto" /></td>
                  <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-full w-16 mx-auto" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28 mx-auto" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 mx-auto" /></td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <div className="h-[34px] w-10 bg-gray-200 rounded-[8px]" />
                      <div className="h-[34px] w-10 bg-gray-200 rounded-[8px]" />
                    </div>
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 font-bold text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : hargas.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-400 font-medium">
                  Belum ada aturan harga terdefinisi.
                </td>
              </tr>
            ) : (
              hargas.map((harga, index) => (
                /* Row Hover menggunakan warna aksen lembut Cyan Tint (#5AE3ED1C) */
                <tr key={harga.id} className="transition-colors hover:bg-[#5AE3ED1C] border-b border-b-[#1A335A]/10">
                  <td className="px-6 py-2 text-sm font-bold text-center text-gray-500">{index + 1}.</td>
                  
                  {/* ── KOLOM JENIS PEWARNA ── */}
                  <td className="px-6 py-2 text-center">
                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold text-white shadow-sm inline-block ${
                      harga.jenis_pewarna === 'alami' ? 'bg-[#5797FD]' : 'bg-[#B639FF]'
                    }`}>
                      {harga.jenis_pewarna === 'alami' ? 'Alami' : 'Sintetis'}
                    </span>
                  </td>
                  
                  {/* ── KOLOM LEBAR ── */}
                  <td className="px-6 py-2 text-center">
                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold text-white shadow-sm inline-block min-w-[65px] ${
                      parseInt(harga.lebar) === 70 ? 'bg-[#B639FF]' : 'bg-[#5797FD]'
                    }`}>
                      {harga.lebar} cm
                    </span>
                  </td>
                  
                  <td className="px-6 py-2 font-bold text-xs text-center text-[#000000]">
                    {harga.motif?.nama ? (
                      <span>{harga.motif.nama}</span>
                    ) : (
                      <span className="italic font-normal text-xs text-gray-400">Umum (semua motif)</span>
                    )}
                  </td>
                  <td className="px-6 py-2 font-bold text-xs text-center text-[#1A335A]">
                    Rp {harga.harga_per_meter?.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-2 text-center">
                    <div className="flex items-center justify-center gap-2 p-0.5">
                      {/* Tombol Edit - Tema Navy Utama */}
                      <button
                        onClick={() => onEdit(harga)}
                        className="flex flex-col items-center justify-center gap-0.5 aspect-square w-10 bg-[#1A335A] hover:bg-[#122440] text-white rounded-[8px] transition-all duration-200 shadow-sm active:scale-95"
                        title="Edit"
                      >
                        <Edit3 className="w-[12px] h-[12px]" strokeWidth={2.5} />
                        <span className="text-[9px] font-bold leading-none">Edit</span>
                      </button>

                      {/* Tombol Hapus - Red Coral Harmonis */}
                      <button
                        onClick={() => onDelete(harga)}
                        className="flex flex-col items-center justify-center gap-0.5 aspect-square w-10 bg-[#FF695E] hover:bg-[#E55A50] text-white rounded-[8px] transition-all duration-200 shadow-sm active:scale-95"
                        title="Hapus"
                      >
                        <Trash2 className="w-[12px] h-[12px]" strokeWidth={2.5} />
                        <span className="text-[9px] font-bold leading-none">Hapus</span>
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
  )
}