'use client';

import React from 'react';
import AddPreOrderCustomContainer from '@/app/components/cs/po/poc/AddPreOrderCustom';

export default function PreOrderCustomPage() {
  return (
    <div className="w-full h-full">
      {/* Judul Utama Halaman */}
      <h1 className="text-lg sm:text-[24px] font-medium text-black mb-6 border-b pb-2 border-[#D4C5B9]">Pre Order Custom</h1>
      
      {/* Container Utama */}
      <AddPreOrderCustomContainer />
    </div>
  );
}