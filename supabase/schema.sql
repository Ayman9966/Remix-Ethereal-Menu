-- ============================================================
-- Savor Digital Menu — Full Supabase Schema
-- ============================================================
-- Run this in the Supabase SQL Editor to set up all tables,
-- RLS policies, and seed data.
-- ============================================================

-- 1. ENUMS
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM ('awaiting_approval', 'pending', 'preparing', 'ready', 'served', 'ready_to_pickup', 'picked');
  END IF;
  -- If enum already exists but is missing the new value
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'order_status' AND e.enumlabel = 'awaiting_approval') THEN
      ALTER TYPE public.order_status ADD VALUE 'awaiting_approval' BEFORE 'pending';
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_type') THEN
    CREATE TYPE public.order_type AS ENUM ('dine-in', 'takeaway');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ordering_mode') THEN
    CREATE TYPE public.ordering_mode AS ENUM ('dine-in', 'takeaway', 'both');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'kitchen');
  END IF;
END
$$;

-- 2. TABLES
-- ============================================================

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📋',
  sort_order INT NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Menu Items
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  preparation_time INT NOT NULL DEFAULT 10, -- minutes
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL,
  status public.order_status NOT NULL DEFAULT 'pending',
  order_type public.order_type NOT NULL DEFAULT 'dine-in',
  table_number INT,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  service_charge_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  additional_fee_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  customer_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS service_charge_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS additional_fee_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Order Items (join table)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE RESTRICT,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  notes TEXT,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0, -- snapshot price at time of order
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Brand / Restaurant Settings (single-row config)
CREATE TABLE IF NOT EXISTS public.brand_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_name TEXT NOT NULL DEFAULT 'Savor',
  tagline TEXT NOT NULL DEFAULT 'Modern Dining, Redefined',
  accent_color TEXT NOT NULL DEFAULT '#426564',
  logo_url TEXT,
  hero_image_url TEXT,
  online_ordering_enabled BOOLEAN NOT NULL DEFAULT true,
  show_prep_time BOOLEAN NOT NULL DEFAULT true,
  menu_scale INT NOT NULL DEFAULT 90,
  currency TEXT NOT NULL DEFAULT '$',
  total_tables INT NOT NULL DEFAULT 20,
  ordering_mode public.ordering_mode NOT NULL DEFAULT 'both',
  board_background_color TEXT NOT NULL DEFAULT '#0a0d13',
  board_cycle_seconds INT NOT NULL DEFAULT 15,
  board_columns INT NOT NULL DEFAULT 3,
  board_show_photos BOOLEAN NOT NULL DEFAULT true,
  board_show_price BOOLEAN NOT NULL DEFAULT true,
  board_show_description BOOLEAN NOT NULL DEFAULT true,
  board_show_prep_time BOOLEAN NOT NULL DEFAULT true,
  tax_enabled BOOLEAN NOT NULL DEFAULT false,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  tax_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  service_charge_enabled BOOLEAN NOT NULL DEFAULT false,
  service_charge_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  service_charge_type TEXT NOT NULL DEFAULT 'percentage',
  additional_fee_enabled BOOLEAN NOT NULL DEFAULT false,
  additional_fee_name TEXT NOT NULL DEFAULT 'Processing Fee',
  additional_fee_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  additional_fee_type TEXT NOT NULL DEFAULT 'fixed',
  tax_apply_dine_in BOOLEAN NOT NULL DEFAULT true,
  tax_apply_takeaway BOOLEAN NOT NULL DEFAULT true,
  service_charge_apply_dine_in BOOLEAN NOT NULL DEFAULT true,
  service_charge_apply_takeaway BOOLEAN NOT NULL DEFAULT false,
  additional_fee_apply_dine_in BOOLEAN NOT NULL DEFAULT true,
  additional_fee_apply_takeaway BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_settings
  ADD COLUMN IF NOT EXISTS tax_apply_dine_in BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS tax_apply_takeaway BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS service_charge_apply_dine_in BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS service_charge_apply_takeaway BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS additional_fee_apply_dine_in BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS additional_fee_apply_takeaway BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS board_background_color TEXT NOT NULL DEFAULT '#0a0d13',
  ADD COLUMN IF NOT EXISTS board_cycle_seconds INT NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS board_columns INT NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS board_show_photos BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS board_show_price BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS board_show_description BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS board_show_prep_time BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS tax_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_type TEXT NOT NULL DEFAULT 'percentage',
  ADD COLUMN IF NOT EXISTS service_charge_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS service_charge_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS service_charge_type TEXT NOT NULL DEFAULT 'percentage',
  ADD COLUMN IF NOT EXISTS additional_fee_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS additional_fee_name TEXT NOT NULL DEFAULT 'Processing Fee',
  ADD COLUMN IF NOT EXISTS additional_fee_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS additional_fee_type TEXT NOT NULL DEFAULT 'fixed',
  ADD COLUMN IF NOT EXISTS auto_print_invoice BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS invoice_size TEXT NOT NULL DEFAULT '80mm';

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

-- User Roles (CRITICAL: roles stored separately — never on profile/users table)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(available);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);

-- 4. UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER trg_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_brand_settings_updated_at ON public.brand_settings;
CREATE TRIGGER trg_brand_settings_updated_at
  BEFORE UPDATE ON public.brand_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. SECURITY: ROW LEVEL SECURITY
-- ============================================================

-- Helper: check if a user has a specific role (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Categories: public read, admin write
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Demo mode: allow public writes (remove for production, use admin role instead)
DROP POLICY IF EXISTS "Anyone can manage categories" ON public.categories;
CREATE POLICY "Anyone can manage categories"
  ON public.categories FOR ALL
  TO anon, authenticated
  USING (name <> '')
  WITH CHECK (name <> '');

-- Menu Items: public read, admin write
DROP POLICY IF EXISTS "Anyone can view menu items" ON public.menu_items;
CREATE POLICY "Anyone can view menu items"
  ON public.menu_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- Demo mode: allow public writes (remove for production, use admin role instead)
DROP POLICY IF EXISTS "Anyone can manage menu items" ON public.menu_items;
CREATE POLICY "Anyone can manage menu items"
  ON public.menu_items FOR ALL
  TO anon, authenticated
  USING (name <> '' AND price >= 0)
  WITH CHECK (name <> '' AND price >= 0);

-- Orders: public create/read/update (demo); tighten in production
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    total >= 0 AND
    (table_number IS NULL OR table_number > 0) AND
    (order_number IS NULL OR order_number > 0)
  );

DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
CREATE POLICY "Anyone can view orders"
  ON public.orders FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;
CREATE POLICY "Anyone can update orders"
  ON public.orders FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (total >= 0);

-- Order Items: same as orders
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items"
  ON public.order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    order_id IS NOT NULL AND
    menu_item_id IS NOT NULL AND
    quantity > 0 AND
    unit_price >= 0
  );

DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
CREATE POLICY "Anyone can view order items"
  ON public.order_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- Brand Settings: public read, admin write
DROP POLICY IF EXISTS "Anyone can view brand settings" ON public.brand_settings;
CREATE POLICY "Anyone can view brand settings"
  ON public.brand_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Demo mode: allow public writes (remove for production, use admin role instead)
DROP POLICY IF EXISTS "Anyone can manage brand settings" ON public.brand_settings;
CREATE POLICY "Anyone can manage brand settings"
  ON public.brand_settings FOR ALL
  TO anon, authenticated
  USING (restaurant_name <> '')
  WITH CHECK (restaurant_name <> '');

-- User Roles: only admins can manage, users can read their own
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. REALTIME (for kitchen display live updates)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class c ON c.oid = pr.prrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pr.prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime')
      AND n.nspname = 'public'
      AND c.relname = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class c ON c.oid = pr.prrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pr.prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime')
      AND n.nspname = 'public'
      AND c.relname = 'order_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class c ON c.oid = pr.prrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pr.prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime')
      AND n.nspname = 'public'
      AND c.relname = 'categories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class c ON c.oid = pr.prrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pr.prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime')
      AND n.nspname = 'public'
      AND c.relname = 'menu_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class c ON c.oid = pr.prrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pr.prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime')
      AND n.nspname = 'public'
      AND c.relname = 'brand_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.brand_settings;
  END IF;
  
  -- Waiter Calls Table
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'waiter_calls') THEN
    CREATE TABLE public.waiter_calls (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      table_number INT NOT NULL,
      acknowledged BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    
    ALTER TABLE public.waiter_calls ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Anyone can manage waiter calls" 
      ON public.waiter_calls FOR ALL 
      TO anon, authenticated 
      USING (true) 
      WITH CHECK (true);
      
    ALTER PUBLICATION supabase_realtime ADD TABLE public.waiter_calls;
  END IF;
END
$$;

-- 7. SEED: Default brand settings row
-- ============================================================

INSERT INTO public.brand_settings (
  restaurant_name, tagline, accent_color,
  online_ordering_enabled, show_prep_time, menu_scale,
  currency, total_tables, ordering_mode,
  board_background_color, board_cycle_seconds, board_columns, board_show_photos, board_show_price, board_show_description, board_show_prep_time,
  auto_print_invoice, invoice_size
) SELECT
  'Savor', 'Modern Dining, Redefined', '#426564',
  true, true, 90,
  '$', 20, 'both',
  '#0a0d13', 15, 3, true, true, true, true,
  false, '80mm'
WHERE NOT EXISTS (SELECT 1 FROM public.brand_settings);

-- 9. MOCK DATA
-- ============================================================

INSERT INTO public.categories (id, name, icon, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Appetizers', '🥟', 0),
('550e8400-e29b-41d4-a716-446655440001', 'Main Course', '🥩', 1),
('550e8400-e29b-41d4-a716-446655440004', 'Pasta', '🍝', 2),
('550e8400-e29b-41d4-a716-446655440002', 'Desserts', '🍰', 3),
('550e8400-e29b-41d4-a716-446655440003', 'Beverages', '🥤', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.menu_items (id, name, description, price, category_id, image_url, available, preparation_time) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Truffle Burrata', 'Creamy burrata with black truffle, heirloom tomatoes & basil oil', 16.50, '550e8400-e29b-41d4-a716-446655440000', 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&auto=format&fit=crop', true, 10),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Grilled Octopus', 'Charred octopus, smoked paprika, crispy potatoes & chimichurri', 18.00, '550e8400-e29b-41d4-a716-446655440000', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&auto=format&fit=crop', true, 15),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Signature Wagyu Burger', 'Premium Wagyu beef patty, aged cheddar, caramelized onions, and secret sauce on a brioche bun.', 24.00, '550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop', true, 20),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Wild Mushroom Risotto', 'Arborio rice cooked slowly with wild mushrooms, parmesan cheese, and fresh herbs.', 21.00, '550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&auto=format&fit=crop', true, 25),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Pan-Seared Salmon', 'Atlantic salmon with roasted asparagus, baby potatoes, and a lemon butter sauce.', 26.00, '550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop', true, 22),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Lobster Linguine', 'Fresh lobster, cherry tomatoes, white wine & garlic', 36.00, '550e8400-e29b-41d4-a716-446655440004', 'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=800&auto=format&fit=crop', true, 18),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Truffle Carbonara', 'Guanciale, pecorino, egg yolk, black truffle shavings', 24.00, '550e8400-e29b-41d4-a716-446655440004', 'https://images.unsplash.com/photo-1612459284970-e8f027596582?w=800&auto=format&fit=crop', true, 15),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Molten Lava Cake', 'Warm chocolate cake with a gooey center, served with vanilla bean ice cream.', 9.00, '550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1624353365286-3f8d62adda51?w=800&auto=format&fit=crop', true, 15),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'New York Cheesecake', 'Classic creamy cheesecake with a graham cracker crust and fresh berry compote.', 8.50, '550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&auto=format&fit=crop', true, 10),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Classic Mojito', 'Fresh mint leaves muddled with lime, sugar, and soda water. Refreshing and crisp.', 11.00, '550e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop', true, 5),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Craft Iced Coffee', 'Single-origin cold brew topped with creamy oat milk and a touch of vanilla.', 6.50, '550e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&auto=format&fit=crop', true, 5)
ON CONFLICT (id) DO NOTHING;
