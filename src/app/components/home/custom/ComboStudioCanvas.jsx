"use client"

import { useRef, useState, useEffect } from 'react'
import { Layers, Loader2, Scissors, Shirt, Sparkles } from 'lucide-react'
import html2canvas from 'html2canvas'
import JSZip from 'jszip'

const extractDominantColor = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 1, 1);
      
      try {
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        resolve(`rgb(${r}, ${g}, ${b})`);
      } catch (e) {
        resolve('#E5BA73');
      }
    };
    img.onerror = () => resolve('transparent');
  });
};

export default function ComboStudioCanvas({ 
  combination,
  bgColor,          
  setBgColor,       
  patternDensity,   
  stripes,          
  setStripes,

}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null) // Tambahan Ref untuk menembak html2canvas pada area mockup
  const isExtractedRef = useRef('') 
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false) // State loading unduhan
  const [previewView, setPreviewView] = useState('kain')
  const [subBawahan, setSubBawahan] = useState('kain')
  const [canvasUrl, setCanvasUrl] = useState('none')

  const activeImageUrls = Object.values(combination)
    .filter(item => item !== null)
    .map(item => item.gambar_url)

  const combinationKey = Object.entries(combination)
    .map(([slot, item]) => `${slot}:${item ? item.id || item.nomor_gulungan : 'null'}`)
    .join('|');

  // Efek Ekstraksi Warna Dominan
  useEffect(() => {
    if (isExtractedRef.current === combinationKey) return;

    if (activeImageUrls.length > 0) {
      setIsLoading(true);
      
      const promises = activeImageUrls.map(url => extractDominantColor(url));
      Promise.all(promises).then(colors => {
        const validColors = colors.filter(c => c !== 'transparent');
        
        if (validColors.length > 0 && setBgColor) {
          setBgColor(validColors[0]);
        }

        if (setStripes) {
          const initialStripes = validColors.map((color, idx) => ({
            id: idx + 1,
            thickness: 16, 
            color: color
          }));
          setStripes(initialStripes);
        }
        
        isExtractedRef.current = combinationKey;
        setIsLoading(false);
      });
    } else {
      if (setStripes) setStripes([]);
      isExtractedRef.current = '';
    }
  }, [combinationKey]); 

  // Efek Menggambar Utama ke Canvas HTML5
  useEffect(() => {
    if (canvasRef.current && stripes.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      const rect = canvas.parentElement.getBoundingClientRect();
      const actualWidth = rect.width || 500;
      const actualHeight = rect.height || 500;

      canvas.width = actualWidth * window.devicePixelRatio;
      canvas.height = actualHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      const w = actualWidth;
      const h = actualHeight;

      ctx.clearRect(0, 0, w, h);
      
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = bgColor || '#12110F';
      ctx.fillRect(0, 0, w, h);

      const scaleMultiplier = (patternDensity / 100) || 1.0;
      
      const basePatternWidth = stripes.reduce((acc, s) => acc + (parseInt(s.thickness, 10) || 1) + 2, 0);
      const scaledPatternWidth = basePatternWidth * scaleMultiplier;

      let currentX = 0;
      
      if (scaledPatternWidth > 0) {
        while (currentX < w) {
          for (let i = 0; i < stripes.length; i++) {
            const stripe = stripes[i];
            const currentStripeWidth = (parseInt(stripe.thickness, 10) || 1) * scaleMultiplier;
            
            ctx.fillStyle = stripe.color;
            ctx.fillRect(currentX, 0, currentStripeWidth, h);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
            ctx.fillRect(currentX + currentStripeWidth, 0, 2 * scaleMultiplier, h);

            currentX += currentStripeWidth + (2 * scaleMultiplier);
            if (currentX >= w) break;
          }
        }
      }

      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.07; 
      for (let x = 0; x < w; x += 3) {
        ctx.fillStyle = x % 6 === 0 ? '#000000' : '#ffffff';
        ctx.fillRect(x, 0, 1.5, h);
      }
      for (let y = 0; y < h; y += 3) {
        ctx.fillStyle = y % 6 === 0 ? '#000000' : '#ffffff';
        ctx.fillRect(0, y, w, 1.5);
      }

      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.42;
      const foldGrad = ctx.createLinearGradient(0, 0, w, 0);
      foldGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.65)');
      foldGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.15)');
      foldGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.52)');
      foldGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.22)');
      foldGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.55)');
      foldGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.68)');
      ctx.fillStyle = foldGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      const vignette = ctx.createRadialGradient(w/2, h/2, Math.min(w,h) * 0.38, w/2, h/2, Math.max(w,h) * 0.85);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      setCanvasUrl(`url(${canvas.toDataURL()})`);
    }
  }, [bgColor, patternDensity, stripes, previewView]);

  const baseCanvasPatternStyle = {
    backgroundColor: bgColor || '#132237',
    backgroundImage: canvasUrl,
    backgroundSize: 'cover', 
  };

  // LOGIK RESET DESAIN
  const handleResetDesain = () => {
    if (onReset) {
      onReset();
    } else {
      setPreviewView('kain');
      setSubBawahan('kain');
    }
  };

  // LOGIK SCREENSHOT ELEMENT (Html2Canvas & Native Canvas)
  const captureElement = async (viewMode, subMode) => {
    const originalView = previewView;
    const originalSub = subBawahan;

    setPreviewView(viewMode);
    if (subMode) setSubBawahan(subMode);

    // Beri jeda waktu agar DOM melakukan re-render transisi state secara mulus
    await new Promise((resolve) => setTimeout(resolve, 350));

    let base64Data = "";

    if (viewMode === 'kain') {
      // Jika mode kain, langsung ambil dataURL dari native canvas HTML5 (Hasil jauh lebih bersih & HD)
      if (canvasRef.current) {
        base64Data = canvasRef.current.toDataURL('image/png').split(',')[1];
      }
    } else {
      // Jika mode baju/setelan, gunakan html2canvas pada wrapper containerRef
      if (containerRef.current) {
        const screenshot = await html2canvas(containerRef.current, {
          useCORS: true,
          backgroundColor: '#071110',
          scale: 2,
          logging: false
        });
        base64Data = screenshot.toDataURL('image/png').split(',')[1];
      }
    }

    // Kembalikan view state awal user ke posisi semula
    setPreviewView(originalView);
    setSubBawahan(originalSub);

    return base64Data;
  };

  // LOGIK BUNDLE UNDUH ZIP
  const handleUnduhSemuaBerkasZip = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const zip = new JSZip();
      const folderCombo = zip.folder("Hasil_Kombinasi_Studio_Lurik");

      // 1. Capture Pratinjau Serat Kain Murni
      const fabricBase64 = await captureElement('kain');
      if (fabricBase64) folderCombo.file("01_Pratinjau_Serat_Kain.png", fabricBase64, { base64: true });

      // 2. Capture Mockup Baju Kemeja
      const shirtBase64 = await captureElement('baju');
      if (shirtBase64) folderCombo.file("02_Mockup_Kemeja_Lurik.png", shirtBase64, { base64: true });

      // 3. Capture Setelan Pasangan Kain Gantung
      const outfitKainBase64 = await captureElement('setelan', 'kain');
      if (outfitKainBase64) folderCombo.file("03_Setelan_Paduan_Kain.png", outfitKainBase64, { base64: true });

      // 4. Capture Setelan Pasangan Celana Hitam
      const outfitCelanaBase64 = await captureElement('setelan', 'celana');
      if (outfitCelanaBase64) folderCombo.file("04_Setelan_Paduan_Celana.png", outfitCelanaBase64, { base64: true });

      // Generate File biner blob berkas .zip
      const content = await zip.generateAsync({ type: "blob" });

      const linkDownload = document.createElement('a');
      linkDownload.href = URL.createObjectURL(content);
      linkDownload.download = `Combo_Studio_${Date.now()}.zip`;
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
    <div className="w-full lg:w-[55%] flex flex-col bg-[#071110] border border-[#E5BA73]/10 rounded-3xl p-6 relative h-[600px] lg:h-[750px]">
      
      <div className="absolute z-20 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center top-6 left-6 right-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
            {previewView === 'kain' ? 'Pratinjau Tenun Langsung' : 'Mockup Fitting Aktif'}
          </span>
        </div>

        <div className="flex gap-1 p-1 border bg-black/40 backdrop-blur-md border-white/10 rounded-xl">
          <button
            type="button"
            onClick={() => setPreviewView('kain')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              previewView === 'kain' ? 'bg-[#E5BA73] text-[#0A1715] shadow-md' : 'text-zinc-400 hover:text-[#F9F6F0]'
            }`}
          >
            <Scissors size={11} /> Kain
          </button>
          <button
            type="button"
            onClick={() => setPreviewView('baju')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              previewView === 'baju' ? 'bg-[#E5BA73] text-[#0A1715] shadow-md' : 'text-zinc-400 hover:text-[#F9F6F0]'
            }`}
          >
            <Shirt size={11} /> Baju
          </button>
          <button
            type="button"
            onClick={() => setPreviewView('setelan')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              previewView === 'setelan' ? 'bg-[#E5BA73] text-[#0A1715] shadow-md' : 'text-zinc-400 hover:text-[#F9F6F0]'
            }`}
          >
            <Sparkles size={11} /> Setelan
          </button>
        </div>
      </div>

      {previewView === 'setelan' && (
        <div className="absolute top-20 right-6 z-20 flex flex-col gap-2 items-end bg-[#12110F]/80 p-3 rounded-xl border border-white/5 backdrop-blur-md">
          <div className="flex gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
            <button 
              type="button"
              onClick={() => setSubBawahan('kain')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${subBawahan === 'kain' ? 'bg-[#E5BA73] text-[#0A1715] font-bold' : 'text-[#A3A19E]'}`}
            >
              + Lipatan Kain
            </button>
            <button 
              type="button"
              onClick={() => setSubBawahan('celana')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${subBawahan === 'celana' ? 'bg-[#E5BA73] text-[#0A1715] font-bold' : 'text-[#A3A19E]'}`}
            >
              + Celana Hitam
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm rounded-2xl">
          <Loader2 className="animate-spin text-[#E5BA73]" size={32} />
          <p className="text-sm text-[#F9F6F0]">Menganalisis jalinan warna serat...</p>
        </div>
      )}

      {/* Ditambahkan containerRef di elemen pembungkus ini agar html2canvas merekam aset canvas/baju/outfit secara utuh */}
      <div ref={containerRef} className="w-full h-full mt-10 rounded-2xl shadow-2xl relative overflow-hidden border border-white/5  bg-[#9e9d9b44] backdrop-blur-sm flex items-center justify-center">
        {activeImageUrls.length === 0 && stripes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <Layers className="text-zinc-600" size={32} />
            <p className="text-sm text-[#A3A19E]">Belum ada kain yang dipilih.</p>
          </div>
        ) : (
          <div className="relative flex items-center justify-center w-full h-full">
            <canvas 
              ref={canvasRef} 
              className={`block w-full h-full transition-all duration-300 rounded-2xl ${
                previewView !== 'kain' ? 'absolute opacity-0 pointer-events-none' : 'relative opacity-100'
              }`}
            />

            {previewView === 'baju' && (
              <div className="relative w-full h-full max-w-2xl max-h-[500px] flex items-center justify-center">
                <div 
                  style={{
                    ...baseCanvasPatternStyle,
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

            {previewView === 'setelan' && (
              <div className="absolute inset-0 flex items-center justify-center w-full h-full p-6">
                <div className="relative w-full h-full max-w-3xl max-h-[600px] flex justify-between items-center">
                  <div className="relative w-[65%] h-full">
                    <div className="absolute inset-0 z-0 transform transition-all duration-300 scale-[1.05] translate-x-[-29%] translate-y-[9%]">
                      {subBawahan === 'celana' ? (
                        <img src="/mockups/pants-black-fixture.png" alt="Celana Hitam" className="object-contain w-full h-full pointer-events-none" />
                      ) : (
                        <div className="relative w-full h-full">
                          <div 
                            style={{
                              ...baseCanvasPatternStyle,
                              maskImage: "url('/mockups/outfit-kain-mask.png')",
                              WebkitMaskImage: "url('/mockups/outfit-kain-mask.png')",
                              maskSize: 'contain',
                              WebkitMaskSize: 'contain',
                              maskRepeat: 'no-repeat',
                              maskPosition: 'center'
                            }}
                            className="absolute inset-0 w-full h-full transition-all duration-300"
                          />
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 z-10 transition-all duration-300 transform translate-y-[-15%]">
                      <div 
                        style={{
                          ...baseCanvasPatternStyle,
                          maskImage: "url('/mockups/shirt-long-front-mask.png')",
                          WebkitMaskImage: "url('/mockups/shirt-long-front-mask.png')",
                          maskSize: 'contain',
                          WebkitMaskSize: 'contain',
                          maskRepeat: 'no-repeat',
                          maskPosition: 'center'
                        }} 
                        className="absolute inset-0 w-full h-full transition-all duration-300"
                      />
                      <img src="/mockups/shirt-long-front-mask.png" alt="Tekstur Atasan" className="object-contain w-full h-full pointer-events-none mix-blend-multiply opacity-60" />
                    </div>
                  </div>

                  <div className="relative w-[32%] h-[55%] flex flex-col items-center justify-between bg-[#12110F]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-3 shadow-xl">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5BA73]/80 mb-2 block text-center w-full border-b border-white/5 pb-1.5">
                      Detail Tekstur
                    </span>
                    <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
                      <div 
                        style={{
                          ...baseCanvasPatternStyle,
                          maskImage: "url('/mockups/kain-gantung-mask.png')",
                          WebkitMaskImage: "url('/mockups/kain-gantung-mask.png')",
                          maskSize: 'contain',
                          WebkitMaskSize: 'contain',
                          maskRepeat: 'no-repeat',
                          maskPosition: 'center'
                        }}
                        className="absolute inset-0 z-0 w-full h-full transition-all duration-300"
                      />
                      <img src="/mockups/kain-gantung-mask.png" alt="Tekstur Sampel Kain" className="absolute inset-0 z-10 object-contain w-full h-full pointer-events-none mix-blend-multiply opacity-90" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm border border-white/5 px-2.5 py-1 rounded-md text-[9px] uppercase tracking-widest text-[#E5BA73] font-medium pointer-events-none z-10">
              Mode: {previewView}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Menu Bagian Bawah (Reset & Unduh ZIP) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#12110F]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl z-10">
        <button 
          type="button"
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

      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,rgba(229,186,115,0.2)_0%,transparent_50%)] pointer-events-none" />
    </div>
  )
}