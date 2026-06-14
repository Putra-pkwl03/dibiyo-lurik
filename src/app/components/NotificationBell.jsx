'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Clock, AlertCircle, X } from 'lucide-react'; // Ditambahkan icon X

export default function NotificationBell({ role = 'cs', currentType = 'reguler' }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getExpectedOrderCode = (type) => (type === 'custom' ? 'POC' : 'POR');

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifikasi?role=${role}`);
      const resJson = await res.json();
      setNotifications(resJson.data || []);
    } catch (err) {
      console.error('Gagal mengambil data notifikasi:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, [role]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = notifications.filter((item) => {
    return item.tipe_order === getExpectedOrderCode(currentType);
  });

  const unreadCount = filteredNotifications.filter((n) => !n.status_dibaca).length;

  const handleMarkAsRead = async (id, currentStatus) => {
    if (currentStatus === true) return;
    try {
      const res = await fetch('/api/notifikasi', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === id ? { ...notif, status_dibaca: true } : notif))
        );
      }
    } catch (err) {
      console.error('Gagal memperbarui status:', err);
    }
  };

  const handleDeleteSingle = async (e, id) => {
    e.stopPropagation(); 
    try {
      const res = await fetch(`/api/notifikasi?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      }
    } catch (err) {
      console.error('Gagal menghapus notifikasi:', err);
    }
  };

  const handleClearAll = async () => {
    const tipeOrder = getExpectedOrderCode(currentType);
    try {
      const res = await fetch(`/api/notifikasi?role=${role}&tipe_order=${tipeOrder}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((notif) => notif.tipe_order !== tipeOrder));
      }
    } catch (err) {
      console.error('Gagal membersihkan seluruh notifikasi:', err);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('id-ID', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderTruncatedPesan = (pesan) => {
    if (!pesan) return '';
    return pesan;
  };

  return (
    <div className="relative inline-block font-inter" ref={dropdownRef}>
      {/* Icon Tombol Lonceng */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-[38px] h-[38px] bg-[#5AE3ED1C] border border-[#1A335A]/20 hover:bg-[#5AE3ED33] text-stone-700 transition-all rounded-md"
      >
        <Bell size={16} className={unreadCount > 0 ? 'animate-bounce' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 overflow-hidden duration-150 bg-white border shadow-xl w-[calc(100vw-2rem)] sm:w-[420px] border-stone-200 rounded-xl animate-in fade-in slide-in-from-top-2">
          
          {/* Header Panel */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-stone-50 border-stone-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-black uppercase">
                Notifikasi PO {currentType === 'custom' ? 'Custom' : 'Reguler'}
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  {unreadCount} Baru
                </span>
              )}
            </div>
            
            {/* BUTTON BARU: Clear All */}
            {filteredNotifications.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="text-[10px] font-bold text-stone-400 hover:text-red-600 transition-colors bg-stone-100 hover:bg-red-50 px-2 py-1 rounded-md"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Body Konten */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-stone-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-6 text-xs font-medium text-center text-stone-400">
                Tidak ada notifikasi untuk Pre-Order {currentType === 'custom' ? 'Custom' : 'Reguler'}.
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id, item.status_dibaca)}
                  className={`group relative p-4 transition-colors cursor-pointer text-left ${
                    !item.status_dibaca ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-stone-50'
                  }`}
                >
                  <div className="flex gap-2.5 items-start pr-4">
                    {/* Icon Status Indicator */}
                    <div className={`mt-0.5 p-1 rounded-md shrink-0 ${
                      item.tipe_order === 'POC' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.tipe_order === 'POC' ? <AlertCircle size={13} /> : <Clock size={13} />}
                    </div>

                    {/* Detail Konten */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className={`text-xs font-bold truncate ${!item.status_dibaca ? 'text-blue-900' : 'text-stone-800'}`}>
                          {item.judul}
                        </p>
                        <span className="text-[9px] font-semibold text-stone-400 shrink-0 group-hover:opacity-0 transition-opacity">
                          {formatTime(item.created_at)}
                        </span>
                      </div>
                      
                      {/* Pesan Notifikasi */}
                      <p className="text-[11px] text-stone-600 font-medium leading-relaxed break-words">
                        {renderTruncatedPesan(item.pesan)}
                      </p>

                      {/* Badge Tipe */}
                      <span className={`inline-block mt-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                        item.tipe_order === 'POC' 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        #{item.tipe_order === 'POC' ? 'Custom' : 'Reguler'}
                      </span>
                    </div>

                    {/* Unread Dot Indicator */}
                    {!item.status_dibaca && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0 group-hover:opacity-0 transition-opacity" />
                    )}
                  </div>

                  {/* ICON BUTTON BARU: Tombol X kecil di pojok kanan atas saat di-hover */}
                  <button
                    onClick={(e) => handleDeleteSingle(e, item.id)}
                    className="absolute p-1 transition-all rounded-md opacity-0 right-2 top-3 text-stone-400 hover:text-stone-700 hover:bg-stone-200 group-hover:opacity-100"
                    title="Hapus"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}