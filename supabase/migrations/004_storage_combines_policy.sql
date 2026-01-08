-- ============================================================
-- Storage Policy for Combines folder - Allow public uploads
-- ============================================================

-- Allow anyone to upload to combines folder
CREATE POLICY "Allow public uploads to combines"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'garment-images' 
  AND (storage.foldername(name))[1] = 'combines'
);

-- Allow anyone to read from combines folder
CREATE POLICY "Allow public reads from combines"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'garment-images' 
  AND (storage.foldername(name))[1] = 'combines'
);

-- Allow anyone to update combines folder
CREATE POLICY "Allow public updates to combines"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'garment-images' 
  AND (storage.foldername(name))[1] = 'combines'
);

