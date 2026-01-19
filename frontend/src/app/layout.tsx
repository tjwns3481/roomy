import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { koKR } from '@clerk/localizations'
import { AuthSyncProvider } from '@/components/providers/AuthSyncProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Roomy - 디지털 숙소 안내서',
  description: '에어비앤비 호스트를 위한 디지털 숙소 안내서 플랫폼',
}

// Clerk publishableKey 확인 (빌드 시 환경변수 없으면 ClerkProvider 스킵)
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Clerk 키가 없으면 ClerkProvider 없이 렌더링 (빌드 타임)
  if (!clerkPubKey) {
    return (
      <html lang="ko">
        <body>{children}</body>
      </html>
    )
  }

  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        <body>
          <AuthSyncProvider>
            {children}
          </AuthSyncProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
