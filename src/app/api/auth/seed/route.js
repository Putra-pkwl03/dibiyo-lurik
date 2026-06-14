import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

export async function GET() {
  try {
    // 1. Data dummy yang ingin dimasukkan
    const dummyUsers = [
      {
        email: 'owner@dibiyolurik.com',
        password: 'password123',
        username: 'owner_dibiyo',
        nama: 'Bapak Dibiyo',
        role: 'owner',
        avatar_url: 'https://placeholder.com/owner.png'
      },
      {
        email: 'agus.produksi@dibiyolurik.com',
        password: 'password123',
        username: 'kepala_produksi_lurik',
        nama: 'Agus Setiawan',
        role: 'kepala_produksi',
        avatar_url: 'https://placeholder.com/produksi.png'
      },
      {
        email: 'siti.cs@dibiyolurik.com',
        password: 'password123',
        username: 'cs_dibiyo1',
        nama: 'Siti Rahma',
        role: 'customer_service',
        avatar_url: 'https://placeholder.com/cs.png'
      }
    ]

    const results = []

    for (const u of dummyUsers) {
      // Bersihkan data profil lama jika ada agar tidak duplikat di tabel public
      await supabaseAdmin.from('profiles').delete().eq('email', u.email)

      // Cek apakah user sudah ada di auth.users bawaan Supabase
      // Supabase Admin API tidak punya method delete by email langsung, jadi kita cari dulu id-nya jika ada
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const foundUser = existingUsers?.users?.find(user => user.email === u.email)
      
      if (foundUser) {
        await supabaseAdmin.auth.admin.deleteUser(foundUser.id)
      }

      // 2. Buat User baru di auth via Admin API (Otomatis menghash password dengan benar & membuat identitas)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true // Otomatis mengonfirmasi email
      })

      if (authError) {
        results.push({ email: u.email, status: 'failed_auth', error: authError.message })
        continue
      }

      // 3. Masukkan ke tabel public.profiles menggunakan ID yang didapat dari authData
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: u.username,
          nama: u.nama,
          role: u.role,
          avatar_url: u.avatar_url,
          email: u.email
        })

      if (profileError) {
        results.push({ email: u.email, status: 'failed_profile', error: profileError.message })
      } else {
        results.push({ email: u.email, status: 'success', userId: authData.user.id })
      }
    }

    return NextResponse.json({ message: 'Proses seeding selesai', detail: results })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}