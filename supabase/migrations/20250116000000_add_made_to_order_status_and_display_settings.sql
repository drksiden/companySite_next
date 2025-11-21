-- Add 'made_to_order' status to product_status enum
DO $$
BEGIN
    -- Check if 'made_to_order' value exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'made_to_order'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'product_status')
    ) THEN
        -- Add 'made_to_order' to the enum if it doesn't exist
        ALTER TYPE product_status ADD VALUE 'made_to_order';
    END IF;
END $$;

-- Create display_settings table for product display configuration
CREATE TABLE IF NOT EXISTS display_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_display_settings_key ON display_settings(setting_key);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_display_settings_updated_at
    BEFORE UPDATE ON display_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE display_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admin users to manage display settings
CREATE POLICY "Admins can manage display settings"
    ON display_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- Allow public read access to display settings (for frontend)
CREATE POLICY "Public can view display settings"
    ON display_settings FOR SELECT
    USING (true);

-- Insert default display settings
INSERT INTO display_settings (setting_key, setting_value, description)
VALUES 
    (
        'product_display',
        '{
            "show_stock_status": true,
            "show_quantity": true,
            "show_made_to_order": true,
            "made_to_order_text": "На заказ",
            "in_stock_text": "В наличии",
            "out_of_stock_text": "Нет в наличии",
            "low_stock_threshold": 5,
            "show_low_stock_warning": true,
            "low_stock_text": "Осталось мало"
        }'::jsonb,
        'Настройки отображения статусов товаров'
    )
ON CONFLICT (setting_key) DO NOTHING;

