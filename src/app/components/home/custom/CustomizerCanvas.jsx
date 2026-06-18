"use client"
import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Layers, Loader2, Scissors, Shirt, Sparkles } from 'lucide-react'
import JSZip from 'jszip';

export default function CustomizerCanvas({ 
  bgColor = '#132237', 
  patternDensity = 80, 
  stripes = [], 
  previewMode,
  setPreviewMode,
  onReset 
}) {
  const [subBawahan, setSubBawahan] = useState('kain'); 
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef(null);

  // FUNGSI UTAMA: Pembuat struktur anyaman garis dinamis otomatis dengan kalkulasi offset presisi
  const generateLurikGradient = () => {
    let gradientString = '';
    let currentOffset = 0;

    stripes.forEach((stripe) => {
      const startPoint = currentOffset;
      const endPoint = currentOffset + stripe.thickness;
      gradientString += `${stripe.color} ${startPoint}px, ${stripe.color} ${endPoint}px, `;
      gradientString += `transparent ${endPoint}px, transparent ${endPoint + 2}px, `;
      currentOffset = endPoint + 2; 
    });

    return {
      gradient: `linear-gradient(90deg, ${gradientString.slice(0, -2)})`,
      totalWidth: currentOffset
    };
  };

  const { gradient, totalWidth } = generateLurikGradient();
  const ukuranKerapatanDinamis = (totalWidth * (patternDensity / 100)) || 20;

  const patternStyle = {
    backgroundColor: bgColor, 
    backgroundImage: gradient,
    backgroundSize: `${ukuranKerapatanDinamis}px 100%`,
  };

  const handleResetDesain = () => {
    if (onReset) {
      onReset();
    } else {
      setSubBawahan('kain');
      setPreviewMode('fabric');
    }
  };

  // HANDLER 2: Mengambil screenshot elemen saat ini dan mengembalikannya dalam bentuk Base64 DataURL
  const captureElement = async (mode, subMode) => {
    const originalMode = previewMode;
    const originalSub = subBawahan;

    setPreviewMode(mode);
    if (subMode) setSubBawahan(subMode);
    
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (!canvasRef.current) return null;

    const canvas = await html2canvas(canvasRef.current, {
      useCORS: true, 
      backgroundColor: '#071110',
      scale: 2, 
      logging: false,
    });

    setPreviewMode(originalMode);
    setSubBawahan(originalSub);

    return canvas.toDataURL('image/png').split(',')[1]; 
  };

  // HANDLER 3: Bundle seluruh aset pratinjau hasil kustomisasi ke format arsip ZIP
  const handleUnduhSemuaBerkasZip = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const zip = new JSZip();
      const folderKustom = zip.folder("Hasil_Kustomisasi_Lurik");

      // 1. Ambal visualisasi mode kain utuh
      const fabricBase64 = await captureElement('fabric');
      if (fabricBase64) folderKustom.file("01_Pratinjau_Serat_Kain.png", fabricBase64, {base64: true});

      // 2. Ambil visualisasi mode kemeja baju
      const shirtBase64 = await captureElement('shirt');
      if (shirtBase64) folderKustom.file("02_Mockup_Kemeja_Lurik.png", shirtBase64, {base64: true});

      // 3. Ambil visualisasi mode setelan outfit penuh (dengan celana & kain gantung detail)
      const outfitKainBase64 = await captureElement('outfit', 'kain');
      if (outfitKainBase64) folderKustom.file("03_Setelan_Paduan_Kain_Lurik.png", outfitKainBase64, {base64: true});

      const outfitCelanaBase64 = await captureElement('outfit', 'celana');
      if (outfitCelanaBase64) folderKustom.file("04_Setelan_Paduan_Celana_Hitam.png", outfitCelanaBase64, {base64: true});

      // Generate & kompresi seluruh tumpukan file blob biner menjadi berkas .zip siap unduh
      const content = await zip.generateAsync({ type: "blob" });
      
      const linkDownload = document.createElement('a');
      linkDownload.href = URL.createObjectURL(content);
      linkDownload.download = `Lurik_Customizer_${Date.now()}.zip`;
      document.body.appendChild(linkDownload);
      linkDownload.click();
      document.body.removeChild(linkDownload);

    } catch (error) {
      console.error("Gagal memproses pembuatan paket unduhan berkas zip:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
     <div className="w-full lg:w-[55%] flex flex-col justify-between items-center bg-[#F5F2EB] border border-[#E5BA73]/10 rounded-3xl p-6 relative aspect-square lg:aspect-auto lg:h-[750px]">
            
      {/* 1. TOMBOL UTAMA SWITCH PREVIEW MODEL */}
      <div className="absolute top-6 right-6 bg-[#aa9e84] backdrop-blur-md border border-[#E5BA73]/20 rounded-xl p-1 flex gap-1 z-20">        {[
          { id: 'fabric', label: 'Kain', icon: <Scissors size={13} /> },
          { id: 'shirt', label: 'Baju', icon: <Shirt size={13} /> },
          { id: 'outfit', label: 'Setelan', icon: <Layers size={13} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPreviewMode(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all duration-300 flex items-center gap-1.5 ${
              previewMode === tab.id 
                ? 'bg-[#F5F2EB] text-[#0A1715] font-bold shadow-md' 
                : 'text-[#ffffff] hover:text-[#000000]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Badge Status Kiri Atas */}
      <div className="absolute z-10 flex items-center gap-2 top-7 left-6">
        <span className="w-2 h-2 bg-[#E5BA73] rounded-full animate-ping"></span>
        <span className="text-[10px] font-bold tracking-widest text-[#E5BA73] uppercase">
          {previewMode === 'fabric' ? 'Pratinjau Tenun Langsung' : 'Mockup Fitting Aktif'}
        </span>
      </div>

      {/* 2. AREA PREVIEW KANVAS UTAMA */}
        <div ref={canvasRef} className="w-full h-full mt-10 rounded-2xl shadow-inner relative overflow-hidden flex items-center justify-center border border-white/5 bg-[#9e9d9b44]">
        
        {/* JIKA MODE KAIN */}
        {previewMode === 'fabric' && (
          <div style={patternStyle} className="absolute inset-0 w-full h-full transition-all duration-300 ease-in-out animate-fade-in" />
        )}

        {/* JIKA MODE BAJU */}
        {previewMode === 'shirt' && (
          <div className="relative w-full h-full max-w-2xl max-h-[500px] flex items-center justify-center animate-scale-up">
            <div 
              style={{
                ...patternStyle,
                maskImage: "url('/mockups/shirt-long-front-mask.png')",
                WebkitMaskImage: "url('/mockups/shirt-long-front-mask.png')",
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
              }} 
              className="absolute inset-0 w-full h-full transition-all duration-300"
            />
            <img src="/mockups/shirt-long-front-mask.png" alt="Tekstur Baju" className="absolute inset-0 object-contain w-full h-full pointer-events-none mix-blend-multiply opacity-70" />
          </div>
        )}

        {/* JIKA MODE OUTFIT */}
        {previewMode === 'outfit' && (
          <div className="absolute inset-0 flex items-center justify-center w-full h-full p-6 animate-scale-up">
            <div className="relative w-full h-full max-w-3xl max-h-[600px] flex justify-between items-center">
              
              {/* ================= BARIS KIRI: AREA MODEL UTAMA (BAJU & BAWAHAN ASLI) ================= */}
              <div className="relative w-[65%] h-full">
                {(() => {
                  const posisiSetelan = {
                    baju: { X: '0%', Y: '-15%' },
                    bawahan: { X: '-29%', Y: '9%' }
                  };

                  return (
                    <>
                      {/* AREA BAWAHAN MODEL */}
<div 
  className="absolute inset-0 z-0 transform transition-all duration-300 scale-[1.05]"
  style={{ transform: `translate(${posisiSetelan.bawahan.X}, ${posisiSetelan.bawahan.Y})` }}
>
  <img 
    src="/mockups/pants-black-fixture.png" 
    alt="Celana Hitam Pasangan Kemeja" 
    className="object-contain w-full h-full pointer-events-none"
  />
</div>

                      {/* AREA ATASAN (KEMEJA) */}
                      <div 
                        className="absolute inset-0 z-10 transition-all duration-300 transform"
                        style={{ transform: `translate(${posisiSetelan.baju.X}, ${posisiSetelan.baju.Y})` }}
                      >
                        <div 
                          style={{
                            ...patternStyle,
                            maskImage: "url('/mockups/shirt-long-front-mask.png')",
                            WebkitMaskImage: "url('/mockups/shirt-long-front-mask.png')",
                            maskSize: 'contain',
                            WebkitMaskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center'
                          }} 
                          className="absolute inset-0 w-full h-full transition-all duration-300"
                        />
                        <img 
                          src="/mockups/shirt-long-front-mask.png" 
                          alt="Tekstur Atasan" 
                          className="object-contain w-full h-full pointer-events-none mix-blend-multiply opacity-60" 
                        />
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* ================= BARIS KANAN: DISPLAY MOCKUP KAIN GANTUNG BARU (REPRESENTATIF CUSTOM) ================= */}
              <div className="relative w-[32%] h-[55%] flex flex-col items-center justify-between bg-[#12110F]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-3 animate-fade-in shadow-xl">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5BA73]/80 mb-2 block text-center w-full border-b border-white/5 pb-1.5">
                  Detail Tekstur
                </span>
                
                <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
                  <div 
                    style={{
                      ...patternStyle,
                      maskImage: "url('/mockups/kain-gantung-mask.png')",
                      WebkitMaskImage: "url('/mockups/kain-gantung-mask.png')",
                      maskSize: 'contain',
                      WebkitMaskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center'
                    }}
                    className="absolute inset-0 z-0 w-full h-full transition-all duration-300 ease-in-out"
                  />
                  
                  <img 
                    src="/mockups/kain-gantung-mask.png" 
                    alt="Tekstur Sampel Kain Kustom" 
                    className="absolute inset-0 z-10 object-contain w-full h-full pointer-events-none mix-blend-multiply opacity-90"
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Efek Tekstur Serat Kain Kedalaman Gradasi Global */}
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
      </div>

      {/* Floating Action Menu Bawah */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#12110F]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl z-10">
        <button 
          onClick={handleResetDesain} 
          title="Reset Desain" 
          className="text-[#A3A19E] hover:text-[#E5BA73] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18"/></svg>
        </button>
        <button 
          onClick={handleUnduhSemuaBerkasZip}
          disabled={isDownloading}
          className={`flex items-center gap-2 text-xs font-bold transition-colors tracking-wide ${isDownloading ? 'text-[#E5BA73]/50 cursor-not-allowed' : 'text-[#F9F6F0] hover:text-[#E5BA73]'}`}
        >
          <svg className={`w-5 h-5 ${isDownloading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isDownloading ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            )}
          </svg>
          {isDownloading ? 'Memproses ZIP Berkas...' : 'Unduh Berkas'}
        </button>
      </div>

    </div>
  );
}