// @TASK T1.3 - 설정 페이지 구현
// @SPEC docs/planning/03-user-flow.md#프로필-설정

'use client'

import { useUser } from '@/hooks/useUser'
import { useClerk } from '@clerk/nextjs'
import { ProfileForm } from '@/components/settings/ProfileForm'

/**
 * 설정 페이지
 *
 * 사용자 프로필 정보를 표시하고 관리합니다.
 * - 프로필 이미지
 * - 이름, 이메일
 * - 계정 정보
 * - 플랜 정보
 * - 로그아웃
 */
export default function SettingsPage() {
  const { user, isLoading, isPro } = useUser()
  const { signOut } = useClerk()

  const handleSignOut = async () => {
    await signOut()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">사용자 정보를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary mb-2">설정</h1>
        <p className="text-gray-600">프로필 정보를 확인하고 계정을 관리하세요.</p>
      </div>

      <ProfileForm user={user} isPro={isPro} onSignOut={handleSignOut} />
    </div>
  )
}
