import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/courses(.*)',
  '/course/(.*)',
  '/pricing',
  '/login',
  '/sign-up(.*)',
  '/forgot-password',
  '/auth/callback',
  '/policies/(.*)',
  '/ai-engineering-for-beginners',
  '/ai-curriculum',
  '/animations(.*)',
  '/practice(.*)',
  '/system-design(.*)',
  '/certificates(.*)',
  '/badges',
  '/leaderboard',
  '/playground',
  '/learn/(.*)',
  '/paths/(.*)',
  '/api/(.*)',
  '/payment/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
  await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|static|favicon.ico|.*\\..*).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
