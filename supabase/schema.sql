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
    CREATE TYPE public.order_status AS ENUM ('pending', 'preparing', 'ready', 'served', 'ready_to_pickup', 'picked');
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_settings
  ADD COLUMN IF NOT EXISTS board_background_color TEXT NOT NULL DEFAULT '#0a0d13',
  ADD COLUMN IF NOT EXISTS board_cycle_seconds INT NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS board_columns INT NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS board_show_photos BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS board_show_price BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS board_show_description BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS board_show_prep_time BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_print_invoice BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS invoice_size TEXT NOT NULL DEFAULT '80mm';

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

-- 8. SEED: Default categories
-- ============================================================

INSERT INTO public.categories (name, icon, sort_order)
SELECT v.name, v.icon, v.sort_order
FROM (
  VALUES
    ('Starters', '🥗', 1),
    ('Main Course', '🍽️', 2),
    ('Pasta', '🍝', 3),
    ('Desserts', '🍰', 4),
    ('Beverages', '🥤', 5)
) AS v(name, icon, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c WHERE c.name = v.name
);
