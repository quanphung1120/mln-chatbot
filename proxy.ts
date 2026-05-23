import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 1. Define matching rules for protected routes
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/admin(.*)', '/api/upload(.*)'])

export default clerkMiddleware(async (auth, req) => {
    // 2. Step in if the route matches our list
    if (isProtectedRoute(req)) {
        await auth.protect()
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|woff2?|ttf|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
