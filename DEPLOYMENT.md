# Deployment Guide - Leave A Mark Behind

This guide will walk you through deploying the Leave A Mark Behind PWA to production.

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier is fine to start)
- Google Maps API key
- Vercel or Netlify account (for frontend hosting)

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Create a new organization (if needed)
4. Click "New Project"
5. Fill in:
   - Project name: `leave-a-mark`
   - Database password: (generate a strong password)
   - Region: Choose closest to your users
   - Pricing plan: Free tier is fine to start
6. Click "Create new project" (takes ~2 minutes)

### 1.2 Run Database Migrations

1. In your Supabase project, go to **SQL Editor**
2. Run each migration file in order:

```sql
-- Copy and paste content from:
-- supabase/migrations/001_create_marks_table.sql
-- Then run it

-- Repeat for:
-- 002_create_snapshots_table.sql
-- 003_create_mark_views_table.sql
-- 004_create_indexes.sql
-- 005_setup_rls_policies.sql
```

3. For `006_setup_cron_jobs.sql`:
   - First, enable pg_cron:
     - Go to **Database > Extensions**
     - Search for "pg_cron"
     - Toggle it on
   - Then run the migration

### 1.3 Create Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Click "Create a new bucket"
3. Create bucket:
   - Name: `mark-images`
   - Public: Yes
   - Click "Create bucket"
4. Repeat for `mark-audio` bucket

### 1.4 Set Storage Bucket Policies

1. Click on `mark-images` bucket
2. Go to "Policies" tab
3. Click "New Policy" > "For full customization"
4. Add INSERT policy:
   ```sql
   CREATE POLICY "Public can upload images"
   ON storage.objects FOR INSERT
   TO public
   WITH CHECK (bucket_id = 'mark-images');
   ```
5. Add SELECT policy:
   ```sql
   CREATE POLICY "Public can view images"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'mark-images');
   ```
6. Repeat for `mark-audio` bucket

### 1.5 Get API Credentials

1. Go to **Settings > API**
2. Copy:
   - `Project URL` (e.g., https://xxxxx.supabase.co)
   - `anon` `public` key
   - `service_role` `secret` key (for Edge Functions)

## Step 2: Deploy Edge Functions

### 2.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 2.2 Login and Link Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID
```

Your project ref is in the Project URL: `https://YOUR_PROJECT_ID.supabase.co`

### 2.3 Set Secrets for Edge Functions

```bash
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2.4 Deploy Functions

```bash
# Deploy both functions
supabase functions deploy generate-snapshot
supabase functions deploy cleanup-content
```

### 2.5 Update Cron Jobs (Optional)

If you want cron jobs to call Edge Functions instead of running SQL directly:

1. Go to Supabase SQL Editor
2. Run:
```sql
-- Schedule snapshot generation
SELECT cron.schedule(
  'generate-daily-snapshot',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url:='https://YOUR_PROJECT_ID.supabase.co/functions/v1/generate-snapshot',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);

-- Schedule cleanup
SELECT cron.schedule(
  'cleanup-expired-content',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url:='https://YOUR_PROJECT_ID.supabase.co/functions/v1/cleanup-content',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

## Step 3: Get Google Maps API Key

### 3.1 Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Name it "Leave A Mark"

### 3.2 Enable APIs

1. Go to **APIs & Services > Library**
2. Search and enable:
   - Maps JavaScript API
   - Geolocation API (optional, browser API is used)

### 3.3 Create API Key

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Copy the API key
4. Click **Restrict Key**:
   - Set application restrictions: **HTTP referrers**
   - Add your domain: `https://yourdomain.com/*`
   - API restrictions: Select **Maps JavaScript API**
5. Save

### 3.4 Enable Billing (Required)

Google Maps requires billing to be enabled, but includes $200/month free credit.

1. Go to **Billing**
2. Link a billing account
3. Don't worry - $200/month free credit is more than enough for most apps

## Step 4: Configure Frontend

### 4.1 Install Dependencies

```bash
cd frontend
npm install
```

### 4.2 Create Environment Variables

Create `.env.local` in the frontend directory:

```env
# Supabase
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 4.3 Add App Icons

Create app icons (192x192 and 512x512) and place them in `frontend/public/`:

- `icon-192.png`
- `icon-512.png`

You can use a tool like https://realfavicongenerator.net/ or create simple colored squares for testing.

Quick test icons using ImageMagick:
```bash
cd frontend/public
# Create simple purple gradient icons for testing
convert -size 192x192 gradient:#667eea-#764ba2 icon-192.png
convert -size 512x512 gradient:#667eea-#764ba2 icon-512.png
```

### 4.4 Test Locally

```bash
npm run dev
```

Visit `http://localhost:5173` and test:
- Location access works
- Map loads correctly
- Can create marks (they'll fail without Supabase, but UI should work)

## Step 5: Deploy to Vercel

### 5.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 5.2 Build the Project

```bash
npm run build
```

### 5.3 Deploy

```bash
vercel
```

Follow prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N**
- Project name? `leave-a-mark`
- Directory? `./` (or leave empty)
- Override settings? **N**

### 5.4 Add Environment Variables

```bash
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your anon key

vercel env add VITE_GOOGLE_MAPS_API_KEY
# Paste your Google Maps key
```

### 5.5 Deploy to Production

```bash
vercel --prod
```

Your app is now live! Vercel will give you a URL like:
`https://leave-a-mark.vercel.app`

## Step 6: Configure Custom Domain (Optional)

### 6.1 Add Domain in Vercel

1. Go to Vercel dashboard
2. Select your project
3. Go to **Settings > Domains**
4. Click **Add**
5. Enter your domain (e.g., `leaveamark.app`)
6. Follow DNS configuration instructions

### 6.2 Update Google Maps API Key

Add your custom domain to allowed referrers:
1. Go to Google Cloud Console
2. **APIs & Services > Credentials**
3. Edit your API key
4. Add to HTTP referrers: `https://yourdomain.com/*`

## Step 7: Alternative - Deploy to Netlify

If you prefer Netlify over Vercel:

### 7.1 Install Netlify CLI

```bash
npm install -g netlify-cli
```

### 7.2 Build and Deploy

```bash
npm run build
netlify deploy --prod
```

Follow prompts and configure environment variables in Netlify dashboard.

## Step 8: Testing

### 8.1 Test on Mobile

1. Open the URL on your phone's browser
2. Test location permissions
3. Try creating a mark
4. Test "Add to Home Screen" (iOS: Share button, Android: menu)

### 8.2 Test PWA Features

1. **Offline**: Disconnect internet, app should still load
2. **Add to Home Screen**: Should show app-like experience
3. **Location**: Must allow location access
4. **Upload**: Test image and audio upload

### 8.3 Test Database

1. Create a few test marks
2. Check Supabase dashboard:
   - **Table Editor > marks** - should see new rows
   - **Storage > mark-images** - should see uploaded images
3. Wait 24 hours, marks should become inactive
4. Check snapshots are created at midnight

## Monitoring & Maintenance

### Check Edge Function Logs

```bash
supabase functions logs generate-snapshot
supabase functions logs cleanup-content
```

### Monitor Cron Jobs

```sql
-- Check recent cron runs
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;

-- Check scheduled jobs
SELECT * FROM cron.job;
```

### Database Monitoring

In Supabase dashboard:
- **Database > Database** - Check storage usage
- **Database > Backups** - Enable automated backups
- **Storage** - Monitor file storage usage

### Google Maps Usage

- Go to Google Cloud Console > APIs & Services > Dashboard
- Check Maps JavaScript API usage
- Stay within $200/month free tier

## Troubleshooting

### Location Access Denied

- Ensure HTTPS (required for geolocation)
- Check browser permissions
- iOS: Settings > Safari > Location Services

### Maps Not Loading

- Verify Google Maps API key
- Check browser console for errors
- Ensure billing is enabled in Google Cloud

### Marks Not Saving

- Check Supabase credentials in `.env.local`
- Verify RLS policies allow public insert
- Check browser console for errors

### Storage Upload Fails

- Verify storage buckets exist
- Check bucket policies allow public insert
- Ensure file size < 10MB

## Security Considerations

### Rate Limiting

Consider adding rate limiting to prevent spam:
- Implement IP-based rate limiting in Edge Functions
- Use Supabase's rate limiting features
- Monitor for suspicious activity

### Content Moderation

For production:
- Implement content moderation API
- Add report/flag feature
- Regular manual review

### API Key Protection

- Google Maps key: Restrict to your domain only
- Supabase keys: anon key is safe to expose
- Never expose service_role key in frontend

## Scaling

As your app grows:

### Database

- Supabase Free tier: 500MB database, 1GB file storage
- Pro tier ($25/month): 8GB database, 100GB storage
- Monitor usage in dashboard

### Bandwidth

- Vercel Free: 100GB/month
- Netlify Free: 100GB/month
- Both have generous free tiers

### Google Maps

- $200/month free credit
- ~28,000 map loads per month free
- Monitor usage in Google Cloud Console

## Next Steps

1. **Analytics**: Add Google Analytics or Plausible
2. **Error Tracking**: Add Sentry for error monitoring
3. **Performance**: Monitor with Lighthouse
4. **SEO**: Add meta tags for better discovery
5. **Marketing**: Share on ProductHunt, social media

## Support

For issues:
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- Google Maps: https://developers.google.com/maps

## Cost Summary

- **Supabase**: Free tier (upgrade at $25/month)
- **Vercel/Netlify**: Free tier (generous limits)
- **Google Maps**: $200/month free credit (plenty for most apps)
- **Domain**: ~$12/year (optional)

**Total**: $0 to start, can scale to ~$25-50/month if needed.

Enjoy your deployed PWA!
