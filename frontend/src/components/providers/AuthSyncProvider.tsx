// @TASK T1.1 - Auth Store와 Clerk 동기화 Provider
// @SPEC docs/planning/03-user-flow.md#인증-플로우

'use client'

import { useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { useAuthStore } from '@/stores/auth'

/**
 * AuthSyncProvider
 *
 * Clerk의 인증 상태를 Zustand Store와 동기화합니다.
 * - useUser, useAuth 훅을 사용하여 Clerk 상태 감지
 * - 상태 변경 시 useAuthStore에 반영
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * <ClerkProvider>
 *   <AuthSyncProvider>
 *     {children}
 *   </AuthSyncProvider>
 * </ClerkProvider>
 * ```
 */
export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: userLoaded, isSignedIn: userSignedIn } = useUser()
  const { isLoaded: authLoaded, isSignedIn: authSignedIn } = useAuth()
  const { syncAuth } = useAuthStore()

  useEffect(() => {
    // Clerk 상태를 Store에 동기화
    const isLoaded = Boolean(userLoaded && authLoaded)
    const isSignedIn = Boolean(userSignedIn && authSignedIn)

    syncAuth(user ?? null, isLoaded, isSignedIn)
  }, [user, userLoaded, userSignedIn, authLoaded, authSignedIn, syncAuth])

  return <>{children}</>
}
