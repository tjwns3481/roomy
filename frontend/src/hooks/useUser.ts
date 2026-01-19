// @TASK T1.3 - useUser Hook 구현
// @SPEC docs/planning/03-user-flow.md#프로필-설정
// @TEST src/__tests__/hooks/useUser.test.ts

'use client'

import { useUser as useClerkUser } from '@clerk/nextjs'
import { useAuthStore } from '@/stores/auth'
import { useEffect } from 'react'

/**
 * 사용자 플랜 타입
 */
export type UserPlan = 'FREE' | 'PRO'

/**
 * 사용자 정보 인터페이스
 */
export interface UserInfo {
  /**
   * 사용자 ID (Clerk)
   */
  id: string
  /**
   * 이메일 주소
   */
  email: string
  /**
   * 이름 (성 + 이름)
   */
  fullName: string | null
  /**
   * 이름만
   */
  firstName: string | null
  /**
   * 성만
   */
  lastName: string | null
  /**
   * 프로필 이미지 URL
   */
  imageUrl: string
  /**
   * 사용자 플랜 (기본값: FREE)
   */
  plan: UserPlan
  /**
   * 이메일 인증 여부
   */
  emailVerified: boolean
  /**
   * 계정 생성일
   */
  createdAt: Date
}

/**
 * useUser Hook 반환 타입
 */
export interface UseUserReturn {
  /**
   * 사용자 정보
   */
  user: UserInfo | null
  /**
   * 로딩 상태
   */
  isLoading: boolean
  /**
   * 로그인 여부
   */
  isSignedIn: boolean
  /**
   * 프리미엄 사용자 여부
   */
  isPro: boolean
}

/**
 * 사용자 정보를 가져오는 Hook
 *
 * Clerk의 useUser와 Auth Store를 동기화하며,
 * 사용자 플랜 정보를 포함한 추가 정보를 제공합니다.
 *
 * @example
 * ```tsx
 * function ProfilePage() {
 *   const { user, isLoading, isPro } = useUser()
 *
 *   if (isLoading) return <Spinner />
 *   if (!user) return <SignInPrompt />
 *
 *   return (
 *     <div>
 *       <h1>안녕하세요, {user.fullName}님!</h1>
 *       {isPro ? <ProBadge /> : <UpgradeButton />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useUser(): UseUserReturn {
  const { user: clerkUser, isLoaded, isSignedIn } = useClerkUser()
  const { syncAuth } = useAuthStore()

  // Clerk 상태를 Auth Store와 동기화
  useEffect(() => {
    if (isLoaded) {
      syncAuth(clerkUser, isLoaded, !!isSignedIn)
    }
  }, [clerkUser, isLoaded, isSignedIn, syncAuth])

  // 사용자 정보가 없으면 null 반환
  if (!clerkUser || !isSignedIn) {
    return {
      user: null,
      isLoading: !isLoaded,
      isSignedIn: false,
      isPro: false,
    }
  }

  // 사용자 플랜 확인 (publicMetadata에서 가져옴)
  const plan = (clerkUser.publicMetadata?.plan as UserPlan) || 'FREE'

  // 전체 이름 조합
  const fullName = [clerkUser.lastName, clerkUser.firstName]
    .filter(Boolean)
    .join('')
    .trim() || null

  const userInfo: UserInfo = {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    fullName,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
    plan,
    emailVerified: clerkUser.emailAddresses[0]?.verification.status === 'verified',
    createdAt: new Date(clerkUser.createdAt || Date.now()),
  }

  return {
    user: userInfo,
    isLoading: !isLoaded,
    isSignedIn: true,
    isPro: plan === 'PRO',
  }
}
