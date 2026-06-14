'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  
  // State Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total_items: 0,
    total_pages: 1
  });
  
  // State Lokal Kontrol Dropdown Menu Filter
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const hasActiveFilters = status !== '' || statusPembayaran !== '';

  const fetchPOData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    
    const apiPath = tipe === 'reguler' ? '/api/pre-order-reguler' : '/api/pre-order-custom';
    
    let queryParams = [`page=${page}`, `limit=10`];
    if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
    if (status) queryParams.push(`status=${status}`);
    if (statusPembayaran) queryParams.push(`status_pembayaran=${statusPembayaran}`);

    const url = `${apiPath}?${queryParams.join('&')}`;

    try {
      const res = await fetch(url);
      const resJson = await res.json();
      
      setData(resJson.data || []);
      
      // FIX SINKRONISASI DISINI: Membaca properti 'meta' dari backend
      if (resJson.meta) {
        const totalItems = resJson.meta.total || 0;
        const limitItems = resJson.meta.limit || 10;
        
        setPagination({
          page: resJson.meta.page || 1,
          limit: limitItems,
          total_items: totalItems,
          // Hitung total halaman berdasarkan jumlah data asli dibagi limit
          total_pages: Math.ceil(totalItems / limitItems) || 1
        });
      }
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  // Reset ke halaman 1 jika tipe, pencarian, atau filter kategori berubah
  useEffect(() => {
    setPage(1);
  }, [tipe, search, status, statusPembayaran]);

  // Handle Fetch Data dengan Debounce khusus input pencarian teks
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPOData(page === 1);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [tipe, search, status, statusPembayaran, page]);

  const handleDeleteSuccess = (deletedId) => {
    setData((prevData) => prevData.filter(item => item.id !== deletedId));
    fetchPOData(false);
  };

  const handleResetFilters = () => {
    setStatus('');
    setStatusPembayaran('');
    setIsFilterOpen(false);
  };

  // Helper navigasi halaman pagination
  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (page < pagination.total_pages) setPage((prev) => prev + 1);
  };

  return (
    <>
      <div className="overflow-visible bg-white border rounded-lg shadow-sm border-stone-200 font-inter">
        
        {/* ================= BARIS FILTER & SEARCH CODE DI SINI ================= */}
        <div className="relative z-30 p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <h2 className="text-sm font-bold text-black min-w-max">
              List Pre-Order {tipe === 'reguler' ? 'Reguler' : 'Custom'}
            </h2>
            
            <div className="flex flex-col items-center justify-end flex-1 w-full gap-3 sm:flex-row md:w-auto">
              {/* Input Pencarian */}
              <div className="relative w-full sm:max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                  <Search size={14} />
                </span>
                <input 
                  type="text"
                  placeholder="Cari nama pelanggan..."
                  className="w-full h-[38px] bg-[#5AE3ED1C] pl-9 pr-4 border border-[#1A335A]/20 rounded-md text-xs text-stone-800 font-medium outline-none placeholder-gray-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Tombol Filter Utama */}
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center justify-center gap-2 h-[38px] px-4 border rounded-md text-xs font-bold transition-all w-full sm:w-auto ${
                  isFilterOpen || hasActiveFilters 
                    ? 'bg-[#1A335A] text-white border-[#1A335A]' 
                    : 'border-[#1A335A]/20 text-black bg-[#5AE3ED1C] hover:bg-[#5AE3ED33]'
                }`}
              >
                <SlidersHorizontal size={12} />
                Filter
                {hasActiveFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block ml-1"></span>
                )}
              </button>
            </div>
          </div>

          {/* DROP-DOWN PANEL GRID MELAYANG */}
          {isFilterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
              <div className="absolute right-6 top-[70px] w-80 bg-white border border-stone-200 shadow-xl rounded-xl p-5 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                <h3 className="mb-4 text-xs font-bold tracking-wider text-black uppercase">Pilih Kriteria Filter</h3>
                
                <div className="space-y-4">
                  {/* Grid 1: Status Produksi */}
                  <div>
                    <p className="mb-2 text-[11px] font-bold text-stone-500 uppercase">Status Produksi</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button 
                        onClick={() => setStatus('')}
                        className={`p-2 rounded-lg text-left text-xs font-medium transition-colors ${
                          status === '' ? 'bg-[#1A335A] text-white font-bold' : 'bg-[#5AE3ED1C] text-stone-700 hover:bg-[#5AE3ED33]' 
                        }`}
                      >
                        Semua
                      </button>
                      {['dalam_proses', 'sedang_diproses', 'selesai_diproses'].map((opt) => (
                        <button 
                          key={opt}
                          onClick={() => setStatus(opt)}
                          className={`p-2 rounded-lg text-left text-xs font-medium transition-colors ${
                            status === opt ? 'bg-[#1A335A] text-white font-bold' : 'bg-[#5AE3ED1C] text-stone-700 hover:bg-[#5AE3ED33]' 
                          }`}
                        >
                          {opt.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid 2: Status Pembayaran */}
                  <div>
                    <p className="mb-2 text-[11px] font-bold text-stone-500 uppercase">Status Pembayaran</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button 
                        onClick={() => setStatusPembayaran('')}
                        className={`p-2 rounded-lg text-left text-xs font-medium transition-colors ${
                          statusPembayaran === '' ? 'bg-[#1A335A] text-white font-bold' : 'bg-[#5AE3ED1C] text-stone-700 hover:bg-[#5AE3ED33]' 
                        }`}
                      >
                        Semua
                      </button>
                      {['dp', 'lunas'].map((opt) => (
                        <button 
                          key={opt}
                          onClick={() => setStatusPembayaran(opt)}
                          className={`p-2 rounded-lg text-left text-xs font-medium transition-colors ${
                            statusPembayaran === opt ? 'bg-[#1A335A] text-white font-bold' : 'bg-[#5AE3ED1C] text-stone-700 hover:bg-[#5AE3ED33]' 
                          }`}
                        >
                          {opt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reset Action */}
                {hasActiveFilters && (
                  <button 
                    onClick={handleResetFilters}
                    className="w-full mt-5 bg-[#A63636] text-white py-2 rounded-lg font-bold text-xs hover:bg-[#852b2b] shadow-sm transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <X size={12} strokeWidth={2.5} />
                    Reset Semua Filter
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Tabel Data */}
        <POTable 
          data={data} 
          loading={loading} 
          setSelectedItem={setSelectedItem} 
          onDeleteSuccess={handleDeleteSuccess}
          tipe={tipe}
        />

        {/* ================= CONTROLLER UI PAGINATION BAR CUSTOM STYLE ================= */}
        {!loading && pagination.total_pages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 p-6 border-t border-stone-100 sm:flex-row bg-stone-50/30">
            <div className="text-xs font-medium text-stone-500">
              Menampilkan{' '}
              <span className="text-[#1A335A] font-bold">
                {Math.min((page - 1) * pagination.limit + 1, pagination.total_items)}
              </span>
              –
              {Math.min(page * pagination.limit, pagination.total_items)}{' '}
              dari{' '}
              <span className="text-[#1A335A] font-bold">{pagination.total_items}</span> Total Antrean
            </div>
            
            <div className="flex items-center gap-1">
              {/* Tombol Halaman Sebelumnya */}
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={page === 1}
                className="flex items-center justify-center w-8 h-8 transition-all bg-white border rounded shadow-sm cursor-pointer border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronLeft size={14} strokeWidth={2.5} />
              </button>

              {/* Looping Nomor Halaman */}
              {[...Array(pagination.total_pages)].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded transition-all cursor-pointer ${
                      page === pageNum
                        ? 'bg-[#1A335A] text-white shadow-md shadow-[#1A335A]/10'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 shadow-sm'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Tombol Halaman Selanjutnya */}
              <button
                type="button"
                onClick={handleNextPage}
                disabled={page === pagination.total_pages}
                className="flex items-center justify-center w-8 h-8 transition-all bg-white border rounded shadow-sm cursor-pointer border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <POModalDetail
          item={selectedItem}
          tipe={tipe}
          onClose={() => setSelectedItem(null)}
          onRefresh={() => fetchPOData(false)}
        />
      )}
    </>
  );
}