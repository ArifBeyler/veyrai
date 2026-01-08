-- ============================================================
-- Add gender column to garments table
-- ============================================================

-- Add gender column with check constraint
ALTER TABLE garments 
ADD COLUMN IF NOT EXISTS gender TEXT 
CHECK (gender IN ('male', 'female', 'unisex')) 
DEFAULT 'unisex';

-- Create index for gender filtering
CREATE INDEX IF NOT EXISTS idx_garments_gender ON garments(gender);

-- Update existing garments to have unisex as default
UPDATE garments SET gender = 'unisex' WHERE gender IS NULL;

-- Comment for documentation
COMMENT ON COLUMN garments.gender IS 'Gender filter: male, female, or unisex';

