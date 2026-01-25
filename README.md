# Leave A Mark Behind

A location-based Progressive Web App (PWA) for sharing ephemeral messages, images, and audio at specific GPS coordinates.

## Features

- **Location-Based Discovery**: Find marks left by others within 50-100m proximity
- **Anti-Viral Algorithm**: Prioritizes low-engagement content to ensure diverse discovery
- **Ephemeral Content**: All marks expire after 24 hours
- **Daily Snapshots**: Top content preserved for 36 hours in location-specific archives
- **Threading**: Reply to marks with "Add To" feature
- **Onboarding Flow**: Interactive 3-slide introduction for first-time users
- **Toast Notifications**: Real-time feedback with haptic support
- **PWA**: Works on any mobile browser, no app store required

## Tech Stack

- **Frontend**: React 19 + Vite + React Router
- **Maps**: Google Maps JavaScript API
- **Backend**: Supabase (PostgreSQL with PostGIS)
- **Storage**: Supabase Storage
- **Hosting**: Vercel/Netlify

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Maps API key

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your credentials
   ```

4. Set up Supabase:
   - Create a new Supabase project
   - Run migrations in `supabase/migrations/` in order
   - Deploy Edge Functions from `supabase/functions/`

5. Start development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
leave-a-mark/
├── frontend/           # React PWA
│   ├── public/        # Static assets and PWA manifest
│   └── src/
│       ├── components/ # React components
│       │   ├── Create/     # Mark creation UI
│       │   ├── Discovery/  # Mark viewing & anti-viral
│       │   ├── FAB/        # Floating action button
│       │   ├── Feedback/   # Toast notifications
│       │   ├── Map/        # Google Maps integration
│       │   ├── Navigation/ # Bottom tab navigation
│       │   ├── Onboarding/ # First-time user experience
│       │   └── Snapshot/   # Daily snapshot archive
│       ├── hooks/     # Custom React hooks
│       ├── pages/     # Page components (Home, Snapshot)
│       ├── services/  # API and business logic
│       └── utils/     # Utility functions
└── supabase/
    ├── functions/     # Edge Functions
    └── migrations/    # Database schema
```

## Development

- Frontend dev server: `npm run dev` (in frontend/)
- Build for production: `npm run build`
- Preview production build: `npm run preview`

## App Navigation

- **Explore Tab**: Main map view with nearby marks and FAB to create new marks
- **Snapshot Tab**: Daily archive of top content in your area

## Deployment

1. Build the frontend: `npm run build`
2. Deploy to Vercel/Netlify
3. Configure custom domain
4. Users access via browser URL (e.g., https://leaveamark.app)

## License

MIT
