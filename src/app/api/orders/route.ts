import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(name, phone, email),
        items:order_items(
          *,
          product:products(name, id, product_images(image_url))
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const mappedOrders = data.map(o => ({
      id: o.id,
      customer: o.user?.name || 'Guest User',
      total: Number(o.total_price),
      status: o.order_status.charAt(0).toUpperCase() + o.order_status.slice(1),
      date: o.created_at.split('T')[0],
      payment: o.payment_method,
      items: o.items?.length || 0,
      image: o.items?.[0]?.product?.product_images?.[0]?.image_url || '/images/placeholder.png',
      phone: o.user?.phone,
      address: o.shipping_address?.fullAddress || '',
      district: o.shipping_address?.district || '',
      area: o.shipping_address?.area || '',
      orderItems: o.items?.map((item: any) => ({
        name: item.product?.name,
        quantity: item.quantity,
        price: Number(item.price)
      })) || []
    }));
    
    return NextResponse.json(mappedOrders);
  } catch (error: any) {
    console.error("Orders GET Error:", error.message);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Find or create user (Simple logic for now)
    let userId = null;
    if (body.customer) {
        const { data: userData } = await supabase.from('users').select('id').eq('name', body.customer).single();
        userId = userData?.id;
    }

    // 2. Create Order Header
    const { data: order, error: orderError } = await supabase.from('orders').insert([{
      user_id: userId,
      order_status: 'pending',
      payment_status: 'unpaid',
      subtotal: body.total, // Simplified subtotal
      shipping_cost: 0,
      total_price: body.total,
      shipping_address: {
        fullAddress: body.address,
        district: body.district,
        area: body.area
      },
      payment_method: body.payment || 'COD'
    }]).select().single();

    if (orderError) throw orderError;

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Orders POST Error:", error.message);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    
    const { error } = await supabase
      .from('orders')
      .update({ order_status: status.toLowerCase() })
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
