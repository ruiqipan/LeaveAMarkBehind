# Leave A Mark Behind

A location-based Progressive Web App (PWA) for sharing ephemeral messages, images, and audio at specific GPS coordinates.

**Open this link on a phone, tablet, or laptop to try this app! https://lamb-mcit.vercel.app/**

## Inspiration

City life is full of waiting—on subway platforms, at bus stops, in hospital lobbies. These in-between moments often feel like dead time, spaces where we lose our sense of agency. We scroll endlessly, disconnected from the place we're standing and the strangers sharing it with us.

We were inspired by the graffiti and street art scattered across NYC—those unexpected bursts of creativity that transform mundane walls into moments of discovery. A clever tag, a poetic stencil, a hidden mural—these are gifts left by strangers for strangers, connecting people across time without ever meeting.

**Leave A Mark Behind** was born from a question: *What if we could bring that same magic to the digital world?* What if the boring moments of city life became opportunities to share something—a piece of art, a life hack, a foreign phrase, a meme—for the next person waiting in that exact spot?

## What it does

**Leave A Mark Behind** is a location-based Progressive Web App that transforms idle city moments into shared discoveries:

- **Drop "marks"** at your exact location—text messages, photos, audio recordings, drawings, poems, life hacks, language tips, or memes
- **Discover marks** left by others within 50-100 meters, seeing what previous strangers shared at the same spot
- **Learn and react** to content that spans art, humor, wisdom, and everyday creativity
- **Experience true ephemerality** as all content automatically vanishes after 24 hours—just like the fleeting nature of waiting itself
- **Engage with threads** by adding replies to existing marks, building on what others started
- **Browse daily snapshots** of the top content from your area (preserved for 36 hours)

What makes this app fundamentally different is our **Anti-Viral Algorithm**. Unlike traditional social platforms that amplify popular content, we deliberately surface lesser-seen marks using linear inverse weighting:

$$w_i = V_{\max} - v_i + 1, \quad P(\text{mark}_i) = \frac{w_i}{\sum_j w_j}$$

This ensures diverse discovery experiences where every voice has an equal chance of being heard—the quiet poet gets the same spotlight as the prolific memer.

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
4. Users access via browser URL (e.g., https://lamb-mcit.vercel.app/)

## License

MIT
