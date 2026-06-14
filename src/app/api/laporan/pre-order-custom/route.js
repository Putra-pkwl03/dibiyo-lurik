import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const filterStatus = searchParams.get('status');
    const filterPembayaran = searchParams.get('status_pembayaran');

    // Kolom disesuaikan murni dengan struktur tabel kamu
    let query = supabaseAdmin
      .from('pre_order_custom')
      .select('id, nama_customer, status, status_pembayaran, total_harga, created_at');

    if (startDate && startDate.trim() !== '') {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate && endDate.trim() !== '') {
      query = query.lte('created_at', endDate + 'T23:59:59');
    }
    
    if (filterStatus && filterStatus.trim() !== '') {
      query = query.eq('status', filterStatus);
    }
    
    if (filterPembayaran && filterPembayaran.trim() !== '') {
      query = query.eq('status_pembayaran', filterPembayaran);
    }

    const { data: poList, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase Query Error]:', error.message);
      return NextResponse.json(
        { error: 'Gagal memuat PO custom dari database: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: poList || [] }, { status: 200 });

  } catch (catchErr) {
    console.error('[API Route Catch Error]:', catchErr.message);
    return NextResponse.json(
      { error: 'Terjadi kegagalan internal server: ' + catchErr.message },
      { status: 500 }
    );
  }
}