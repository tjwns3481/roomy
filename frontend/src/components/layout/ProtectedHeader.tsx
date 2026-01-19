// @TASK T1.3 - Protected 레이아웃 헤더
// @SPEC docs/planning/03-user-flow.md#프로필-설정

'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

/**
 * 보호된 레이아웃의 헤더 컴포넌트
 *
 * - 로고 및 네비게이션
 * - 사용자 버튼 (Clerk UserButton)
 * - 현재 경로 하이라이트
 */
export function ProtectedHeader() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: '대시보드' },
    { href: '/settings', label: '설정' },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link
            href="/dashboard"
            className="text-xl font-bold text-secondary hover:text-secondary-700 transition-colors"
          >
            Roomy
          </Link>

          {/* 네비게이션 */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-gray-600'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 사용자 버튼 */}
          <div className="flex items-center gap-4">
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                  userButtonPopoverCard: 'shadow-lg',
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
