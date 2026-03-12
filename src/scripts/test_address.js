require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAddAddress() {
  // Get first user
  const { data: users } = await supabase.from('users').select('id').limit(1);
  if (!users || users.length === 0) {
    console.error("No users found");
    return;
  }
  const userId = users[0].id;
  console.log("Using userId:", userId);

  const newAddress = {
    user_id: userId,
    category: 'Home',
    district: 'Dhaka',
    area: 'Savar',
    full_address: 'Test Address 123',
    is_default: true
  };

  const { data, error } = await supabase
    .from('user_addresses')
    .insert([newAddress])
    .select()
    .single();

  if (error) {
    console.error("Error inserting address:", error);
  } else {
    console.log("Successfully inserted address:", data);
  }
}

testAddAddress();
