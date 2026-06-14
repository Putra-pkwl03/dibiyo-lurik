'use client';
import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import OrderDetailModal from './OrderDetailModal'; 

export default function OrderTable({ orders }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <>
      <div className="w-full overflow-x-auto rounded-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#1A335A] text-white text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3.5 font-medium text-center w-12">No.</th>
              <th className="px-6 py-3.5 font-medium">Tanggal</th>
              <th className="px-6 py-3.5 font-medium">Id Pesanan</th>
              <th className="px-6 py-3.5 font-medium">Motif</th>
              <th className="px-6 py-3.5 font-medium text-center">Jumlah Order</th>
              <th className="px-6 py-3.5 font-medium text-center">Lebar</th>
              <th className="px-6 py-3.5 font-medium">Panjang</th>
              <th className="px-6 py-3.5 font-medium">Total Harga</th>
              <th className="px-4 py-3.5 font-medium text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200 text-stone-800">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-10 text-center text-stone-400">
                  Tidak ada riwayat order ditemukan.
                </td>
              </tr>
            ) : (
              orders.map((order, orderIndex) => (
                order.items.map((item, itemIndex) => {
                  const isLebar70 = parseInt(item.gulungan?.lebar) === 70;

                  return (
                    <tr key={`${order.id}-${itemIndex}`} className="transition-colors hover:bg-stone-50/60">
                      {itemIndex === 0 && (
                        <>
                          <td rowSpan={order.items.length} className="px-4 py-4 font-normal text-center ">
                            {orderIndex + 1}.
                          </td>
                          <td rowSpan={order.items.length} className="px-6 py-4 whitespace-nowrap">
                            {new Date(order.tanggal_order).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            }).replace(/\//g, '-')}
                          </td>
                          <td rowSpan={order.items.length} className="px-6 py-4 font-normal text-stone-600 whitespace-nowrap">
                            {order.id ? `ID ${order.id.toString().toUpperCase()}` : '-'}
                          </td>
                        </>
                      )}
                      
                      <td className="px-6 py-4 font-normal">{item.gulungan?.produk?.motif?.nama || '-'}</td>
                      <td className="px-6 py-4 font-normal text-center">{item.jumlah_order}</td>
                      
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-sm min-w-[65px] ${
                          isLebar70 ? 'bg-[#A855F7]' : 'bg-[#3B82F6]'
                        }`}>
                          {item.gulungan?.lebar ? `${item.gulungan.lebar} cm` : '-'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 font-normal whitespace-nowrap">
                        {item.jumlah_order} Meter
                      </td>

                      {itemIndex === 0 && (
                        <>
                          <td rowSpan={order.items.length} className="px-6 py-4 font-normal whitespace-nowrap">
                            Rp. {order.total_harga?.toLocaleString('id-ID')},00
                          </td>
                          <td rowSpan={order.items.length} className="px-3 py-3 text-center align-middle">
                            {/* Trigger Event onClick untuk membuka detail modal */}
                            <button 
                              onClick={() => handleOpenDetail(order)}
                              className="inline-flex flex-col items-center justify-center gap-1 bg-[#F2B600] text-white px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#d6a100] transition-colors shadow-sm mx-auto min-w-[50px]"
                            >
                              <span>Detail</span>
                              <Eye size={14} strokeWidth={3} /> 
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Inisialisasi Modal Element */}
      <OrderDetailModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        orderData={selectedOrder} 
      />
    </>
  );
}