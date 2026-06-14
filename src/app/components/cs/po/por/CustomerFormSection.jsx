import React from 'react'
import DatePicker from 'react-datepicker'
import { User, Calendar } from 'lucide-react'

export default function CustomerFormSection({ customer, setCustomer, status, setStatus }) {
  return (
    <div className="p-5 space-y-4 bg-white border border-stone-100 rounded-xl">
      <div className="flex items-center gap-2 mb-1 text-xs font-bold tracking-wider uppercase text-stone-800">
        <User size={15} className="text-stone-700" />
        <span>Data Customer</span>
      </div>

      <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
        {/* Nama Customer */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-stone-600">Nama Customer</label>
          <input
            type="text"
            required
            placeholder="Masukkan Nama"
            value={customer?.nama || ''}
            onChange={(e) => setCustomer({ ...customer, nama: e.target.value })}
            className="w-full h-9 px-3 bg-[#EBF9FB] rounded-lg text-black outline-none border-none text-xs font-medium"
          />
        </div>

        {/* No Telpon */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-stone-600">No Telpon</label>
          <input
            type="text"
            required
            placeholder="Masukkan No Telpon"
            value={customer?.telpon || ''}
            onChange={(e) => setCustomer({ ...customer, telpon: (e.target.value || '').replace(/[^0-9]/g, '') })}
            className="w-full h-9 px-3 bg-[#EBF9FB] rounded-lg text-black outline-none border-none text-xs font-medium"
          />
        </div>

        {/* Tanggal Pre-Order */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-stone-600">Tanggal Pre-Order Reguler</label>
          <div className="relative w-full">
            <DatePicker
              selected={customer?.tgl ? new Date(customer.tgl) : null}
              onChange={(date) => {
                if (date) {
                  const yyyy = date.getFullYear()
                  const mm = String(date.getMonth() + 1).padStart(2, '0')
                  const dd = String(date.getDate()).padStart(2, '0')
                  setCustomer({ ...customer, tgl: `${yyyy}-${mm}-${dd}` })
                } else {
                  setCustomer({ ...customer, tgl: '' })
                }
              }}
              dateFormat="yyyy-MM-dd"
              placeholderText=""
              className="w-full h-9 px-3 bg-[#EBF9FB] rounded-lg text-black outline-none border-none text-xs font-medium cursor-pointer"
            />
          </div>
        </div>

        {/* Alamat Lengkap */}
        <div className="col-span-1 md:col-span-3 space-y-1.5">
          <label className="text-[11px] font-medium text-stone-600">Alamat</label>
          <textarea
            placeholder=""
            value={customer?.alamat || ''}
            onChange={(e) => setCustomer({ ...customer, alamat: e.target.value })}
            className="w-full h-9 px-3 py-2.5 bg-[#EBF9FB] rounded-lg text-black outline-none border-none text-xs font-medium resize-none overflow-hidden"
          />
        </div>
      </div>
    </div>
  )
}