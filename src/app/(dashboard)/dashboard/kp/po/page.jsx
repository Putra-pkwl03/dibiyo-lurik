'use client';

import { Suspense } from 'react';
import ManagePOContent from '../../../../components/kp-produk/po/ManagePOContent';

export default function ManagePOPage() {
  return (
    <div className="w-full mx-auto space-y-4 text-black font-inter">
      {/* Header Utama Navigasi & Deskripsi Alur Informasi */}
      <div className="relative overflow-x-visible">
        <h2 className="text-lg sm:text-[24px] font-medium text-black pb-2 sm:pb-0.5 border-b border-gray-500 tracking-wide -mx-4 px-4 sm:-mx-6 sm:px-6">
          Pre Order Produk
        <p className="max-w-2xl text-xs leading-relaxed text-gray-500">
          Pusat Informasi Pre-Order — Kelola data pesanan reguler dan custom pelanggan Anda di sini.
        </p>
        </h2>
      </div>

      {/* Komponen Utama dengan Suspense Wrapper */}
      <Suspense fallback={<div className="p-10 text-[#1A335A] font-semibold animate-pulse text-center text-sm">Memuat halaman...</div>}>
        <ManagePOContent />
      </Suspense>
    </div>
  );
}