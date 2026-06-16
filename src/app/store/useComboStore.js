// D:\dibiyo-lurik\src\app\store\useComboStore.js
import { create } from 'zustand'

export const useComboStore = create((set, get) => ({
  // 1. State Utama Penampung Kombinasi Kain Customizer
  combination: {
    badan: null,  // Menyimpan objek data kain/gulungan untuk area badan utama
    lengan: null, // Menyimpan objek data kain/gulungan untuk area lengan
    aksen: null,  // Menyimpan objek data kain/gulungan untuk kancing/kerah/saku
  },
  
  // State UI tambahan untuk penunjang animasi atau status loading
  isGeneratingPreview: false,
  activeSlot: 'badan', // Track slot mana yang sedang aktif dipilih user ('badan', 'lengan', 'aksen')

  // 2. Actions: Mengisi kain ke dalam slot tertentu
  setSlot: (slot, fabricData) => set((state) => ({
    combination: {
      ...state.combination,
      [slot]: fabricData ? {
        ...fabricData,
        panjang_order: fabricData.panjang_order || 1 // default beli 1 meter per komponen
      } : null
    }
  })),

  // 3. Actions: Mengubah kuantitas panjang kain (meter) per slot komponen
  updateSlotLength: (slot, length) => set((state) => {
    if (!state.combination[slot]) return state;
    return {
      combination: {
        ...state.combination,
        [slot]: {
          ...state.combination[slot],
          panjang_order: Math.max(1, length) // minimal pembelian 1 meter
        }
      }
    };
  }),
  
  // 4. Actions: Menghapus item dari slot spesifik
  clearSlot: (slot) => set((state) => ({
    combination: {
      ...state.combination,
      [slot]: null
    }
  })),

  // 5. Actions: Mengubah target slot yang sedang dipilih/diedit user
  setActiveSlot: (slot) => set({ activeSlot: slot }),

  // 6. Actions: Mengubah status loading render visualisasi baju
  setGeneratingPreview: (status) => set({ isGeneratingPreview: status }),

  // 7. Actions: Reset total konfigurasi padu padan kain kembali ke nol
  resetCombo: () => set({
    combination: { badan: null, lengan: null, aksen: null },
    activeSlot: 'badan',
    isGeneratingPreview: false
  }),

  // ==========================================
  // COMPUTED SELECTORS (GETTER JALUR CEPAT)
  // ==========================================

  // Menghitung total akumulasi estimasi harga dari kombinasi yang dirakit
  getTotalPrice: () => {
    const { combination } = get();
    return Object.values(combination).reduce((total, item) => {
      if (item && item.harga) {
        return total + (item.harga * (item.panjang_order || 1));
      }
      return total;
    }, 0);
  },

  // Validasi kelayakan: minimal komponen 'badan' wajib terisi untuk bisa di-checkout
  isValidCombo: () => {
    const { combination } = get();
    return combination.badan !== null;
  },

  // Ekstraksi payload bersih siap kirim ke API /api/keranjang masal
  getCartPayload: () => {
    const { combination } = get();
    return Object.entries(combination)
      .filter(([_, item]) => item !== null)
      .map(([slotName, item]) => ({
        gulungan_id: item.id || item.gulungan_id,
        jumlah_order: item.panjang_order || 1,
        catatan_kustom: `Bagian kustomisasi pakaian: ${slotName.toUpperCase()}`
      }));
  }
}));