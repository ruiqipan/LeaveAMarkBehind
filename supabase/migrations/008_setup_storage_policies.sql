-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('mark-images', 'mark-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('mark-audio', 'mark-audio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for mark-images bucket
-- Allow public read access
CREATE POLICY "Public can view mark images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'mark-images');

-- Allow public upload
CREATE POLICY "Public can upload mark images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'mark-images');

-- Storage policies for mark-audio bucket
-- Allow public read access
CREATE POLICY "Public can view mark audio"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'mark-audio');

-- Allow public upload
CREATE POLICY "Public can upload mark audio"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'mark-audio');

-- Add comments
COMMENT ON POLICY "Public can view mark images" ON storage.objects IS 'Allow anyone to view uploaded images';
COMMENT ON POLICY "Public can upload mark images" ON storage.objects IS 'Allow anyone to upload images (no auth required)';
COMMENT ON POLICY "Public can view mark audio" ON storage.objects IS 'Allow anyone to view uploaded audio';
COMMENT ON POLICY "Public can upload mark audio" ON storage.objects IS 'Allow anyone to upload audio (no auth required)';
