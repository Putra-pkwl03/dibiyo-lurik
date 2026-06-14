'use client';

import React, { useState, useEffect } from 'react';
import LaporanPoCustomFilterBar from '@/app/components/owner/laporan/por/LaporanPoRegulerFilterBar';
import LaporanPoTable from '@/app/components/owner/laporan/por/LaporanPoRegulerTable'; 
import Swal from 'sweetalert2';

export default function LaporanPoCustomPage() {
  const [poData, setPoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [pembayaran, setPembayaran] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch data dari API internal
  const fetchLaporanPo = async () => {
    setLoading(true);
    try {
      let url = `/api/laporan/pre-order-reguler?status=${status}&status_pembayaran=${pembayaran}`;
      if (startDate) url += `&start=${startDate}`;
      if (endDate) url += `&end=${endDate}`;

      const res = await fetch(url);
      const result = await res.json();
      if (res.ok) {
        setPoData(result.data || []);
      }
    } catch (err) {
      console.error('Gagal memuat data PO custom:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporanPo();
  }, [startDate, endDate, status, pembayaran]);

  const handleExportPDF = () => {
    setExportLoading(true);
    try {
      const { jsPDF } = require('jspdf');
      const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      doc.setTextColor(30, 53, 94); 
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('DIBYO LURIK', 105, 15, { align: 'center' });

      doc.setTextColor(102, 102, 102);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Sistem Manajemen Toko Kain Lurik', 105, 21, { align: 'center' });

      doc.setDrawColor(30, 53, 94); 
      doc.setLineWidth(0.4);
      doc.line(15, 26, 195, 26);

      doc.setTextColor(30, 53, 94);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('LAPORAN PRE-ORDER REGULER', 105, 35, { align: 'center' });

      let dateRange = 'Semua Periode';
      if (startDate && endDate) dateRange = `${startDate} s/d ${endDate}`;
      else if (startDate) dateRange = `Mulai ${startDate}`;
      else if (endDate) dateRange = `Sampai ${endDate}`;

      doc.setTextColor(102, 102, 102);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Periode: ${dateRange}`, 105, 41, { align: 'center' });

      const tableHeaders = [
        ['No.', 'Tanggal Buat', 'No. PO', 'Nama Customer', 'Status Produksi', 'Status Bayar', 'Total Harga']
      ];

      let grandTotalSum = 0;
      const tableRows = poData.map((row, index) => {
        grandTotalSum += Number(row.total_harga || 0);

        const formattedDate = new Date(row.created_at).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).replace(/\//g, '-');

        return [
          `${index + 1}.`,
          formattedDate,
          row.nomor_po || `PO-${row.id?.slice(0, 8).toUpperCase()}`,
          row.nama_customer,
          row.status?.replace('_', ' ').toUpperCase(),
          row.status_pembayaran?.toUpperCase(),
          `Rp ${Number(row.total_harga || 0).toLocaleString('id-ID')},00`,
        ];
      });

      const tableFooters = [
        [
          { 
            content: 'TOTAL OMSET PO REGULER:', 
            colSpan: 6, 
            styles: { halign: 'right', fontStyle: 'bold', textColor: [30, 53, 94] } 
          },
          { 
            content: `Rp ${grandTotalSum.toLocaleString('id-ID')},00`, 
            styles: { halign: 'right', fontStyle: 'bold', textColor: [30, 53, 94] } 
          }
        ]
      ];

      autoTable(doc, {
        startY: 48,
        head: tableHeaders,
        body: tableRows,
        foot: tableFooters, 
        margin: { left: 15, right: 15, bottom: 25 },
        theme: 'striped',
        styles: {
          font: 'helvetica',
          fontSize: 8.5,
          cellPadding: 2.5,
          verticalAlignment: 'middle',
        },
        headStyles: {
          fillColor: [30, 53, 94],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left',
        },
        footStyles: {
          fillColor: [240, 244, 248], 
          fillLineWidth: 0.2,
          fillDrawColor: [30, 53, 94],
        },
        columnStyles: {
          0: { halign: 'center', width: 10 },
          1: { halign: 'center', width: 25 },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'right' },
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
      });

      let finalY = doc.previousAutoTable?.finalY ? doc.previousAutoTable.finalY + 15 : 150;
      
      if (finalY > 265) {
        doc.addPage();
        finalY = 30; 
      }

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(153, 153, 153);

      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Gagal generate PDF PDF PO Custom:', err);
      Swal.fire({
        title: 'Gagal Export',
        text: 'Terjadi kesalahan saat memproses preview PDF.',
        icon: 'error',
        confirmButtonColor: '#1E355E'
      });
    } finally {
      setExportLoading(false);
    }
  };
  return (
    <div className="w-full mx-auto space-y-4 text-black font-inter">
      {/* Bagian Judul Sesuai Permintaan */}
      <div className="relative overflow-x-visible">
        <h2 className="text-lg sm:text-[24px] font-medium text-black pb-2 sm:pb-5 border-b border-gray-500 tracking-wide -mx-4 px-4 sm:-mx-6 sm:px-6">
         Laporan Pre Order Reguler
        </h2>
      </div>

      {/* Kontainer Kotak Putih & Isian Konten */}
      <div className="p-6 overflow-hidden bg-white border rounded-lg shadow-sm border-gray-200/60">
        <LaporanPoCustomFilterBar
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          status={status}
          setStatus={setStatus}
          pembayaran={pembayaran}
          setPembayaran={setPembayaran}
          onExport={handleExportPDF}
          exportLoading={exportLoading}
        />

        {/* Render komponen tabel list data */}
        <LaporanPoTable data={poData} loading={loading} />
      </div>
    </div>
  );
}