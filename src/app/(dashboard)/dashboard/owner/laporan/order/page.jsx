'use client';

import React, { useState, useEffect } from 'react';
import LaporanFilterBar from '@/app/components/owner/laporan/LaporanFilterBar';
import LaporanTable from '@/app/components/owner/laporan/LaporanTable';
import Swal from 'sweetalert2';

export default function LaporanOrderPage() {
  const [laporanData, setLaporanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  // Ambil data laporan dari API
  const fetchLaporan = async () => {
    setLoading(true);
    try {
      let url = `/api/laporan/orders?search=${encodeURIComponent(search)}`;
      if (startDate) url += `&start=${startDate}`;
      if (endDate) url += `&end=${endDate}`;

      const res = await fetch(url);
      const result = await res.json();
      if (res.ok) {
        setLaporanData(result.data || []);
      }
    } catch (err) {
      console.error('Gagal memuat data laporan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchLaporan();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search, startDate, endDate]);

  // Handler Generator PDF Client-side
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

      // ===== HEADER BISNIS =====
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
      doc.setFontSize(14);
      doc.text('LAPORAN PENJUALAN / ORDER', 105, 35, { align: 'center' });

      let dateRange = 'Semua Periode';
      if (startDate && endDate) dateRange = `${startDate} s/d ${endDate}`;
      else if (startDate) dateRange = `Mulai ${startDate}`;
      else if (endDate) dateRange = `Sampai ${endDate}`;

      doc.setTextColor(102, 102, 102);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Periode: ${dateRange}`, 105, 41, { align: 'center' });

      // ===== DATAFORMAT FOR AUTOTABLE =====
      const tableHeaders = [
        ['No.', 'Tanggal', 'ID Pesanan', 'Motif', 'Kategori', 'Qty', 'Lebar', 'Panjang', 'Total Harga'],
      ];

      let grandTotalSum = 0;
      const tableRows = laporanData.map((row, index) => {
        grandTotalSum += Number(row.total_harga || 0);

        const formattedDate = new Date(row.tanggal).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).replace(/\//g, '-');

        return [
          `${index + 1}.`,
          formattedDate,
          row.id_pesanan,
          row.motif,
          row.kategori,
          row.jumlah_order,
          `${row.lebar} cm`,
          `${row.panjang} Meter`,
          `Rp ${Number(row.total_harga || 0).toLocaleString('id-ID')},00`,
        ];
      });

      const tableFooters = [
        [
          { 
            content: 'TOTAL OMSET PENJUALAN:', 
            colSpan: 8, 
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
          5: { halign: 'center', width: 12 },
          6: { halign: 'center', width: 18 },
          7: { halign: 'center', width: 18 },
          8: { halign: 'right' },
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
      console.error('Gagal generate PDF:', err);
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
      {/* Struktur Judul Utama sesuai Request */}
      <div className="relative overflow-x-visible">
        <h2 className="text-lg sm:text-[24px] font-medium text-black pb-2 sm:pb-5 border-b border-gray-500 tracking-wide -mx-4 px-4 sm:-mx-6 sm:px-6">
          Laporan Order
        </h2>
      </div>

      {/* Kontainer Kotak Putih & Isian Konten */}
      <div className="p-6 bg-white border rounded-lg shadow-sm border-gray-200/60">
        <LaporanFilterBar
          search={search}
          setSearch={setSearch}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onExport={handleExportPDF}
          exportLoading={exportLoading}
        />

        <LaporanTable data={laporanData} loading={loading} />
      </div>
    </div>
  );
}