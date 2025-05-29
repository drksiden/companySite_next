-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    items JSONB DEFAULT '[]'::jsonb,
    total DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS carts_user_id_idx ON carts(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_carts_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own carts
CREATE POLICY "Users can view their own carts"
    ON carts FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own carts
CREATE POLICY "Users can insert their own carts"
    ON carts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own carts
CREATE POLICY "Users can update their own carts"
    ON carts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own carts
CREATE POLICY "Users can delete their own carts"
    ON carts FOR DELETE
    USING (auth.uid() = user_id); 