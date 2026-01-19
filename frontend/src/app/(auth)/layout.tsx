// @TASK T1.1 - 인증 페이지 레이아웃
// @SPEC docs/planning/05-design-system.md#색상-시스템

/**
 * 인증 관련 페이지 (로그인, 회원가입)의 공통 레이아웃
 * - 중앙 정렬된 카드 형태
 * - 브랜드 색상 배경
 * - Roomy 로고 표시
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E07A5F]/10 via-white to-[#3D405B]/10">
      <div className="w-full max-w-md p-4">
        {/* 로고 영역 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#3D405B] mb-2">
            Roomy
          </h1>
          <p className="text-[#3D405B]/70 text-base">
            디지털 숙소 안내서
          </p>
        </div>

        {/* Clerk 컴포넌트 영역 */}
        <div className="flex justify-center">
          {children}
        </div>

        {/* 푸터 */}
        <div className="text-center mt-8">
          <p className="text-sm text-[#3D405B]/50">
            © 2026 Roomy. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
