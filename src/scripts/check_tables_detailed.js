require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = ['products', 'reviews', 'orders', 'users', 'user_addresses'];
  for (const table of tables) {
    const { data, error, count } = await supabase.from(table).select('*', { count: 'exact' }).limit(1);
    if (error) {
      console.log(`Table ${table} Error:`, error);
    } else {
      console.log(`Table ${table} exists. Count: ${count}`);
    }
  }
}

checkTables();
