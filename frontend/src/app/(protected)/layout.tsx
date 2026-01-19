// @TASK T1.3 - 보호된 라우트 레이아웃
// @SPEC docs/planning/03-user-flow.md#프로필-설정
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ProtectedHeader } from '@/components/layout/ProtectedHeader'

/**
 * 보호된 라우트의 공통 레이아웃
 * - 서버 사이드에서 인증 상태 확인
 * - 미인증 시 로그인 페이지로 리다이렉트
 * - 공통 헤더 포함
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 서버 사이드 인증 확인
  const { userId } = await auth()

  // 미인증 사용자 리다이렉트
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <ProtectedHeader />

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
