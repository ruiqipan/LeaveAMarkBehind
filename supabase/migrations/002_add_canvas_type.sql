-- Add 'canvas' to mark_type enum
ALTER TYPE mark_type ADD VALUE 'canvas';

-- Add image_url column for canvas thumbnails (and future use)
ALTER TABLE marks ADD COLUMN image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN marks.image_url IS 'URL to thumbnail image (used for canvas marks PNG export)';
