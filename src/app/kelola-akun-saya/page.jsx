"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Footer from "../components/home/Footer.jsx"
import Swal from "sweetalert2" 

// Import komponen baru yang telah dipecah
import FormContactAkun from "../components/home/SaPuAkun/FormContactAkun.jsx"
import FormAlamatDelivery from "../components/home/SaPuAkun/FormAlamatDelivery.jsx"

export default function KelolaAkunSayaPage() {
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [role, setRole] = useState("customer")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("") 
  const [nomorTelp, setNomorTelp] = useState("")
  const [alamat, setAlamat] = useState("")
  const [originalNomorTelp, setOriginalNomorTelp] = useState("")
  const [originalAlamat, setOriginalAlamat] = useState("")
  const [saving, setSaving] = useState(false)

  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(false)

  // State koordinat wilayah untuk divalidasi saat tombol simpan ditekan
  const [selectedProvinsiId, setSelectedProvinsiId] = useState("")
  const [selectedKabupatenId, setSelectedKabupatenId] = useState("")
  const [selectedKecamatanId, setSelectedKecamatanId] = useState("")
  const [selectedDesaId, setSelectedDesaId] = useState("")
  const [detailAlamat, setDetailAlamat] = useState("")

  useEffect(() => {
    async function initProfileData() {
      try {
        const resProfile = await fetch('/api/auth/profile', { cache: 'no-store' })
        if (!resProfile.ok) {
          setUnauthorized(true)
          setLoading(false)
          return
        }

        const jsonProfile = await resProfile.json()
        const user = jsonProfile.data

        if (user && user.id) {
          setRole(user.role || "customer")
          setUsername(user.username || "")
          setEmail(user.email || "")
          setNomorTelp(user.nomor_telp || "")
          setAlamat(user.alamat_lengkap || "")
          
          setOriginalNomorTelp(user.nomor_telp || "")
          setOriginalAlamat(user.alamat_lengkap || "")
        } else {
          setUnauthorized(true)
        }
      } catch (err) {
        console.error("Gagal memuat profil akun:", err)
      } finally {
        setLoading(false)
      }
    }
    initProfileData()
  }, [])

  const togglePhoneEdit = () => {
    if (isEditingPhone) setNomorTelp(originalNomorTelp)
    setIsEditingPhone(!isEditingPhone)
  }

  const handleSimpanPerubahanAkun = async () => {
    if (!username.trim()) {
      Swal.fire("Peringatan!", "Nama Lengkap / Username tidak boleh kosong.", "warning")
      return
    }
    if (isEditingPhone && !nomorTelp.trim()) {
      Swal.fire("Peringatan!", "Nomor telepon aktif tidak boleh kosong.", "warning")
      return
    }
    if (isEditingAddress && (!selectedProvinsiId || !selectedKabupatenId || !selectedKecamatanId || !selectedDesaId || !detailAlamat.trim())) {
      Swal.fire("Peringatan!", "Mohon lengkapi seluruh struktur pilihan daerah & detail alamat Anda.", "warning")
      return
    }
    if (!alamat.trim()) {
      Swal.fire("Peringatan!", "Alamat lengkap pengiriman wajib diisi untuk kurir.", "warning")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          nomor_telp: nomorTelp.trim(),
          alamat_lengkap: alamat.trim()
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Gagal memperbarui profil")
      }

      setOriginalNomorTelp(nomorTelp.trim())
      setOriginalAlamat(alamat.trim())
      setIsEditingPhone(false)
      setIsEditingAddress(false)

      Swal.fire({
        title: "Berhasil disimpan!",
        text: "Informasi kontak personal dan alamat pengiriman Anda telah diperbarui.",
        icon: "success",
        confirmButtonColor: "#2D2219",
      })
    } catch (err) {
      console.error(err)
      Swal.fire("Gagal!", err.message, "error")
    } finally {
      setSaving(false)
    }
  }

  if (!loading && unauthorized) {
    return (
      <div className="bg-[#fcfbf9] text-black min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 text-center bg-white border shadow-sm border-neutral-200 rounded-2xl">
          <h3 className="text-xl font-serif font-bold text-[#2D2219] mb-2">Sesi Tidak Ditemukan</h3>
          <p className="text-sm text-[#6a5848] mb-6">Silakan masuk terlebih dahulu untuk mengakses akun Anda.</p>
          <Link href="/auth/login" className="inline-block bg-[#2D2219] text-white px-8 py-3 rounded-xl text-xs font-bold tracking-wider hover:bg-[#d9a05b] transition-colors w-full">
            LOGIN SEKARANG
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#fcfbf9] text-black min-h-screen flex flex-col pt-24 md:pt-28">
      <div className="flex flex-col flex-1 w-full md:flex-row">
        <aside className="flex flex-col w-full p-6 bg-white border-b md:w-80 md:border-b-0 md:border-r border-neutral-200/80 md:p-8 shrink-0">
          {!loading && (
            <div className="flex items-center pb-6 mb-8 space-x-4 border-b border-neutral-100">
              <div className="w-12 h-12 rounded-full bg-[#2D2219] text-[#fcfbf9] flex items-center justify-center font-serif text-lg font-bold">
                {username ? username.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold truncate text-neutral-800">{username || "Pengguna"}</h4>
                <p className="text-[11px] text-neutral-400 font-mono truncate">{email}</p>
                <span className="inline-block text-[9px] font-bold font-mono bg-amber-50 text-[#d9a05b] px-2 py-0.5 rounded mt-1 uppercase border border-[#d9a05b]/20">
                  {role}
                </span>
              </div>
            </div>
          )}

          <nav className="space-y-1.5 flex-1">
            <Link href="/pesanan-saya" className="w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl text-xs font-bold tracking-wider text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              <span>{role === 'customer_service' ? "PESANAN MASUK (CS)" : "PESANAN SAYA"}</span>
            </Link>

            <Link href="/kelola-akun-saya" className="w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl text-xs font-bold tracking-wider bg-[#2D2219] text-white shadow-sm shadow-[#2D2219]/10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span>KELOLA AKUN</span>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-10 lg:p-12 bg-[#faf9f6]">
          {loading ? (
            <div className="py-12 font-mono text-xs tracking-widest text-center text-gray-400 animate-pulse">
              MEMUAT INFORMASI AKUN...
            </div>
          ) : (
            <div className="w-full animate-fadeIn">
              <div className="w-full max-w-full space-y-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#2D2219]">Pengaturan Akun & Kontak</h2>
                  <p className="mt-1 text-xs text-neutral-400">Mutakhirkan informasi kontak personal dan penataan koordinat alamat kurir Anda</p>
                </div>

                <div className="w-full p-6 space-y-6 bg-white border shadow-sm border-neutral-200/60 rounded-2xl md:p-8">
                  
                  {/* Komponen 1: Mengurus Info Kontak Utama */}
                  <FormContactAkun 
                    email={email}
                    username={username}
                    setUsername={setUsername}
                    nomorTelp={nomorTelp}
                    setNomorTelp={setNomorTelp}
                    isEditingPhone={isEditingPhone}
                    togglePhoneEdit={togglePhoneEdit}
                  />

                  {/* Komponen 2: Mengurus Pilihan Alamat Bertingkat */}
                  <FormAlamatDelivery 
                    alamat={alamat}
                    setAlamat={setAlamat}
                    originalAlamat={originalAlamat}
                    isEditingAddress={isEditingAddress}
                    setIsEditingAddress={setIsEditingAddress}
                    selectedProvinsiId={selectedProvinsiId}
                    setSelectedProvinsiId={setSelectedProvinsiId}
                    selectedKabupatenId={selectedKabupatenId}
                    setSelectedKabupatenId={setSelectedKabupatenId}
                    selectedKecamatanId={selectedKecamatanId}
                    setSelectedKecamatanId={setSelectedKecamatanId}
                    selectedDesaId={selectedDesaId}
                    setSelectedDesaId={setSelectedDesaId}
                    detailAlamat={detailAlamat}
                    setDetailAlamat={setDetailAlamat}
                  />

                  <div className="flex justify-end pt-4 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={handleSimpanPerubahanAkun}
                      disabled={saving}
                      className="bg-[#2D2219] text-white px-8 py-3.5 rounded-xl text-xs font-bold tracking-wider hover:bg-[#d9a05b] disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors shadow-sm shadow-[#2D2219]/10"
                    >
                      {saving ? "MENYIMPAN PERUBAHAN..." : "SIMPAN INFORMASI AKUN"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}