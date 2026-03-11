import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return NextResponse.json(db.products);
}

export async function POST(request: Request) {
  try {
    const product = await request.json();
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    db.products.unshift(product);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    db.products = db.products.filter(p => p.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedProduct = await request.json();
    
    if (!updatedProduct.id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const index = db.products.findIndex(p => p.id === updatedProduct.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    db.products[index] = { ...db.products[index], ...updatedProduct };
    return NextResponse.json(db.products[index], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
