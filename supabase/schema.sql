-- ==========================================
-- E-commerce Database Schema for Supabase
-- ==========================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    price NUMERIC NOT NULL,
    "originalPrice" NUMERIC,
    discount TEXT,
    rating NUMERIC DEFAULT 0,
    "reviewsCount" INTEGER DEFAULT 0,
    "stockStatus" TEXT DEFAULT 'In Stock',
    stock INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active',
    images JSONB DEFAULT '[]'::jsonb,
    category TEXT DEFAULT 'Uncategorized',
    badge TEXT,
    colors JSONB DEFAULT '[]'::jsonb,
    storage JSONB DEFAULT '[]'::jsonb,
    highlights JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    specs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Reviews Table (Linked to Products)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending',
    payment_method TEXT DEFAULT 'COD',
    items_count INTEGER DEFAULT 1,
    cover_image TEXT,
    phone TEXT,
    address TEXT,
    district TEXT,
    area TEXT,
    order_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    district TEXT,
    area TEXT,
    address TEXT,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.5 Create User Addresses Table
CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT CHECK (category IN ('Home', 'Office', 'Business')) DEFAULT 'Home',
    district TEXT NOT NULL,
    area TEXT NOT NULL,
    full_address TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS) for modern security practices
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- 5. Create basic safety policies (Public read, authenticated write)
-- Note: You should update these depending on your auth strategy!

CREATE POLICY "Allow public read access to user_addresses" 
ON public.user_addresses FOR SELECT USING (true);

CREATE POLICY "Allow public insert to user_addresses" 
ON public.user_addresses FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to user_addresses" 
ON public.user_addresses FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete to user_addresses" 
ON public.user_addresses FOR DELETE USING (true);

CREATE POLICY "Allow public read access to products" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Allow public insert to products" 
ON public.products FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to products" 
ON public.products FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete to products" 
ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public read access to reviews" 
ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Allow public insert to reviews" 
ON public.reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to orders" 
ON public.orders FOR SELECT USING (true);

CREATE POLICY "Allow public insert to orders" 
ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to orders" 
ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete to orders" 
ON public.orders FOR DELETE USING (true);

-- (Optional) Example Mock Data Insertion:
/*
INSERT INTO public.products (name, brand, price, "stockStatus", stock, category, description)
VALUES ('Zenith Pro Earbuds', 'Zenith', 12900, 'In Stock', 45, 'Audio', 'Experience premium sound quality...');
*/
