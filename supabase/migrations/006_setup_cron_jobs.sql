-- Enable pg_cron extension for scheduled jobs
-- Note: This requires superuser privileges and may need to be run separately
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily snapshot generation at midnight UTC
-- Uncomment and update URL after deploying Edge Functions
/*
SELECT cron.schedule(
    'generate-daily-snapshot',
    '0 0 * * *', -- Daily at midnight UTC
    $$
    SELECT net.http_post(
        url:='https://YOUR_PROJECT_ID.supabase.co/functions/v1/generate-snapshot',
        headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
    $$
);
*/

-- Schedule cleanup of expired content every 30 minutes
-- Uncomment and update URL after deploying Edge Functions
/*
SELECT cron.schedule(
    'cleanup-expired-content',
    '*/30 * * * *', -- Every 30 minutes
    $$
    SELECT net.http_post(
        url:='https://YOUR_PROJECT_ID.supabase.co/functions/v1/cleanup-content',
        headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
    $$
);
*/

-- Alternative: Use pg_cron to run SQL directly without Edge Functions
-- This is more efficient but less flexible

-- Deactivate marks older than 24 hours (runs every 30 minutes)
SELECT cron.schedule(
    'deactivate-old-marks',
    '*/30 * * * *',
    $$
    UPDATE marks
    SET is_active = false
    WHERE is_active = true
    AND created_at < NOW() - INTERVAL '24 hours';
    $$
);

-- Delete expired snapshots (runs daily at 1 AM UTC)
SELECT cron.schedule(
    'delete-expired-snapshots',
    '0 1 * * *',
    $$
    DELETE FROM snapshots
    WHERE expires_at < NOW();
    $$
);

-- Clean up old mark_views (keep only last 7 days, runs weekly)
SELECT cron.schedule(
    'cleanup-old-mark-views',
    '0 2 * * 0', -- Sundays at 2 AM UTC
    $$
    DELETE FROM mark_views
    WHERE viewed_at < NOW() - INTERVAL '7 days';
    $$
);

-- Add comments
COMMENT ON EXTENSION pg_cron IS 'Scheduled jobs for maintaining ephemeral content';

-- View scheduled jobs
-- SELECT * FROM cron.job;

-- Unscheduled jobs (use if needed to remove)
-- SELECT cron.unschedule('generate-daily-snapshot');
-- SELECT cron.unschedule('cleanup-expired-content');
-- SELECT cron.unschedule('deactivate-old-marks');
-- SELECT cron.unschedule('delete-expired-snapshots');
-- SELECT cron.unschedule('cleanup-old-mark-views');
