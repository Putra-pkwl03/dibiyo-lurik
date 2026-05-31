
'use client';

import { Suspense } from 'react';
import ManagePOContent from '../../../../components/kp-produk/po/ManagePOContent';

export default function ManagePOPage() {
  return (
    <div className="space-y-3">
      {/* Header Utama Navigasi & Deskripsi Alur Informasi */}
      <header className="border-b border-gray-150 pb-1">
        <h2 className="text-2xl font-bold text-[#A47352]">Pre-Order Produk</h2>
        <p className="text-xs text-gray-500 mt-1.5 max-w-2xl leading-relaxed">
          Pusat Informasi Pre-Order — Kelola data pesanan reguler dan custom pelanggan Anda di sini.
        </p>
      </header>

      {/* Komponen Utama dengan Suspense Wrapper */}
      <Suspense fallback={<div className="p-10 text-[#A47352] font-medium">Memuat halaman...</div>}>
        <ManagePOContent />
      </Suspense>
    </div>
  );
}