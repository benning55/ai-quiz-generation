import { clerkMiddleware } from '@clerk/nextjs/server';

// Export the middleware
export default clerkMiddleware();

export const config = {
  matcher: [
    // Public routes that don't require authentication
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
  // You can add routes that should be public here
  // Clerk will automatically allow these routes
  publicRoutes: [
    '/',
    '/api/quiz',
    '/api/import-flashcards-json',
    '/sign-in',
    '/sign-up',
    '/quiz'
  ],
}; 