'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Search, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import dynamic from "next/dynamic";
const OrderTable = dynamic(() => import('../../../../../components/cs/rp/order/OrderTable'), { ssr: false });

// Komponen Skeleton Loader untuk baris tabel
function TableSkeleton({ limit = 10 }) {
  return (
    <div className="w-full overflow-x-auto border rounded-sm border-stone-100 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-[#1A335A]/90 h-11 w-full flex items-center px-4 justify-between gap-4">
        <div className="w-10 h-4 rounded bg-stone-300/30"></div>
        <div className="flex-1 hidden w-24 h-4 rounded bg-stone-300/30 sm:block"></div>
        <div className="flex-1 h-4 rounded bg-stone-300/30 w-28"></div>
        <div className="flex-1 h-4 rounded bg-stone-300/30 w-36"></div>
        <div className="flex-1 hidden w-32 h-4 rounded bg-stone-300/30 md:block"></div>
        <div className="flex-1 w-20 h-4 rounded bg-stone-300/30"></div>
        <div className="w-16 h-4 rounded bg-stone-300/30"></div>
      </div>
      
      {/* Rows Skeleton */}
      <div className="bg-white divide-y divide-stone-100">
        {[...Array(limit)].map((_, index) => (
          <div key={index} className="flex items-center justify-between h-16 gap-4 px-4 py-4">
            <div className="w-6 h-4 rounded bg-stone-200"></div>
            <div className="flex-1 hidden w-24 h-4 rounded bg-stone-200 sm:block"></div>
            <div className="flex-1 h-4 rounded bg-stone-200 w-28"></div>
            <div className="flex-1 h-4 rounded bg-stone-200 w-36"></div>
            <div className="flex-1 hidden w-32 h-4 rounded bg-stone-200 md:block"></div>
            <div className="flex-1 w-20 h-4 rounded bg-stone-200"></div>
            <div className="w-16 rounded-lg h-7 bg-stone-200 shrink-0"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RiwayatOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  // State Baru untuk Pagination Server-side
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const dateInputRef = useRef(null);

  // Memicu fetching ulang data ketika state halaman berubah
  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Mengirimkan parameter page dan limit ke API route orders
      const res = await fetch(`/api/orders?page=${currentPage}&limit=${itemsPerPage}`); 
      const result = await res.json();
      if (res.ok) {
        setOrders(result.data || []);
        // Menyimpan nilai total baris dari metadata backend
        setTotalItems(result.meta?.total || result.data?.length || 0);
      }
    } catch (err) {
      console.error('Gagal memuat riwayat:', err);
      setOrders([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDatePickerTrigger = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.click();
      }
    }
  };

  // Logika Filter Gabungan Client-side (untuk pencarian di scope page yang aktif)
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items?.some(item => 
        item.gulungan?.produk?.motif?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.gulungan?.produk?.kategori?.nama?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    let matchesDate = true;
    if (selectedDate) {
      const dateObj = new Date(o.tanggal_order);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      const orderDateFormatted = `${year}-${month}-${day}`;
      
      matchesDate = orderDateFormatted === selectedDate;
    }

    return matchesSearch && matchesDate;
  });

  // Menghitung total halaman berdasarkan total item database
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full mx-auto space-y-4 text-black font-inter">
      <div className="relative overflow-x-visible">
        <h2 className="text-lg sm:text-[24px] font-medium text-black pb-2 sm:pb-5 border-b border-gray-500 tracking-wide -mx-4 px-4 sm:-mx-6 sm:px-6">
          Order
        </h2>
      </div>

      <div className="p-6 bg-white border rounded-lg shadow-sm border-stone-200">

        <div className="flex flex-col justify-between gap-4 px-6 pb-6 mb-6 -mx-6 border-b border-stone-200 sm:flex-row sm:items-center">
          
          <span className="text-base font-semibold text-black whitespace-nowrap">
            List Order
          </span>
          
          <div className="flex items-center justify-end flex-1 w-full max-w-xl gap-3 ml-auto sm:w-auto">

            <div className="flex items-center flex-1 gap-3 px-4 py-2 transition-colors border rounded-lg border-[#1A335A] bg-[#5AE3ED1C] focus-within:border-stone-400">
              <Search className="text-stone-700 shrink-0" size={18} />
              <input
                type="text"
                placeholder="Motif/Kategori"
                className="w-full text-sm bg-transparent focus:outline-none placeholder-stone-400 text-stone-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative flex shrink-0">
              <button 
                type="button"
                onClick={handleDatePickerTrigger}
                className="flex items-center justify-center gap-2 px-8 py-2 text-sm font-medium transition-colors bg-[#5AE3ED1C] border rounded-lg border-[#1A335A] text-stone-800 hover:bg-stone-50 min-w-[180px] sm:w-auto shadow-sm"
              >
                <Calendar size={18} className="text-stone-800" /> 
                <span>
                  {selectedDate 
                    ? new Date(selectedDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
                    : 'Pilih Tanggal'
                  }
                </span>
              </button>

              <input 
                ref={dateInputRef}
                type="date" 
                className="absolute invisible w-0 h-0 opacity-0 pointer-events-none"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate('')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600 transition-colors shadow-sm z-10"
                  title="Clear tanggal"
                >
                  <X size={14} />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Tampilan Kondisional */}
        {loading ? (
          <TableSkeleton limit={itemsPerPage} />
        ) : (
          <>
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-sm border-stone-200 bg-stone-50/50">
                <p className="text-xs font-medium text-stone-400">Tidak ada riwayat transaksi ditemukan.</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <OrderTable orders={filteredOrders} />
              </div>
            )}

            {/* ================= CONTROLLER PAGINATION RIWAYAT ORDER ================= */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-between gap-4 pt-4 mt-4 border-t border-stone-100 sm:flex-row">
                <div className="text-xs font-medium text-stone-500">
                  Menampilkan <span className="text-[#1A335A] font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span>–{Math.min(currentPage * itemsPerPage, totalItems)} dari <span className="text-[#1A335A] font-bold">{totalItems}</span> Total Transaksi
                </div>
                
                <div className="flex items-center gap-1">
                  {/* Tombol Sebelumnya */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-8 h-8 transition-all bg-white border rounded shadow-sm cursor-pointer border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white"
                  >
                    <ChevronLeft size={14} strokeWidth={2.5} />
                  </button>

                  {/* Daftar Angka Halaman */}
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#1A335A] text-white shadow-md shadow-[#1A335A]/10'
                            : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 shadow-sm'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Tombol Selanjutnya */}
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
          </>
        )}
      </div>
    </div>
  );
}