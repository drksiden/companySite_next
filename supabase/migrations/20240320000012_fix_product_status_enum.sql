-- Fix product_status enum to match actual database values
-- This migration updates the enum to include the correct values

-- First, check if we need to update existing enum
DO $$
BEGIN
    -- Check if 'active' value exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'active'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'product_status')
    ) THEN
        -- Add 'active' to the enum if it doesn't exist
        ALTER TYPE product_status ADD VALUE 'active';
    END IF;

    -- Check if 'out_of_stock' value exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'out_of_stock'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'product_status')
    ) THEN
        -- Add 'out_of_stock' to the enum if it doesn't exist
        ALTER TYPE product_status ADD VALUE 'out_of_stock';
    END IF;
END $$;

-- Update existing 'published' status to 'active' if any exist
UPDATE products
SET status = 'active'
WHERE status = 'published';

-- Comment: The enum now supports: 'draft', 'active', 'archived', 'out_of_stock'
-- Note: PostgreSQL doesn't allow removing enum values easily, so 'published' may still exist
-- but won't be used in the application
