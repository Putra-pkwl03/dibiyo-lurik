import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const filterStatus = searchParams.get('status');
    const filterPembayaran = searchParams.get('status_pembayaran');

    let query = supabaseAdmin
      .from('pre_order_reguler')
      .select('id, nama_customer, status, status_pembayaran, total_harga, created_at');

    if (startDate && startDate.trim() !== '') query = query.gte('created_at', startDate);
    if (endDate && endDate.trim() !== '') query = query.lte('created_at', endDate + 'T23:59:59');
    if (filterStatus && filterStatus.trim() !== '') query = query.eq('status', filterStatus);
    if (filterPembayaran && filterPembayaran.trim() !== '') query = query.eq('status_pembayaran', filterPembayaran);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}