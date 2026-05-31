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

  const handleReset = () => {
    setStatus('');
    setStatusPembayaran('');
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between w-full gap-4">
        <h2 className="text-lg font-semibold text-[#A47352] whitespace-nowrap">
          List Pre-Order {tipe === 'reguler' ? 'Reguler' : 'Custom'}
        </h2>
        
        <div className="flex flex-1 gap-4 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute text-gray-400 left-3 top-3" size={18} />
            <input 
              type="text"
              placeholder="Nama Pelanggan..."
              className="w-full pl-10 pr-4 py-2 border bg-[#E3C2AC59] border-[#E0D3C9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47352] text-[#A47352]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
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
        </div>
      </div>

      {/* Dropdown Panel Filter */}
      {isOpen && (
        <div className="p-4 border border-[#E0D3C9] bg-[#f9f5f2] rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-200">
          <div>
            <label className="block text-xs font-semibold text-[#A47352] uppercase mb-1">Status Produksi</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 bg-white border border-[#E0D3C9] rounded-lg focus:ring-2 focus:ring-[#A47352] focus:outline-none text-sm text-gray-700"
            >
              <option value="">Semua Status</option>
              <option value="belum_diproses">Belum Diproses</option>
              <option value="dalam_proses">Dalam Proses</option>
              <option value="sedang_diproses">Sedang Diproses</option>
              <option value="selesai_diproses">Selesai Diproses</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A47352] uppercase mb-1">Status Pembayaran</label>
            <div className="flex gap-2">
              <select
                value={statusPembayaran}
                onChange={(e) => setStatusPembayaran(e.target.value)}
                className="w-full p-2 bg-white border border-[#E0D3C9] rounded-lg focus:ring-2 focus:ring-[#A47352] focus:outline-none text-sm text-gray-700"
              >
                <option value="">Semua Pembayaran</option>
                <option value="belum_bayar">Belum Bayar</option>
                <option value="dp">DP</option>
                <option value="lunas">Lunas</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center p-2 text-red-500 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  title="Reset Filter"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}