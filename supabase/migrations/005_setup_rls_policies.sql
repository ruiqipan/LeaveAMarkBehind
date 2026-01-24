-- Enable Row Level Security on all tables
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE mark_views ENABLE ROW LEVEL SECURITY;

-- Marks table policies
-- Allow public read access to active marks only
CREATE POLICY "Public can view active marks"
    ON marks FOR SELECT
    USING (is_active = true);

-- Allow public insert (since no authentication)
CREATE POLICY "Public can create marks"
    ON marks FOR INSERT
    WITH CHECK (true);

-- Prevent updates and deletes from client (only Edge Functions can modify)
CREATE POLICY "Only service role can update marks"
    ON marks FOR UPDATE
    USING (false);

CREATE POLICY "Only service role can delete marks"
    ON marks FOR DELETE
    USING (false);

-- Snapshots table policies
-- Allow public read access to non-expired snapshots
CREATE POLICY "Public can view active snapshots"
    ON snapshots FOR SELECT
    USING (expires_at > NOW());

-- Only Edge Functions can create/modify snapshots
CREATE POLICY "Only service role can create snapshots"
    ON snapshots FOR INSERT
    WITH CHECK (false);

CREATE POLICY "Only service role can update snapshots"
    ON snapshots FOR UPDATE
    USING (false);

CREATE POLICY "Only service role can delete snapshots"
    ON snapshots FOR DELETE
    USING (false);

-- Mark views table policies
-- Allow public read access
CREATE POLICY "Public can view mark views"
    ON mark_views FOR SELECT
    USING (true);

-- Allow public insert for tracking views
CREATE POLICY "Public can create mark views"
    ON mark_views FOR INSERT
    WITH CHECK (true);

-- Prevent updates and deletes
CREATE POLICY "Only service role can update mark views"
    ON mark_views FOR UPDATE
    USING (false);

CREATE POLICY "Only service role can delete mark views"
    ON mark_views FOR DELETE
    USING (false);

-- Add comments
COMMENT ON POLICY "Public can view active marks" ON marks IS 'Users can only see marks created within last 24 hours';
COMMENT ON POLICY "Only service role can update marks" ON marks IS 'Prevents client-side manipulation of view counts and flags';
