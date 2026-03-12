import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    // Auto-seed if empty!
    if (data.length === 0) {
      const seedData = db.products.map(p => {
        const { id, reviews, ...rest } = p; // Remove mock IDs and reviews (separate table)
        return rest;
      });
      
      const { data: insertedData, error: insertError } = await supabase.from('products').insert(seedData).select('*').order('created_at', { ascending: false });
      if (insertError) throw insertError;
      return NextResponse.json(insertedData);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Products GET Error:", error.message);
    return NextResponse.json([], { status: 200 }); // Returns empty array instead of crashing UI if env missing
  }
}

export async function POST(request: Request) {
  try {
    const product = await request.json();
    const { id, ...supabaseProduct } = product; // Let Supabase handle UUID
    
    const { data, error } = await supabase.from('products').insert([supabaseProduct]).select().single();
    if (error) throw error;
    
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Products POST Error:", error.message);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Products DELETE Error:", error.message);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedProduct = await request.json();
    
    if (!updatedProduct.id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    const { id, created_at, ...updateData } = updatedProduct; // Don't try to update id or created_at
    
    const { data, error } = await supabase.from('products').update(updateData).eq('id', id).select().single();
    if (error) throw error;
    
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Products PUT Error:", error.message);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
