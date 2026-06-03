import React from "react";
import { CreditCard, ChevronDown } from "lucide-react";

export default function PaymentSection({
  pembayaran,
  setPembayaran,
  hasNewItems,
  isOriginallyLunas,
  isOriginallyDp,
  dibayarSebelumnya,
  tagihanItemBaru,
  minDpItemBaru,
  showSimpleLunasView,
  isDpLocked,
  isDiskonLocked,
  bayarSekarang,
  sisaTagihan,
  isDpInvalid,
  inputTerkunci,
  subTotal,
  nilaiDiskon,
  subTotalBaru,
  totalHargaAkhir,
  formatRibuan,
  parseRibuan,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-black border-b pb-1">
        <CreditCard size={14} className="text-[#1A335A]" />
        <span>Detail Pembayaran</span>
      </div>

      {hasNewItems && (isOriginallyLunas || isOriginallyDp) && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-[11px]">
          <span className="font-bold flex items-center gap-1 text-amber-700">⚠️ Penambahan Item Baru</span>
          <p className="text-amber-900 mt-1">
            {isOriginallyLunas ? (
              <>Transaksi ini sebelumnya sudah <strong>LUNAS</strong> (Rp {dibayarSebelumnya.toLocaleString("id-ID")}). Item baru diperlakukan sebagai pesanan tersendiri: pilih <strong>Lunas</strong> untuk bayar penuh, atau <strong>DP</strong> minimal 30% dari harga item baru.</>
            ) : (
              <>DP yang sudah dibayar (Rp {dibayarSebelumnya.toLocaleString("id-ID")}) dibiarkan. Item baru diperlakukan tersendiri: pilih <strong>Lunas</strong> untuk bayar penuh, atau <strong>DP</strong> minimal 30% dari harga item baru.</>
            )}
          </p>
          <div className="mt-2 flex items-baseline justify-between bg-white border border-amber-200 rounded-md px-3 py-2">
            <span className="text-[10px] text-gray-500 font-medium">Harga Item Baru</span>
            <span className="text-sm font-black text-emerald-700">Rp {tagihanItemBaru.toLocaleString("id-ID")}</span>
          </div>
        </div>
      )}

      <div className="bg-[#5AE3ED1C] border border-[#1A335A]/20 rounded-xl p-5 space-y-4 text-[11px]">
        {showSimpleLunasView ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="p-3 bg-white border border-[#1A335A]/20 rounded-lg shadow-sm">
              <span className="block text-black font-medium mb-1">Metode Pembayaran</span>
              <span className="text-xs font-bold text-gray-800 capitalize">{pembayaran.metode_pembayaran}</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg shadow-sm space-y-1.5">
              <div className="flex justify-between text-gray-500 text-[10px]">
                <span>Subtotal: Rp {subTotal.toLocaleString("id-ID")}</span>
                <span className="text-emerald-700 font-medium">Diskon: {pembayaran.diskon}%</span>
              </div>
              <hr className="border-emerald-200" />
              <div className="flex justify-between items-center">
                <div>
                  <span className="block text-emerald-600 font-medium text-[9px]">Status</span>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">LUNAS</span>
                </div>
                <div className="text-right">
                  <span className="block text-gray-400 text-[9px]">Total Nilai Kontrak</span>
                  <span className="text-xs font-black text-gray-800">Rp {totalHargaAkhir.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-black font-semibold mb-1">Status Pembayaran</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={isDpLocked}
                  onClick={() => setPembayaran({ ...pembayaran, status_pembayaran: "dp" })}
                  className={`py-2 rounded-lg font-bold text-center text-xs border transition-all cursor-pointer ${
                    pembayaran.status_pembayaran === "dp" ? "bg-[#1A335A] text-white border-[#1A335A] shadow-sm" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  } ${isDpLocked ? "bg-gray-100 text-gray-700 border-gray-300 !cursor-not-allowed shadow-none" : ""}`}
                >
                  {isDpLocked ? "DP (Sudah Dibayar)" : "DP (Uang Muka)"}
                </button>
                <button
                  type="button"
                  onClick={() => setPembayaran({ ...pembayaran, status_pembayaran: "lunas" })}
                  className={`py-2 rounded-lg font-bold text-center text-xs border transition-all cursor-pointer ${
                    pembayaran.status_pembayaran === "lunas" ? "bg-[#1A335A] text-white border-[#1A335A] shadow-sm" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Lunas
                </button>
              </div>
            </div>

            <div>
              <label className="block text-black font-semibold mb-1">
                {pembayaran.status_pembayaran === "lunas" ? "Dibayar Sekarang (Pelunasan)" : hasNewItems ? "Nominal DP Item Baru" : "Total DP"}
              </label>
              <div className={`flex rounded-lg border overflow-hidden px-3 py-2.5 items-center bg-white transition-colors ${isDpInvalid ? "border-red-400" : pembayaran.status_pembayaran === "lunas" ? "border-emerald-300 bg-emerald-50/40" : "border-[#1A335A]"}`}>
                <span className="text-gray-500 text-xs mr-2 font-medium">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  name="nominal-dp-custom"
                  autoComplete="off"
                  data-lpignore="true"
                  value={formatRibuan(bayarSekarang)}
                  disabled={inputTerkunci}
                  onChange={(e) => setPembayaran({ ...pembayaran, total_dp: parseRibuan(e.target.value) })}
                  className={`nominal-input w-full bg-transparent focus:outline-none text-sm font-bold tracking-wide ${inputTerkunci ? (pembayaran.status_pembayaran === "lunas" ? "text-emerald-700 cursor-not-allowed" : "text-gray-600 cursor-not-allowed") : "text-gray-900"}`}
                />
              </div>

              {pembayaran.status_pembayaran === "dp" && hasNewItems && (
                <span className={`text-[10px] block mt-1 ${bayarSekarang < minDpItemBaru ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                  * DP item baru minimal 30% yaitu <strong>Rp {Math.ceil(minDpItemBaru).toLocaleString("id-ID")}</strong>, maksimal <strong>Rp {tagihanItemBaru.toLocaleString("id-ID")}</strong>.
                </span>
              )}

              {pembayaran.status_pembayaran === "dp" && (
                <div className="flex justify-between items-center mt-2 bg-red-50 border border-red-200 rounded-lg p-2 text-[10px]">
                  <span className="text-red-700 font-medium">Sisa Tagihan / Kekurangan:</span>
                  <span className="font-black text-red-600 text-xs">Rp {sisaTagihan.toLocaleString("id-ID")}</span>
                </div>
              )}

              {pembayaran.status_pembayaran === "lunas" && hasNewItems && (
                <div className="flex justify-between items-center mt-2 bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-[10px]">
                  <span className="text-emerald-800 font-bold flex items-center gap-1">💰 Dibayar saat ini (pelunasan):</span>
                  <span className="font-black text-emerald-700 text-xs bg-white border border-emerald-300 rounded px-2 py-0.5">Rp {bayarSekarang.toLocaleString("id-ID")}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5 relative">
                <label className="block text-black font-semibold mb-1">Metode Pembayaran</label>
                <div className="relative">
                  <select
                    value={pembayaran.metode_pembayaran}
                    onChange={(e) => setPembayaran({ ...pembayaran, metode_pembayaran: e.target.value })}
                    className="w-full border border-[#1A335A] bg-white rounded-lg p-2.5 pr-10 focus:outline-none text-gray-700 appearance-none text-xs cursor-pointer"
                  >
                    <option value="cash">Cash</option>
                    <option value="transfer">Transfer</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#1A335A]">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-black font-semibold mb-1">Diskon</label>
                <input
                  type="text"
                  value={pembayaran.diskon ? `${pembayaran.diskon}%` : ""}
                  placeholder="0%"
                  disabled={isDiskonLocked}
                  onChange={(e) => setPembayaran({ ...pembayaran, diskon: Number(e.target.value.replace("%", "")) || 0 })}
                  className={`w-full border rounded-lg p-2.5 text-center focus:outline-none font-medium text-xs ${isDiskonLocked ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed" : "border-[#1A335A] bg-white"}`}
                  title={isDiskonLocked ? "Diskon terkunci karena transaksi sudah lunas" : ""}
                />
                {isDiskonLocked && (
                  <span className="text-[9px] text-gray-400 block mt-1 leading-tight">Terkunci (transaksi sudah lunas)</span>
                )}
              </div>

              <div className="md:col-span-5">
                <label className="block text-black font-semibold mb-1">Total Harga</label>
                <div className="bg-white border border-[#1A335A] rounded-lg p-3 space-y-1.5 text-[11px] shadow-sm">
                  <div className="flex justify-between text-gray-500"><span>Sub Total</span><span className="font-semibold text-gray-700">Rp {subTotal.toLocaleString("id-ID")}</span></div>
                  <div className="flex justify-between text-gray-500">
                    <span>{hasNewItems ? "Diskon (barang lama)" : "Diskon"}</span>
                    <span className="font-semibold text-gray-700">{pembayaran.diskon || 0}% (- Rp {nilaiDiskon.toLocaleString("id-ID")})</span>
                  </div>
                  {hasNewItems && (
                    <div className="flex justify-between text-gray-500"><span>Item baru (tanpa diskon)</span><span className="font-semibold text-gray-700">Rp {subTotalBaru.toLocaleString("id-ID")}</span></div>
                  )}
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-gray-900 font-bold pt-0.5"><span>Total Kontrak</span><span>Rp {totalHargaAkhir.toLocaleString("id-ID")}</span></div>

                  {hasNewItems && (
                    <>
                      <hr className="border-dashed border-gray-200" />
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Sudah Dibayar</span>
                        <span>- Rp {dibayarSebelumnya.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Bayar Sekarang</span>
                        <span>- Rp {bayarSekarang.toLocaleString("id-ID")}</span>
                      </div>
                      <div className={`flex justify-between font-bold p-1 rounded ${sisaTagihan > 0 ? "text-red-600 bg-red-50/50" : "text-emerald-700 bg-emerald-50/50"}`}>
                        <span>{sisaTagihan > 0 ? "Sisa Tagihan" : "Lunas"}</span>
                        <span>Rp {sisaTagihan.toLocaleString("id-ID")}</span>
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