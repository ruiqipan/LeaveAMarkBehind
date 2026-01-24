-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create ENUM type for mark types
CREATE TYPE mark_type AS ENUM ('text', 'image', 'audio');

-- Create marks table
CREATE TABLE marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type mark_type NOT NULL,
    content TEXT NOT NULL, -- For text marks or URLs for media
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location_point GEOGRAPHY(POINT, 4326), -- PostGIS point for efficient geospatial queries
    parent_id UUID REFERENCES marks(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    view_count INTEGER DEFAULT 0,
    add_count INTEGER DEFAULT 0, -- Tracks replies/additions
    is_active BOOLEAN DEFAULT TRUE, -- True if created within last 24h
    CONSTRAINT valid_coordinates CHECK (
        latitude >= -90 AND latitude <= 90 AND
        longitude >= -180 AND longitude <= 180
    )
);

-- Create trigger to automatically populate location_point from lat/lng
CREATE OR REPLACE FUNCTION update_location_point()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location_point = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_location_point
    BEFORE INSERT OR UPDATE OF latitude, longitude ON marks
    FOR EACH ROW
    EXECUTE FUNCTION update_location_point();

-- Add comments for documentation
COMMENT ON TABLE marks IS 'Stores all user-generated marks (text, image, audio) with location data';
COMMENT ON COLUMN marks.location_point IS 'PostGIS geography point for efficient spatial queries';
COMMENT ON COLUMN marks.is_active IS 'Marks are active for 24 hours after creation';
COMMENT ON COLUMN marks.parent_id IS 'References parent mark for threading (Add To feature)';
