'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChevronRight, ChevronDown, ChevronUp, Download } from 'lucide-react';
import jsPDF from 'jspdf';

export default function RekapStokPage() {
  const params = useParams();
  const lebar = params?.lebar;
  const angkaLebar = lebar?.replace('lebar', '');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk interaksi
  const [expandedRaks, setExpandedRaks] = useState({}); 
  const [limitRaks, setLimitRaks] = useState(4); 

  useEffect(() => {
    if (!angkaLebar) return;
    fetch(`/api/rekap-gulungan?lebar=${angkaLebar}`)
      .then((res) => res.json())
      .then((res) => {
        const grouped = res.data.items.reduce((acc, item) => {
          const rakNama = item.rak?.nama || 'Tanpa Rak';
          if (!acc[rakNama]) acc[rakNama] = [];
          acc[rakNama].push(item);
          return acc;
        }, {});
        setData(grouped);
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [angkaLebar]);

  // Fungsi Export PDF Menggunakan jsPDF secara manual & bersih
  const exportToPDF = () => {
    if (!data) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let currentY = 20;

    // Title / Header PDF
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`REKAP STOK GULUNGAN - LEBAR ${angkaLebar} CM`, 14, currentY);
    currentY += 10;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Total Keseluruhan: ${totalKeseluruhan} meter`, 14, currentY);
    currentY += 10;

    // Loop data rak untuk dicetak ke PDF
    Object.entries(data).forEach(([rakNama, items]) => {
      // Cek limit halaman agar tidak overflow ke bawah
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`RAK: ${rakNama} (${items.length} gulungan)`, 14, currentY);
      currentY += 6;

      // Table Header Ringkas
      doc.setFontSize(10);
      doc.setFillColor(26, 51, 90); // Warna Navy #1A335A
      doc.rect(14, currentY, 182, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('No.', 16, currentY + 5);
      doc.text('Kode Produk', 30, currentY + 5);
      doc.text('Motif', 80, currentY + 5);
      doc.text('Jenis Pewarna', 130, currentY + 5);
      doc.text('Sisa (M)', 175, currentY + 5);
      
      currentY += 7;
      doc.setTextColor(0, 0, 0);
      doc.setFont('Helvetica', 'normal');

      // Table Rows
      items.forEach((item, idx) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.text(`${idx + 1}.`, 16, currentY + 5);
        doc.text(item.produk?.kode_produk || '-', 30, currentY + 5);
        doc.text(item.produk?.motif?.nama || '-', 80, currentY + 5);
        doc.text(item.produk?.jenis_pewarna || '-', 130, currentY + 5);
        doc.text(`${item.panjang_sisa || 0}`, 175, currentY + 5);
        
        // Garis pemisah baris tipis
        doc.setDrawColor(230, 230, 230);
        doc.line(14, currentY + 7, 196, currentY + 7);

        currentY += 7;
      });

      // Total per rak
      const totalPerRak = items.reduce((sum, item) => sum + (item.panjang_sisa || 0), 0);
      doc.setFont('Helvetica', 'bold');
      doc.text(`Total Rak ${rakNama}: ${totalPerRak} Meter`, 140, currentY + 5);
      
      currentY += 15; // Jarak antar rak
    });

    // Simpan dokumen PDF
    doc.save(`rekap-stok-lebar-${angkaLebar}cm.pdf`);
  };

  if (error) return <div className="p-10 text-red-500 font-inter">Error: {error}</div>;

  const rakEntries = data ? Object.entries(data) : [];
  const totalKeseluruhan = data ? Object.values(data).flat().reduce((sum, item) => sum + (item.panjang_sisa || 0), 0) : 0;

  return (
    <div className="mx-auto font-inter">
      {/* Breadcrumbs */}
      <div className="flex items-center mb-2 text-xs font-medium text-gray-400">
        <h3>Rekap Stok Gulungan</h3>
        <ChevronRight className="w-3.5 h-3.5 mx-1" />
        <span>Lebar {angkaLebar || '...'} cm</span>
      </div>

      {/* Judul Besar */}
      <h1 className="pb-2 mb-6 text-xl font-bold border-b border-gray-100 text-[#1A335A]">
        Rekap Stok - Lebar {angkaLebar || '...'} cm
      </h1>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          {/* Skeleton Box Total Keseluruhan */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-amber-400/20 border-amber-200">
            <div className="w-1/3 h-6 rounded bg-stone-200"></div>
            <div className="w-24 rounded h-9 bg-stone-200"></div>
          </div>

          {/* Skeleton List Blok Rak */}
          {[...Array(2)].map((_, rIdx) => (
            <div key={rIdx} className="mb-5 overflow-hidden bg-white border border-gray-100 rounded-lg shadow-sm">
              <div className="p-4 bg-gray-100 border-b border-gray-200">
                <div className="w-24 h-5 rounded bg-stone-200"></div>
              </div>
              <div className="p-4 space-y-4">
                <div className="w-full h-10 rounded bg-stone-100"></div>
                <div className="space-y-3">
                  {[...Array(2)].map((_, rowIdx) => (
                    <div key={rowIdx} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                      <div className="w-6 h-4 rounded bg-stone-200"></div>
                      <div className="w-12 h-12 rounded bg-stone-200"></div>
                      <div className="grid flex-1 grid-cols-5 gap-3">
                        <div className="h-4 rounded bg-stone-200"></div>
                        <div className="h-4 rounded bg-stone-200"></div>
                        <div className="h-4 rounded bg-stone-200"></div>
                        <div className="h-4 rounded bg-stone-200"></div>
                        <div className="h-4 rounded bg-stone-200"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>

        <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div className="bg-[#1A335A14] border border-[#1A335A1F] p-3 rounded-lg flex-1">
            <p className="text-base font-bold tracking-wide text-[#1A335A]">
              Total Keseluruhan : {totalKeseluruhan} meter
            </p>
          </div>

          <button
            onClick={exportToPDF}
            className="flex items-center justify-center gap-2 bg-[#1A335A] hover:bg-[#122440] text-white px-5 h-[47px] rounded-lg text-xs font-bold transition-all shadow-sm min-w-max self-end sm:self-auto"
          >
            <Download size={14} />
            <span>Export PDF</span>
          </button>
        </div>

          <div className="space-y-5 rak-container">
            {rakEntries.slice(0, limitRaks).map(([rakNama, items]) => {
              const isExpanded = expandedRaks[rakNama];
              const displayItems = isExpanded ? items : [items[0]];
              const totalPerRak = items.reduce((sum, item) => sum + (item.panjang_sisa || 0), 0);
              const jumlahGulungan = items.length; 

              return (
                <div key={rakNama} className="overflow-hidden duration-200 bg-white border border-gray-200 rounded-lg shadow-sm">
                  
                  {/* Kepala Rak (Header Dropdown) */}
                  <div className="flex items-center justify-between bg-[#FFECA7] px-5 py-3.5 font-bold text-[#1A335A] text-sm border-b border-gray-300">
                    <div className="flex items-center gap-2">
                      <span>Rak {rakNama}</span>
                      <span className="text-xs font-medium text-[#1A335A]/70">
                        ({jumlahGulungan} gulangan)
                      </span>
                    </div>
                    
                    <div>
                      {items.length > 1 ? (
                        <button 
                          onClick={() => setExpandedRaks(prev => ({...prev, [rakNama]: !isExpanded}))}
                          className="text-[#1A335A] hover:text-[#11223d] transition-colors flex items-center"
                        >
                          {isExpanded ? <ChevronUp size={18} strokeWidth={2.5} /> : <ChevronDown size={18} strokeWidth={2.5} />}
                        </button>
                      ) : (
                        <ChevronDown size={18} className="text-gray-400 opacity-40" />
                      )}
                    </div>
                  </div>
                  
                  {/* Badan Tabel Rak */}
                  <div className="p-4 overflow-x-auto text-black">
                    <table className="w-full text-left min-w-[700px] text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-[#1A335A] text-white rounded-md font-bold">
                          <th className="p-3 rounded-l-md w-[50px]">No.</th>
                          <th className="p-3 w-[100px]">Gambar</th>
                          <th className="p-3">Kode Produk</th>
                          <th className="p-3">Lebar</th>
                          <th className="p-3">Motif</th>
                          <th className="p-3">Jenis Pewarna</th>
                          <th className="p-3 pr-6 text-right rounded-r-md">Panjang sisa</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {displayItems.map((item, idx) => (
                          <tr key={item.id} className="transition-all border-b border-gray-100 hover:bg-gray-50/80">
                            <td className="p-3 font-medium text-gray-500">{idx + 1}.</td>
                            <td className="p-3">
                              {item.produk?.gambar_url ? (
                                <img src={item.produk.gambar_url} className="object-cover border border-gray-200 rounded-md shadow-sm w-11 h-11" alt="produk" />
                              ) : (
                                <div className="flex items-center justify-center w-11 h-11 text-[9px] text-gray-400 bg-gray-100 rounded-md border border-gray-200">No Img</div>
                              )}
                            </td>
                            <td className="p-3 font-bold text-gray-700">{item.produk?.kode_produk || '-'}</td>
                            <td className="p-3 font-medium text-gray-600">{item.lebar} cm</td>
                            <td className="p-3 font-semibold text-gray-700">{item.produk?.motif?.nama || '-'}</td>
                            <td className="p-3 text-gray-600">{item.produk?.jenis_pewarna || '-'}</td>
                            <td className="p-3 pr-6 font-bold text-right text-gray-900">{item.panjang_sisa} Meter</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <div className="pr-4 mt-4 text-xs font-bold text-right text-[#1A335A] tracking-wide">
                      Total : {totalPerRak} Meter
                    </div>
                  </div>
                </div>
              );
            })}

            {rakEntries.length > limitRaks && (
              <button 
                onClick={() => setLimitRaks(prev => prev + 4)}
                className="w-full py-3 flex justify-center text-[#1A335A] hover:text-[#11223d] transition-colors animate-bounce mt-4"
              >
                <ChevronDown size={28} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}