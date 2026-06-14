// 'use client';

// import { useEffect } from 'react';
// import { usePathname, useSearchParams } from 'next/navigation';
// import NProgress from 'nprogress';
// import 'nprogress/nprogress.css';

// export default function ProgressBar() {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   useEffect(() => {
//     // Jika berada di halaman login, jangan tampilkan bar apapun
//     if (pathname === '/auth/login') {
//       NProgress.done();
//       return;
//     }

//     NProgress.configure({ 
//       showSpinner: false, 
//       speed: 300, 
//       trickleSpeed: 100 
//     });
//   }, [pathname]);

//   useEffect(() => {
//     // Selesai jika route berubah
//     NProgress.done();
//   }, [pathname, searchParams]);

//   return null;
// }

'use client';

export const dynamic = 'force-dynamic'; // Paksa komponen dibaca dinamis di sisi client

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Jika berada di halaman login, jangan tampilkan bar apapun
    if (pathname === '/auth/login') {
      NProgress.done();
      return;
    }

    NProgress.configure({ 
      showSpinner: false, 
      speed: 300, 
      trickleSpeed: 100 
    });
  }, [pathname]);

  useEffect(() => {
    // Selesai jika route berubah
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}