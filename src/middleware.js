import { NextResponse } from 'next/server'
import supabasePublic from '@/lib/supabase-public' // Pastikan ini bisa diakses di middleware

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  if (
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }
  
  let hasToken = request.cookies.has('sb-access-token')
  const refreshToken = request.cookies.get('sb-refresh-token')?.value
  const userRole = request.cookies.get('user-role')?.value?.toLowerCase()

  const isAuthPage = pathname.startsWith('/auth')
  const isDashboardPage = pathname.startsWith('/dashboard') || pathname.startsWith('/kepala-produksi')

  // --- LOGIKA ROLLING SESSION & AUTO REFRESH ---
  if (hasToken) {
    // Jika masih bergerak di sistem, perpanjang umur cookie access token ke 5 menit lagi
    const currentAccessToken = request.cookies.get('sb-access-token').value
    response.cookies.set('sb-access-token', currentAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 300, // Reset kembali ke 5 menit
    })
  } else if (!hasToken && refreshToken) {
    try {
      // Jika access token habis tapi masih aktif bergerak, perbarui sesi pakai refresh token
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

  // KONDISI 1: User sudah login tapi memaksa ke halaman login -> Lempar ke dashboard
  if (hasToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // KONDISI 2: User BELUM login tapi memaksa masuk ke dashboard -> Lempar ke login
  if (!hasToken && isDashboardPage) {
    const loginRedirect = NextResponse.redirect(new URL('/auth/login', request.url))
    // Hapus sisa cookie lama jika ada kebocoran
    loginRedirect.cookies.delete('sb-access-token')
    loginRedirect.cookies.delete('sb-refresh-token')
    loginRedirect.cookies.delete('user-role')
    return loginRedirect
  }

  // KONDISI 3: Role-Based Access Control
  if (hasToken) {
    if (userRole === 'customer_service') {
      if (pathname.startsWith('/dashboard/kepala-produksi') || pathname.startsWith('/dashboard/owner')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    if (userRole === 'kepala-produksi' || userRole === 'kepala_produksi') {
      if (pathname.startsWith('/dashboard/cs') || pathname.startsWith('/dashboard/owner')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    if (userRole === 'owner') {
      if (pathname.startsWith('/dashboard/cs') || pathname.startsWith('/dashboard/kepala-produksi')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  // KONDISI 4: Penanganan halaman root murni (/)
  if (pathname === '/') {
    if (hasToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/auth/:path*',
    '/dashboard/:path*',
    '/kp/:path*',
    '/cs/:path*',
    '/owner/:path*',
  ],
}