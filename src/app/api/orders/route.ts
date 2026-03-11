import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return NextResponse.json(db.orders);
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    
    // Create new order record
    const newOrder = {
       id: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
       customer: orderData.customer || 'Guest User',
       total: orderData.total,
       status: 'Processing',
       date: new Date().toISOString().split('T')[0]
    };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    db.orders.unshift(newOrder); // Add to beginning of mock DB array
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
