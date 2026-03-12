import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message.includes("Could not find the table")) {
        console.warn("Table 'user_addresses' not found. Returning empty array.");
        return NextResponse.json([]);
      }
      throw error;
    }

    const mapped = data.map(a => ({
      id: a.id,
      userId: a.user_id,
      category: a.category,
      district: a.district,
      area: a.area,
      fullAddress: a.full_address,
      isDefault: a.is_default
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error("Address GET Error:", error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if user already has any addresses
    const { count } = await supabase
      .from('user_addresses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', body.userId);

    // If this is the first address or user explicitly set it as default
    const shouldBeDefault = (count === 0) || body.isDefault;

    if (shouldBeDefault) {
      // Unset any existing default (just in case, though count==0 handles first case)
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', body.userId);
    }

    const newAddress = {
      user_id: body.userId,
      category: body.category,
      district: body.district,
      area: body.area,
      full_address: body.fullAddress,
      is_default: shouldBeDefault
    };

    const { data, error } = await supabase
      .from('user_addresses')
      .insert([newAddress])
      .select()
      .single();

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json({ 
        error: error.message, 
        details: error.details,
        hint: error.hint 
      }, { status: 500 });
    }

    const mapped = {
      id: data.id,
      userId: data.user_id,
      category: data.category,
      district: data.district,
      area: data.area,
      fullAddress: data.full_address,
      isDefault: data.is_default
    };

    return NextResponse.json(mapped, { status: 201 });
  } catch (error: any) {
    console.error("Address POST Route Error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to add address' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, userId, ...updateData } = body;

    // If setting as default, unset others first
    if (updateData.isDefault && userId) {
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const dbUpdate = {
      category: updateData.category,
      district: updateData.district,
      area: updateData.area,
      full_address: updateData.fullAddress,
      is_default: updateData.isDefault
    };

    const { data, error } = await supabase
      .from('user_addresses')
      .update(dbUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const mapped = {
      id: data.id,
      userId: data.user_id,
      category: data.category,
      district: data.district,
      area: data.area,
      fullAddress: data.full_address,
      isDefault: data.is_default
    };

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error("Address PUT Error:", error?.message);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    // 1. Fetch the address to be deleted
    const { data: addressToDelete, error: fetchError } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !addressToDelete) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // 2. Prevent deleting the default address
    if (addressToDelete.is_default) {
      return NextResponse.json({ error: "can't delete default address" }, { status: 400 });
    }

    // 3. Delete the address
    const { error: deleteError } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // 4. After deletion, check remaining addresses. 
    // If only one remains, it should be marked as default automatically.
    const { data: remaining, count } = await supabase
      .from('user_addresses')
      .select('*', { count: 'exact' })
      .eq('user_id', addressToDelete.user_id);

    if (count === 1 && remaining) {
      await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', remaining[0].id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Address DELETE Error:", error?.message);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
