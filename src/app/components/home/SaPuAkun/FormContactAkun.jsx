"use client"

export default function FormContactAkun({
  email,
  username,
  setUsername,
  nomorTelp,
  setNomorTelp,
  isEditingPhone,
  togglePhoneEdit
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
            Email Pengguna (Permanen)
          </label>
          <input 
            type="email"
            className="w-full p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/60 cursor-not-allowed text-xs text-neutral-400 font-mono focus:outline-none"
            value={email}
            disabled
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            Nama Lengkap / Username
          </label>
          <input 
            type="text"
            className="w-full p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/30 focus:bg-white focus:ring-1 focus:ring-[#d9a05b] focus:border-[#d9a05b] transition-all text-xs text-black focus:outline-none font-medium"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan nama lengkap..."
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider">
            Nomor WhatsApp / Telepon
          </label>
          <button
            type="button"
            onClick={togglePhoneEdit}
            className="text-xs text-[#d9a05b] font-bold hover:underline focus:outline-none"
          >
            {isEditingPhone ? "Batal Edit" : "Ubah Kontak"}
          </button>
        </div>
        <input 
          type="text"
          className={`w-full p-3.5 rounded-xl border text-xs transition-all focus:outline-none ${
            isEditingPhone 
              ? "border-[#d9a05b] bg-white focus:ring-1 focus:ring-[#d9a05b] text-black font-medium" 
              : "border-neutral-200 bg-neutral-50/60 cursor-not-allowed text-neutral-400 font-mono"
          }`}
          value={nomorTelp}
          onChange={(e) => setNomorTelp(e.target.value)}
          disabled={!isEditingPhone}
          placeholder="Contoh: 081234567890"
        />
      </div>
    </div>
  )
}