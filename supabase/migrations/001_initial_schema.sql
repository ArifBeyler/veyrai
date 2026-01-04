-- FIT-SWAP / GARDROP - Initial Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================
-- DEVICES TABLE
-- ===================
-- Track devices for free credit management
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_hash TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  free_used BOOLEAN DEFAULT FALSE,
  push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for device lookup
CREATE INDEX IF NOT EXISTS idx_devices_device_hash ON devices(device_hash);
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);

-- ===================
-- USER PROFILES TABLE
-- ===================
-- Multiple body/pose profiles per user
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Profil',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_device_id ON user_profiles(device_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ===================
-- USER PHOTOS TABLE
-- ===================
-- Photos associated with profiles
CREATE TABLE IF NOT EXISTS user_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  kind TEXT CHECK (kind IN ('front', 'side', 'angle')) DEFAULT 'front',
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_photos_profile_id ON user_photos(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_device_id ON user_photos(device_id);

-- ===================
-- GARMENTS TABLE
-- ===================
-- User's wardrobe items
CREATE TABLE IF NOT EXISTS garments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('tops', 'pants', 'dresses', 'outerwear', 'shoes', 'accessories')) NOT NULL,
  brand TEXT,
  source_url TEXT,
  image_path TEXT NOT NULL,
  thumbnail_path TEXT,
  -- License tracking (important for legal compliance)
  license_source TEXT CHECK (license_source IN ('user-uploaded', 'self-generated', 'licensed', 'affiliate')) DEFAULT 'user-uploaded',
  is_user_added BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garments_device_id ON garments(device_id);
CREATE INDEX IF NOT EXISTS idx_garments_user_id ON garments(user_id);
CREATE INDEX IF NOT EXISTS idx_garments_category ON garments(category);

-- ===================
-- TRY-ON JOBS TABLE
-- ===================
-- Job queue for try-on processing
CREATE TABLE IF NOT EXISTS tryon_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  user_photo_id UUID REFERENCES user_photos(id) ON DELETE SET NULL,
  garment_id UUID REFERENCES garments(id) ON DELETE SET NULL,
  
  -- Job status
  status TEXT CHECK (status IN ('queued', 'processing', 'completed', 'failed')) DEFAULT 'queued',
  priority INTEGER DEFAULT 0, -- Higher = more priority
  
  -- AI Provider tracking
  provider TEXT,
  provider_job_id TEXT,
  
  -- Parameters
  params JSONB DEFAULT '{}',
  
  -- Results
  output_path TEXT,
  thumbnail_path TEXT,
  seed INTEGER,
  
  -- Error handling
  error_code TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tryon_jobs_device_id ON tryon_jobs(device_id);
CREATE INDEX IF NOT EXISTS idx_tryon_jobs_user_id ON tryon_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_tryon_jobs_status ON tryon_jobs(status);
CREATE INDEX IF NOT EXISTS idx_tryon_jobs_created_at ON tryon_jobs(created_at DESC);

-- Index for job queue processing
CREATE INDEX IF NOT EXISTS idx_tryon_jobs_queue ON tryon_jobs(status, priority DESC, created_at ASC) 
  WHERE status IN ('queued', 'processing');

-- ===================
-- ENTITLEMENTS CACHE TABLE
-- ===================
-- Cache RevenueCat subscription status
CREATE TABLE IF NOT EXISTS entitlements_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT FALSE,
  product_id TEXT,
  expires_at TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(device_id)
);

CREATE INDEX IF NOT EXISTS idx_entitlements_device_id ON entitlements_cache(device_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON entitlements_cache(user_id);

-- ===================
-- ROW LEVEL SECURITY
-- ===================

-- Enable RLS on all tables
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE garments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tryon_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements_cache ENABLE ROW LEVEL SECURITY;

-- Devices: Users can only see their own devices
CREATE POLICY "Users can view own devices" ON devices
  FOR SELECT USING (
    auth.uid() = user_id OR 
    device_hash = current_setting('request.headers')::json->>'x-device-hash'
  );

CREATE POLICY "Users can insert own devices" ON devices
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own devices" ON devices
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    device_hash = current_setting('request.headers')::json->>'x-device-hash'
  );

-- User Profiles: Users can only access their own profiles
CREATE POLICY "Users can view own profiles" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id OR device_id IN (
    SELECT id FROM devices WHERE device_hash = current_setting('request.headers')::json->>'x-device-hash'
  ));

CREATE POLICY "Users can insert own profiles" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profiles" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id OR device_id IN (
    SELECT id FROM devices WHERE device_hash = current_setting('request.headers')::json->>'x-device-hash'
  ));

CREATE POLICY "Users can delete own profiles" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id OR device_id IN (
    SELECT id FROM devices WHERE device_hash = current_setting('request.headers')::json->>'x-device-hash'
  ));

-- User Photos: Users can only access their own photos
CREATE POLICY "Users can view own photos" ON user_photos
  FOR SELECT USING (auth.uid() = user_id OR device_id IN (
    SELECT id FROM devices WHERE device_hash = current_setting('request.headers')::json->>'x-device-hash'
  ));

CREATE POLICY "Users can insert own photos" ON user_photos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own photos" ON user_photos
  FOR DELETE USING (auth.uid() = user_id OR device_id IN (
    SELECT id FROM devices WHERE device_hash = current_setting('request.headers')::json->>'x-device-hash'
  ));

-- Garments: Users can only access their own garments
CREATE POLICY "Users can view own garments" ON garments
  FOR SELECT USING (auth.uid() = user_id OR device_id IN (
    SELECT id FROM devices WHERE device_hash = current_setting('request.headers')::json->>'x-device-hash'
  ));

CREATE POLICY "Users can insert own garments" ON garments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own garments" ON garments
  FOR UPDATE USING (auth.uid() = user_id OR device_id IN (
    SELECT id FROM devices WHERE device_hash = current_setting('request.headers')::json->>'x-device-hash'
  ));

CREATE POLICY "Users can delete own garments" ON garments
  FOR DELETE USING (auth.uid() = user_id OR device_id IN (
    SELECT id FROM devices WHERE device_hash = current_setting('request.headers')::json->>'x-device-hash'
  ));

-- Try-on Jobs: Users can only access their own jobs
CREATE POLICY "Users can view own jobs" ON tryon_jobs
  FOR SELECT USING (auth.uid() = user_id OR device_id IN (
    SELECT id FROM devices WHERE device_hash = current_setting('request.headers')::json->>'x-device-hash'
  ));

CREATE POLICY "Users can insert own jobs" ON tryon_jobs
  FOR INSERT WITH CHECK (true);

-- Entitlements: Users can only view their own entitlements
CREATE POLICY "Users can view own entitlements" ON entitlements_cache
  FOR SELECT USING (auth.uid() = user_id OR device_id IN (
    SELECT id FROM devices WHERE device_hash = current_setting('request.headers')::json->>'x-device-hash'
  ));

-- ===================
-- STORAGE BUCKETS
-- ===================
-- Note: Run these in Supabase Dashboard or via API

-- INSERT INTO storage.buckets (id, name, public) VALUES 
--   ('user-photos', 'user-photos', false),
--   ('garments', 'garments', false),
--   ('tryon-outputs', 'tryon-outputs', false);

-- ===================
-- FUNCTIONS
-- ===================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garments_updated_at
  BEFORE UPDATE ON garments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tryon_jobs_updated_at
  BEFORE UPDATE ON tryon_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entitlements_updated_at
  BEFORE UPDATE ON entitlements_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get next job from queue
CREATE OR REPLACE FUNCTION get_next_tryon_job()
RETURNS tryon_jobs AS $$
DECLARE
  job tryon_jobs;
BEGIN
  SELECT * INTO job
  FROM tryon_jobs
  WHERE status = 'queued'
  ORDER BY priority DESC, created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  IF job.id IS NOT NULL THEN
    UPDATE tryon_jobs
    SET status = 'processing', started_at = NOW()
    WHERE id = job.id;
  END IF;
  
  RETURN job;
END;
$$ LANGUAGE plpgsql;

