-- Create warehouse_inventory table for tracking products in different locations
CREATE TABLE IF NOT EXISTS warehouse_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location TEXT NOT NULL, -- Офис, склад, у клиента и т.д.
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity INTEGER DEFAULT 0 CHECK (reserved_quantity >= 0),
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'reserved', 'sold', 'written_off')),
    assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    notes TEXT,
    last_counted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, location) -- Один товар может быть только один раз в одном месте
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_product_id ON warehouse_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_location ON warehouse_inventory(location);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_status ON warehouse_inventory(status);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_assigned_to ON warehouse_inventory(assigned_to);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_warehouse_inventory_updated_at
    BEFORE UPDATE ON warehouse_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE warehouse_inventory ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admin users to manage warehouse inventory
CREATE POLICY "Admins can manage warehouse inventory"
    ON warehouse_inventory FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'super_admin', 'manager')
        )
    );

-- Allow authenticated users to view warehouse inventory
CREATE POLICY "Users can view warehouse inventory"
    ON warehouse_inventory FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
        )
    );

