"use client"

import { useState, useEffect } from "react"
import { provinsi, kabupaten, kecamatan, desa } from 'daftar-wilayah-indonesia'

export default function FormAlamatDelivery({
  alamat,
  setAlamat,
  originalAlamat,
  isEditingAddress,
  setIsEditingAddress,
  selectedProvinsiId,
  setSelectedProvinsiId,
  selectedKabupatenId,
  setSelectedKabupatenId,
  selectedKecamatanId,
  setSelectedKecamatanId,
  selectedDesaId,
  setSelectedDesaId,
  detailAlamat,
  setDetailAlamat
}) {
  const [listProvinsi, setListProvinsi] = useState([])
  const [listKabupaten, setListKabupaten] = useState([])
  const [listKecamatan, setListKecamatan] = useState([])
  const [listDesa, setListDesa] = useState([])

  // Load awal data Provinsi
  useEffect(() => {
    async function loadProvinsi() {
      try {
        const data = await provinsi()
        setListProvinsi(data || [])
      } catch (err) {
        console.error("Gagal mengambil data provinsi:", err)
      }
    }
    loadProvinsi()
  }, [])

  // Load Kabupaten berdasarkan Provinsi terpilih
  useEffect(() => {
    if (!selectedProvinsiId) {
      setListKabupaten([])
      setSelectedKabupatenId("")
      return
    }
    async function loadKabupaten() {
      try {
        const data = await kabupaten(selectedProvinsiId)
        setListKabupaten(data || [])
        setSelectedKabupatenId("")
        setSelectedKecamatanId("")
        setSelectedDesaId("")
      } catch (err) {
        console.error("Gagal mengambil data kabupaten:", err)
      }
    }
    loadKabupaten()
  }, [selectedProvinsiId, setSelectedKabupatenId, setSelectedKecamatanId, setSelectedDesaId])

  // Load Kecamatan berdasarkan Kabupaten terpilih
  useEffect(() => {
    if (!selectedKabupatenId) {
      setListKecamatan([])
      setSelectedKecamatanId("")
      return
    }
    async function loadKecamatan() {
      try {
        const data = await kecamatan(selectedKabupatenId)
        setListKecamatan(data || [])
        setSelectedKecamatanId("")
        setSelectedDesaId("")
      } catch (err) {
        console.error("Gagal mengambil data kecamatan:", err)
      }
    }
    loadKecamatan()
  }, [selectedKabupatenId, setSelectedKecamatanId, setSelectedDesaId])

  // Load Desa berdasarkan Kecamatan terpilih
  useEffect(() => {
    if (!selectedKecamatanId) {
      setListDesa([])
      setSelectedDesaId("")
      return
    }
    async function loadDesa() {
      try {
        const data = await desa(selectedKecamatanId)
        setListDesa(data || [])
        setSelectedDesaId("")
      } catch (err) {
        console.error("Gagal mengambil data desa:", err)
      }
    }
    loadDesa()
  }, [selectedKecamatanId, setSelectedDesaId])

  // Menggabungkan struktur string alamat secara realtime
  useEffect(() => {
    if (!isEditingAddress) return

    const currentProv = listProvinsi.find(p => String(p.id || p.kode) === String(selectedProvinsiId))
    const currentKab = listKabupaten.find(k => String(k.id || k.kode) === String(selectedKabupatenId))
    const currentKec = listKecamatan.find(kc => String(kc.id || kc.kode) === String(selectedKecamatanId))
    const currentDesa = listDesa.find(d => String(d.id || d.kode) === String(selectedDesaId))

    const provName = currentProv ? (currentProv.name || currentProv.nama) : ""
    const kabName = currentKab ? (currentKab.name || currentKab.nama) : ""
    const kecName = currentKec ? (currentKec.name || currentKec.nama) : ""
    const desaName = currentDesa ? (currentDesa.name || currentDesa.nama) : ""

    const gabunganAlamat = [
      detailAlamat.trim(),
      desaName ? `Desa/Kel. ${desaName}` : "",
      kecName ? `Kec. ${kecName}` : "",
      kabName ? kabName : "",
      provName ? `Prov. ${provName}` : ""
    ].filter(Boolean).join(", ")

    setAlamat(gabunganAlamat)
  }, [detailAlamat, selectedProvinsiId, selectedKabupatenId, selectedKecamatanId, selectedDesaId, isEditingAddress, listProvinsi, listKabupaten, listKecamatan, listDesa, setAlamat])

  const toggleAddressEdit = () => {
    if (isEditingAddress) {
      setAlamat(originalAlamat)
      setSelectedProvinsiId("")
      setSelectedKabupatenId("")
      setSelectedKecamatanId("")
      setSelectedDesaId("")
      setDetailAlamat("")
    }
    setIsEditingAddress(!isEditingAddress)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider">
          Alamat Lengkap Pengiriman
        </label>
        <button
          type="button"
          onClick={toggleAddressEdit}
          className="text-xs text-[#d9a05b] font-bold hover:underline focus:outline-none"
        >
          {isEditingAddress ? "Batal Ubah" : "Ubah Wilayah & Alamat"}
        </button>
      </div>

      {isEditingAddress && (
        <div className="space-y-4 bg-neutral-50/50 p-5 rounded-2xl border border-neutral-200/80 animate-fadeIn mb-4">
          <p className="text-[10px] text-neutral-400 font-mono uppercase font-bold tracking-widest">
            Struktur Wilayah Indonesia
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Provinsi</label>
              <select
                className="w-full p-3 rounded-xl border border-neutral-200 bg-white text-xs text-black focus:ring-1 focus:ring-[#d9a05b] focus:outline-none"
                value={selectedProvinsiId}
                onChange={(e) => setSelectedProvinsiId(e.target.value)}
              >
                <option value="">-- Pilih Provinsi --</option>
                {listProvinsi.map((prov, index) => {
                  const val = prov.id || prov.kode || ""
                  const txt = prov.name || prov.nama || ""
                  return <option key={`prov-${val || index}`} value={val}>{txt}</option>
                })}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Kabupaten / Kota</label>
              <select
                className="w-full p-3 rounded-xl border border-neutral-200 bg-white text-xs text-black focus:ring-1 focus:ring-[#d9a05b] focus:outline-none disabled:opacity-40 disabled:bg-neutral-100"
                value={selectedKabupatenId}
                onChange={(e) => setSelectedKabupatenId(e.target.value)}
                disabled={!selectedProvinsiId}
              >
                <option value="">-- Pilih Kabupaten/Kota --</option>
                {listKabupaten.map((kab, index) => {
                  const val = kab.id || kab.kode || ""
                  const txt = kab.name || kab.nama || ""
                  return <option key={`kab-${val || index}`} value={val}>{txt}</option>
                })}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Kecamatan</label>
              <select
                className="w-full p-3 rounded-xl border border-neutral-200 bg-white text-xs text-black focus:ring-1 focus:ring-[#d9a05b] focus:outline-none disabled:opacity-40 disabled:bg-neutral-100"
                value={selectedKecamatanId}
                onChange={(e) => setSelectedKecamatanId(e.target.value)}
                disabled={!selectedKabupatenId}
              >
                <option value="">-- Pilih Kecamatan --</option>
                {listKecamatan.map((kec, index) => {
                  const val = kec.id || kec.kode || ""
                  const txt = kec.name || kec.nama || ""
                  return <option key={`kec-${val || index}`} value={val}>{txt}</option>
                })}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Desa / Kelurahan</label>
              <select
                className="w-full p-3 rounded-xl border border-neutral-200 bg-white text-xs text-black focus:ring-1 focus:ring-[#d9a05b] focus:outline-none disabled:opacity-40 disabled:bg-neutral-100"
                value={selectedDesaId}
                onChange={(e) => setSelectedDesaId(e.target.value)}
                disabled={!selectedKecamatanId}
              >
                <option value="">-- Pilih Desa/Kelurahan --</option>
                {listDesa.map((d, index) => {
                  const val = d.id || d.kode || ""
                  const txt = d.name || d.nama || ""
                  return <option key={`desa-${val || index}`} value={val}>{txt}</option>
                })}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Nama Jalan, RT/RW, dan No. Rumah</label>
            <textarea
              rows="2"
              className="w-full p-3.5 rounded-xl border border-neutral-200 bg-white text-xs text-black focus:ring-1 focus:ring-[#d9a05b] focus:outline-none placeholder:text-neutral-300 font-medium"
              placeholder="Contoh: Jl. Malioboro No. 12, RT 05/RW 02"
              value={detailAlamat}
              onChange={(e) => setDetailAlamat(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="mt-3">
        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
          Alamat Terpasang Saat Ini
        </label>
        <div className="p-4 rounded-xl border border-neutral-100 bg-neutral-50/60 text-xs text-neutral-600 leading-relaxed font-medium">
          {alamat || "Belum mengonfigurasi alamat pengiriman."}
        </div>
      </div>
    </div>
  )
}