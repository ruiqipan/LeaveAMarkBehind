# Supabase Setup

This directory contains database migrations and Edge Functions for the Leave A Mark Behind app.

## Database Setup

### Prerequisites

1. Create a Supabase project at https://supabase.com
2. Note your project URL and API keys

### Running Migrations

Execute the SQL migrations in order through the Supabase SQL Editor:

1. **001_create_marks_table.sql** - Creates marks table with PostGIS support
2. **002_create_snapshots_table.sql** - Creates snapshots table for daily archives
3. **003_create_mark_views_table.sql** - Creates view tracking table
4. **004_create_indexes.sql** - Creates performance indexes
5. **005_setup_rls_policies.sql** - Sets up Row Level Security
6. **006_setup_cron_jobs.sql** - Sets up scheduled jobs (requires pg_cron extension)

### Enabling pg_cron

The cron jobs require the `pg_cron` extension. To enable:

1. Go to Database > Extensions in Supabase dashboard
2. Search for "pg_cron"
3. Enable the extension
4. Run migration 006

Alternatively, run SQL directly:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### Storage Buckets

Create storage buckets for media uploads:

1. Go to Storage in Supabase dashboard
2. Create bucket: `mark-images` (public)
3. Create bucket: `mark-audio` (public)

Set bucket policies to allow public uploads and reads:

```sql
-- Allow public uploads
CREATE POLICY "Public can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'mark-images');

CREATE POLICY "Public can upload audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'mark-audio');

-- Allow public access
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'mark-images');

CREATE POLICY "Public can view audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'mark-audio');
```

## Edge Functions

### Deploying Functions

Install Supabase CLI:
```bash
npm install -g supabase
```

Login and link project:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_ID
```

Deploy functions:
```bash
supabase functions deploy generate-snapshot
supabase functions deploy cleanup-content
```

### Function Secrets

Set environment variables for Edge Functions:
```bash
supabase secrets set SUPABASE_URL=your-project-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing Migrations

After running migrations, verify setup:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check PostGIS is enabled
SELECT PostGIS_Version();

-- Check indexes
SELECT indexname, tablename FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check cron jobs
SELECT * FROM cron.job;

-- Test creating a mark
INSERT INTO marks (type, content, latitude, longitude)
VALUES ('text', 'Test mark', 37.7749, -122.4194);

-- Verify location_point was created
SELECT id, latitude, longitude, ST_AsText(location_point::geometry)
FROM marks LIMIT 1;
```

## Troubleshooting

### PostGIS not enabled
If you get errors about geography types:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### RLS blocking queries
Temporarily disable for testing:
```sql
ALTER TABLE marks DISABLE ROW LEVEL SECURITY;
-- Re-enable after testing
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
```

### Cron jobs not running
Check cron job status:
```sql
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```
