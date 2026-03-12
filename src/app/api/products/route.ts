import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Advanced Join to fetch everything in one go for high performance
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(name),
        category:categories(
          name,
          parent:categories(name)
        ),
        images:product_images(image_url, is_thumbnail, sort_order),
        highlights:product_highlights(highlight_text, sort_order),
        variants:product_variants(*),
        specs:product_specs(spec_group, spec_name, spec_value, sort_order)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform relational data back to the flat format the UI expects
    const mappedProducts = data.map(p => {
      const parentName = (p.category as any)?.parent?.name;
      const currentName = (p.category as any)?.name || 'Uncategorized';
      const fullCategory = parentName ? `${parentName} > ${currentName}` : currentName;
      
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand?.name || 'Generic',
        category: fullCategory,
        price: Number(p.price),
        originalPrice: Number(p.sale_price || p.price),
        discount: p.discount_percentage ? `${p.discount_percentage}%` : '',
        rating: Number(p.rating),
        reviewsCount: p.review_count,
        stockStatus: p.stock_status,
        stock: p.stock_quantity,
        status: p.is_active ? 'Active' : 'Inactive',
        images: p.images?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((i: any) => i.image_url) || [],
        highlights: p.highlights?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((h: any) => h.highlight_text) || [],
        colors: p.variants?.filter((v: any) => v.variant_type === 'Color').map((v: any) => ({ name: v.variant_value, value: v.variant_value })) || [],
        storage: p.variants?.filter((v: any) => v.variant_type === 'Storage').map((v: any) => v.variant_value) || [],
        description: p.full_description || p.short_description || '',
        specs: p.specs?.reduce((acc: any, s: any) => {
          acc[s.spec_name] = s.spec_value;
          return acc;
        }, {}) || {},
        reviews: [],
        category_id: p.category_id,
        is_featured: p.is_featured
      };
    });

    return NextResponse.json(mappedProducts);
  } catch (error: any) {
    console.error("Products GET Error:", error.message);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Insert basic product info
    const { data: product, error: productError } = await supabase.from('products').insert([{
      name: body.name,
      slug: body.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(7),
      short_description: body.description?.substring(0, 150),
      full_description: body.description,
      price: body.price,
      sale_price: body.originalPrice || body.price,
      stock_quantity: body.stock || 0,
      is_active: true
    }]).select().single();

    if (productError) throw productError;

    // 2. Insert Images
    if (body.images && body.images.length > 0) {
      const images = body.images.map((url: string, idx: number) => ({
        product_id: product.id,
        image_url: url,
        is_thumbnail: idx === 0,
        sort_order: idx
      }));
      await supabase.from('product_images').insert(images);
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Products POST Error:", error.message);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
