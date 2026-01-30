# Quick Setup Guide

Follow these steps to get the app running locally.

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier)
- A Google Maps API key

## 1. Clone and Install

```bash
cd leave-a-mark/frontend
npm install
```

## 2. Set Up Supabase

### Create a Project

1. Go to https://supabase.com and create a new project
2. Wait for setup to complete (~2 minutes)

### Run Database Migrations

Go to **SQL Editor** in Supabase and run each file in order:

1. `supabase/migrations/001_create_marks_table.sql`
2. `supabase/migrations/002_add_canvas_type.sql`
3. `supabase/migrations/002_create_snapshots_table.sql`
4. `supabase/migrations/003_create_mark_views_table.sql`
5. `supabase/migrations/004_create_indexes.sql`
6. `supabase/migrations/005_setup_rls_policies.sql`
7. Enable pg_cron extension (Database > Extensions)
8. `supabase/migrations/006_setup_cron_jobs.sql`
9. `supabase/migrations/007_create_helper_functions.sql`
10. `supabase/migrations/008_setup_storage_policies.sql`

### Create Storage Buckets

1. Go to **Storage** and create two public buckets:
   - `mark-images`
   - `mark-audio`

2. Add policies to each bucket:

```sql
-- Allow public uploads
CREATE POLICY "Public can upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'mark-images'); -- or 'mark-audio'

-- Allow public viewing
CREATE POLICY "Public can view"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mark-images'); -- or 'mark-audio'
```

## 3. Get Google Maps API Key

1. Go to https://console.cloud.google.com/
2. Create a project
3. Enable "Maps JavaScript API"
4. Create an API key
5. Restrict it to your domain (or localhost for testing)

## 4. Configure Environment Variables

Create `frontend/.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

Get your Supabase credentials from:
- **Settings > API** in Supabase dashboard

## 5. Create App Icons (Optional for local dev)

For PWA functionality, create icons in `frontend/public/`:

```bash
cd frontend/public
# Create simple colored squares for testing
# Or use any 192x192 and 512x512 images
convert -size 192x192 xc:#667eea icon-192.png
convert -size 512x512 xc:#667eea icon-512.png
```

You can also just download any PNG images and rename them.

## 6. Run Development Server

```bash
cd frontend
npm run dev
```

Visit http://localhost:5173

## 7. Test the App

1. **Complete onboarding**: Swipe through the 3-slide intro (or skip)
2. **Allow location access** when prompted
3. **Create a mark**: Tap the floating action button (FAB) with the pin icon
4. **View marks**: Walk around (or fake your location in browser dev tools)
5. **Check toast**: A success toast should appear when you create a mark
6. **Navigate to Snapshot**: Use the bottom navigation bar
7. **Explore Snapshot**: View top text, audio, and image marks

## Troubleshooting

### "Location not available"
- Use HTTPS or localhost (geolocation requires secure context)
- Check browser permissions
- Try Chrome/Safari/Firefox

### Map not loading
- Check Google Maps API key
- Ensure Maps JavaScript API is enabled
- Check browser console for errors

### Database errors
- Verify migrations ran successfully
- Check Supabase credentials in .env.local
- Review RLS policies

### Storage upload fails
- Ensure buckets exist and are public
- Check bucket policies
- Verify file size < 10MB

### Onboarding keeps showing
- Check localStorage for `leave-a-mark-onboarding-completed`
- Or clear it to test onboarding again: `localStorage.removeItem('leave-a-mark-onboarding-completed')`

### FAB hint not appearing
- Only shows for first-time users
- Reset with: `localStorage.removeItem('leave-a-mark-fab-hint-shown')`

## Next Steps

- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Check [README.md](./README.md) for full documentation
- Explore the codebase in `frontend/src/`

## Key Components to Explore

| Component | Path | Purpose |
|-----------|------|---------|
| App | `src/App.jsx` | Main app with routing & onboarding |
| HomePage | `src/pages/HomePage.jsx` | Main explore view with map |
| SnapshotPage | `src/pages/SnapshotPage.jsx` | Daily archive view |
| Onboarding | `src/components/Onboarding/` | First-time user experience |
| FAB | `src/components/FAB/` | Floating action button |
| Toast | `src/components/Feedback/` | Notification system |
| BottomNav | `src/components/Navigation/` | Tab navigation |

## Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Deploy Edge Functions (Optional)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_ID

# Set secrets
supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Deploy functions
supabase functions deploy generate-snapshot
supabase functions deploy cleanup-content
```

## Testing Without Moving

For local development, you can fake your location:

### Chrome DevTools
1. Open DevTools (F12)
2. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
3. Type "sensors"
4. Select "Show Sensors"
5. Choose a location or enter custom coordinates

### Firefox
1. about:config
2. Set `geo.provider.network.url` to a mock location
3. Or use the Location Guard extension

## Sample Test Locations

Try these locations to test the app:

- **San Francisco**: 37.7749, -122.4194
- **New York**: 40.7128, -74.0060
- **London**: 51.5074, -0.1278
- **Tokyo**: 35.6762, 139.6503

## Database Testing Queries

Check if everything is working:

```sql
-- View all marks
SELECT * FROM marks ORDER BY created_at DESC LIMIT 10;

-- Check active marks
SELECT COUNT(*) FROM marks WHERE is_active = true;

-- View snapshots
SELECT * FROM snapshots ORDER BY created_at DESC;

-- Check cron jobs
SELECT * FROM cron.job;

-- View recent mark views
SELECT * FROM mark_views ORDER BY viewed_at DESC LIMIT 10;
```

## Need Help?

- Check the browser console for errors
- Review Supabase logs in dashboard
- Read the full [README.md](./README.md)
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup

Happy building!
