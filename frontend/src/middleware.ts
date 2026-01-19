// @TASK T1.1 - Clerk Middleware 설정
// @SPEC docs/planning/03-user-flow.md#인증-플로우

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

/**
 * 보호된 라우트 정의
 * - /dashboard: 대시보드 (로그인 필요)
 * - /editor: 에디터 (로그인 필요)
 * - /settings: 설정 (로그인 필요)
 */
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/editor(.*)',
  '/settings(.*)',
])

/**
 * Clerk Middleware
 * - 보호된 라우트에 대한 인증 강제
 * - 공개 라우트 허용 (/, /g/*, /sign-in, /sign-up)
 */
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
