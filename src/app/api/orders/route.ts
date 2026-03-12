import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function decodeImageField(cover_image: string | null) {
  if (!cover_image) return { image: '', phone: null, address: null, district: null, area: null, orderItems: [] };
  if (cover_image.startsWith('json:')) {
    try {
      const parsed = JSON.parse(cover_image.slice(5));
      return {
        image: parsed.i || '',
        phone: parsed.p || null,
        address: parsed.a || null,
        district: parsed.d || null,
        area: parsed.ar || null,
        orderItems: parsed.oi || []
      };
    } catch {
      return { image: cover_image, phone: null, address: null, district: null, area: null, orderItems: [] };
    }
  }
  return { image: cover_image, phone: null, address: null, district: null, area: null, orderItems: [] };
}

export async function GET() {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    // Map database snake_case fields back to what the frontend expects
    const mappedOrders = data.map(o => {
      const extra = decodeImageField(o.cover_image);
      return {
        id: o.id,
        customer: o.customer_name,
        total: o.total,
        status: o.status,
        date: o.created_at.split('T')[0],
        payment: o.payment_method,
        items: o.items_count,
        image: extra.image,
        phone: extra.phone,
        address: extra.address,
        district: extra.district,
        area: extra.area,
        orderItems: extra.orderItems
      };
    });
    
    return NextResponse.json(mappedOrders);
  } catch (error: any) {
    console.error("Orders GET Error:", error.message);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    
    const extraData = JSON.stringify({
      i: orderData.image || '',
      p: orderData.phone || null,
      a: orderData.address || null,
      d: orderData.district || null,
      ar: orderData.area || null,
      oi: orderData.orderItems || []
    });

    const newOrder = {
       customer_name: orderData.customer || 'Guest User',
       total: orderData.total,
       status: 'Pending',
       payment_method: orderData.payment || 'COD',
       items_count: orderData.items || 1,
       cover_image: 'json:' + extraData
    };

    const { data, error } = await supabase.from('orders').insert([newOrder]).select().single();
    if (error) throw error;
    
    const extra = decodeImageField(data.cover_image);

    const mappedOrder = {
      id: data.id,
      customer: data.customer_name,
      total: data.total,
      status: data.status,
      date: data.created_at.split('T')[0],
      payment: data.payment_method,
      items: data.items_count,
      image: extra.image,
      phone: extra.phone,
      address: extra.address,
      district: extra.district,
      area: extra.area,
      orderItems: extra.orderItems
    };

    return NextResponse.json(mappedOrder, { status: 201 });
  } catch (error: any) {
    console.error("Orders POST Error:", error.message);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing ID or status' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Supabase Order Update Error:", error);
      throw error;
    }
    
    const extra = decodeImageField(data.cover_image);

    const mappedOrder = {
      id: data.id,
      customer: data.customer_name,
      total: data.total,
      status: data.status,
      date: data.created_at.split('T')[0],
      payment: data.payment_method,
      items: data.items_count,
      image: extra.image,
      phone: extra.phone,
      address: extra.address,
      district: extra.district,
      area: extra.area,
      orderItems: extra.orderItems
    };

    return NextResponse.json(mappedOrder);
  } catch (error: any) {
    console.error("Orders PATCH Error Trace:", error);
    return NextResponse.json({ 
      error: 'Failed to update order', 
      details: error.message,
      hint: error.hint
    }, { status: 500 });
  }
}
