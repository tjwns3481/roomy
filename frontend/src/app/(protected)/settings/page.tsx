// @TASK T1.3 - 설정 페이지 구현
// @SPEC docs/planning/03-user-flow.md#프로필-설정

'use client'

import { useUser } from '@/hooks/useUser'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useClerk } from '@clerk/nextjs'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

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

      <div className="space-y-6">
        {/* 프로필 카드 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-secondary mb-6">프로필 정보</h2>

          <div className="flex items-start gap-6 mb-6">
            {/* 프로필 이미지 */}
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary/10">
                <Image
                  src={user.imageUrl}
                  alt={user.fullName || '사용자 프로필'}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* 사용자 정보 */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-2xl font-bold text-secondary">
                  {user.fullName || '이름 없음'}
                </h3>
                {/* 플랜 뱃지 */}
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    isPro
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700'
                  )}
                >
                  {isPro ? 'PRO' : 'FREE'}
                </span>
              </div>

              {/* 이메일 */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">이메일</p>
                  <p className="text-base text-gray-900">{user.email}</p>
                  {user.emailVerified && (
                    <span className="text-xs text-accent-600 mt-1 inline-block">
                      ✓ 인증됨
                    </span>
                  )}
                </div>

                {/* 계정 생성일 */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">가입일</p>
                  <p className="text-base text-gray-900">
                    {user.createdAt.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* 계정 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-sand-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">사용자 ID</p>
              <p className="text-xs font-mono text-gray-800 break-all">{user.id}</p>
            </div>
            <div className="bg-sand-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">현재 플랜</p>
              <p className="text-base font-semibold text-gray-800">{user.plan}</p>
            </div>
          </div>

          {/* 프리미엄 업그레이드 안내 */}
          {!isPro && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-primary mb-2">프리미엄으로 업그레이드</h4>
              <p className="text-sm text-gray-700 mb-3">
                더 많은 기능과 무제한 가이드를 이용하세요.
              </p>
              <Button variant="primary" size="sm">
                업그레이드
              </Button>
            </div>
          )}
        </Card>

        {/* 계정 관리 카드 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-secondary mb-6">계정 관리</h2>

          <div className="space-y-4">
            {/* 로그아웃 */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">로그아웃</p>
                <p className="text-sm text-gray-600">현재 기기에서 로그아웃합니다.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSignOut}
              >
                로그아웃
              </Button>
            </div>

            {/* 추후 추가 기능 */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">계정 설정</p>
                <p className="text-sm text-gray-600">비밀번호 변경, 이메일 변경 등</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled
                className="opacity-50"
              >
                준비 중
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
