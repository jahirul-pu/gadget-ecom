require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Environment variables missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAddressTable() {
  console.log("Creating user_addresses table...");

  const sql = `
    -- Ensure users table has necessary columns for the UI
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS district TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS area TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;

    CREATE TABLE IF NOT EXISTS public.user_addresses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        category TEXT, -- e.g., 'Home', 'Office'
        district TEXT NOT NULL,
        area TEXT NOT NULL,
        full_address TEXT NOT NULL,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    -- Enable RLS
    ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

    -- Create Policies
    DROP POLICY IF EXISTS "Allow all actions on user_addresses" ON public.user_addresses;
    CREATE POLICY "Allow all actions on user_addresses" ON public.user_addresses FOR ALL USING (true);
  `;

  // Since we can't run raw SQL easily via the JS client without an RPC, 
  // we'll try to check if it exists first and then insert/select to trigger cache refresh
  // but usually, the user should run this in the Supabase Dashboard SQL Editor.
  // HOWEVER, I can try to use a dummy select to verify.
  
  console.log("Please run the following SQL in your Supabase Dashboard SQL Editor:");
  console.log("--------------------------------------------------");
  console.log(sql);
  console.log("--------------------------------------------------");
  
  // I will attempt to "create" it by trying to insert and seeing if it fails with 'not found'
  const { error } = await supabase.from('user_addresses').select('*').limit(1);
  if (error && error.message.includes("Could not find the table")) {
     console.log("Status: Table still missing. Please run the SQL above.");
  } else if (error) {
     console.log("Status: Table exists but check failed:", error.message);
  } else {
     console.log("Status: Table exists!");
  }
}

createAddressTable();
