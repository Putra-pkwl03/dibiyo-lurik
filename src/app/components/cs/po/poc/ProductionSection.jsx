import React from "react";
import { Calendar, Box } from "lucide-react";
import DatePicker from "react-datepicker";

export default function ProductionSection({ produksi, setProduksi, labelStyle }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px]">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-black border-b pb-1">
          <Calendar size={14} className="text-[#1A335A]" />
          <span>Estimasi Produk Jadi</span>
        </div>
        <div>
          <label className={labelStyle}>Tanggal Estimasi Selesai</label>
          <div className="relative flex items-center">
            <Calendar size={14} className="absolute left-3 text-[#A47352] pointer-events-none z-10" />
            <DatePicker
              selected={produksi.tanggal_selesai ? new Date(produksi.tanggal_selesai) : null}
              onChange={(date) => {
                if (date) {
                  const yyyy = date.getFullYear();
                  const mm = String(date.getMonth() + 1).padStart(2, "0");
                  const dd = String(date.getDate()).padStart(2, "0");
                  setProduksi({ ...produksi, tanggal_selesai: `${yyyy}-${mm}-${dd}` });
                } else {
                  setProduksi({ ...produksi, tanggal_selesai: "" });
                }
              }}
              dateFormat="dd/MM/yyyy"
              placeholderText="Pilih Tanggal Selesai"
              className="w-full border border-[#A47352] bg-[#FFE176] rounded-lg py-2 pl-9 pr-3 focus:outline-none font-bold text-black text-xs cursor-pointer text-left"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-black border-b pb-1">
          <Box size={14} className="text-[#1A335A]" />
          <span>Status Produksi</span>
        </div>
        <div>
          <label className={labelStyle}>Status Produksi Aktif</label>
          <div className="w-full bg-gray-100 border border-gray-300 text-gray-700 font-bold rounded-lg p-2.5 text-xs capitalize">
            {produksi.status ? produksi.status.replace(/_/g, " ") : "Belum diproses"}
          </div>
        </div>
      </div>
    </div>
  );
}