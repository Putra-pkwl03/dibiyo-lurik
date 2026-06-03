import React from "react";
import { User } from "lucide-react";

export default function CustomerSection({ customer, setCustomer, createdAt, labelStyle, inputStyle }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-black border-b pb-1">
        <User size={14} className="text-[#1A335A]" />
        <span>Data Customer</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
        <div>
          <label className={labelStyle}>Nama Customer</label>
          <input
            type="text"
            value={customer.nama_customer}
            onChange={(e) => setCustomer({ ...customer, nama_customer: e.target.value })}
            className={inputStyle}
          />
        </div>
        <div>
          <label className={labelStyle}>No Telepon</label>
          <input
            type="text"
            value={customer.kontak_customer}
            onChange={(e) => setCustomer({ ...customer, kontak_customer: e.target.value })}
            className={inputStyle}
          />
        </div>
        <div>
          <label className={labelStyle}>Tanggal Pre-Order</label>
          <input
            type="text"
            value={createdAt ? new Date(createdAt).toLocaleDateString("id-ID") : ""}
            disabled
            className={`${inputStyle} text-gray-500 cursor-not-allowed`}
          />
        </div>
      </div>
      <div className="text-[11px]">
        <label className={labelStyle}>Alamat</label>
        <textarea
          rows={2}
          value={customer.alamat_customer}
          onChange={(e) => setCustomer({ ...customer, alamat_customer: e.target.value })}
          className={`${inputStyle} resize-none`}
        />
      </div>
    </div>
  );
}