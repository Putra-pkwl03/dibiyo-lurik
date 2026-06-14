import React from "react";
import { User } from "lucide-react";


export default function CustomerSection({ customer, setCustomer, item }) {
  return (
    <div className="space-y-4">
      {/* JUDUL SEKSI */}
      <div className="flex items-center gap-2 pb-2 text-xs font-bold tracking-wider uppercase border-b text-stone-800 border-stone-100">
        <User size={15} className="text-[#1A335A]" />
        <span>Data Customer</span>
      </div>

      {/* GRID INPUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
        <div>
          <label className="block mb-1 font-bold tracking-wide uppercase text-stone-500 text-[10px]">Nama Customer</label>
          <input
            type="text"
            value={customer.nama_customer}
            onChange={(e) => setCustomer({ ...customer, nama_customer: e.target.value })}

            className="w-full h-9 bg-[#EBF9FB] rounded-xl px-3 focus:outline-none border-none font-medium text-stone-800"
          />
        </div>

        <div>
          <label className="block mb-1 font-bold tracking-wide uppercase text-stone-500 text-[10px]">No Telepon</label>
          <input
            type="text"
            value={customer.kontak_customer}
            onChange={(e) => setCustomer({ ...customer, kontak_customer: e.target.value })}
            className="w-full h-9 bg-[#EBF9FB] rounded-xl px-3 focus:outline-none border-none font-medium text-stone-800"
          />
        </div>

        <div>
          <label className="block mb-1 font-bold tracking-wide uppercase text-stone-500 text-[10px]">Tanggal Pre-Order</label>
          <input
            type="text"
            value={item?.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : ""}
            disabled
            className="w-full px-3 font-medium border cursor-not-allowed h-9 rounded-xl bg-stone-50 text-stone-400 border-stone-100 focus:outline-none"
          />
        </div>
      </div>

      {/* ALAMAT */}
      <div className="text-[11px]">
        <label className="block mb-1 font-bold tracking-wide uppercase text-stone-500 text-[10px]">Alamat</label>
        <textarea
          rows={2}
          value={customer.alamat_customer}
          onChange={(e) => setCustomer({ ...customer, alamat_customer: e.target.value })}

          className="w-full bg-[#EBF9FB] rounded-xl p-3 focus:outline-none border-none resize-none overflow-hidden font-medium text-stone-800"
        />
      </div>
    </div>
  );
}