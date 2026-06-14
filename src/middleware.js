// import { NextResponse } from 'next/server'
// import supabasePublic from '@/lib/supabase-public'

// export async function middleware(request) {
//   const { pathname } = request.nextUrl
//   const response = NextResponse.next()

//   // 1. Bypass asset statis Next.js & favicon (Kecuali API agar rolling session tetap jalan saat fetch data)
//   if (
//     pathname.startsWith('/_next/') || 
//     pathname.startsWith('/favicon.ico')
//   ) {
//     return NextResponse.next()
//   }
  
//   let hasToken = request.cookies.has('sb-access-token')
//   const refreshToken = request.cookies.get('sb-refresh-token')?.value
//   const userRole = request.cookies.get('user-role')?.value?.toLowerCase()

//   const isAuthPage = pathname.startsWith('/auth')
  
//   // Perluas jangkauan deteksi halaman terproteksi sesuai konfigurasi matcher Anda
//   const isDashboardPage = 
//     pathname.startsWith('/dashboard') || 
//     pathname.startsWith('/kp') ||
//     pathname.startsWith('/cs') ||
//     pathname.startsWith('/owner')

//   // --- LOGIKA ROLLING SESSION & AUTO REFRESH ---
//   if (hasToken) {
//     const currentAccessToken = request.cookies.get('sb-access-token').value
//     response.cookies.set('sb-access-token', currentAccessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       path: '/',
//       maxAge: 300, // Reset kembali ke 5 menit tiap kali ada aktivitas/fetch
//     })
//   } else if (!hasToken && refreshToken) {
//     try {
//       const { data, error } = await supabasePublic.auth.setSession({
//         access_token: '',
//         refresh_token: refreshToken
//       })

//       if (!error && data.session) {
//         hasToken = true
//         response.cookies.set('sb-access-token', data.session.access_token, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === 'production',
//           sameSite: 'lax',
//           path: '/',
//           maxAge: 300,
//         })
//         response.cookies.set('sb-refresh-token', data.session.refresh_token, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === 'production',
//           sameSite: 'lax',
//           path: '/',
//           maxAge: 60 * 60 * 24 * 7,
//         })
//       }
//     } catch (e) {
//       console.error("Gagal auto-refresh token di middleware:", e)
//     }
//   }

//   // JIKA REQUEST ADALAH ROUTE API, KEMBALIKAN RESPONSE DENGAN COOKIE TERBARU
//   if (pathname.startsWith('/api/')) {
//     return response;
//   }

//   // KONDISI 1: User sudah login dipaksa ke login -> Lempar ke dashboard
//   if (hasToken && isAuthPage) {
//     const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
//     // FIX: Gunakan .getAll() sebelum .forEach()
//     response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie.name, cookie.value))
//     return redirectResponse
//   }

//   // KONDISI 2: User BELUM login memaksa masuk ke dashboard -> Lempar ke login
//   if (!hasToken && isDashboardPage) {
//     const loginRedirect = NextResponse.redirect(new URL('/auth/login', request.url))
//     loginRedirect.cookies.delete('sb-access-token')
//     loginRedirect.cookies.delete('sb-refresh-token')
//     loginRedirect.cookies.delete('user-role')
//     return loginRedirect
//   }

//   // KONDISI 3: Role-Based Access Control
//   if (hasToken) {
//     let targetURL = null
//     if (userRole === 'customer_service') {
//       if (pathname.startsWith('/dashboard/kp') || pathname.startsWith('/dashboard/owner')) {
//         targetURL = '/dashboard'
//       }
//     }
//     if (userRole === 'kepala_produksi') {
//       if (pathname.startsWith('/dashboard/cs') || pathname.startsWith('/dashboard/owner')) {
//         targetURL = '/dashboard'
//       }
//     }
//     if (userRole === 'owner') {
//       if (pathname.startsWith('/dashboard/cs') || pathname.startsWith('/dashboard/kp')) {
//         targetURL = '/dashboard'
//       }
//     }

//     if (targetURL) {
//       const roleRedirect = NextResponse.redirect(new URL(targetURL, request.url))
//       // FIX: Gunakan .getAll() sebelum .forEach()
//       response.cookies.getAll().forEach((cookie) => roleRedirect.cookies.set(cookie.name, cookie.value))
//       return roleRedirect
//     }
//   }

//   // KONDISI 4: Penanganan halaman root murni (/)
//   if (pathname === '/') {
//     const rootRedirect = hasToken 
//       ? NextResponse.redirect(new URL('/dashboard', request.url))
//       : NextResponse.redirect(new URL('/auth/login', request.url))
    
//     // FIX: Gunakan .getAll() sebelum .forEach()
//     response.cookies.getAll().forEach((cookie) => rootRedirect.cookies.set(cookie.name, cookie.value))
//     return rootRedirect
//   }

//   return response;
// }

// export const config = {
//   matcher: [
//     '/',
//     '/auth/:path*',
//     '/dashboard/:path*',
//     '/kp/:path*',
//     '/cs/:path*',
//     '/owner/:path*',
//     '/api/:path*' 
//   ],
// }




import { NextResponse } from 'next/server'
import supabasePublic from '@/lib/supabase-public'

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // 1. Bypass asset statis Next.js & favicon
  if (
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }
  
  let hasToken = request.cookies.has('sb-access-token')
  const refreshToken = request.cookies.get('sb-refresh-token')?.value
  const userRole = request.cookies.get('user-role')?.value?.toLowerCase()

  const isAuthPage = pathname.startsWith('/auth')
  
  const isDashboardPage = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/kp') ||
    pathname.startsWith('/cs') ||
    pathname.startsWith('/owner')

  // --- LOGIKA ROLLING SESSION & AUTO REFRESH ---
  if (hasToken) {
    const currentAccessToken = request.cookies.get('sb-access-token').value
    response.cookies.set('sb-access-token', currentAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 300, 
    })
  } else if (!hasToken && refreshToken) {
    try {
      const { data, error } = await supabasePublic.auth.setSession({
        access_token: '',
        refresh_token: refreshToken
      })

      if (!error && data.session) {
        hasToken = true
        response.cookies.set('sb-access-token', data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 300,
        })
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })
      }
    } catch (e) {
      console.error("Gagal auto-refresh token di middleware:", e)
    }
  }

  // JIKA REQUEST ADALAH ROUTE API, KEMBALIKAN RESPONSE DENGAN COOKIE TERBARU
  if (pathname.startsWith('/api/')) {
    return response;
  }

  // KONDISI 1: User sudah login dipaksa ke login -> Lempar ke dashboard internal mereka
  if (hasToken && isAuthPage) {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie.name, cookie.value))
    return redirectResponse
  }

  // KONDISI 2: User BELUM login memaksa masuk ke dashboard -> Lempar ke login asli
  if (!hasToken && isDashboardPage) {
    const loginRedirect = NextResponse.redirect(new URL('/auth/login', request.url))
    loginRedirect.cookies.delete('sb-access-token')
    loginRedirect.cookies.delete('sb-refresh-token')
    loginRedirect.cookies.delete('user-role')
    return loginRedirect
  }

  // KONDISI 3: Role-Based Access Control
  if (hasToken) {
    let targetURL = null
    if (userRole === 'customer_service') {
      if (pathname.startsWith('/dashboard/kp') || pathname.startsWith('/dashboard/owner')) {
        targetURL = '/dashboard'
      }
    }
    if (userRole === 'kepala_produksi') {
      if (pathname.startsWith('/dashboard/cs') || pathname.startsWith('/dashboard/owner')) {
        targetURL = '/dashboard'
      }
    }
    if (userRole === 'owner') {
      if (pathname.startsWith('/dashboard/cs') || pathname.startsWith('/dashboard/kp')) {
        targetURL = '/dashboard'
      }
    }

    if (targetURL) {
      const roleRedirect = NextResponse.redirect(new URL(targetURL, request.url))
      response.cookies.getAll().forEach((cookie) => roleRedirect.cookies.set(cookie.name, cookie.value))
      return roleRedirect
    }
  }

  // --- PERUBAHAN DI SINI (KONDISI 4 DIHAPUS) ---
  // Halaman murni '/' tidak di-redirect lagi agar Next.js merender src/app/page.js sebagai Home publik.

  return response;
}

export const config = {
  matcher: [
    '/',
    '/auth/:path*',
    '/dashboard/:path*',
    '/kp/:path*',
    '/cs/:path*',
    '/owner/:path*',
    '/api/:path*' 
  ],
}