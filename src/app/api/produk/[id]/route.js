import { NextResponse } from 'next/server'
import supabaseAdmin from '../../../../lib/supabase-admin'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ message: 'ID produk wajib diisi' }, { status: 400 })
    }

    const { data: produk, error: produkError } = await supabaseAdmin
      .from('produk')
      .select(`
        id,
        gambar_url,
        kode_produk,
        jenis_pewarna,
        stok,
        status,
        terjual,
        tanggal_ditambahkan,
        created_at,
        updated_at,
        kategori:kategori_id(id, nama),
        motif:motif_id(id, nama)
      `)
      .eq('id', id)
      .single()

    if (produkError || !produk) {
      return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 })
    }

    const { data: gulungan, error: gulunganError } = await supabaseAdmin
      .from('gulungan')
      .select(`
        id,
        nomor_gulungan,
        lebar,
        panjang_total,
        panjang_sisa,
        harga_per_meter,
        is_active,
        created_at,
        updated_at,
        rak:rak_id(id, nama)
      `)
      .eq('produk_id', id)
      .order('nomor_gulungan', { ascending: true })

    if (gulunganError) {
      console.error('[produk/[id] GET] gulungan error:', gulunganError)
    }

    return NextResponse.json({
      data: {
        ...produk,
        gulungan: gulungan || []
      }
    }, { status: 200 })

  } catch (err) {
    return NextResponse.json({ message: 'Internal Server Error: ' + err.message }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ message: 'ID produk wajib diisi' }, { status: 400 })
    }

    const formData = await request.formData()
    const updateData = {}
    let imageFile = null
    let gulunganData = []
    let deletedGulunganIds = []

    if (formData.has('kategori_id')) updateData.kategori_id = formData.get('kategori_id')
    if (formData.has('motif_id')) updateData.motif_id = formData.get('motif_id')
    if (formData.has('jenis_pewarna')) updateData.jenis_pewarna = formData.get('jenis_pewarna')

    if (formData.has('gulungan_data')) {
      gulunganData = JSON.parse(formData.get('gulungan_data'))
    }

    if (formData.has('deleted_gulungan_ids')) {
      try {
        deletedGulunganIds = JSON.parse(formData.get('deleted_gulungan_ids')) || []
      } catch {
        deletedGulunganIds = []
      }
    }

    imageFile = formData.get('image')

    const { data: currentProduk, error: fetchCurrentError } = await supabaseAdmin
      .from('produk')
      .select('kategori_id, motif_id, jenis_pewarna')
      .eq('id', id)
      .single()

    if (fetchCurrentError || !currentProduk) {
      return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 })
    }

    // ── 💡 VALIDASI PATCH BACKEND (BLOK LURIK + ALAMI) ──
    const finalMotifId = updateData.motif_id ?? currentProduk.motif_id
    const finalJenisPewarna = updateData.jenis_pewarna ?? currentProduk.jenis_pewarna

    const { data: motData } = await supabaseAdmin.from('motif').select('nama').eq('id', finalMotifId).single()
    
    if (motData?.nama?.toLowerCase() === 'blok lurik' && finalJenisPewarna?.toLowerCase() === 'alami') {
      if (gulunganData && gulunganData.length > 0) {
        const hasInvalidWidth = gulunganData.some(g => parseInt(g.lebar) !== 110);
        if (hasInvalidWidth) {
          return NextResponse.json({ 
            message: 'Validasi Gagal: Motif Blok Lurik dengan pewarna Alami hanya diperbolehkan menggunakan lebar 110 cm.' 
          }, { status: 400 })
        }
      } else {
        const { data: dbGulungans } = await supabaseAdmin.from('gulungan').select('lebar').eq('produk_id', id)
        const hasInvalidWidthInDb = dbGulungans?.some(g => parseInt(g.lebar) !== 110);
        if (hasInvalidWidthInDb) {
          return NextResponse.json({ 
            message: 'Validasi Gagal: Produk ini memiliki gulungan dengan lebar 70cm. Tidak bisa diubah ke motif Blok Lurik Alami.' 
          }, { status: 400 })
        }
      }
    }

    // ── 💡 GENERATE KODE PRODUK BARU (Format: LP-M27052026XX) ──
    if (updateData.kategori_id || updateData.motif_id) {
      const finalKategoriId = updateData.kategori_id ?? currentProduk.kategori_id

      const [resKategori, resMotif] = await Promise.all([
        supabaseAdmin.from('kategori').select('nama').eq('id', finalKategoriId).single(),
        supabaseAdmin.from('motif').select('nama').eq('id', finalMotifId).single()
      ])

      // 1. Inisial Motif (Lurik Pelangi -> LP)
      const motifName = resMotif.data?.nama || "M"
      const motifInitials = motifName.split(' ').map(w => w[0]).join('').toUpperCase()

      // 2. Inisial Kategori (Modern -> M)
      const catName = resKategori.data?.nama || "K"
      const catInitial = catName.charAt(0).toUpperCase()

      // 3. Tanggal (DDMMYYYY)
      const now = new Date()
      const dateStr = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`

      // 4. Random 2 digit
      const randomStr = Math.random().toString(36).substring(2, 4).toUpperCase()

      updateData.kode_produk = `${motifInitials}-${catInitial}${dateStr}${randomStr}`
    }

    if (imageFile && imageFile instanceof File) {
      const fileName = `${id}-${Date.now()}.${imageFile.name.split('.').pop()}`
      const { error: uploadError } = await supabaseAdmin.storage
        .from('prudok-img')
        .upload(`public/${fileName}`, imageFile)
      if (!uploadError) {
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('prudok-img')
          .getPublicUrl(`public/${fileName}`)
        updateData.gambar_url = publicUrl
      }
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('produk')
        .update(updateData)
        .eq('id', id)
      if (updateError) throw updateError
    }

    if (deletedGulunganIds.length > 0) {
      const { data: lockedGulungan, error: errCheck } = await supabaseAdmin
        .from('item_pre_order_reguler')
        .select('gulungan_id')
        .in('gulungan_id', deletedGulunganIds)
        .limit(1)

      if (lockedGulungan && lockedGulungan.length > 0) {
        return NextResponse.json({ message: 'Beberapa gulungan masih terikat pada pre-order reguler.' }, { status: 409 })
      }

      await supabaseAdmin.from('gulungan').delete().in('id', deletedGulunganIds).eq('produk_id', id)
    }

    if (gulunganData && gulunganData.length > 0) {
      let currentIdx = 1

      for (const g of gulunganData) {
        const payload = {
          nomor_gulungan: currentIdx,
          lebar: parseInt(g.lebar) || 110,
          panjang_total: parseFloat(g.panjang_total) || 0,
          panjang_sisa: parseFloat(g.panjang_total) || 0,
          harga_per_meter: parseFloat(g.harga_per_meter) || 0,
          rak_id: g.rak_id || null,
          is_active: true
        }

        if (g.id) {
          await supabaseAdmin
            .from('gulungan')
            .update({
              nomor_gulungan: payload.nomor_gulungan,
              lebar: payload.lebar,
              panjang_total: payload.panjang_total,
              harga_per_meter: payload.harga_per_meter,
              rak_id: payload.rak_id
            })
            .eq('id', g.id)
        } else {
          await supabaseAdmin.from('gulungan').insert({ ...payload, produk_id: id })
        }

        currentIdx++
      }
    }

    return NextResponse.json({ message: 'Produk dan data gulungan berhasil diperbarui' }, { status: 200 })
  } catch (err) {
    console.error('[API PATCH PRODUCT ERROR]:', err)
    return NextResponse.json({ message: 'Error: ' + err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ message: 'ID produk wajib diisi' }, { status: 400 })
    }

    const { count: countGulungan, error: errGulung } = await supabaseAdmin
      .from('gulungan')
      .select('*', { count: 'exact', head: true })
      .eq('produk_id', id)

    if (errGulung) throw errGulung
    if (countGulungan > 0) {
      return NextResponse.json({ message: 'Gagal menghapus produk! Data masih digunakan pada tabel gulungan.' }, { status: 409 })
    }

    const { count: countPO, error: errPO } = await supabaseAdmin
      .from('item_pre_order_reguler')
      .select('*', { count: 'exact', head: true })
      .eq('produk_id', id)

    if (errPO) throw errPO
    if (countPO > 0) {
      return NextResponse.json({ message: 'Gagal menghapus produk! Data terikat item pre-order.' }, { status: 409 })
    }

    await supabaseAdmin.from('produk').delete().eq('id', id)
    return NextResponse.json({ message: 'Produk berhasil dihapus' }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: 'Internal Server Error: ' + err.message }, { status: 500 })
  }
}