'use client'

import { Eye, Edit, Trash2 } from 'lucide-react'

export default function POCustomTable({ data }) {

  if (!data || !Array.isArray(data)) {
    return <p className="py-4 text-center">Data tidak tersedia.</p>;
  }

  // Format nomor WhatsApp
  const formatWhatsAppNumber = (phone) => {
    if (!phone) return '';

    let cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }

    return cleaned;
  };

  // Badge status produksi
  const getStatusProduksiClass = (status) => {
    const map = {
      'dalam_proses': 'bg-[#FF6B6B]',
      'selesai_diproses': 'bg-[#4AD3B0]',
      'sedang_diproses': 'bg-[#7CD4FF]'
    };

    return `${map[status] || 'bg-gray-400'} text-white text-xs px-3 py-1 rounded-full font-medium inline-block shadow-sm`;
  };

  // Badge pembayaran
  const getStatusPembayaranClass = (status) => {
    return status === 'lunas'
      ? 'bg-[#B07C49] text-white'
      : 'bg-[#D4A373] text-white';
  };

  return (
    <table className="w-full text-center border-collapse">

      {/* HEADER */}
      <thead>
        <tr className="bg-[#B07C49] text-white text-sm font-medium">

          <th className="px-2 py-3 font-normal rounded-l-lg">No.</th>

          <th className="px-3 py-3 font-normal">Id Pre-Order</th>

          <th className="px-4 py-3 font-normal">Nama Pelanggan</th>

          <th className="px-4 py-3 font-normal">Kontak</th>

          <th className="px-3 py-3 font-normal">Status Produksi</th>

          <th className="px-3 py-3 font-normal">Status Pembayaran</th>

          <th className="px-4 py-3 font-normal">Total Harga</th>

          <th className="px-4 py-3 font-normal rounded-r-lg">Aksi</th>

        </tr>
      </thead>

      {/* BODY */}
      <tbody className="text-sm text-gray-700">

        {data.map((item, index) => {

          const waFormatted = formatWhatsAppNumber(item.kontak_customer);

          // Pesan WhatsApp dinamis
          const waMessage = encodeURIComponent(
            `Halo Bapak/Ibu ${item.nama_customer},

Kami dari Dibiyo Lurik ingin menginformasikan terkait pesanan Pre-Order Custom Anda dengan ID #POC-${item.id.slice(0, 8).toUpperCase()}.

${
  item.status === 'selesai_diproses'
    ? `Pesanan Anda telah selesai diproses dan sudah siap untuk diambil.

Silakan datang ke Dibiyo Lurik untuk melakukan pengambilan pesanan sesuai jadwal yang telah ditentukan.`

    : item.status === 'sedang_diproses'
    ? `Saat ini pesanan Anda sedang dalam tahap proses produksi oleh tim kami.

Mohon menunggu dengan sabar hingga proses produksi selesai. Kami akan segera menghubungi Anda kembali setelah pesanan siap.`

    : `Pesanan Anda saat ini masih dalam tahap antrian dan proses pengerjaan.

Tim kami sedang mempersiapkan proses produksi pesanan Anda. Mohon menunggu informasi selanjutnya dari kami.`
}

Status Pembayaran:
${
  item.status_pembayaran === 'lunas'
    ? 'Pembayaran Anda telah kami terima sepenuhnya.'
    : item.status_pembayaran === 'dp'
    ? 'Pembayaran uang muka (DP) telah kami terima.'
    : 'Pembayaran pesanan masih menunggu konfirmasi.'
}

Total tagihan pesanan:
Rp ${item.total_harga?.toLocaleString('id-ID')}

Terima kasih telah mempercayakan pesanan Anda kepada Dibiyo Lurik.`
          );

          return (
            <tr
              key={item.id}
              className="border-b border-[#D4A373]/20 hover:bg-amber-50/20 transition-colors"
            >

              {/* NO */}
              <td className="px-2 py-4 text-gray-500">
                {index + 1}.
              </td>

              {/* ID */}
              <td className="py-4 px-3 text-[#B07C49] font-medium">
                {item.id.slice(0, 8)}
              </td>

              {/* NAMA */}
              <td className="px-4 py-4">
                {item.nama_customer}
              </td>

              {/* WHATSAPP */}
              <td className="px-4 py-4">

                {waFormatted ? (
                  <a
                    href={`https://wa.me/${waFormatted}?text=${waMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#25D366] hover:text-[#1ebd53] font-medium underline decoration-dotted transition-colors"
                    title="Chat via WhatsApp"
                  >

                    {/* ICON WA */}
                    <svg
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.503-5.713-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.428 1.98 13.96 .951 11.343.951c-5.44 0-9.866 4.372-9.87 9.8c-.001 1.701.453 3.361 1.314 4.814L1.706 22.28l4.941-1.293z"/>
                    </svg>

                    {item.kontak_customer}

                  </a>
                ) : (
                  <span className="italic text-gray-400">
                    Tidak ada kontak
                  </span>
                )}

              </td>

              {/* STATUS PRODUKSI */}
              <td className="px-3 py-4">

                <span className={getStatusProduksiClass(item.status)}>

                  {item.status?.replace('_', ' ')}

                </span>

              </td>

              {/* STATUS PEMBAYARAN */}
              <td className="px-3 py-4">

                <span
                  className={`${getStatusPembayaranClass(item.status_pembayaran)} text-xs px-3 py-0.5 rounded-full font-medium shadow-sm`}
                >

                  {item.status_pembayaran?.charAt(0).toUpperCase() +
                    item.status_pembayaran?.slice(1)}

                </span>

              </td>

              {/* TOTAL */}
              <td className="px-4 py-4 font-medium text-gray-600">

                Rp. {item.total_harga?.toLocaleString('id-ID')}

              </td>

              {/* AKSI */}
              <td className="px-4 py-4">

                <div className="flex items-center justify-center gap-1.5">

                  <button className="bg-[#8B5E3C] hover:bg-[#724c30] text-white text-[11px] px-2 py-1 rounded shadow-sm transition-colors font-medium">
                    Produk di Terima
                  </button>

                  <button className="bg-[#4AD3B0] hover:bg-[#3bc2a0] text-white p-1 rounded shadow-sm">
                    <Eye size={14} />
                  </button>

                  <button className="bg-[#F0A55D] hover:bg-[#e0944b] text-white p-1 rounded shadow-sm">
                    <Edit size={14} />
                  </button>

                  <button className="bg-[#FF6B6B] hover:bg-[#f05656] text-white p-1 rounded shadow-sm">
                    <Trash2 size={14} />
                  </button>

                </div>

              </td>

            </tr>
          );
        })}

      </tbody>

    </table>
  )
}