// @TASK T1.3 - 프로필 설정 페이지 테스트
// @SPEC docs/planning/03-user-flow.md#프로필-설정

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useUser } from '@/hooks/useUser'
import { useClerk } from '@clerk/nextjs'
import SettingsPage from '@/app/(protected)/settings/page'

// Mock dependencies
vi.mock('@/hooks/useUser')
vi.mock('@clerk/nextjs', () => ({
  useClerk: vi.fn(),
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, className }: any) => (
    <img src={src} alt={alt} className={className} />
  ),
}))

describe('ProfileSettings', () => {
  const mockSignOut = vi.fn()

  const mockUserData = {
    user: {
      id: 'user_test123',
      email: 'test@example.com',
      fullName: '홍길동',
      firstName: '길동',
      lastName: '홍',
      imageUrl: 'https://example.com/avatar.jpg',
      plan: 'FREE' as const,
      emailVerified: true,
      createdAt: new Date('2024-01-01'),
    },
    isLoading: false,
    isSignedIn: true,
    isPro: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useClerk).mockReturnValue({
      signOut: mockSignOut,
    } as any)
  })

  describe('프로필 정보 표시', () => {
    it('로딩 중일 때 스피너를 표시해야 함', () => {
      vi.mocked(useUser).mockReturnValue({
        ...mockUserData,
        user: null,
        isLoading: true,
        isSignedIn: false,
      })

      render(<SettingsPage />)

      // 스피너가 표시되는지 확인
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('사용자 정보가 없을 때 에러 메시지를 표시해야 함', () => {
      vi.mocked(useUser).mockReturnValue({
        ...mockUserData,
        user: null,
        isLoading: false,
        isSignedIn: false,
      })

      render(<SettingsPage />)

      expect(screen.getByText('사용자 정보를 불러올 수 없습니다.')).toBeInTheDocument()
    })

    it('프로필 정보가 올바르게 표시되어야 함', () => {
      vi.mocked(useUser).mockReturnValue(mockUserData)

      render(<SettingsPage />)

      // 이름 표시
      expect(screen.getByText('홍길동')).toBeInTheDocument()

      // 이메일 표시
      expect(screen.getByText('test@example.com')).toBeInTheDocument()

      // 이메일 인증 표시
      expect(screen.getByText('✓ 인증됨')).toBeInTheDocument()

      // 플랜 뱃지 (여러 개가 있으므로 getAllBy 사용)
      const freeTexts = screen.getAllByText('FREE')
      expect(freeTexts.length).toBeGreaterThan(0)

      // 프로필 이미지
      const profileImage = screen.getByAltText('홍길동')
      expect(profileImage).toBeInTheDocument()
      expect(profileImage).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('가입일이 올바른 형식으로 표시되어야 함', () => {
      vi.mocked(useUser).mockReturnValue(mockUserData)

      render(<SettingsPage />)

      // 한국어 날짜 형식 확인
      expect(screen.getByText('2024년 1월 1일')).toBeInTheDocument()
    })

    it('PRO 사용자는 PRO 뱃지를 표시해야 함', () => {
      vi.mocked(useUser).mockReturnValue({
        ...mockUserData,
        user: {
          ...mockUserData.user,
          plan: 'PRO',
        },
        isPro: true,
      })

      render(<SettingsPage />)

      // PRO 뱃지 (여러 개가 있으므로 getAllBy 사용)
      const proTexts = screen.getAllByText('PRO')
      expect(proTexts.length).toBeGreaterThan(0)
    })

    it('FREE 사용자는 업그레이드 안내를 표시해야 함', () => {
      vi.mocked(useUser).mockReturnValue(mockUserData)

      render(<SettingsPage />)

      expect(screen.getByText('프리미엄으로 업그레이드')).toBeInTheDocument()
      expect(screen.getByText('더 많은 기능과 무제한 가이드를 이용하세요.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '업그레이드' })).toBeInTheDocument()
    })

    it('PRO 사용자는 업그레이드 안내를 표시하지 않아야 함', () => {
      vi.mocked(useUser).mockReturnValue({
        ...mockUserData,
        user: {
          ...mockUserData.user,
          plan: 'PRO',
        },
        isPro: true,
      })

      render(<SettingsPage />)

      expect(screen.queryByText('프리미엄으로 업그레이드')).not.toBeInTheDocument()
    })

    it('사용자 ID가 표시되어야 함', () => {
      vi.mocked(useUser).mockReturnValue(mockUserData)

      render(<SettingsPage />)

      expect(screen.getByText('user_test123')).toBeInTheDocument()
    })
  })

  describe('로그아웃 기능', () => {
    it('로그아웃 버튼이 표시되어야 함', () => {
      vi.mocked(useUser).mockReturnValue(mockUserData)

      render(<SettingsPage />)

      expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument()
    })

    it('로그아웃 버튼 클릭 시 signOut이 호출되어야 함', async () => {
      vi.mocked(useUser).mockReturnValue(mockUserData)
      const user = userEvent.setup()

      render(<SettingsPage />)

      const signOutButton = screen.getByRole('button', { name: '로그아웃' })
      await user.click(signOutButton)

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledOnce()
      })
    })
  })

  describe('페이지 구조', () => {
    it('페이지 제목이 표시되어야 함', () => {
      vi.mocked(useUser).mockReturnValue(mockUserData)

      render(<SettingsPage />)

      expect(screen.getByRole('heading', { name: '설정', level: 1 })).toBeInTheDocument()
    })

    it('프로필 정보 섹션이 있어야 함', () => {
      vi.mocked(useUser).mockReturnValue(mockUserData)

      render(<SettingsPage />)

      expect(screen.getByRole('heading', { name: '프로필 정보', level: 2 })).toBeInTheDocument()
    })

    it('계정 관리 섹션이 있어야 함', () => {
      vi.mocked(useUser).mockReturnValue(mockUserData)

      render(<SettingsPage />)

      expect(screen.getByRole('heading', { name: '계정 관리', level: 2 })).toBeInTheDocument()
    })
  })

  describe('접근성', () => {
    it('프로필 이미지에 적절한 alt 텍스트가 있어야 함', () => {
      vi.mocked(useUser).mockReturnValue(mockUserData)

      render(<SettingsPage />)

      const profileImage = screen.getByAltText('홍길동')
      expect(profileImage).toBeInTheDocument()
    })

    it('fullName이 없을 때 기본 alt 텍스트를 사용해야 함', () => {
      vi.mocked(useUser).mockReturnValue({
        ...mockUserData,
        user: {
          ...mockUserData.user,
          fullName: null,
        },
      })

      render(<SettingsPage />)

      const profileImage = screen.getByAltText('사용자 프로필')
      expect(profileImage).toBeInTheDocument()
    })
  })
})
