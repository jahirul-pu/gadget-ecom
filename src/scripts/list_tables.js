require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables'); // Custom RPC if it exists
  if (error) {
     console.log("No get_tables RPC. Trying raw selection...");
     // Try to select from a non-existent table to see the hint again
     const { error: err2 } = await supabase.from('random_table_name').select('*');
     console.log("Hint from random table:", err2?.hint);
  } else {
     console.log("Tables:", data);
  }
}

listTables();
