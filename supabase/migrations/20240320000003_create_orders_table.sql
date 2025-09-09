-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid,
  customer_name text NOT NULL,
  customer_email text NOT NULL CHECK (customer_email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
  customer_phone text CHECK (customer_phone ~ '^\+?[0-9\s\-\(\)]+$'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method text NOT NULL,
  total numeric NOT NULL CHECK (total >= 0),
  items_count integer NOT NULL DEFAULT 0 CHECK (items_count >= 0),
  shipping_address text NOT NULL,
  billing_address text,
  notes text,
  tracking_number text,
  shipped_at timestamp with time zone,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create order items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid,
  product_name text NOT NULL,
  product_sku text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  product_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  current_year text;
  sequence_num text;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::text;

  -- Get next sequence number for current year
  SELECT LPAD((COUNT(*) + 1)::text, 6, '0')
  INTO sequence_num
  FROM public.orders
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

  RETURN 'ORD-' || current_year || '-' || sequence_num;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Admins can see all orders
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'manager')
    )
  );

-- Users can see their own orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can insert orders
CREATE POLICY "Admins can insert orders" ON public.orders
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'manager')
    )
  );

-- Admins can update orders
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'manager')
    )
  );

-- Admins can delete orders
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'manager')
    )
  );

-- Order items policies
CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'manager')
    )
  );

CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage order items" ON public.order_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'manager')
    )
  );

-- Insert some sample data for testing
INSERT INTO public.orders (
  customer_name,
  customer_email,
  customer_phone,
  status,
  payment_status,
  payment_method,
  total,
  items_count,
  shipping_address
) VALUES
(
  'Иван Петров',
  'ivan@example.com',
  '+7 777 123 4567',
  'processing',
  'paid',
  'Банковская карта',
  125000,
  3,
  'г. Алматы, ул. Абая 150'
),
(
  'Анна Смирнова',
  'anna@example.com',
  '+7 777 234 5678',
  'shipped',
  'pending',
  'Наличные',
  85000,
  2,
  'г. Астана, пр. Республики 25'
),
(
  'Михаил Козлов',
  'mikhail@example.com',
  '+7 777 345 6789',
  'delivered',
  'paid',
  'Банковская карта',
  95500,
  1,
  'г. Шымкент, ул. Тауке хана 45'
),
(
  'Елена Васильева',
  'elena@example.com',
  '+7 777 456 7890',
  'pending',
  'pending',
  'Kaspi Pay',
  150000,
  5,
  'г. Алматы, мкр. Сайран 12'
),
(
  'Дмитрий Николаев',
  'dmitry@example.com',
  '+7 777 567 8901',
  'cancelled',
  'refunded',
  'Банковская карта',
  75000,
  2,
  'г. Караганда, ул. Бухар жырау 24'
);
