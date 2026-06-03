import React from "react";
import { X, ThumbsUp } from "lucide-react";

export default function SuccessModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] relative animate-in fade-in zoom-in-95 duration-150">
        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-4 right-4 text-[#1A335A] hover:opacity-80 transition-opacity"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <ThumbsUp size={56} className="text-[#1A335A] mb-5" strokeWidth={1.5} />
          <p className="text-[#000000] text-[18px] font-bold text-center">
            Perubahan Berhasil Disimpan
          </p>
        </div>
      </div>
    </div>
  );
}