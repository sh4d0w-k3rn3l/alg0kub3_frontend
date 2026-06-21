# AlgoKube Frontend

Production-grade Next.js 16 app for AlgoKube — interactive DSA animations, AI tutoring, courses, and coding practice platform.

## Prerequisites

- Node.js >= 18
- pnpm >= 9

## Setup

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (required for auth) |
| `CLERK_SECRET_KEY` | Clerk secret key (required for auth) |
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript check |

## Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

The `next.config.ts` includes security headers (HSTS, XSS protection, etc.) and image remote patterns for Clerk avatars.
