'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

export default function LogoutModal({ isOpen, onClose, onConfirm, isLoggingOut }) {

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-[350px] rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h3 className="mb-2 text-lg font-bold text-gray-800">
              Konfirmasi Logout
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              Apakah Anda yakin ingin keluar dari sistem?
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                Batal
              </button>

              <button
                onClick={onConfirm}
                disabled={isLoggingOut}
                className="flex flex-1 items-center justify-center rounded-lg bg-[#1A335A] px-4 py-2 text-sm font-medium text-white hover:bg-[#244479] transition-colors"
              >
                {isLoggingOut ? 'Memproses...' : 'Ya, Keluar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}