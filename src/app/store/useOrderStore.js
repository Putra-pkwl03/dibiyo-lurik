import { create } from 'zustand';

export const useOrderStore = create((set) => ({
  orderData: {
    customer: { nama: '', telpon: '', tgl: '', alamat: '' },
    items: [],
  },
  setOrderData: (data) => set((state) => ({ orderData: { ...state.orderData, ...data } })),
}));