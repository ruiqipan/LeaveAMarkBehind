# Edge Functions

This directory contains Supabase Edge Functions for automated tasks.

## Functions

### generate-snapshot
Generates daily snapshots of top marks at each location cluster.

**Schedule:** Daily at midnight UTC (configured in pg_cron)

**What it does:**
1. Fetches all active marks from the last 24 hours
2. Groups marks by location cluster (~100m radius)
3. For each location:
   - Selects top 5 text marks by engagement
   - Selects top 5 audio marks by engagement
   - Includes all image marks
4. Creates snapshot records with 36-hour expiration

### cleanup-content
Cleans up expired content to maintain ephemeral nature of the app.

**Schedule:** Every 30 minutes (configured in pg_cron)

**What it does:**
1. Deactivates marks older than 24 hours
2. Deletes snapshots past their 36-hour expiration
3. Removes old mark_views (keeps last 7 days)

## Deployment

### Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Logged in to Supabase: `supabase login`
- Project linked: `supabase link --project-ref YOUR_PROJECT_ID`

### Deploy Functions

Deploy all functions:
```bash
supabase functions deploy
```

Deploy specific function:
```bash
supabase functions deploy generate-snapshot
supabase functions deploy cleanup-content
```

### Set Environment Variables

Edge Functions need access to Supabase credentials:

```bash
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Test Functions Locally

Start local development:
```bash
supabase functions serve
```

Test a function:
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-snapshot' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

### Invoke Functions Manually

Using cURL:
```bash
curl -i --location --request POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/generate-snapshot' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

Using Supabase Dashboard:
1. Go to Edge Functions in Supabase dashboard
2. Select the function
3. Click "Invoke" button

## Monitoring

### View Logs

Real-time logs:
```bash
supabase functions logs generate-snapshot --follow
supabase functions logs cleanup-content --follow
```

### Check Function Status

```sql
-- Check recent cron job runs
SELECT * FROM cron.job_run_details
WHERE jobname IN ('generate-daily-snapshot', 'cleanup-expired-content')
ORDER BY start_time DESC
LIMIT 10;

-- View scheduled jobs
SELECT * FROM cron.job
WHERE jobname IN ('generate-daily-snapshot', 'cleanup-expired-content');
```

## Troubleshooting

### Function returns 500 error
- Check logs: `supabase functions logs <function-name>`
- Verify environment variables are set
- Test locally with `supabase functions serve`

### Cron jobs not running
- Verify pg_cron extension is enabled
- Check job schedule: `SELECT * FROM cron.job;`
- Review job run history: `SELECT * FROM cron.job_run_details;`

### Database permissions
- Edge Functions use the service role key
- Ensure RLS policies allow service role operations
- Check table permissions in Supabase dashboard

## Development

### Function Structure
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Your logic here
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Return response
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### Testing Changes
1. Make changes to function code
2. Deploy: `supabase functions deploy <function-name>`
3. Test: Invoke manually or wait for cron schedule
4. Check logs: `supabase functions logs <function-name>`
