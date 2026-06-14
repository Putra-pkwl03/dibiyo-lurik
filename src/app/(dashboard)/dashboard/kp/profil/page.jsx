'use client'

import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { User, ShieldCheck } from 'lucide-react'

export default function ProfilePage() {
  const [profile, setProfile] = useState({ username: '', email: '' })
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  // Fungsi untuk memuat data profil
  const fetchProfile = async () => {
    const res = await fetch('/api/auth/profile', { credentials: 'include' })
    const data = await res.json()
    if (data.data) {
      setProfile(data.data)
      setFormData({ username: data.data.username, password: '' })
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })
      
      const result = await res.json()

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Profil Anda telah diperbarui.',
          confirmButtonColor: '#1A335A'
        })
        
        // --- LANGKAH PENTING: Update state lokal agar UI berubah seketika ---
        setProfile(prev => ({ ...prev, username: formData.username }))
        setFormData(prev => ({ ...prev, password: '' }))
      } else {
        throw new Error(result.error || 'Gagal update profil')
      }
    } catch (err) {
      Swal.fire('Error', err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full mx-auto space-y-4 text-black font-inter">
      
      {/* Bagian Judul disamakan persis dengan halaman cs */}
      <div className="relative overflow-x-visible">
        <h2 className="text-lg sm:text-[24px] font-medium text-black pb-2 sm:pb-5 border-b border-gray-500 tracking-wide -mx-4 px-4 sm:-mx-6 sm:px-6">
          Profil
        </h2>
      </div>

      <div className="max-w-4xl mx-auto duration-500 animate-in fade-in">
        <div className="p-8 bg-white border shadow-sm border-stone-200 rounded-3xl">
          
          {/* Bagian Avatar dengan Bg #1A335A dan Icon Tetap Putih */}
          <div className="flex justify-center mb-4">
            <div className="w-28 h-28 bg-[#1A335A] rounded-full flex items-center justify-center text-white shadow-md">
              <User size={48} strokeWidth={1.5} /> 
            </div>
          </div>

          {/* Form Read-Only dengan Bg Kolom #5AE3ED1C */}
          <div className="mb-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A335A] mb-1">Username</label>
              <div className="w-full p-3 bg-[#5AE3ED1C] border border-stone-200 rounded-lg text-stone-800 font-medium">
                {profile.username}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A335A] mb-1">Email</label>
              <div className="w-full p-3 bg-[#5AE3ED1C] border border-stone-200 rounded-lg text-stone-800 font-medium">
                {profile.email || '-'}
              </div>
            </div>
          </div>

          {/* Kartu Ubah Profil dengan Bg #5AE3ED1C */}
          <div className="bg-[#5AE3ED1C] border border-stone-200 p-6 rounded-2xl">
            <h3 className="flex items-center gap-2 font-bold text-[#1A335A] mb-4">
              {/* Ikon ShieldCheck dari lucide-react */}
              <ShieldCheck size={20} /> Ubah Profil
            </h3>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* ... form inputs ... */}
              <div>
                <label className="block text-sm font-medium text-[#1A335A] mb-1">Username</label>
                <input 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full text-stone-800 p-3 bg-[#5AE3ED1C] border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#1A335A] focus:border-[#1A335A] outline-none transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1A335A] mb-1">Password Baru</label>
                <input 
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full p-3 text-stone-800 bg-[#5AE3ED1C] border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#1A335A] focus:border-[#1A335A] outline-none transition"
                />
              </div>

              <div className="flex justify-end mt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-8 py-2.5 bg-[#1A335A] text-white font-semibold rounded-lg hover:bg-[#12243f] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}