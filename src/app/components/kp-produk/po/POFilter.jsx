import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

export default function POFilter({ 
  search, 
  setSearch, 
  tipe, 
  status, 
  setStatus, 
  statusPembayaran, 
  setStatusPembayaran 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = status !== '' || statusPembayaran !== '';

  // Fungsi toggle filter (menyamakan konsep ProdukFilter: jika diklik opsi yang sama, maka reset/clear)
  const handleFilterChange = (setter, currentVal, targetVal) => {
    setter(currentVal === targetVal ? '' : targetVal);
  };

  const handleReset = () => {
    setStatus('');
    setStatusPembayaran('');
  };

  // Komponen Tombol Kustom Opsi Filter (Sesuai Desain ProdukFilter)
  const FilterButton = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-3 py-2.5 rounded-[12px] text-xs font-bold tracking-wide transition-all duration-150 active:scale-[0.97] ${
        active
          ? 'bg-[#A47352] text-white shadow-md shadow-[#A47352]/20'
          : 'bg-[#A47352]/10 text-[#A47352] hover:bg-[#A47352]/15'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="p-6 relative">
      <div className="flex flex-wrap items-center justify-between w-full gap-4">
        <h2 className="text-lg font-semibold text-[#A47352] whitespace-nowrap">
          List Pre-Order {tipe === 'reguler' ? 'Reguler' : 'Custom'}
        </h2>
        
        {/* Parent container filter menggunakan 'relative' sebagai jangkar posisi dropdown */}
        <div className="flex flex-1 gap-4 min-w-[300px] justify-end relative">
          
          {/* Input Pencarian */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute text-gray-400 left-3 top-3" size={18} />
            <input 
              type="text"
              placeholder="Nama Pelanggan..."
              className="w-full pl-10 pr-4 py-2 border bg-[#E3C2AC59] border-[#E0D3C9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47352] text-[#A47352]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Tombol Pemicu Panel Filter */}
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all ${
              isOpen || hasActiveFilters 
                ? 'bg-[#A47352] text-white border-[#A47352]' 
                : 'border-[#E0D3C9] text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal size={18} />
            Filter
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block ml-1"></span>
            )}
          </button>

          {/* 1. Backdrop Overlay: Menutup filter saat klik di luar area */}
          {isOpen && (
            <div 
              className="fixed inset-0 z-40 bg-stone-900/10 backdrop-blur-xs md:bg-transparent" 
              onClick={() => setIsOpen(false)} 
            />
          )}

          {/* 2. Responsive Floating Panel Container */}
          {isOpen && (
            <div className="fixed inset-x-4 bottom-6 top-auto md:absolute md:inset-auto md:right-0 md:top-full md:mt-3 z-50 p-6 space-y-5 bg-white border border-[#A47352]/15 shadow-2xl w-auto md:w-[350px] rounded-[24px] animate-in fade-in slide-in-from-bottom-5 md:slide-in-from-top-2 duration-200 text-left">
              
              {/* Header Dropdown */}
              <div className="flex items-center justify-between pb-1">
                <h4 className="text-[16px] font-bold text-[#A47352]">Pilih Filter</h4>
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)} 
                  className="text-[#A47352]/50 hover:text-[#A47352] p-1.5 rounded-full hover:bg-stone-50 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              {/* Kategori Filter: Status Produksi */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold text-[#A47352]/60 block uppercase tracking-wider">
                  Status Produksi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'belum_diproses', label: 'Belum Diproses' },
                    { key: 'dalam_proses', label: 'Dalam Proses' },
                    { key: 'sedang_diproses', label: 'Sedang Diproses' },
                    { key: 'selesai_diproses', label: 'Selesai Diproses' },
                  ].map((opt) => (
                    <FilterButton
                      key={opt.key}
                      active={status === opt.key}
                      onClick={() => handleFilterChange(setStatus, status, opt.key)}
                    >
                      {opt.label}
                    </FilterButton>
                  ))}
                </div>
              </div>

              {/* Kategori Filter: Status Pembayaran */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold text-[#A47352]/60 block uppercase tracking-wider">
                  Status Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'belum_bayar', label: 'Belum Bayar' },
                    { key: 'dp', label: 'DP' },
                    { key: 'lunas', label: 'Lunas' },
                  ].map((opt) => (
                    <FilterButton
                      key={opt.key}
                      active={statusPembayaran === opt.key}
                      onClick={() => handleFilterChange(setStatusPembayaran, statusPembayaran, opt.key)}
                    >
                      {opt.label}
                    </FilterButton>
                  ))}
                </div>
              </div>

              {/* Tombol Reset Utama */}
              <div className="pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3 text-center text-sm font-bold bg-[#A47352]/10 text-[#A47352] rounded-[12px] hover:bg-[#A47352]/15 transition-colors active:scale-[0.98] duration-150"
                >
                  Reset Filter
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}