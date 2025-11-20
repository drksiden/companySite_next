-- Create slides table
CREATE TABLE IF NOT EXISTS slides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_type TEXT NOT NULL CHECK (section_type IN ('teko', 'flexem', 'ant')),
    image_url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    catalog_url TEXT NOT NULL,
    sizes TEXT DEFAULT '(max-width: 768px) 100vw, 50vw',
    priority BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_slides_section_type ON slides(section_type);
CREATE INDEX IF NOT EXISTS idx_slides_is_active ON slides(is_active);
CREATE INDEX IF NOT EXISTS idx_slides_sort_order ON slides(section_type, sort_order);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_slides_updated_at
    BEFORE UPDATE ON slides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active slides
CREATE POLICY "Slides are viewable by everyone"
    ON slides FOR SELECT
    USING (is_active = true);

-- Allow authenticated admin users to manage slides
CREATE POLICY "Admins can manage slides"
    ON slides FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

