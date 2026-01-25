# Quick Reference Guide

## Common Tasks

### Local Development

```bash
# Start dev server
cd frontend
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Reset User State (for Testing)

```javascript
// In browser console - reset onboarding
localStorage.removeItem('leave-a-mark-onboarding-completed');

// Reset FAB hint
localStorage.removeItem('leave-a-mark-fab-hint-shown');

// Clear all app state
localStorage.clear();
```

### Supabase Operations

```bash
# Deploy Edge Function
supabase functions deploy generate-snapshot

# View function logs
supabase functions logs generate-snapshot --follow

# List all functions
supabase functions list

# Set environment variable
supabase secrets set KEY=value
```

### Database Queries

```sql
-- View all active marks
SELECT * FROM marks WHERE is_active = true ORDER BY created_at DESC;

-- Get marks at a location
SELECT * FROM get_marks_within_radius(37.7749, -122.4194, 100);

-- View recent snapshots
SELECT * FROM snapshots ORDER BY created_at DESC LIMIT 5;

-- Check cron job status
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- View engagement stats
SELECT
  type,
  COUNT(*) as count,
  AVG(view_count) as avg_views,
  MAX(view_count) as max_views
FROM marks
WHERE is_active = true
GROUP BY type;

-- Find popular locations
SELECT
  ROUND(latitude, 3) as lat,
  ROUND(longitude, 3) as lng,
  COUNT(*) as mark_count
FROM marks
WHERE is_active = true
GROUP BY ROUND(latitude, 3), ROUND(longitude, 3)
ORDER BY mark_count DESC
LIMIT 10;
```

### Testing Locations

```javascript
// San Francisco
{ latitude: 37.7749, longitude: -122.4194 }

// New York
{ latitude: 40.7128, longitude: -74.0060 }

// London
{ latitude: 51.5074, longitude: -0.1278 }

// Tokyo
{ latitude: 35.6762, longitude: 139.6503 }
```

### Environment Variables

```env
# Required for frontend/.env.local
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### API Endpoints

```javascript
// Supabase REST API
const baseUrl = 'https://xxxxx.supabase.co/rest/v1';

// Get active marks
GET /marks?is_active=eq.true&select=*

// Get snapshot
GET /snapshots?location_cluster_id=eq.37.775_-122.419

// Edge Functions
POST https://xxxxx.supabase.co/functions/v1/generate-snapshot
POST https://xxxxx.supabase.co/functions/v1/cleanup-content
```

### Chrome DevTools Location Override

1. Open DevTools (F12)
2. Press `Ctrl+Shift+P` (Cmd+Shift+P on Mac)
3. Type "Show Sensors"
4. Set custom location or choose from presets

### Useful SQL Functions

```sql
-- Manually trigger snapshot generation
SELECT * FROM generate_snapshot();

-- Get location statistics
SELECT get_location_stats('37.775_-122.419');

-- Increment view count
SELECT increment_view_count('mark-uuid-here');

-- Find marks within 50m of a point
SELECT * FROM get_marks_within_radius(37.7749, -122.4194, 50);
```

### Debugging

```bash
# Check frontend build
npm run build
# Look for errors in output

# Test service worker
# Open DevTools > Application > Service Workers
# Check if registered and active

# View browser console
# Open DevTools > Console
# Look for errors and warnings

# Check Supabase logs
# Go to Supabase Dashboard > Logs
# Filter by severity
```

### Performance Monitoring

```sql
-- Check database size
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Slow queries (if enabled)
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Storage Management

```bash
# List storage buckets
supabase storage list

# Upload file
supabase storage upload mark-images test.jpg

# Get file URL
# https://xxxxx.supabase.co/storage/v1/object/public/mark-images/test.jpg
```

### Cron Job Management

```sql
-- View all scheduled jobs
SELECT * FROM cron.job;

-- View recent job runs
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;

-- Manually run cleanup
UPDATE marks SET is_active = false
WHERE created_at < NOW() - INTERVAL '24 hours';

-- Delete old snapshots
DELETE FROM snapshots WHERE expires_at < NOW();

-- Unschedule a job
SELECT cron.unschedule('job-name-here');

-- Reschedule a job
SELECT cron.schedule(
  'new-job',
  '*/30 * * * *',
  $$SQL COMMAND HERE$$
);
```

### Git Workflow

```bash
# Initial commit
git init
git add .
git commit -m "Initial commit: Leave A Mark PWA"

# Deploy to Vercel from Git
vercel --prod

# Push to GitHub
git remote add origin https://github.com/username/leave-a-mark
git push -u origin main
```

### Monitoring URLs

```bash
# Frontend (after deployment)
https://your-app.vercel.app

# Supabase Dashboard
https://supabase.com/dashboard/project/YOUR_PROJECT_ID

# Google Cloud Console
https://console.cloud.google.com/apis/dashboard

# Vercel Dashboard
https://vercel.com/dashboard
```

### Troubleshooting Quick Fixes

```bash
# Clear service worker cache
# DevTools > Application > Storage > Clear site data

# Reset database
# Run migrations in order again

# Clear localStorage
localStorage.clear();

# Force refresh browser
Ctrl+Shift+R (Cmd+Shift+R on Mac)

# Restart dev server
# Ctrl+C then npm run dev
```

### Component-Specific Testing

```javascript
// Import helpers in browser console or test files

// Reset onboarding (shows intro screens again)
import { resetOnboarding } from './components/Onboarding/Onboarding';
resetOnboarding();

// Reset FAB hint (shows "Leave your mark!" tooltip again)
import { resetFabHint } from './components/FAB/FloatingActionButton';
resetFabHint();

// Show toast notification
import { useToast } from './components/Feedback/Toast';
const { showToast } = useToast();
showToast('Test message', 'success'); // types: success, error, info, warning
```

### App Navigation Structure

```
/ (HomePage)
├── MapView - Interactive Google Maps with marks
├── FloatingActionButton - Create new mark
├── MarkDisplay - View mark details (modal)
├── CreateMark - Create new mark (modal)
└── ToastContainer - Notifications

/snapshot (SnapshotPage)
├── SnapshotView - Daily archive
│   ├── TopTextList - Top 5 text marks
│   ├── TopAudioList - Top 5 audio marks
│   └── ImageGrid - All image marks
└── MarkDetailModal - View mark details

BottomNav - Tab navigation (persistent)
Onboarding - First-time user flow (overlay)
```

### Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Google Maps API key restricted to domain
- [ ] Supabase anon key exposed (safe)
- [ ] Service role key never in frontend
- [ ] Storage buckets have proper policies
- [ ] HTTPS enabled in production
- [ ] No secrets in git repository

### Pre-Launch Checklist

- [ ] All migrations run successfully
- [ ] Storage buckets created and configured
- [ ] Edge Functions deployed
- [ ] Cron jobs scheduled
- [ ] Environment variables set
- [ ] PWA icons added
- [ ] Domain configured (if custom)
- [ ] Google Maps billing enabled
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Service Worker working
- [ ] Offline mode functional
- [ ] Onboarding flow works correctly
- [ ] FAB hint appears for new users
- [ ] Toast notifications display properly
- [ ] Bottom navigation works between tabs
- [ ] Haptic feedback works (mobile devices)

### Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Google Maps**: https://developers.google.com/maps
- **Vite Docs**: https://vitejs.dev
- **PWA Guide**: https://web.dev/progressive-web-apps/

### Common Errors & Solutions

| Error | Solution |
|-------|----------|
| "Location not available" | Enable HTTPS or use localhost |
| "Failed to load map" | Check Google Maps API key |
| "Database error" | Verify Supabase credentials |
| "Upload failed" | Check storage bucket policies |
| "Service worker not registered" | Ensure HTTPS in production |
| "Marks not appearing" | Check is_active flag and RLS policies |
| Onboarding keeps showing | Check localStorage for `leave-a-mark-onboarding-completed` |
| FAB hint not dismissing | Check localStorage for `leave-a-mark-fab-hint-shown` |
| Toast not appearing | Verify ToastContainer is rendered in component tree |
| Navigation not working | Check React Router setup in App.jsx |
| Haptic feedback not working | Only works on supported mobile devices |

### New Component LocalStorage Keys

| Key | Purpose |
|-----|---------|
| `leave-a-mark-onboarding-completed` | Tracks if user completed onboarding |
| `leave-a-mark-fab-hint-shown` | Tracks if FAB hint was dismissed |

---

Keep this guide handy for quick reference during development and deployment!
