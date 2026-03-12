import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // 1. Mark orders as having an "Inactive" customer instead of deleting them
    // Logic: We don't have a direct customer_id in orders, but we might want to flag them.
    // However, the request says "order history will remain. there will be a sign that the user has deleted their account."
    // Since orders table uses customer_name and doesn't link to users table by foreign key, 
    // we should ideally update the customer_name to include "(Deleted)" or similar.
    // To do this accurately, we need to know the customer_name associated with this user.
    
    // Fetch user details first
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', userId)
        .single();
    
    if (user) {
        // Update all orders for this customer name
        await supabase
            .from('orders')
            .update({ customer_name: `${user.full_name} (Deleted)` })
            .eq('customer_name', user.full_name);
    }

    // 2. Delete the user
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Account Error:", error.message);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
