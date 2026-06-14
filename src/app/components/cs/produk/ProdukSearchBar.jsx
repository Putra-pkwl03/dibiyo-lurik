import { Search, SlidersHorizontal } from 'lucide-react'

export default function ProdukSearchBar({ searchQuery, setSearchQuery, onOpenFilter }) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-3 text-stone-400" size={18} />
        <input
          className="w-full pl-11 pr-4 py-2.5 bg-[#5AE3ED1C] border border-[#1A335A] rounded-lg text-gray-500 hover:bg-blue-50 text-sm focus:border-[#adf4f91c] focus:ring-1 focus:ring-[#adf4f91c]"
          placeholder="Cari motif atau kode..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  )
}