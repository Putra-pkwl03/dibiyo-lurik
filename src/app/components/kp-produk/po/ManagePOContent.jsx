'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import POFilter from './POFilter';
import POTable from './POTable';
import POModalDetail from './POModalDetail';

export default function ManagePOContent() {
  const searchParams = useSearchParams();
  const tipe = searchParams.get('tipe') || 'reguler';

  // State Data & UI
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // State Filter untuk Sinkronisasi ke API Backend
  const [status, setStatus] = useState('');
  const [statusPembayaran, setStatusPembayaran] = useState('');

  const fetchPOData = () => {
    setLoading(true);
    
    // Tentukan path endpoint berdasarkan tipe dokumen
    const apiPath = tipe === 'reguler' ? '/api/pre-order-reguler' : '/api/pre-order-custom';
    
    // Susun query params sesuai kebutuhan route backend
    let queryParams = [`page=1`, `limit=50`];
    if (status) queryParams.push(`status=${status}`);
    if (statusPembayaran) queryParams.push(`status_pembayaran=${statusPembayaran}`);

    const url = `${apiPath}?${queryParams.join('&')}`;

    fetch(url)
      .then(res => res.json())
      .then(res => {
        setData(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  // Trigger fetch ulang setiap kali tipe halaman, filter status, atau filter bayar berubah
  useEffect(() => {
    fetchPOData();
  }, [tipe, status, statusPembayaran]);

  // Pencarian lokal berbasis nama customer
  const filteredData = Array.isArray(data) 
    ? data.filter(item => item?.nama_customer?.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <>
      {/* Catatan: 'overflow-hidden' DIHAPUS dari div boks putih ini 
        agar dropdown filter melayang bebas ke luar batas border boks tanpa terpotong.
      */}
      <div className="border border-[#D4C5B9] font-inter shadow-sm bg-white rounded-lg">
        
        {/* Sub-Komponen Filter */}
        <POFilter 
          search={search} 
          setSearch={setSearch} 
          tipe={tipe} 
          status={status}
          setStatus={setStatus}
          statusPembayaran={statusPembayaran}
          setStatusPembayaran={setStatusPembayaran}
        />

        {/* Sub-Komponen Tabel */}
        <POTable data={filteredData} loading={loading} setSelectedItem={setSelectedItem} />
      </div>

      {/* Modal Detail */}
      {selectedItem && (
        <POModalDetail
          item={selectedItem}
          tipe={tipe}
          onClose={() => setSelectedItem(null)}
          onRefresh={fetchPOData}
        />
      )}
    </>
  );
}