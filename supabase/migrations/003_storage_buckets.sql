-- ============================================================
-- Storage Buckets & Policies for Try-On
-- ============================================================

-- Create storage buckets (if not exists)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('human-images', 'human-images', false, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('garment-images', 'garment-images', false, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('tryon-results', 'tryon-results', false, 20971520, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- ============================================================
-- HUMAN-IMAGES Bucket Policies
-- ============================================================

-- Users can upload their own images
create policy "Users can upload human images"
  on storage.objects for insert
  with check (
    bucket_id = 'human-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own images
create policy "Users can view own human images"
  on storage.objects for select
  using (
    bucket_id = 'human-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own images
create policy "Users can delete own human images"
  on storage.objects for delete
  using (
    bucket_id = 'human-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- GARMENT-IMAGES Bucket Policies
-- ============================================================

-- Users can upload garment images
create policy "Users can upload garment images"
  on storage.objects for insert
  with check (
    bucket_id = 'garment-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own garment images
create policy "Users can view own garment images"
  on storage.objects for select
  using (
    bucket_id = 'garment-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own garment images
create policy "Users can delete own garment images"
  on storage.objects for delete
  using (
    bucket_id = 'garment-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- TRYON-RESULTS Bucket Policies
-- ============================================================

-- Service role can upload results (Edge Functions)
create policy "Service can upload tryon results"
  on storage.objects for insert
  with check (bucket_id = 'tryon-results');

-- Users can view their own results
create policy "Users can view own tryon results"
  on storage.objects for select
  using (
    bucket_id = 'tryon-results' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own results
create policy "Users can delete own tryon results"
  on storage.objects for delete
  using (
    bucket_id = 'tryon-results' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

