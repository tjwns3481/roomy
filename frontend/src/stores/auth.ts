// @TASK T1.1 - Auth Store 구현
// @SPEC docs/planning/03-user-flow.md#인증-플로우
// @TEST src/__tests__/stores/auth.test.ts

'use client'

import { create } from 'zustand'
import type { UserResource } from '@clerk/types'

/**
 * Auth Store 상태 인터페이스
 */
interface AuthState {
  /**
   * Clerk 사용자 정보
   */
  user: UserResource | null
  /**
   * Clerk 로딩 완료 여부
   */
  isLoaded: boolean
  /**
   * 로그인 여부
   */
  isSignedIn: boolean
  /**
   * 사용자 상태 업데이트
   */
  setUser: (user: UserResource | null) => void
  /**
   * 로딩 상태 업데이트
   */
  setIsLoaded: (isLoaded: boolean) => void
  /**
   * 로그인 상태 업데이트
   */
  setIsSignedIn: (isSignedIn: boolean) => void
  /**
   * 전체 상태 동기화
   */
  syncAuth: (user: UserResource | null, isLoaded: boolean, isSignedIn: boolean) => void
}

/**
 * Auth Store
 *
 * Clerk의 useUser, useAuth와 연동하여 전역 인증 상태를 관리합니다.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isSignedIn, isLoaded } = useAuthStore()
 *
 *   if (!isLoaded) return <Spinner />
 *   if (!isSignedIn) return <SignInButton />
 *
 *   return <div>안녕하세요, {user?.firstName}님!</div>
 * }
 * ```
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoaded: false,
  isSignedIn: false,

  setUser: (user) => set({ user }),
  setIsLoaded: (isLoaded) => set({ isLoaded }),
  setIsSignedIn: (isSignedIn) => set({ isSignedIn }),

  syncAuth: (user, isLoaded, isSignedIn) =>
    set({ user, isLoaded, isSignedIn }),
}))

/**
 * 사용자 ID를 반환하는 헬퍼 함수
 */
export const getUserId = () => useAuthStore.getState().user?.id

/**
 * 사용자 이메일을 반환하는 헬퍼 함수
 */
export const getUserEmail = () =>
  useAuthStore.getState().user?.emailAddresses[0]?.emailAddress

/**
 * 사용자 전체 이름을 반환하는 헬퍼 함수
 */
export const getUserFullName = () => {
  const user = useAuthStore.getState().user
  if (!user) return null
  return `${user.lastName || ''}${user.firstName || ''}`.trim() || null
}

/**
 * 사용자 아바타 URL을 반환하는 헬퍼 함수
 */
export const getUserAvatar = () => useAuthStore.getState().user?.imageUrl
