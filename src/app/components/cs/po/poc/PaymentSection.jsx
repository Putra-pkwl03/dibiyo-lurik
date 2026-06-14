import React from "react";
import { CreditCard, ChevronDown } from "lucide-react";

export default function PaymentSection({
  pembayaran,
  setPembayaran,

  showSimpleLunasView,
  hasNewItems,
  isOriginallyLunas,
  isOriginallyDp,
  isDpLocked,
  isDiskonLocked,
  inputTerkunci,
  isDpInvalid,
  dibayarSebelumnya,
  tagihanItemBaru,
  minDpItemBaru,
  bayarSekarang,
  sisaTagihan,
  subTotal,
  subTotalBaru,
  nilaiDiskon,
  totalHargaAkhir,
  formatRibuan,
  parseRibuan
}) {
  const isLunas = pembayaran.status_pembayaran === "lunas";

  return (
    <div className="space-y-4">
      {/* JUDUL SEKSI */}
      <div className="flex items-center gap-2 pb-2 text-xs font-bold tracking-wider uppercase border-b text-stone-800 border-stone-100">
        <CreditCard size={15} className="text-[#1A335A]" />
        <span>Detail Pembayaran</span>
      </div>

      {/* BANNER PERINGATAN ITEM BARU */}
      {hasNewItems && (isOriginallyLunas || isOriginallyDp) && (
        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 text-[11px]">
          <span className="flex items-center gap-1 font-bold text-amber-700 uppercase tracking-wide text-[10px]">⚠️ Penambahan Item Baru</span>
          <p className="mt-1 leading-relaxed text-amber-800/90">
            {isOriginallyLunas ? (
              <>Transaksi ini sebelumnya sudah <strong className="text-amber-900">LUNAS</strong> (Rp {dibayarSebelumnya.toLocaleString("id-ID")}). Item baru diperlakukan sebagai pesanan tersendiri: pilih <strong>Lunas</strong> untuk bayar penuh, atau <strong>DP</strong> minimal 30% dari harga item baru.</>
            ) : (
              <>DP yang sudah dibayar (Rp {dibayarSebelumnya.toLocaleString("id-ID")}) dibiarkan tetap terkunci. Item baru dikalkulasi tersendiri: pilih <strong>Lunas</strong> untuk langsung lunas, atau <strong>DP</strong> minimal 30% dari harga item baru.</>
            )}
          </p>
          <div className="flex items-center justify-between px-4 py-2 mt-3 bg-white border shadow-sm border-amber-200/60 rounded-xl">
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Subtotal Khusus Item Baru</span>

            <span className="text-sm font-black text-emerald-700">Rp {tagihanItemBaru.toLocaleString("id-ID")}</span>
          </div>
        </div>
      )}


      {/* KONTEN UTAMA PEMBAYARAN */}
      <div className="bg-[#EBF9FB]/60 border border-stone-100 rounded-2xl p-5 space-y-4 text-[11px]">
        {showSimpleLunasView ? (
          <div className="grid items-center grid-cols-1 gap-4 md:grid-cols-2">
            <div className="p-3 bg-white border shadow-sm border-stone-100 rounded-xl">
              <span className="block mb-0.5 font-bold tracking-wide uppercase text-stone-400 text-[9px]">Metode Pembayaran</span>
              <span className="text-xs font-bold capitalize text-stone-800">{pembayaran.metode_pembayaran}</span>
            </div>
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl shadow-sm space-y-1.5">
              <div className="flex justify-between text-stone-500 text-[10px]">
                <span>Subtotal: Rp {subTotal.toLocaleString("id-ID")}</span>
                <span className="font-bold text-emerald-700">Diskon: {pembayaran.diskon}%</span>
              </div>
              <hr className="border-emerald-100/50" />
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-emerald-600 font-bold text-[9px] uppercase tracking-wider">Status Kontrak</span>
                  <span className="text-[10px] font-black text-emerald-700 tracking-wider">LUNAS</span>
                </div>
                <div className="text-right">
                  <span className="block text-stone-400 text-[9px] uppercase tracking-wider">Total Nilai Kontrak</span>
                  <span className="text-xs font-black text-stone-800">Rp {totalHargaAkhir.toLocaleString("id-ID")}</span>

                </div>
              </div>
            </div>
          </div>
        ) : (
          <>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1.5 font-bold tracking-wide uppercase text-stone-500 text-[10px]">Status Pembayaran</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isDpLocked}
                    onClick={() => setPembayaran({ ...pembayaran, status_pembayaran: "dp" })}
                    className={`h-9 rounded-xl font-bold text-center text-xs border transition-all cursor-pointer ${
                      pembayaran.status_pembayaran === "dp"
                        ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm"
                        : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                    } ${isDpLocked ? "bg-stone-100 text-stone-400 border-stone-200 !cursor-not-allowed shadow-none" : ""}`}
                  >
                    {isDpLocked ? "DP (Sudah Dikunci)" : "DP (Uang Muka)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPembayaran({ ...pembayaran, status_pembayaran: "lunas" })}
                    className={`h-9 rounded-xl font-bold text-center text-xs border transition-all cursor-pointer ${
                      isLunas
                        ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm"
                        : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    Lunas
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-bold tracking-wide uppercase text-stone-500 text-[10px]">
                  {isLunas ? "Dibayar Sekarang (Pelunasan)" : hasNewItems ? "Nominal DP Item Baru" : "Total DP"}
                </label>
                <div
                  className={`flex rounded-xl border overflow-hidden px-3 items-center bg-white h-9 transition-colors ${
                    isDpInvalid
                      ? "border-red-300 bg-red-50/40"
                      : isLunas
                      ? "border-emerald-200 bg-emerald-50/30"
                      : "border-stone-200 focus-within:border-[#1A335A]/50"
                  }`}
                >
                  <span className="mr-2 text-xs font-medium text-stone-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="nominal-dp-custom"
                    autoComplete="off"
                    data-lpignore="true"
                    value={formatRibuan(bayarSekarang)}
                    disabled={inputTerkunci}
                    onChange={(e) => setPembayaran({ ...pembayaran, total_dp: parseRibuan(e.target.value) })}
                    className={`w-full bg-transparent focus:outline-none text-xs font-bold tracking-wide ${
                      inputTerkunci
                        ? isLunas
                          ? "text-emerald-700 cursor-not-allowed"
                          : "text-stone-500 cursor-not-allowed"
                        : "text-stone-900"
                    }`}
                  />
                </div>
                {pembayaran.status_pembayaran === "dp" && hasNewItems && (
                  <span className={`text-[10px] block mt-1.5 leading-tight ${isDpInvalid ? "text-red-500 font-semibold" : "text-stone-400"}`}>
                    * DP item baru min 30%: <strong>Rp {Math.ceil(minDpItemBaru).toLocaleString("id-ID")}</strong>, max <strong>Rp {tagihanItemBaru.toLocaleString("id-ID")}</strong>.
                  </span>
                )}
                {pembayaran.status_pembayaran === "dp" && !hasNewItems && (
                  <div className="flex justify-between items-center mt-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-[10px]">
                    <span className="font-bold text-red-700 uppercase tracking-wide text-[9px]">Sisa Tagihan Lurik:</span>
                    <span className="text-xs font-black text-red-600">Rp {sisaTagihan.toLocaleString("id-ID")}</span>
                  </div>
                )}
                {isLunas && hasNewItems && (
                  <div className="flex justify-between items-center mt-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5 text-[10px]">
                    <span className="font-medium text-emerald-800">💰 Dibayar saat ini (pelunasan):</span>
                    <span className="font-black text-emerald-700 text-xs bg-white border border-emerald-200 px-2 py-0.5 rounded-lg shadow-sm">Rp {bayarSekarang.toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid items-end grid-cols-1 gap-4 pt-1 md:grid-cols-12">
              <div className="relative md:col-span-5">
                <label className="block mb-1.5 font-bold tracking-wide uppercase text-stone-500 text-[10px]">Metode Pembayaran</label>

                <div className="relative">
                  <select
                    value={pembayaran.metode_pembayaran}
                    onChange={(e) => setPembayaran({ ...pembayaran, metode_pembayaran: e.target.value })}

                    className="w-full pl-3 pr-10 text-xs font-medium bg-white border shadow-sm appearance-none cursor-pointer h-9 border-stone-200 rounded-xl focus:outline-none text-stone-700"
                  >
                    <option value="cash">Cash / Tunai</option>
                    <option value="transfer">Transfer Bank</option>

                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#1A335A]">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>


              <div className="md:col-span-2">
                <label className="block mb-1.5 font-bold tracking-wide uppercase text-stone-500 text-[10px]">Diskon</label>

                <input
                  type="text"
                  value={pembayaran.diskon ? `${pembayaran.diskon}%` : ""}
                  placeholder="0%"
                  disabled={isDiskonLocked}
                  onChange={(e) => setPembayaran({ ...pembayaran, diskon: Number(e.target.value.replace("%", "")) || 0 })}

                  className={`w-full border rounded-xl px-2 text-center focus:outline-none font-bold text-xs h-9 shadow-sm ${
                    isDiskonLocked
                      ? "border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
                      : "border-stone-200 bg-white text-stone-800"
                  }`}
                  title={isDiskonLocked ? "Diskon terkunci karena transaksi sudah lunas" : ""}
                />
                {isDiskonLocked && (
                  <span className="text-[9px] text-stone-400 block mt-1 leading-tight text-center">Terkunci (Lunas)</span>

                )}
              </div>

              <div className="md:col-span-5">

                <label className="block mb-1.5 font-bold tracking-wide uppercase text-stone-500 text-[10px]">Kalkulasi Ringkasan Kontrak</label>
                <div className="bg-white border border-stone-100 rounded-xl p-4 space-y-2 text-[11px] shadow-sm">
                  <div className="flex justify-between text-stone-500"><span>Sub Total Barang</span><span className="font-semibold text-stone-700">Rp {subTotal.toLocaleString("id-ID")}</span></div>
                  <div className="flex justify-between text-stone-500">
                    <span>{hasNewItems ? "Diskon (Khusus Item Lama)" : "Diskon Kontrak"}</span>
                    <span className="font-semibold text-stone-700">{pembayaran.diskon || 0}% (- Rp {nilaiDiskon.toLocaleString("id-ID")})</span>
                  </div>
                  {hasNewItems && (
                    <div className="flex justify-between text-stone-500"><span>Item Baru (Murni Tanpa Diskon)</span><span className="font-semibold text-stone-700">Rp {subTotalBaru.toLocaleString("id-ID")}</span></div>
                  )}
                  <hr className="border-stone-100" />
                  <div className="flex justify-between text-stone-900 font-bold pt-0.5"><span>Total Nilai Kontrak</span><span className="text-xs font-black text-stone-800">Rp {totalHargaAkhir.toLocaleString("id-ID")}</span></div>

                  {hasNewItems && (
                    <>
                      <hr className="border-dashed border-stone-200" />
                      <div className="flex justify-between font-medium text-emerald-600">
                        <span>Kas Masuk Sebelumnya</span>
                        <span>- Rp {dibayarSebelumnya.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between font-medium text-emerald-700">
                        <span>Masuk Kas Saat Ini</span>
                        <span>- Rp {bayarSekarang.toLocaleString("id-ID")}</span>
                      </div>
                      <div className={`flex justify-between font-bold p-1.5 rounded-lg mt-1 ${sisaTagihan > 0 ? "text-red-600 bg-red-50/40" : "text-emerald-700 bg-emerald-50/40"}`}>
                        <span className="text-[10px] uppercase tracking-wide">{sisaTagihan > 0 ? "Sisa Tagihan / Piutang" : "Lunas Kontrak"}</span>
                        <span className="font-black">Rp {sisaTagihan.toLocaleString("id-ID")}</span>

                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}