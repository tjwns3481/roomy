// @TASK T1.1 - 회원가입 페이지
// @SPEC docs/planning/03-user-flow.md#인증-플로우

import { SignUp } from '@clerk/nextjs'

/**
 * 회원가입 페이지
 * - Clerk SignUp 컴포넌트 사용
 * - 한국어 로컬라이제이션 적용 (ClerkProvider에서 설정)
 * - Roomy 브랜딩 스타일 적용
 * - 소셜 로그인 지원
 * - 가입 완료 시 /dashboard로 리다이렉트
 */
export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        elements: {
          // 카드 전체 스타일
          card: 'shadow-lg rounded-2xl border border-gray-100',

          // 헤더 스타일
          headerTitle: 'text-[#3D405B] font-semibold text-2xl',
          headerSubtitle: 'text-[#3D405B]/70 text-sm',

          // Primary 버튼 스타일 (회원가입 버튼)
          formButtonPrimary:
            'bg-[#E07A5F] hover:bg-[#C96A51] text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md',

          // 소셜 로그인 버튼 스타일
          socialButtonsBlockButton:
            'border border-gray-200 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:border-gray-300',
          socialButtonsBlockButtonText: 'text-[#3D405B] font-medium',

          // 입력 필드 스타일
          formFieldInput:
            'rounded-lg border-gray-200 focus:border-[#E07A5F] focus:ring-[#E07A5F] transition-colors duration-200',
          formFieldLabel: 'text-[#3D405B] font-medium text-sm',

          // 링크 스타일
          footerActionLink: 'text-[#E07A5F] hover:text-[#C96A51] font-medium transition-colors duration-200',

          // 구분선
          dividerLine: 'bg-gray-200',
          dividerText: 'text-[#3D405B]/50 text-sm',

          // 에러 메시지
          formFieldErrorText: 'text-red-500 text-sm',

          // 로고 (Clerk 기본 로고 숨김)
          logoBox: 'hidden',

          // 약관 동의 체크박스
          formFieldInputShowPasswordButton: 'text-[#E07A5F] hover:text-[#C96A51]',
        },
        layout: {
          socialButtonsPlacement: 'top',
          socialButtonsVariant: 'blockButton',
        },
      }}
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      forceRedirectUrl="/dashboard"
    />
  )
}
