export default function FilterPanel({ options, filters, setFilters, onClose }) {
  // Mapping untuk sinkronisasi key state dengan key options
  const keyMapping = { 'Kategori': 'kategori', 'Pewarna': 'pewarna', 'Status': 'status' };

  return (
    <div className="p-6">
      <h2 className="mb-4 text-lg font-bold text-stone-700">Pilih Filter</h2>
      
      {Object.entries(options).map(([title, items]) => (
        <div key={title} className="mb-4">
          <p className="mb-2 text-sm font-semibold text-stone-600">{title}</p>
          <div className="grid grid-cols-2 gap-2">
            {/* Opsi 'All' untuk mereset filter */}
            <button 
              onClick={() => setFilters({...filters, [keyMapping[title]]: 'All'})}
              className={`p-2 rounded-lg text-sm transition-colors ${
                filters[keyMapping[title]] === 'All' 
                  ? 'bg-[#8B5E3C] text-white' 
                  : 'bg-stone-100 text-stone-600'
              }`}
            >Semua</button>
            {items.map(opt => (
              <button 
                key={opt}
                onClick={() => setFilters({...filters, [keyMapping[title]]: opt})}
                className={`p-2 rounded-lg text-sm transition-colors ${
                  filters[keyMapping[title]] === opt 
                    ? 'bg-[#8B5E3C] text-white' 
                    : 'bg-[#F5EBE0] text-stone-700 hover:bg-[#EEDCC9]'
                }`}
              >{opt}</button>
            ))}
          </div>
        </div>
      ))}
      
      <button 
        onClick={onClose}
        className="w-full mt-4 bg-[#8B5E3C] text-white py-2.5 rounded-xl font-medium hover:bg-[#724d31]"
      >
        Terapkan
      </button>
    </div>
  )
}