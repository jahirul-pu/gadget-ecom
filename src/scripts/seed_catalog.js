const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanCurrentData() {
    console.log('Cleaning existing data...');
    // Order matters for FK constraints
    await supabase.from('product_tags').delete().neq('product_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('tags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('product_specs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('product_variants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('product_highlights').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('product_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('inventory').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('brands').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

async function seed() {
  await cleanCurrentData();

  console.log('--- Starting Phase 1 Catalog Seeding ---');

  // 1. Create Category Structure
  console.log('Step 1: Creating Categories...');
  const topCategories = [
    { name: 'Phones & Tablets', slug: 'phones-tablets', description: 'Latest smartphones and tablets', sort_order: 1, icon: '📱' },
    { name: 'Wearables', slug: 'wearables', description: 'Smart gadgets for your body', sort_order: 2, icon: '⌚' },
    { name: 'Audio', slug: 'audio', description: 'Premium sound devices', sort_order: 3, icon: '🎧' },
    { name: 'Smart Home', slug: 'smart-home', description: 'Home automation gadgets', sort_order: 4, icon: '🏠' },
    { name: 'Creator Gadgets', slug: 'creator-gadgets', description: 'Tools for content creators', sort_order: 5, icon: '📷' },
    { name: 'Accessories', slug: 'accessories', description: 'Essential gadget companions', sort_order: 6, icon: '🔌' }
  ];

  const { data: catData, error: catErr } = await supabase.from('categories').insert(topCategories).select();
  if (catErr) throw catErr;

  const catMap = catData.reduce((acc, cat) => { acc[cat.name] = cat.id; return acc; }, {});

  const subCategories = [
    { name: 'Smartphones', slug: 'smartphones', parent_id: catMap['Phones & Tablets'], sort_order: 1, icon: '📲' },
    { name: 'Foldables', slug: 'foldables', parent_id: catMap['Phones & Tablets'], sort_order: 2, icon: '📖' },
    { name: 'Tablets', slug: 'tablets', parent_id: catMap['Phones & Tablets'], sort_order: 3, icon: '平板' },
    { name: 'Smartwatches', slug: 'smartwatches', parent_id: catMap['Wearables'], sort_order: 1, icon: '⌚' },
    { name: 'Fitness Trackers', slug: 'fitness-trackers', parent_id: catMap['Wearables'], sort_order: 2, icon: '🏃' },
    { name: 'Smart Rings', slug: 'smart-rings', parent_id: catMap['Wearables'], sort_order: 3, icon: '💍' },
    { name: 'Wireless Earbuds', slug: 'wireless-earbuds', parent_id: catMap['Audio'], sort_order: 1, icon: '👂' },
    { name: 'Headphones', slug: 'headphones', parent_id: catMap['Audio'], sort_order: 2, icon: '🎧' },
    { name: 'Bluetooth Speakers', slug: 'bluetooth-speakers', parent_id: catMap['Audio'], sort_order: 3, icon: '🔊' },
    { name: 'Security Cameras', slug: 'security-cameras', parent_id: catMap['Smart Home'], sort_order: 1, icon: '🛡️' },
    { name: 'Smart Lights', slug: 'smart-lights', parent_id: catMap['Smart Home'], sort_order: 2, icon: '💡' },
    { name: 'Smart Plugs', slug: 'smart-plugs', parent_id: catMap['Smart Home'], sort_order: 3, icon: '🔌' },
    { name: 'Doorbells', slug: 'doorbells', parent_id: catMap['Smart Home'], sort_order: 4, icon: '🔔' },
    { name: 'Smart Locks', slug: 'smart-locks', parent_id: catMap['Smart Home'], sort_order: 5, icon: '🔒' },
    { name: 'Action Cameras', slug: 'action-cameras', parent_id: catMap['Creator Gadgets'], sort_order: 1, icon: '📽️' },
    { name: 'Gimbals', slug: 'gimbals', parent_id: catMap['Creator Gadgets'], sort_order: 2, icon: '⚖️' },
    { name: 'Microphones', slug: 'microphones', parent_id: catMap['Creator Gadgets'], sort_order: 3, icon: '🎤' },
    { name: 'Streaming Equipment', slug: 'streaming-equipment', parent_id: catMap['Creator Gadgets'], sort_order: 4, icon: '📺' },
    { name: 'Lighting', slug: 'creator-lighting', parent_id: catMap['Creator Gadgets'], sort_order: 5, icon: '💡' },
    { name: 'Chargers', slug: 'chargers', parent_id: catMap['Accessories'], sort_order: 1, icon: '🔋' },
    { name: 'Power Banks', slug: 'power-banks', parent_id: catMap['Accessories'], sort_order: 2, icon: '🔋' },
    { name: 'Cables', slug: 'cables', parent_id: catMap['Accessories'], sort_order: 3, icon: '🎗️' },
    { name: 'Wireless Chargers', slug: 'wireless-chargers', parent_id: catMap['Accessories'], sort_order: 4, icon: '⚡' },
    { name: 'Phone Mounts', slug: 'phone-mounts', parent_id: catMap['Accessories'], sort_order: 5, icon: '🚲' }
  ];

  const { data: subCatData, error: subCatErr } = await supabase.from('categories').insert(subCategories).select();
  if (subCatErr) throw subCatErr;

  const finalCatMap = subCatData.reduce((acc, cat) => { acc[cat.name] = cat.id; return acc; }, {});

  // 2. Populate Brands Table
  console.log('Step 2: Populating Brands...');
  const brands = [
    { name: 'Apple', slug: 'apple', is_featured: true },
    { name: 'Samsung', slug: 'samsung', is_featured: true },
    { name: 'Sony', slug: 'sony', is_featured: true },
    { name: 'Xiaomi', slug: 'xiaomi', is_featured: true },
    { name: 'Nothing', slug: 'nothing', is_featured: true },
    { name: 'DJI', slug: 'dji', is_featured: true },
    { name: 'GoPro', slug: 'gopro', is_featured: true },
    { name: 'Anker', slug: 'anker', is_featured: true },
    { name: 'JBL', slug: 'jbl', is_featured: true },
    { name: 'Logitech', slug: 'logitech' },
    { name: 'Garmin', slug: 'garmin' },
    { name: 'Amazfit', slug: 'amazfit' },
    { name: 'Huawei', slug: 'huawei' },
    { name: 'Baseus', slug: 'baseus' },
    { name: 'UGREEN', slug: 'ugreen' },
    { name: 'Belkin', slug: 'belkin' },
    { name: 'TP-Link', slug: 'tp-link' },
    { name: 'Philips', slug: 'philips' },
    { name: 'Marshall', slug: 'marshall' },
    { name: 'Beats', slug: 'beats' }
  ];

  const { data: brandData, error: brandErr } = await supabase.from('brands').insert(brands).select();
  if (brandErr) throw brandErr;

  const brandMap = brandData.reduce((acc, brand) => { acc[brand.name] = brand.id; return acc; }, {});

  // 3. Create Initial Product Catalog
  console.log('Step 3: Creating Products...');
  const productsToCreate = [
    // Smartphones
    { name: 'iPhone 15', brand: 'Apple', category: 'Smartphones', price: 99900, sale_price: 105000, sku: 'APL-I15-MTL', model: 'A3090', desc: 'The latest iPhone with A16 Bionic chip and Dynamic Island.', is_featured: true },
    { name: 'Samsung Galaxy S23', brand: 'Samsung', category: 'Smartphones', price: 85000, sale_price: 95000, sku: 'SAM-S23-BLK', model: 'SM-S911B', desc: 'Powerful Android flagship with a stunning camera system.' },
    { name: 'Xiaomi 13', brand: 'Xiaomi', category: 'Smartphones', price: 65000, sale_price: 72000, sku: 'XIA-13-GRN', model: '2211133G', desc: 'Leica co-engineered camera and Snapdragon 8 Gen 2.' },
    
    // Wearables
    { name: 'Apple Watch Series 9', brand: 'Apple', category: 'Smartwatches', price: 45000, sale_price: 48000, sku: 'APL-W9-MID', model: 'A2978', desc: 'Smarter, brighter, mightier. The essential companion for a healthy life.', is_featured: true },
    { name: 'Amazfit GTR 4', brand: 'Amazfit', category: 'Smartwatches', price: 18500, sale_price: 21000, sku: 'AMZ-GTR4-BRN', model: 'A2166', desc: 'Vintage style with modern health tracking features.' },
    { name: 'NovaWatch Series 5', brand: 'Nothing', category: 'Smartwatches', price: 24500, sale_price: 28000, sku: 'NOV-S5-WHT', model: 'NV-W5', desc: 'Minimalist design with maximum performance.' },

    // Audio
    { name: 'Sony WF-1000XM5', brand: 'Sony', category: 'Wireless Earbuds', price: 29500, sale_price: 32000, sku: 'SON-XM5-BLK', model: 'WF1000XM5', desc: 'The best noise cancelling earbuds in the world.', is_featured: true },
    { name: 'Apple AirPods Pro', brand: 'Apple', category: 'Wireless Earbuds', price: 24500, sale_price: 26000, sku: 'APL-APP2-WHT', model: 'A2698', desc: 'Magic reinvented with twice the active noise cancellation.' },
    { name: 'JBL Flip 6', brand: 'JBL', category: 'Bluetooth Speakers', price: 12500, sale_price: 15000, sku: 'JBL-FLIP6-RED', model: 'FLIP6', desc: 'Portable waterproof speaker with powerful sound.' },
    { name: 'Marshall Emberton II', brand: 'Marshall', category: 'Bluetooth Speakers', price: 18500, sale_price: 22000, sku: 'MAR-EMB2-CRM', model: 'EMBERTON II', desc: 'Compact portable speaker with the loud and vibrant sound you love.' },

    // Smart Home
    { name: 'TP-Link Tapo C200 Security Camera', brand: 'TP-Link', category: 'Security Cameras', price: 3500, sale_price: 4500, sku: 'TPL-C200', model: 'C200', desc: 'Pan/Tilt Home Security Wi-Fi Camera.', is_featured: true },
    { name: 'Xiaomi Smart LED Bulb', brand: 'Xiaomi', category: 'Smart Lights', price: 1200, sale_price: 1500, sku: 'XIA-LED-B', model: 'MJDPL01YL', desc: 'Smart voice control, adjustable brightness and color temperature.' },

    // Creator Gadgets
    { name: 'DJI Osmo Action 4', brand: 'DJI', category: 'Action Cameras', price: 38500, sale_price: 42000, sku: 'DJI-ACT4', model: 'AC003', desc: 'Set the tone with best-in-class image quality and flexibility.', is_featured: true },
    { name: 'GoPro Hero 12', brand: 'GoPro', category: 'Action Cameras', price: 42500, sale_price: 48000, sku: 'GPR-H12', model: 'CHDHX-121-RW', desc: 'Unbelievable image quality, even better video stabilization.' },
    { name: 'DJI Osmo Mobile 6', brand: 'DJI', category: 'Gimbals', price: 15500, sale_price: 18000, sku: 'DJI-OM6', model: 'OF600', desc: 'Unfold your creativity with intelligent tracking and quick launch.' },

    // Accessories
    { name: 'Anker 20000mAh Power Bank', brand: 'Anker', category: 'Power Banks', price: 4500, sale_price: 5500, sku: 'ANK-PW-20K', model: 'A1289', desc: 'High-speed charging for your phone, tablet, and more.', is_featured: true },
    { name: 'UGREEN 65W Fast Charger', brand: 'UGREEN', category: 'Chargers', price: 2800, sale_price: 3500, sku: 'UGR-65W-CHR', model: 'CD244', desc: 'GaN fast charger with 3 ports for all your devices.' },
    { name: 'Baseus USB-C Cable', brand: 'Baseus', category: 'Cables', price: 650, sale_price: 900, sku: 'BAS-USBC-1M', model: 'CATJK-A01', desc: 'High-quality braided USB-C to USB-C cable.' },
    { name: 'Belkin MagSafe Charger', brand: 'Belkin', category: 'Wireless Chargers', price: 3500, sale_price: 4500, sku: 'BEL-MAG-W', model: 'WIA004btWH', desc: 'Magnetic Wireless Charger Pad with 15W fast charging.' }
  ];

  const productsForDb = productsToCreate.map(p => ({
    name: p.name,
    slug: p.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
    brand_id: brandMap[p.brand],
    category_id: finalCatMap[p.category] || catMap[p.category],
    sku: p.sku,
    model_number: p.model,
    short_description: p.desc.substring(0, 100),
    full_description: p.desc,
    price: p.price,
    sale_price: p.price, // Matching price for consistency or sale_price
    cost_price: p.price * 0.7,
    stock_quantity: 25,
    stock_status: 'In Stock',
    is_featured: p.is_featured || false,
    is_trending: p.is_trending || false,
    is_active: true
  }));

  const { data: createdProducts, error: prodErr } = await supabase.from('products').insert(productsForDb).select();
  if (prodErr) throw prodErr;

  // 4, 5, 6, 7, 8: Media, Highlights, Specs, Inventory, Tags
  console.log('Step 4-8: Populating related product data...');
  
  for (const product of createdProducts) {
    // Media
    const images = [
      { product_id: product.id, image_url: `https://images.unsplash.com/photo-15${Math.floor(Math.random()*1000000)}?auto=format&fit=crop&q=80&w=1000`, is_thumbnail: true, sort_order: 0 },
      { product_id: product.id, image_url: `https://images.unsplash.com/photo-15${Math.floor(Math.random()*1000000)}?auto=format&fit=crop&q=80&w=1000`, is_thumbnail: false, sort_order: 1 },
      { product_id: product.id, image_url: `https://images.unsplash.com/photo-15${Math.floor(Math.random()*1000000)}?auto=format&fit=crop&q=80&w=1000`, is_thumbnail: false, sort_order: 2 }
    ];
    await supabase.from('product_images').insert(images);

    // Highlights
    const highlights = [
        { product_id: product.id, highlight_text: 'Premium Build Quality', sort_order: 0 },
        { product_id: product.id, highlight_text: 'Best in class performance', sort_order: 1 },
        { product_id: product.id, highlight_text: 'Long lasting battery life', sort_order: 2 },
        { product_id: product.id, highlight_text: '1 Year official warranty', sort_order: 3 }
    ];
    await supabase.from('product_highlights').insert(highlights);

    // Specs
    const specs = [
        { product_id: product.id, spec_group: 'Display', spec_name: 'Panel Type', spec_value: 'OLED / AMOLED', sort_order: 0 },
        { product_id: product.id, spec_group: 'Battery', spec_name: 'Capacity', spec_value: 'High Capacity Li-Ion', sort_order: 0 },
        { product_id: product.id, spec_group: 'Warranty', spec_name: 'Duration', spec_value: '12 Months', sort_order: 0 }
    ];
    await supabase.from('product_specs').insert(specs);

    // Inventory
    await supabase.from('inventory').insert({
        product_id: product.id,
        warehouse_location: 'Main Dhaka Hub',
        quantity: 25,
        reserved_quantity: 0
    });

    // Tags
    const tags = ['gadget', 'new-arrival', product.slug.split('-')[0]];
    for (const tagName of tags) {
        let { data: tag } = await supabase.from('tags').select('id').eq('name', tagName).single();
        if (!tag) {
            const { data: newTag } = await supabase.from('tags').insert({ name: tagName, slug: tagName }).select('id').single();
            tag = newTag;
        }
        if (tag) {
            await supabase.from('product_tags').insert({ product_id: product.id, tag_id: tag.id });
        }
    }
  }

  console.log('--- Phase 1 Catalog Seeding Complete ---');
}

seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
