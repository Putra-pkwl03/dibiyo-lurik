import { NextResponse } from 'next/server'
import supabaseAdmin from '../../../lib/supabase-admin'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
 
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
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
        motif:motif_id(id, nama),
        gulungan (
          id, 
          nomor_gulungan, 
          lebar, 
          panjang_total, 
          panjang_sisa,
          harga:harga_per_meter,
          rak:rak_id(id, nama)
        )
      `, { count: 'exact' });

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ 
      data: data || [], 
      meta: { 
        total: count, 
        page, 
        limit 
      } 
    }, { status: 200 });

  } catch (err) {
    console.error("Supabase Error:", err); 
    return NextResponse.json({ message: 'Gagal memuat produk: ' + err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const kategori_id = formData.get("kategori_id")
    const motif_id = formData.get("motif_id")
    const jenis_pewarna = formData.get("jenis_pewarna")
    const imageFile = formData.get("image")
    const gulungansRaw = formData.get("gulungans")
    const gulungans = gulungansRaw ? JSON.parse(gulungansRaw) : []

    if (!motif_id || !kategori_id || !jenis_pewarna) {
      return NextResponse.json({ message: 'Field utama wajib diisi' }, { status: 400 })
    }

    // ── 💡 VALIDASI BACKEND ATURAN KHUSUS (BLOK LURIK + ALAMI) ──
    const { data: motData } = await supabaseAdmin.from('motif').select('nama').eq('id', motif_id).single()
    const isBlokLurik = motData?.nama?.toLowerCase() === 'blok lurik'
    const isAlami = jenis_pewarna?.toLowerCase() === 'alami'

    if (isBlokLurik && isAlami) {
      const hasInvalidWidth = gulungans.some(g => parseInt(g.lebar_gulungan) !== 110);
      if (hasInvalidWidth) {
        return NextResponse.json({ 
          message: 'Validasi Gagal: Motif Blok Lurik dengan pewarna Alami hanya diperbolehkan menggunakan lebar 110 cm.' 
        }, { status: 400 })
      }
    }

// ── 💡 GENERATE KODE PRODUK (Format: LP-M27052026XX) ──
    const { data: catData } = await supabaseAdmin.from('kategori').select('nama').eq('id', kategori_id).single()
    
    // 1. Ambil Inisial Motif (Contoh: "Lurik Pelangi" -> "LP")
    const motifInitials = (motData?.nama || "M")
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();

    // 2. Ambil Inisial Kategori (Contoh: "Modern" -> "M")
    const catInitial = (catData?.nama || "K").charAt(0).toUpperCase();

    // 3. Format Tanggal (DDMMYYYY)
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`;

    // 4. Generate 2 karakter random
    const randomStr = Math.random().toString(36).substring(2, 4).toUpperCase();

    // 5. Gabungkan menjadi format: LP-M27052026XX
    const kodeGenerated = `${motifInitials}-${catInitial}${dateStr}${randomStr}`;

    // ── UPLOAD GAMBAR ──
    let finalGambarUrl = null
    if (imageFile && imageFile.size > 0) {
      const filePath = `produk/${Date.now()}-${Math.random().toString(36).substring(7)}.${imageFile.name.split('.').pop()}`
      const { error: uploadError } = await supabaseAdmin.storage.from('prudok-img').upload(filePath, imageFile)
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabaseAdmin.storage.from('prudok-img').getPublicUrl(filePath)
      finalGambarUrl = publicUrl
    }

const primaryRakId = gulungans.length > 0 ? gulungans[0].rak_id : null;

if (!primaryRakId) {
  return NextResponse.json({ message: 'Lokasi rak wajib ditentukan' }, { status: 400 })
}

const { data: produkBaru, error: produkError } = await supabaseAdmin
  .from('produk')
  .insert({
    kode_produk: kodeGenerated,
    motif_id,
    kategori_id,
    jenis_pewarna,
    gambar_url: finalGambarUrl,
  })
  .select('id')
  .single()

if (produkError) throw produkError

    if (gulungans.length > 0) {
      const gulunganToInsert = gulungans.map((gulung, i) => ({
        produk_id: produkBaru.id,
        nomor_gulungan: i + 1,
        lebar: parseInt(gulung.lebar_gulungan),
        panjang_total: parseFloat(gulung.panjang_gulungan),
        panjang_sisa: parseFloat(gulung.panjang_gulungan),
        harga_per_meter: parseFloat(gulung.harga_per_meter),
        rak_id: gulung.rak_id || null, 
      }))

      const { error: gulunganError } = await supabaseAdmin.from('gulungan').insert(gulunganToInsert)
      if (gulunganError) throw gulunganError
    }

    return NextResponse.json({ message: 'Produk berhasil dibuat' }, { status: 201 })
  } catch (err) {
    console.error('[API Error]:', err)
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}