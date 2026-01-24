-- Create indexes for efficient queries

-- Geospatial index for proximity queries (CRITICAL for performance)
CREATE INDEX idx_marks_location_point ON marks USING GIST (location_point);

-- Indexes for time-based queries
CREATE INDEX idx_marks_created_at ON marks(created_at DESC);
CREATE INDEX idx_marks_is_active ON marks(is_active) WHERE is_active = true;

-- Combined index for active marks within timeframe
CREATE INDEX idx_marks_active_created ON marks(is_active, created_at DESC)
    WHERE is_active = true;

-- Index for parent-child relationships (threading)
CREATE INDEX idx_marks_parent_id ON marks(parent_id) WHERE parent_id IS NOT NULL;

-- Indexes for engagement metrics
CREATE INDEX idx_marks_view_count ON marks(view_count);
CREATE INDEX idx_marks_add_count ON marks(add_count);

-- Snapshot indexes
CREATE INDEX idx_snapshots_location_cluster ON snapshots(location_cluster_id);
CREATE INDEX idx_snapshots_snapshot_date ON snapshots(snapshot_date DESC);
CREATE INDEX idx_snapshots_expires_at ON snapshots(expires_at);

-- Composite index for finding active snapshots by location
CREATE INDEX idx_snapshots_active_location ON snapshots(location_cluster_id, expires_at)
    WHERE expires_at > NOW();

-- Add comments
COMMENT ON INDEX idx_marks_location_point IS 'GIST index for efficient geospatial queries within radius';
COMMENT ON INDEX idx_marks_active_created IS 'Optimizes queries for recent active marks';
