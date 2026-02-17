# Hackathon Template

A production-ready hackathon starter template with Next.js 14, Convex (auth + database), and Tailwind CSS.

## Features

- **Next.js 14** - App Router, TypeScript, Server Components
- **Convex** - Real-time database + auth (signup, login, sessions)
- **Tailwind CSS** - Utility-first styling
- **Vercel** - Production-ready deployment

## Quick Start

```bash
# Clone the repo
git clone https://github.com/winston-claw/hackathon-template.git
cd hackathon-template

# Install dependencies
npm install

# Set up Convex (dev)
npx convex dev

# Run locally
npm run dev
```

## Convex Setup

1. Run `npx convex dev` and authenticate with your browser
2. The Convex backend deploys to a dev URL automatically
3. Copy your Convex deployment URL

### Environment Variables

For local development, create `.env.local`:

```
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.dev
```

For Vercel, add `NEXT_PUBLIC_CONVEX_URL` in your project settings.

## Project Structure

```
hackathon-template/
├── apps/web/              # Next.js app
│   ├── app/               # App Router pages
│   │   ├── login/         # Login page
│   │   ├── signup/       # Signup page
│   │   └── dashboard/    # Protected dashboard
│   ├── lib/               # Utilities (auth, convex client)
│   └── convex/            # Generated Convex types
├── packages/db/           # Convex backend code
│   └── convex/
│       ├── schema.ts      # Database schema
│       └── auth.ts        # Auth mutations
└── convex.json            # Convex config
```

## Authentication

The template includes full auth:

- `/signup` - Create account
- `/login` - Sign in
- `/dashboard` - Protected route (redirects if not logged in)

Auth is handled via Convex mutations with session tokens stored in localStorage.

## Deployment

### Vercel (Recommended)

1. Import the repo on Vercel
2. Add `NEXT_PUBLIC_CONVEX_URL` env var
3. Deploy!

### Convex

Deploy the backend:

```bash
npx convex deploy
```

## Tech Stack

- [Next.js 14](https://nextjs.org/)
- [Convex](https://convex.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## License

MIT
