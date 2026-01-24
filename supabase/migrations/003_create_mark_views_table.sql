-- Create mark_views table for tracking individual views
CREATE TABLE mark_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mark_id UUID NOT NULL REFERENCES marks(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT NOT NULL -- Browser fingerprint or session ID
);

-- Create index for efficient view counting
CREATE INDEX idx_mark_views_mark_id ON mark_views(mark_id);
CREATE INDEX idx_mark_views_session_id ON mark_views(session_id);
CREATE INDEX idx_mark_views_viewed_at ON mark_views(viewed_at);

-- Add comments for documentation
COMMENT ON TABLE mark_views IS 'Tracks individual mark views for analytics and anti-spam';
COMMENT ON COLUMN mark_views.session_id IS 'Browser session identifier to prevent duplicate counting';
