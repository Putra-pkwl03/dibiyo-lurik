'use client';

import { X, Printer, User, CreditCard, Box, Calendar, FileText } from 'lucide-react';

export default function PODustomDetailModal({ isOpen, onClose, item }) {
  if (!isOpen || !item) return null;

  // Helper untuk memformat tanggal menjadi dd/mm/yyyy standar lokal Indonesia
  const formatTanggalIndo = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Ambil data array produk custom dari database, fallback ke array kosong jika tidak ada
  const daftarProduk = item.item_pre_order_custom || [];

  // Kalkulasi nilai akumulasi untuk transparansi data billing
  const hitungSubtotalItem = (it) => 
    Number(it.harga_per_meter || 0) * Number(it.panjang || 0) * Number(it.jumlah || 1);
  
  const hitungSubtotalKotor = daftarProduk.reduce((acc, curr) => acc + hitungSubtotalItem(curr), 0);
  const totalHargaAkhir = Number(item.total_harga || 0);
  const totalDanaMasuk = Number(item.total_dp || 0);
  const sisaKekurangan = Math.max(0, totalHargaAkhir - totalDanaMasuk);

  const tanggalSelesaiRaw = item.tanggal_selesai || item.estimasi_selesai || item.estimasi_jadi;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A335A7A] font-inter backdrop-blur-[3px] print:p-0 print:bg-white print:relative">
      
      {/* INJEKSI STYLE CUSTOM UNTUK SCROLLBAR TIPIS & STYLING PRINT OUT */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* --- UTALITAS SCROLLBAR MODERN --- */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #1A335A transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #1A335A;
          border-radius: 10px;
        }

        /* --- ATURAN CETAK STRUK STRIP ELEMEN UI --- */
        @media print {
          body * { visibility: hidden; }
          .print-modal-container, .print-modal-container * { visibility: visible; }
          .print-modal-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print { display: none !important; }
        }
      `}} />

      {/* CONTAINER MODAL UTAMA */}
      <div className="print-modal-container bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 print:pb-2">
          <h3 className="text-sm font-bold text-[#1A335A] tracking-wide uppercase">Detail Nota Pre-Order Custom</h3>
          <button 
            onClick={onClose}
            className="text-[#1A335A] hover:opacity-70 transition-opacity cursor-pointer no-print"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="p-6 space-y-6 flex-1 text-black">
          
          {/* BARIS 1: DATA CUSTOMER & DETAIL PEMBAYARAN */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
            
            {/* Box Data Customer */}
            <div className="md:col-span-7 bg-[#5AE3ED1C] border border-[#1A335A]/20 rounded-xl p-4 text-[11px] space-y-3 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs border-b border-[#1A335A]/10 pb-1.5">
                <User size={14} /> Data Pelanggan
              </div>
              
              <div className="grid grid-cols-3 pt-1 pb-1">
                <div className="pr-3 border-r border-gray-300">
                  <p className="font-medium text-gray-400">Nama Customer</p>
                  <p className="font-bold text-gray-800 mt-0.5 break-words text-xs">{item.nama_customer || '-'}</p>
                </div>
                
                <div className="px-3 border-r border-gray-300">
                  <p className="font-medium text-gray-400">No Telepon</p>
                  <p className="font-bold text-gray-800 mt-0.5 text-xs">{item.kontak_customer || '-'}</p>
                </div>
                
                <div className="pl-3">
                  <p className="font-medium text-gray-400">Tanggal Pre-Order</p>
                  <p className="font-bold text-gray-800 mt-0.5 text-xs">
                    {item.created_at ? formatTanggalIndo(item.created_at) : formatTanggalIndo(item.tanggal_po)}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="font-medium text-gray-400">Alamat Kirim</p>
                <p className="font-semibold text-gray-700 mt-0.5 leading-relaxed">
                  {item.alamat_customer || 'Alamat tidak dicantumkan.'}
                </p>
              </div>
            </div>

            {/* Box Detail Pembayaran */}
            <div className="md:col-span-5 bg-[#5AE3ED1C] border border-[#1A335A]/20 rounded-xl p-4 text-[11px] flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs border-b border-[#1A335A]/10 pb-1.5 mb-2">
                  <CreditCard size={14} /> Keuangan & Metode Pembayaran
                </div>
                
                <div className="grid grid-cols-2 pt-1 pb-1">
                  <div className="pr-3 border-r border-gray-300">
                    <p className="font-medium text-gray-400">Status Pembayaran</p>
                    <span className={`inline-block mt-1 text-[9px] font-black px-2.5 py-0.5 rounded-md text-white uppercase tracking-wider ${
                      item.status_pembayaran?.toLowerCase() === 'lunas' ? 'bg-[#1DB793]' : 'bg-[#F2B600]'
                    }`}>
                      {item.status_pembayaran?.toUpperCase() || 'DP'}
                    </span>
                  </div>
                  
                  <div className="pl-3">
                    <p className="font-medium text-gray-400">Metode Pembayaran</p>
                    <p className="mt-1 font-bold text-gray-800 text-xs capitalize">{item.metode_pembayaran || 'Cash'}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-200 flex justify-between items-end">
                <div>
                  <p className="font-medium text-gray-400">Total Nilai Kontrak Kerja</p>
                  <p className="text-sm font-black text-[#1A335A] mt-0.5">
                    Rp {totalHargaAkhir.toLocaleString('id-ID')}
                  </p>
                </div>
                {sisaKekurangan > 0 && (
                  <div className="text-right">
                    <span className="text-[9px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">Sisa Kurang: Rp {sisaKekurangan.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* BARIS 2: DATA PRODUK (MAPPING DINAMIS MULTI-BARANG) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs border-b pb-1">
              <Box size={14} /> Daftar Item Produk Custom ({daftarProduk.length} Item)
            </div>
            
            <div className="space-y-3 max-h-[30vh] overflow-y-auto custom-scrollbar pr-1 print:max-h-none">
              {daftarProduk.length === 0 ? (
                <div className="text-center py-6 text-gray-400 border border-dashed rounded-xl text-[11px]">
                  Tidak ada item produk terlampir.
                </div>
              ) : (
                daftarProduk.map((prodItem, idx) => (
                  <div 
                    key={prodItem.id || idx} 
                    className="bg-[#5AE3ED1C] border border-[#1A335A]/10 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px]"
                  >
                    <div className="flex items-center gap-3">
                      {/* Thumbnail Gambar Item */}
                      <div className="w-14 h-14 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {prodItem.gambar_custom || prodItem.image ? (
                          <img 
                            src={prodItem.gambar_custom || prodItem.image} 
                            alt="Custom design" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-[8px] text-gray-400 font-bold p-1 text-center">
                            <span>No Image</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-400">Item Antrean ke-{(idx + 1)}</p>
                        <p className="font-bold text-gray-700 capitalize">
                          Lurik Custom - Pewarna {prodItem.jenis_pewarna || 'Klasik'}
                        </p>
                        <p className="mt-0.5 text-[10px] text-gray-500">
                          Tarif Master: Rp {Number(prodItem.harga_per_meter || 0).toLocaleString('id-ID')}/meter
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 sm:gap-6 text-left sm:text-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                      <div>
                        <p className="font-medium text-gray-400">Lebar Kain</p>
                        <p className="font-bold text-gray-700 mt-0.5 text-xs">
                          {prodItem.lebar ? `${prodItem.lebar} cm` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-400">Qty (Biji)</p>
                        <p className="font-bold text-gray-700 mt-0.5 text-xs">
                          {prodItem.jumlah || prodItem.qty || 1} Pcs
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-400">Panjang</p>
                        <p className="font-bold text-gray-700 mt-0.5 text-xs">
                          {prodItem.panjang ? `${prodItem.panjang} m` : '-'}
                        </p>
                      </div>
                      <div className="text-right sm:text-center">
                        <p className="font-medium text-gray-400">Subtotal</p>
                        <p className="font-black text-gray-800 mt-0.5 text-xs">
                          Rp {hitungSubtotalItem(prodItem).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BARIS 3: ESTIMASI PRODUK JADI & STATUS PRODUKSI */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            
            {/* Estimasi Box */}
            <div className="md:col-span-5 bg-[#5AE3ED1C] border border-[#1A335A]/10 rounded-xl p-4 text-[11px] space-y-2 flex flex-col justify-between shadow-sm">
              <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs">
                <Calendar size={13} /> Estimasi Produk Selesai
              </div>
              <div className="w-full bg-[#f2b600] text-white font-black text-center py-2 rounded-lg tracking-wider text-xs shadow-sm">
                {formatTanggalIndo(tanggalSelesaiRaw)}
              </div>
            </div>

            {/* Status Produksi Box */}
            <div className="md:col-span-7 bg-[#5AE3ED1C] border border-[#1A335A]/10 rounded-xl p-4 text-[11px] space-y-2 flex flex-col justify-between shadow-sm">
              <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs">
                <Box size={13} /> Status Produksi Aktif
              </div>
              <div className={`w-full text-white font-black text-center py-2 rounded-lg text-xs tracking-wider uppercase shadow-sm ${
                item.status === 'selesai_diproses' ? 'bg-[#1DB793]' : item.status === 'dalam_proses' ? 'bg-[#1A335A]' : 'bg-[#A63636]'
              }`}>
                {item.status ? item.status.replace(/_/g, ' ').toUpperCase() : 'BELUM DIPROSES'}
              </div>
            </div>

          </div>

          {/* BARIS 4: RINCIAN BREAKDOWN TRANSAKSI & CATATAN */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            
            {/* Catatan Khusus */}
            <div className="md:col-span-6 bg-[#5AE3ED1C] border border-[#1A335A]/10 rounded-xl p-4 text-[11px] space-y-1.5 shadow-sm">
              <p className="font-bold text-[#1A335A] text-xs flex items-center gap-1"><FileText size={13}/> Catatan Khusus Pesanan</p>
              <div className="w-full bg-white border border-gray-200 rounded-lg p-2.5 min-h-[68px] font-medium text-gray-600 leading-relaxed">
                {item.catatan || 'Tidak ada catatan khusus untuk kustomisasi pengerjaan lurik ini.'}
              </div>
            </div>

            {/* Rekap Finansial Rinci (Kanan) */}
            <div className="md:col-span-6 bg-gray-50 border border-gray-200 rounded-xl p-3 text-[11px] space-y-1.5 shadow-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal ({daftarProduk.length} Item)</span>
                <span className="font-semibold text-gray-700">Rp {hitungSubtotalKotor.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Potongan Diskon</span>
                <span className="font-semibold text-gray-700">{item.diskon || 0}%</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-gray-800 font-bold">
                <span>Total Nilai Kontrak</span>
                <span>Rp {totalHargaAkhir.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Dana yang Telah Diterima (DP/Cash)</span>
                <span>Rp {totalDanaMasuk.toLocaleString('id-ID')}</span>
              </div>
              <hr className="border-dashed border-gray-200" />
              <div className={`flex justify-between p-1 rounded font-black ${sisaKekurangan > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                <span>Sisa Kekurangan Pembayaran</span>
                <span>Rp {sisaKekurangan.toLocaleString('id-ID')}</span>
              </div>
            </div>

          </div>

        </div>

        {/* FOOTER MODAL (TOMBOL AKSI) */}
        <div className="flex justify-end px-6 py-3 border-t border-gray-100 bg-gray-50/50 sticky bottom-0 z-10 no-print">
          <button 
            onClick={() => window.print()} 
            className="bg-[#1A335A] hover:bg-[#11223d] text-white text-xs px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <Printer size={14} />
            Cetak Struk Nota
          </button>
        </div>

      </div>
    </div>
  );
}