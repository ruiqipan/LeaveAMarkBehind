-- Helper functions for incrementing counters

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(mark_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE marks
  SET view_count = view_count + 1
  WHERE id = mark_id;
END;
$$;

-- Function to increment add count
CREATE OR REPLACE FUNCTION increment_add_count(mark_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE marks
  SET add_count = add_count + 1
  WHERE id = mark_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_add_count(UUID) TO anon, authenticated;

-- Function to get marks within radius (using PostGIS)
CREATE OR REPLACE FUNCTION get_marks_within_radius(
  center_lat DECIMAL(10, 8),
  center_lng DECIMAL(11, 8),
  radius_meters INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  type mark_type,
  content TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  parent_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER,
  add_count INTEGER,
  is_active BOOLEAN,
  distance_meters DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    m.id,
    m.type,
    m.content,
    m.latitude,
    m.longitude,
    m.parent_id,
    m.created_at,
    m.view_count,
    m.add_count,
    m.is_active,
    ST_Distance(
      m.location_point,
      ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
    ) AS distance_meters
  FROM marks m
  WHERE
    m.is_active = true
    AND ST_DWithin(
      m.location_point,
      ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_meters ASC;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_marks_within_radius(DECIMAL, DECIMAL, INTEGER) TO anon, authenticated;

-- Function to get location cluster statistics
CREATE OR REPLACE FUNCTION get_location_stats(cluster_id TEXT)
RETURNS JSON
LANGUAGE sql
STABLE
AS $$
  SELECT json_build_object(
    'total_marks', COUNT(*),
    'text_marks', COUNT(*) FILTER (WHERE type = 'text'),
    'image_marks', COUNT(*) FILTER (WHERE type = 'image'),
    'audio_marks', COUNT(*) FILTER (WHERE type = 'audio'),
    'total_views', SUM(view_count),
    'total_adds', SUM(add_count)
  )
  FROM marks
  WHERE is_active = true
    AND (ROUND(latitude * 1000) / 1000)::TEXT || '_' || (ROUND(longitude * 1000) / 1000)::TEXT = cluster_id;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_location_stats(TEXT) TO anon, authenticated;

-- Add comments
COMMENT ON FUNCTION increment_view_count IS 'Atomically increment view count for a mark';
COMMENT ON FUNCTION increment_add_count IS 'Atomically increment add count for a mark';
COMMENT ON FUNCTION get_marks_within_radius IS 'Get all active marks within specified radius using PostGIS';
COMMENT ON FUNCTION get_location_stats IS 'Get aggregated statistics for a location cluster';
