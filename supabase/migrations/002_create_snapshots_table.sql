-- Create snapshots table for daily archives
CREATE TABLE snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_cluster_id TEXT NOT NULL, -- e.g., "37.7749_-122.4194" (rounded coordinates)
    snapshot_date DATE NOT NULL,
    top_texts JSONB DEFAULT '[]'::jsonb, -- Array of top 5 text mark IDs
    top_audios JSONB DEFAULT '[]'::jsonb, -- Array of top 5 audio mark IDs
    images JSONB DEFAULT '[]'::jsonb, -- Array of image mark IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- created_at + 36 hours
    CONSTRAINT unique_location_date UNIQUE (location_cluster_id, snapshot_date)
);

-- Create trigger to automatically set expiration time
CREATE OR REPLACE FUNCTION set_snapshot_expiration()
RETURNS TRIGGER AS $$
BEGIN
    NEW.expires_at = NEW.created_at + INTERVAL '36 hours';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_snapshot_expiration
    BEFORE INSERT ON snapshots
    FOR EACH ROW
    EXECUTE FUNCTION set_snapshot_expiration();

-- Add comments for documentation
COMMENT ON TABLE snapshots IS 'Daily snapshots of top marks at each location cluster';
COMMENT ON COLUMN snapshots.location_cluster_id IS 'Location identifier created by rounding coordinates to ~100m precision';
COMMENT ON COLUMN snapshots.expires_at IS 'Snapshots expire 36 hours after creation';
COMMENT ON COLUMN snapshots.top_texts IS 'Array of mark IDs for top 5 text marks by engagement';
COMMENT ON COLUMN snapshots.top_audios IS 'Array of mark IDs for top 5 audio marks by engagement';
COMMENT ON COLUMN snapshots.images IS 'Array of mark IDs for all images at this location';
