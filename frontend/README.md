# Leave A Mark Behind - Frontend

This is the React frontend for the Leave A Mark Behind PWA.

## Tech Stack

- **React 19** with Vite for fast development
- **React Router** for navigation
- **Google Maps JavaScript API** for map integration
- **Supabase JS Client** for backend communication

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template and configure
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── Create/         # Mark creation (text, image, audio, canvas)
│   ├── Discovery/      # Mark viewing and anti-viral algorithm
│   ├── FAB/            # Floating action button
│   ├── Feedback/       # Toast notifications
│   ├── Map/            # Google Maps integration
│   ├── Navigation/     # Bottom tab navigation
│   ├── Onboarding/     # First-time user experience
│   └── Snapshot/       # Daily snapshot archive
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API and business logic
└── utils/              # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env.local` file with:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Documentation

For detailed setup and deployment instructions, see the documentation in the project root:

- [README.md](../README.md) - Project overview
- [SETUP.md](../SETUP.md) - Quick start guide
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Production deployment
- [QUICK_REFERENCE.md](../QUICK_REFERENCE.md) - Common tasks reference
