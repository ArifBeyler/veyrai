-- Sample Garments Table
-- Örnek kıyafetler (kombinler) için tablo
CREATE TABLE IF NOT EXISTS sample_garments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL UNIQUE, -- Unique constraint for upsert
  category TEXT CHECK (category IN ('tops', 'bottoms', 'onepiece', 'outerwear', 'footwear', 'bags', 'accessories')) NOT NULL,
  sub_category TEXT,
  image_path TEXT NOT NULL, -- Supabase Storage path
  gender TEXT CHECK (gender IN ('male', 'female', 'unisex')),
  tags TEXT[], -- Array of tags
  is_active BOOLEAN DEFAULT TRUE, -- Aktif/pasif kontrolü
  sort_order INTEGER DEFAULT 0, -- Sıralama için
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sample_garments_category ON sample_garments(category);
CREATE INDEX IF NOT EXISTS idx_sample_garments_gender ON sample_garments(gender);
CREATE INDEX IF NOT EXISTS idx_sample_garments_active ON sample_garments(is_active);
CREATE INDEX IF NOT EXISTS idx_sample_garments_sort ON sample_garments(sort_order);

-- Public read access (herkes sample garment'ları görebilir)
ALTER TABLE sample_garments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sample garments are viewable by everyone"
  ON sample_garments FOR SELECT
  USING (is_active = TRUE);

