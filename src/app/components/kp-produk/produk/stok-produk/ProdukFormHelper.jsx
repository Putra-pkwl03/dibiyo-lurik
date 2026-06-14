import React from 'react'
import { Trash2 } from 'lucide-react'

export const BACKDROP_STYLE = {
  backgroundColor: 'rgba(174, 131, 78, 0.53)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
}

export const ARROW_UP_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a47352' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M4.5 15.75l7.5-7.5 7.5 7.5'/%3E%3C/svg%3E")`
export const ARROW_DOWN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a47352' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`

export const JENIS_PEWARNA_OPTIONS = ['Sintetis', 'Alami']

export function FormField({ label, children }) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-[14px] font-medium text-[#1A335A]">{label}</label>
      {children}
    </div>
  )
}

// 1. Tambahkan parameter textColor di sini
export function SelectInput({ value, onChange, options, placeholder, disabled, customBg, textColor }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full h-[40px] px-3 pr-10 rounded-[10px] border border-[#1A335A] text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#1A335A] transition-all disabled:opacity-50 appearance-none bg-no-repeat duration-200 cursor-pointer"
      style={{
        // 2. Suntikkan textColor ke dalam style select utama
        color: textColor || '#1A335A',
        backgroundColor: customBg || 'rgba(227, 194, 172, 0.35)',
        backgroundImage: ARROW_UP_SVG,
        backgroundPosition: 'right 12px center',
        backgroundSize: '14px'
      }}
      onClick={(e) => {
        const isUp = e.target.style.backgroundImage.includes("M4.5")
        e.target.style.backgroundImage = isUp ? ARROW_DOWN_SVG : ARROW_UP_SVG
      }}
      onBlur={(e) => {
        e.target.style.backgroundImage = ARROW_UP_SVG
      }}
    >
      {placeholder && <option value="" className="text-[#1A335A]/50">{placeholder}</option>}
      {options.map(opt => (
        <option 
          key={opt.value} 
          value={opt.value} 
          // 3. Ubah warna teks list option di sini agar mengikuti warna Navy tua / textColor
          style={{ color: textColor || '#1A335A' }}
          className="bg-white"
        >
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[#1A335A] text-[11px] font-medium tracking-wide leading-tight mb-0.5">{label}</p>
      <p className="text-[#162a49] text-[13px] font-bold leading-tight truncate">{value}</p>
    </div>
  )
}

export function GulunganRow({ gulungan, rakName, onRemove, disabled }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-3 items-center px-4 py-3 bg-white border-b border-stone-100 hover:bg-[#1A335A]/5 transition-colors duration-150">
      <div className="grid grid-cols-2 text-xs sm:grid-cols-4 gap-x-3 gap-y-2">
        <Info label="Lebar" value={`${gulungan.lebar} cm`} />
        <Info label="Panjang" value={`${gulungan.panjang_total} m`} />
        <Info label="Harga/m" value={`Rp ${Number(gulungan.harga_per_meter).toLocaleString('id-ID')}`} />
        <Info label="Rak" value={rakName || '-'} />
      </div>
      <div className="flex items-center pl-1">
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="p-2 rounded-[8px] bg-[#ff695e] hover:bg-[#e0584d] text-white transition-colors disabled:opacity-50 shadow-xs active:scale-95 duration-150 flex items-center justify-center"
        >
          <Trash2 size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}