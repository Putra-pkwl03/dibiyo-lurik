import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';

// =====================================================
// GET - Mengambil daftar notifikasi berdasarkan Role (kp/cs)
// =====================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); 
    const statusDibaca = searchParams.get('unread_only');

    if (!role || (role !== 'kp' && role !== 'cs')) {
      return NextResponse.json(
        { error: "Parameter 'role' wajib diisi dengan 'kp' atau 'cs'" }, 
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('notifikasi_sistem')
      .select('*')
      .eq('penerima_role', role);

    if (statusDibaca === 'true') {
      query = query.eq('status_dibaca', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: data || [] }, { status: 200 });

  } catch (err) {
    console.error("💥 [GET NOTIFIKASI ERROR]:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// =====================================================
// PATCH - Menandai Notifikasi Tertentu Sudah Dibaca (Mengurangi Angka Badge)
// =====================================================
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id } = body; 

    if (!id) {
      return NextResponse.json({ error: 'ID Notifikasi wajib disertakan' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('notifikasi_sistem')
      .update({ status_dibaca: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Notifikasi berhasil ditandai sebagai dibaca', 
      data 
    }, { status: 200 });

  } catch (err) {
    console.error("💥 [PATCH NOTIFIKASI ERROR]:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


// =====================================================
// DELETE - Menghapus Satu atau Seluruh Notifikasi (Clear All)
// =====================================================
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const role = searchParams.get('role');
    const tipeOrder = searchParams.get('tipe_order'); 

    if (id) {
      const { error } = await supabaseAdmin
        .from('notifikasi_sistem')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return NextResponse.json({ success: true, message: 'Notifikasi berhasil dihapus' }, { status: 200 });
    }

    if (role && tipeOrder) {
      const { error } = await supabaseAdmin
        .from('notifikasi_sistem')
        .delete()
        .eq('penerima_role', role)
        .eq('tipe_order', tipeOrder);

      if (error) throw error;

      return NextResponse.json({ success: true, message: `Seluruh notifikasi ${tipeOrder} berhasil dibersihkan` }, { status: 200 });
    }

    return NextResponse.json({ error: 'Parameter tidak valid untuk penghapusan' }, { status: 400 });

  } catch (err) {
    console.error("💥 [DELETE NOTIFIKASI ERROR]:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}