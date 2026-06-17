'use client'

export const dynamic = 'force-dynamic'; 

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useRealtime } from '@upstash/realtime/client'
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Database, FileText, User, LogOut, ChevronDown, ClipboardList,
  Layers, Clock7, X, BaggageClaim
} from 'lucide-react'
import { motion } from 'framer-motion'
import Swal from 'sweetalert2';
import NProgress from 'nprogress';
import LogoutModal from '@/app/components/LogoutModal';

const getCookie = (name) => {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift() 
  return null
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [openSubMenu, setOpenSubMenu] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  const [role, setRole] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [cartCount, setCartCount] = useState(0)
  const [animateBadge, setAnimateBadge] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const [poRegulerCount, setPoRegulerCount] = useState(0)
  const [poCustomCount, setPoCustomCount] = useState(0)
  const [animatePoBadge, setAnimatePoBadge] = useState(false)

  const totalPoNotificationCount = poRegulerCount + poCustomCount;

  useEffect(() => {
    const userRole = getCookie('user-role')
    if (userRole) {
      setRole(userRole.toLowerCase())
    }
    const event = new CustomEvent("sidebarToggle", { detail: { isCollapsed: false } });
    window.dispatchEvent(event);
  }, [])

  useRealtime({
    event: '*', 
    history: false,
    enabled: !!role, 
    onData(payload) {
      const eventName = payload.event; 
      const data = payload.data;

      if (!data) return;

      const rawType = (data.tipe || data.type || '').toLowerCase();
      const isCustomOrder = rawType.includes('custom') || rawType.includes('poc');

      if (role === 'kepala_produksi' && eventName === 'notification.created') {
        if (isCustomOrder) {
          setPoCustomCount((prev) => prev + 1);
        } else {
          setPoRegulerCount((prev) => prev + 1);
        }
        setAnimatePoBadge(true);

        try {
          const audio = new Audio('https://signals.nextjs.org/signals.mp3');
          audio.volume = 0.4;
          audio.play().catch(() => {});
        } catch (e) {}

        Swal.fire({
          title: isCustomOrder ? 'Pesanan Custom Baru!' : 'Pesanan Reguler Baru!',
          text: data.pesan,
          icon: 'info',
          position: 'top-end',
          toast: true,                 
          showConfirmButton: true,
          confirmButtonText: 'Lihat',   
          confirmButtonColor: '#1A335A',
          showCancelButton: false,     
          timer: 12000,
          timerProgressBar: true,
          customClass: {
            popup: 'colored-toast'     
          }
        }).then((result) => {
          if (result.isConfirmed) {
            router.push(`/dashboard/kp/po?tipe=${isCustomOrder ? 'custom' : 'reguler'}`);
            router.refresh();
          }
        });
      }

      if ((role === 'cs' || role === 'customer_service') && eventName === 'notification.completed') {
        if (isCustomOrder) {
          setPoCustomCount((prev) => prev + 1);
        } else {
          setPoRegulerCount((prev) => prev + 1);
        }
        setAnimatePoBadge(true);

        try {
          const audio = new Audio('https://signals.nextjs.org/signals.mp3');
          audio.volume = 0.4;
          audio.play().catch(() => {});
        } catch (e) {}

        Swal.fire({
          title: `Produksi Selesai!`,
          text: data.pesan,
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 12000, 
          timerProgressBar: true,
        });
      }
    },
  });

  useEffect(() => {
    if (!role) return;

    if (role === 'kepala_produksi' && pathname.includes('/po')) {
      const currentTipe = searchParams.get('tipe');
      if (currentTipe === 'reguler') {
        setPoRegulerCount(0);
      } else if (currentTipe === 'custom') {
        setPoCustomCount(0);
      }
    }
    
    if ((role === 'cs' || role === 'customer_service') && pathname.includes('/cs/po/')) {
      if (pathname.endsWith('/reguler')) {
        setPoRegulerCount(0);
      } else if (pathname.endsWith('/custom')) {
        setPoCustomCount(0);
      }
    }
  }, [pathname, searchParams, role])

  useEffect(() => {
    if (animatePoBadge) {
      const timer = setTimeout(() => setAnimatePoBadge(false), 300)
      return () => clearTimeout(timer)
    }
  }, [animatePoBadge])

  useEffect(() => {
    const handleUpdateCartCount = (e) => {
      const ditambahkan = e.detail?.count || 1;
      setCartCount((prev) => prev + ditambahkan);
      setAnimateBadge(true); 
    };

    window.addEventListener("updateCartCount", handleUpdateCartCount);
    return () => window.removeEventListener("updateCartCount", handleUpdateCartCount);
  }, []); 

  useEffect(() => {
    const fetchInitialCartCount = async () => {
      try {
        const res = await fetch("/api/keranjang")
        const result = await res.json()
        if (res.ok && result.data) {
          setCartCount(result.data.length)
        }
      } catch (err) {}
    }

    if (role === 'cs' || role === 'customer_service') {
      fetchInitialCartCount()
    }
  }, [role]) 

  useEffect(() => {
    if (animateBadge) {
      const timer = setTimeout(() => setAnimateBadge(false), 300);
      return () => clearTimeout(timer);
    }
  }, [animateBadge]);

  useEffect(() => {
    if (pathname.startsWith('/dashboard/kp/md') || pathname.startsWith('/dashboard/kp/md/produk')) {
      setOpenSubMenu('Master Data')
    } else if (pathname.includes('/rsg/')) {
      setOpenSubMenu('Rekap Stok Gulungan')
    } else if (pathname.includes('/po')) {
      setOpenSubMenu('Pre Order')
    } else if (pathname.includes('/rp/')) {
      setOpenSubMenu('Riwayat Pemesanan')
    } else if (pathname.includes('/laporan/')) {
      setOpenSubMenu('Laporan')
    }
  }, [pathname])

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    const event = new CustomEvent("sidebarToggle", { detail: { isCollapsed: nextState } });
    window.dispatchEvent(event);
  }

  const masterMenuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: ['kepala_produksi', 'cs', 'customer_service', 'owner'] },
    { name: 'Order', icon: <FileText size={20} />, path: '/dashboard/cs/order', roles: ['cs', 'customer_service'] },
    { name: 'Keranjang', icon: <ShoppingCart size={20} />, path: '/dashboard/cs/keranjang', roles: ['cs', 'customer_service'], hasBadge: true },
    { name: 'Pesanan', icon: <BaggageClaim size={20} />, path: '/dashboard/cs/pesanan', roles: ['cs', 'customer_service'] },
    { 
      name: 'Master Data', 
      icon: <Database size={20} />, 
      roles: ['kepala_produksi'], 
      subMenu: [
        { name: 'Kategori', path: '/dashboard/kp/md/kategori' },
        { name: 'Motif', path: '/dashboard/kp/md/motif' },
        { name: 'Rak', path: '/dashboard/kp/md/rak' },
        { name: 'Daftar Harga', path: '/dashboard/kp/md/dh' },
        { name: 'Gulungan', path: '/dashboard/kp/md/gulungan' }
      ]
    },
    { name: 'Produk', path: '/dashboard/kp/md/produk', icon: <Package size={20} />, roles: ['kepala_produksi'] },
    { 
      name: 'Rekap Stok Gulungan', 
      icon: <Layers size={20} />, 
      roles: ['kepala_produksi'],
      subMenu: [
        { name: 'Lebar 70', path: '/dashboard/kp/rsg/lebar70' },
        { name: 'Lebar 110', path: '/dashboard/kp/rsg/lebar110' }
      ] 
    },
    { name: 'Produk', path: '/dashboard/owner/md/produk', icon: <Package size={20} />, roles: ['owner'] },
    { 
      name: 'Rekap Stok Gulungan', 
      icon: <Layers size={20} />, 
      roles: ['owner'],
      subMenu: [
        { name: 'Lebar 70', path: '/dashboard/owner/rsg/lebar70' },
        { name: 'Lebar 110', path: '/dashboard/owner/rsg/lebar110' }
      ] 
    },
    { 
      id: 'po-cs', 
      name: 'Pre Order', 
      icon: <Clock7 size={20} />, 
      roles: ['cs', 'customer_service'],
      subMenu: [
        { name: 'Pre Order Reguler', path: '/dashboard/cs/po/reguler', subId: 'reguler' }, 
        { name: 'Pre Order Custom', path: '/dashboard/cs/po/custom', subId: 'custom' }      
      ]
    },
    { 
      id: 'po-kp',
      name: 'Pre Order', 
      icon: <Clock7 size={20} />, 
      roles: ['kepala_produksi'],
      subMenu: [
        { name: 'Pre Order Reguler', path: '/dashboard/kp/po?tipe=reguler', subId: 'reguler' }, 
        { name: 'Pre Order Custom', path: '/dashboard/kp/po?tipe=custom', subId: 'custom' }
      ]
    },
    { 
      id: 'po-owner',
      name: 'Pre Order', 
      icon: <Clock7 size={20} />, 
      roles: ['owner'],
      subMenu: [
        { name: 'Pre Order Reguler', path: '/dashboard/owner/po?tipe=reguler' }, 
        { name: 'Pre Order Custom', path: '/dashboard/owner/po?tipe=custom' }
      ]
    },
    { 
      name: 'Riwayat Pemesanan', 
      icon: <ClipboardList size={20} />, 
      roles: ['cs', 'customer_service'],
      subMenu: [
        { name: 'Order', path: '/dashboard/cs/rp/order' },
        { name: 'Pre Order Reguler', path: '/dashboard/cs/rp/por' },
        { name: 'Pre Order Custom', path: '/dashboard/cs/rp/poc' }
      ] 
    },
    { 
      name: 'Laporan', 
      icon: <FileText size={20} />, 
      roles: ['owner'],
       subMenu: [
        { name: 'Order', path: '/dashboard/owner/laporan/order' },
        { name: 'Pre Order Reguler', path: '/dashboard/owner/laporan/por' },
        { name: 'Pre Order Custom', path: '/dashboard/owner/laporan/poc' }
      ] 
    },
    { 
      name: 'Profil', 
      icon: <User size={20} />, 
      path: role === 'owner' ? '/dashboard/owner/profil' : role === 'kepala_produksi' ? '/dashboard/kp/profil' : '/dashboard/cs/profil',
      roles: ['kepala_produksi', 'cs', 'customer_service', 'owner'] 
    },
  ]

  const filteredMenuItems = role ? masterMenuItems.filter(item => item.roles.includes(role)) : [];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    NProgress.start();
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.replace('/auth/login');
        router.refresh();
      } else {
        setIsLoggingOut(false);
        NProgress.done();
      }
    } catch (error) {
      setIsLoggingOut(false);
      NProgress.done();
    }
  };

  return (
    <>
    <aside className={`bg-[#1A335A] text-white flex flex-col fixed h-full shadow-xl select-none z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Header Brand */}
      <div className={`p-5 flex items-center justify-between border-b border-white/20 ${isCollapsed ? 'flex-col justify-center' : 'flex-row'}`}>
        <div className="flex items-center gap-1 overflow-hidden">
          <button 
            onClick={isCollapsed ? toggleSidebar : undefined}
            className={`shrink-0 focus:outline-none transition-transform active:scale-95 ${isCollapsed ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
            disabled={!isCollapsed}
          >
            <img 
              src="/images/logo.png" 
              alt="Logo Dibiyo Lurik" 
              className="object-contain w-8 h-8 rounded-md"
            />
          </button>
          
          {!isCollapsed && (
            <motion.h1 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="text-2xl font-bold tracking-wide whitespace-nowrap"
            >
              Dibiyo Lurik
            </motion.h1>
          )}
        </div>
        
        {!isCollapsed && (
          <button 
            onClick={toggleSidebar} 
            className="p-1 transition-colors rounded-lg hover:bg-white/10 text-white/90 focus:outline-none shrink-0"
          >
            <X size={22} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
        {filteredMenuItems.map((item, index) => {
          const hasSubMenu = !!item.subMenu && item.subMenu.length > 0;
          const menuKey = `${item.name}-${index}-${role}`;
          
          const isChildActive = hasSubMenu && item.subMenu.some(sub => {
            if (!sub.path) return false;
            const [pathOnly, queryString] = sub.path.split('?');
            const isSamePath = pathname.replace(/\/$/, '') === pathOnly.replace(/\/$/, '');
            
            if (queryString) {
              const currentParams = new URLSearchParams(searchParams.toString());
              const targetParams = new URLSearchParams(queryString);
              return isSamePath && [...targetParams.entries()].every(([key, value]) => currentParams.get(key) === value);
            }
            return isSamePath;
          });

          const isMainActive = !hasSubMenu && pathname === item.path;

          if (hasSubMenu) {
            const isPoMenu = item.id === 'po-kp' || item.id === 'po-cs';
            // Sembunyikan badge menu utama jika sub menu sedang dibuka
            const showMainMenuBadge = isPoMenu && totalPoNotificationCount > 0 && openSubMenu !== item.name;

            return (
              <div key={menuKey} className="space-y-1">
                <button
                  onClick={() => {
                    if (isCollapsed) toggleSidebar(); 
                    setOpenSubMenu(openSubMenu === item.name ? '' : item.name);
                  }}
                  className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 relative ${
                    isCollapsed ? 'justify-center' : 'justify-between'
                  } ${
                    isChildActive 
                      ? 'bg-white/10 font-semibold text-white' 
                      : 'hover:bg-[#F2B600]/10 text-white/90'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  {isChildActive && (
                    <span className="absolute -left-3 top-0 w-1.5 h-full bg-[#F2B600] rounded-r-lg shadow-md z-50" />
                  )}

                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {item.icon}
                      {/* Titik merah kecil saat sidebar collapsed hanya muncul jika sub menu tidak dibuka */}
                      {showMainMenuBadge && isCollapsed && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 h-2.5 w-2.5 rounded-full ring-2 ring-[#1A335A]" />
                      )}
                    </div>
                    {!isCollapsed && <span className="text-sm whitespace-nowrap">{item.name}</span>}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center gap-2">
                      {showMainMenuBadge && (
                        <motion.span
                          animate={animatePoBadge ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                          className="bg-red-500 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full shadow-sm"
                        >
                          {totalPoNotificationCount}
                        </motion.span>
                      )}
                      
                      <ChevronDown 
                        size={16} 
                        className={`transition-transform duration-200 text-white/70 ${
                          openSubMenu === item.name ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>
                  )}
                </button>
                
                {!isCollapsed && openSubMenu === item.name && (
                  <div className="mt-1 ml-6 space-y-1 transition-all border-l border-white/20">
                    {item.subMenu.map((sub) => {
                      if (!sub.path) return null;
                      const [pathOnly, queryString] = sub.path.split('?');
                      const isSamePath = pathname.replace(/\/$/, '') === pathOnly.replace(/\/$/, '');
                      
                      let isSubActive = isSamePath;
                      if (queryString) {
                        const currentParams = new URLSearchParams(searchParams.toString());
                        const targetParams = new URLSearchParams(queryString);
                        isSubActive = isSamePath && [...targetParams.entries()].every(([key, value]) => currentParams.get(key) === value);
                      }

                      const currentSubBadgeCount = 
                        isPoMenu && sub.subId === 'reguler' ? poRegulerCount :
                        isPoMenu && sub.subId === 'custom' ? poCustomCount : 0;

                      return (
                        <Link
                          key={`${item.name}-${sub.name}`}
                          href={sub.path}
                          className={`flex items-center justify-between ml-3 p-2.5 text-sm rounded-lg transition-all duration-150 relative ${
                            isSubActive 
                              ? 'bg-[#F2B600] text-white font-medium shadow-sm' 
                              : 'text-white/70 hover:text-white hover:bg-[#F2B600]/5'
                          }`}
                        >
                          {isSubActive && (
                            <span className="absolute top-0 z-50 w-1 h-full bg-[#F2B600] rounded-r-lg shadow-md -left-9" />
                          )}
                          <span>{sub.name}</span>

                          {/* Angka di sub-menu tetap muncul sebelum sub-menu yang bersangkutan diklik/aktif */}
                          {currentSubBadgeCount > 0 && !isSubActive && (
                            <span className="bg-red-500 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full shadow-sm mr-1">
                              {currentSubBadgeCount}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }
          
          return (
            <div key={menuKey} className="space-y-1">
              <Link
                href={item.path || '#'}
                className={`flex items-center p-3 rounded-lg transition-all duration-200 relative ${
                  isCollapsed ? 'justify-center' : 'gap-3'
                } ${
                  isMainActive ? 'bg-[#F2B600] font-semibold shadow-inner text-white' : 'hover:bg-[#F2B600]/10 text-white/90'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                {isMainActive && (
                  <span className="absolute -left-3 top-0 w-1.5 h-full bg-[#F2B600] rounded-r-lg shadow-md z-50" />
                )}

                <div className="relative shrink-0">
                  {item.icon}
                  {item.hasBadge && cartCount > 0 && (
                    <motion.span
                      animate={animateBadge ? { scale: [1, 1.6, 1.2, 1], rotate: [0, 10, -10, 0] } : { scale: 1 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-[10px] font-bold text-white h-4 w-4 rounded-full flex items-center justify-center border border-[#8B5E3C]"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </div>
                {!isCollapsed && <span className="text-sm whitespace-nowrap">{item.name}</span>}
              </Link>
            </div>
          )
        })}
      </nav>

      {/* Bagian Tombol Logout */}
      <div className="p-3 border-t border-white/10">
        <button 
          onClick={() => setShowLogoutModal(true)}
          disabled={isLoggingOut}
          className={`flex items-center w-full p-3 transition-all hover:bg-red-500/20 rounded-lg text-white/80 hover:text-white group disabled:opacity-50 disabled:cursor-not-allowed ${
            isCollapsed ? 'justify-center' : 'gap-3'
          }`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          {isLoggingOut ? (
            <div className="w-5 h-5 border-2 border-white rounded-lg animate-spin border-t-transparent shrink-0" />
          ) : (
            <LogOut size={20} className={`shrink-0 transition-transform ${!isCollapsed && 'group-hover:translate-x-1'}`} />
          )}
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>

    <LogoutModal 
      isOpen={showLogoutModal} 
      onClose={() => setShowLogoutModal(false)}
      onConfirm={handleLogout}
      isLoggingOut={isLoggingOut}
    />
    </>
  )
}