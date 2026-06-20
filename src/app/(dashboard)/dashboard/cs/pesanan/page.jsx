'use client'

import React, { useState, useEffect } from 'react'
import { Search, Eye, ShoppingBag, Truck, Package, Save, MessageCircle, MapPin, CheckCircle } from 'lucide-react'
import Swal from 'sweetalert2'

// 🌟 HELPER GENERATOR GRADASI LURIK UNTUK BARANG KUSTOM
const generateLurikGradient = (stripes) => {
  let gradientString = '';
  let currentOffset = 0;
  
  if (!stripes || stripes.length === 0) return { gradient: 'none', totalWidth: 0 };
  
  stripes.forEach((stripe) => {
    const thickness = Number(stripe.thickness) || 0;
    const startPoint = currentOffset;
    const endPoint = currentOffset + thickness;
    
    gradientString += `${stripe.color} ${startPoint}px, ${stripe.color} ${endPoint}px, `;
    gradientString += `transparent ${endPoint}px, transparent ${endPoint + 2}px, `;
    
    currentOffset = endPoint + 2; 
  });
  
  const cleanGradient = gradientString.trim().replace(/,$/, '');
  
  return {
    gradient: `linear-gradient(90deg, ${cleanGradient})`,
    totalWidth: currentOffset
  };
};

// 💀 SKELETON COMPONENT FOR LOADING STATE
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="p-3"><div className="w-16 h-4 bg-gray-200 rounded"></div></td>
    <td className="p-3">
      <div className="w-24 h-3 mb-1 bg-gray-200 rounded"></div>
      <div className="h-2.5 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="p-3"><div className="h-6 bg-gray-200 rounded w-28"></div></td>
    <td className="p-3"><div className="w-32 h-4 bg-gray-200 rounded"></div></td>
    <td className="p-3"><div className="h-4 bg-gray-200 rounded w-14"></div></td>
    <td className="p-3"><div className="w-24 h-5 bg-gray-200 rounded"></div></td>
    <td className="p-3 text-center"><div className="w-8 h-6 mx-auto bg-gray-200 rounded"></div></td>
  </tr>
)

const SkeletonDetail = () => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-md p-4 space-y-4 animate-pulse h-[calc(100vh-5rem)]">
    <div className="pb-3 space-y-2 border-b border-gray-100">
      <div className="flex justify-between">
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
        <div className="w-20 h-3 bg-gray-200 rounded"></div>
      </div>
      <div className="w-40 h-3 bg-gray-200 rounded"></div>
    </div>
    <div className="h-32 bg-gray-100 rounded-xl"></div>
    <div className="space-y-2">
      <div className="w-24 h-3 bg-gray-200 rounded"></div>
      <div className="flex gap-2">
        <div className="w-10 h-10 bg-gray-200 rounded"></div>
        <div className="flex-1 py-1 space-y-2">
          <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
          <div className="h-2.5 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  </div>
)

export default function CSManagePesananPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  const selectedOrder = orders.find(o => o.order_id === selectedOrderId)

  const [inputStatusPengerjaan, setInputStatusPengerjaan] = useState('pesanan di proses')
  const [inputNoResi, setInputNoResi] = useState('')

  // 1. FETCH DATA UTAMA DARI DATABASE
  const fetchTransaksi = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/transaksi')
      const data = await res.json()
      
      if (res.ok) {
        setOrders(data)
        if (data.length > 0 && !selectedOrderId) {
          setSelectedOrderId(data[0].order_id)
          setInputStatusPengerjaan(data[0].status_pengiriman || 'pesanan di proses')
          setInputNoResi(data[0].no_resi || '')
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data transaksi:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransaksi()
  }, [])

  // 2. LIVE MONITORING REALTIME
  useEffect(() => {
    const eventSource = new EventSource('/api/realtime')

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        
        if (message.event === 'notification.status_changed') {
          const { id_order, status_baru, pesan } = message.data

          setOrders(prevOrders => 
            prevOrders.map(o => 
              o.order_id === id_order ? { ...o, status_pengiriman: status_baru } : o
            )
          )

          Swal.fire({
            title: 'Info Produksi Baru!',
            text: pesan,
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000
          })
        }
      } catch (err) {
        console.error("Gagal membaca update realtime produksi:", err)
      }
    }

    return () => eventSource.close()
  }, [])

  // Sinkronisasi input form ketika order terpilih berganti
  useEffect(() => {
    if (selectedOrder) {
      setInputStatusPengerjaan(selectedOrder.status_pengiriman || 'pesanan di proses')
      setInputNoResi(selectedOrder.no_resi || '')
    }
  }, [selectedOrderId, orders])

  const handleSelectOrder = async (order) => {
    setSelectedOrderId(order.order_id)
    
    if (order.notification_id) {
      try {
        await fetch('/api/notifikasi', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: order.notification_id }),
        })
      } catch (err) {
        console.error("Gagal sinkronisasi badge notifikasi:", err)
      }
    }
  }

  const filteredOrders = orders.filter(order => {
    const phone = order.nomor_telp || order.profiles?.nomor_telp || '';
    const address = order.alamat_lengkap || order.profiles?.alamat_lengkap || '';
    return (
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      address.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleSimpanPerubahanStatus = async (e) => {
    e.preventDefault()

    Swal.fire({
      title: 'Simpan Perubahan?',
      text: `Apakah Anda ingin memperbarui status untuk order ${selectedOrder.order_id}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1A335A',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Perbarui!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch('/api/transaksi', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: selectedOrder.order_id,
              status_pengiriman: inputStatusPengerjaan, 
              no_resi: inputStatusPengerjaan === 'pesanan bisa diambil di toko sekarang' ? inputNoResi : selectedOrder.no_resi
            })
          })

          if (response.ok) {
            setOrders(prevOrders => 
              prevOrders.map(o => o.order_id === selectedOrder.order_id 
                ? { ...o, status_pengiriman: inputStatusPengerjaan, no_resi: inputStatusPengerjaan === 'pesanan bisa diambil di toko sekarang' ? inputNoResi : o.no_resi } 
                : o
              )
            )

            Swal.fire({
              title: 'Berhasil Diperbarui!',
              text: `Status pengerjaan berhasil diperbarui.`,
              icon: 'success',
              confirmButtonColor: '#1A335A',
            })
          } else {
            throw new Error("Gagal menyimpan data ke server")
          }
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'Terjadi kesalahan saat menyinkronkan data ke Supabase.',
            icon: 'error',
          })
        }
      }
    })
  }

  const formatWhatsAppLink = (phoneRaw, orderId) => {
    if (!phoneRaw) return '#';
    let cleaned = phoneRaw.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    
    const message = `Halo, kami dari Customer Service Lurik ATBM. Menginfokan terkait pesanan Anda dengan ID Order: ${orderId}. `;
    return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
  }

  const formatTanggal = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="w-full mx-auto space-y-4 text-black font-inter">
      <div className="relative overflow-x-visible">
        <h2 className="text-lg sm:text-[24px] font-medium text-black pb-2 sm:pb-5 border-b border-gray-500 tracking-wide -mx-4 px-4 sm:-mx-6 sm:px-6">
          Manajemen Transaksi
        </h2>
      </div>

      <div className="flex flex-col gap-6 bg-gray-50 lg:flex-row">
        
        {/* KIRI: MONITORING TABEL ANTREAN */}
        <div className="flex flex-col flex-1 p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
          <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#1A335A] flex items-center gap-2">
                <ShoppingBag size={22} /> Manajemen Transaksi 
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Memproses invoice masuk, detail kontak pelanggan, dan pengiriman resi.</p>
            </div>

          <div className="relative w-full sm:w-60">
            <Search className="absolute w-4 h-4 text-gray-400 top-2.5 left-3" />
            <input
              type="text"
              placeholder="Cari ID, User, Telp, Alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-1.5 pr-4 pl-10 w-full text-xs rounded-lg border border-gray-200 outline-none transition-all focus:border-[#1A335A] focus:ring-1 focus:ring-[#1A335A]"
            />
          </div>
        </div>

        {/* Tabel Antrean */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100 bg-gray-50">
                <th className="p-3">ID Pesanan</th>
                <th className="p-3">Tanggal & User</th>
                <th className="p-3">Kontak (WhatsApp)</th>
                <th className="p-3">Alamat Pengiriman</th>
                <th className="p-3">Status Pembayaran</th>
                <th className="p-3">Status Alur Kain</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-50">
              {loading ? (
                // Tampilkan skeleton baris tabel saat loading data
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 italic text-center text-gray-400">Tidak ada data transaksi ditemukan</td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusTx = order.status_transaksi?.toLowerCase();
                  const isPaid = statusTx === 'settlement' || statusTx === 'success' || statusTx === 'capture';
                  
                  const noTelp = order.nomor_telp || order.profiles?.nomor_telp || '-';
                  const alamatLengkap = order.alamat_lengkap || order.profiles?.alamat_lengkap || '-';
                  const currentStatus = order.status_pengiriman;

                  return (
                    <tr 
                      key={order.order_id} 
                      onClick={() => handleSelectOrder(order)}
                      className={`cursor-pointer transition-colors ${
                        selectedOrderId === order.order_id ? 'bg-[#1A335A]/10 font-medium' : 'hover:bg-gray-50/60'
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-gray-700">{order.order_id}</td>
                      <td className="p-3 text-gray-800">
                        <div className="font-mono text-[10px] text-gray-500 max-w-[100px] truncate">{order.user_id}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{formatTanggal(order.created_at)}</div>
                      </td>
                      
                      <td className="p-3">
                        {noTelp !== '-' ? (
                          <a 
                            href={formatWhatsAppLink(noTelp, order.order_id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()} 
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-2 py-1 rounded border border-green-200 transition-colors font-medium font-mono text-[11px]"
                          >
                            <MessageCircle size={12} className="fill-green-600" />
                            {noTelp}
                          </a>
                        ) : (
                          <span className="italic text-gray-400">-</span>
                        )}
                      </td>

                      <td className="p-3 max-w-[180px]">
                        {alamatLengkap !== '-' ? (
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(alamatLengkap)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-gray-700 transition-colors hover:text-blue-600 group"
                            title="Klik untuk buka di Google Maps"
                          >
                            <MapPin size={13} className="text-gray-400 group-hover:text-blue-600 shrink-0" />
                            <span className="truncate block max-w-[150px]">{alamatLengkap}</span>
                          </a>
                        ) : (
                          <span className="italic text-gray-400">-</span>
                        )}
                      </td>

                      <td className="p-3">
                        {isPaid ? (
                          <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Berhasil
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {order.status_transaksi || 'Pending'}
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        {currentStatus === 'pesanan bisa diambil di toko sekarang' && (
                          <span className="inline-flex items-center gap-1 text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            <Truck size={12} /> Siap Ambil
                          </span>
                        )}
                        {currentStatus === 'pesanan di terima' && (
                          <span className="inline-flex items-center gap-1 text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-100">
                            <CheckCircle size={12} /> Selesai
                          </span>
                        )}
                        {(currentStatus === 'pesanan di proses' || !currentStatus) && (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                            <Package size={12} /> Diproses ATBM
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-[#1A335A] hover:text-white transition-colors">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KANAN: FORM UPDATE PROGRESS */}
      <div className="w-full lg:w-96 shrink-0">
        {loading ? (
          <SkeletonDetail />
        ) : selectedOrder ? (
          <div className="sticky top-6 bg-white rounded-xl border border-gray-100 shadow-md p-4 flex flex-col h-[calc(100vh-5rem)]">
            
            <div className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[#1A335A]">{selectedOrder.order_id}</span>
                <span className="text-[10px] text-gray-500">{formatTanggal(selectedOrder.created_at)}</span>
              </div>
              <h2 className="mt-1 font-mono text-xs text-gray-400 truncate">UID: {selectedOrder.user_id}</h2>
            </div>

            {/* FORM KONTROL STATUS */}
            <form onSubmit={handleSimpanPerubahanStatus} className="p-3 mt-4 space-y-3 border border-gray-200 bg-gray-50 rounded-xl">
              <h3 className="text-xs font-bold text-[#1A335A] uppercase tracking-wider">Update Alur Pengerjaan Kain</h3>
              
              <div>
                <label className="block text-[11px] text-gray-500 font-medium mb-1.5">Pilih Status Berikutnya:</label>
                <div className="grid grid-cols-3 gap-1">
                  
                  <button
                    type="button"
                    onClick={() => setInputStatusPengerjaan('pesanan di proses')}
                    className={`py-2 px-1 text-[10px] rounded-lg font-bold border flex flex-col items-center justify-center gap-1 transition-all ${
                      inputStatusPengerjaan === 'pesanan di proses'
                        ? 'bg-amber-100 border-amber-300 text-amber-800 ring-1 ring-amber-400'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Package size={13} /> Proses
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputStatusPengerjaan('pesanan bisa diambil di toko sekarang')}
                    className={`py-2 px-1 text-[10px] rounded-lg font-bold border flex flex-col items-center justify-center gap-1 transition-all ${
                      inputStatusPengerjaan === 'pesanan bisa diambil di toko sekarang'
                        ? 'bg-blue-100 border-blue-300 text-blue-800 ring-1 ring-blue-400'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Truck size={13} /> Siap Ambil
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputStatusPengerjaan('pesanan di terima')}
                    className={`py-2 px-1 text-[10px] rounded-lg font-bold border flex flex-col items-center justify-center gap-1 transition-all ${
                      inputStatusPengerjaan === 'pesanan di terima'
                        ? 'bg-green-100 border-green-300 text-green-800 ring-1 ring-green-400'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <CheckCircle size={13} /> Selesai
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-[#1A335A] text-white py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Save size={13} /> Simpan Perubahan Status
              </button>
            </form>

            {/* List Item Barang */}
            <div className="mt-4 text-xs font-semibold text-gray-500">Daftar Item Belanja:</div>
            <div className="flex-1 overflow-y-auto my-2 space-y-2 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
              {Array.isArray(selectedOrder.items_transaksi) && selectedOrder.items_transaksi.length > 0 ? (
                selectedOrder.items_transaksi.map((item, idx) => {
                  const namaProduk = item.name || item.nama || "Kain Lurik Eksklusif";
                  const kuantitas = item.quantity || item.qty || item.panjang_dibeli || 1;
                  const hargaItem = item.price || item.harga || item.harga_per_meter || 0;
                  
                  // 🌟 DETEKSI METODE VISUALISASI GAMBAR ATAU KUSTOM GRADASI
                  const isCustomItem = item.is_custom === true || item.isCustom === true;
                  let visualBox;

                  if (isCustomItem && item.konfigurasi && item.konfigurasi.stripes) {
                    const { bgColor, patternDensity, stripes } = item.konfigurasi;
                    const { gradient, totalWidth } = generateLurikGradient(stripes);
                    const kerapatanDinamis = (totalWidth * (patternDensity / 100)) || 20;

                    visualBox = (
                      <div 
                        style={{
                          backgroundColor: bgColor || '#ffffff',
                          backgroundImage: gradient,
                          backgroundSize: `${kerapatanDinamis}px 100%`
                        }}
                        className="w-10 h-10 border border-gray-300 rounded shadow-inner shrink-0"
                        title="Motif Kain Kustom ATBM"
                      />
                    );
                  } else {
                    const srcGambar = item.image_url || item.gambar_url || '/placeholder-kain.jpg';
                    visualBox = (
                      <img 
                        src={srcGambar} 
                        alt="Produk" 
                        className="object-cover w-10 h-10 border border-gray-200 rounded shrink-0"
                        onError={(e) => { e.target.src = '/placeholder-kain.jpg' }}
                      />
                    );
                  }

                  return (
                    <div key={idx} className="flex items-center gap-3 p-2 border border-gray-100 rounded-lg bg-gray-50/50">
                      {/* 🌟 MERENDER MEDIA BOX BERDASARKAN HASIL IDENTIFIKASI */}
                      {visualBox}
                      
                      <div className="flex flex-col justify-center flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-800 truncate">{namaProduk}</h4>
                        <div className="flex items-center justify-between mt-0.5 text-[10px] text-gray-500">
                          <span>{kuantitas} Meter</span>
                          <span className="font-bold text-[#1A335A]">Rp {Number(hargaItem).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-2 text-xs italic text-gray-400">Tidak ada rincian produk (JSONB kosong)</div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-500">Total Transaksi</span>
              <span className="text-base font-bold text-[#1A335A]">
                Rp {Number(selectedOrder.total_nominal).toLocaleString('id-ID')}
              </span>
            </div>
            
          </div>
        ) : (
          <div className="sticky p-8 text-center text-gray-400 bg-white border border-gray-100 top-6 rounded-xl">
            Pilih salah satu transaksi untuk mengelola data produksi & resi.
          </div>
        )}
      </div>

      </div>
    </div>
  )
}