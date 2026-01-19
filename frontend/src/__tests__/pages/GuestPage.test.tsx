// @TASK T3.1 - 게스트 페이지 테스트
// @SPEC docs/planning/02-trd.md#게스트-페이지

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock the usePublicGuide hook
const mockUsePublicGuide = vi.fn()
vi.mock('@/hooks/useGuide', () => ({
  usePublicGuide: (slug: string) => mockUsePublicGuide(slug),
}))

// Import the content component (not the page wrapper that uses use())
import { GuestPageContent } from '@/components/guest/GuestPageContent'

/**
 * 테스트 래퍼 컴포넌트
 */
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('GuestPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('발행된 안내서 정보를 표시해야 함', async () => {
    // GIVEN: 발행된 안내서가 존재
    const mockGuide = {
      id: 'guide_1',
      userId: 'user_1',
      title: '홍대 게스트하우스 안내',
      slug: 'hongdae-guesthouse',
      description: '홍대에서 즐거운 시간을 보내세요',
      coverImage: 'https://example.com/cover.jpg',
      isPublished: true,
      theme: {
        primaryColor: '#E07A5F',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Pretendard',
        borderRadius: 'md' as const,
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      blocks: [
        {
          id: 'block_1',
          guideId: 'guide_1',
          type: 'HERO' as const,
          order: 0,
          content: {
            imageUrl: 'https://example.com/hero.jpg',
            title: '환영합니다',
            subtitle: '편안한 숙박을 위한 모든 정보',
          },
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ],
    }

    mockUsePublicGuide.mockReturnValue({
      data: { data: mockGuide },
      isLoading: false,
      isError: false,
      error: null,
    })

    // WHEN: 게스트 페이지에 접근
    render(
      <TestWrapper>
        <GuestPageContent slug="hongdae-guesthouse" />
      </TestWrapper>
    )

    // THEN: 안내서 정보가 표시됨
    await waitFor(() => {
      expect(screen.getByText('홍대 게스트하우스 안내')).toBeInTheDocument()
    })
    expect(screen.getByText('홍대에서 즐거운 시간을 보내세요')).toBeInTheDocument()
  })

  it('안내서 제목이 표시되어야 함', async () => {
    // GIVEN: 제목이 있는 안내서
    const mockGuide = {
      id: 'guide_2',
      userId: 'user_1',
      title: '강남 숙소 가이드',
      slug: 'gangnam-guide',
      description: null,
      coverImage: null,
      isPublished: true,
      theme: {
        primaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Pretendard',
        borderRadius: 'md' as const,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      blocks: [],
    }

    mockUsePublicGuide.mockReturnValue({
      data: { data: mockGuide },
      isLoading: false,
      isError: false,
      error: null,
    })

    // WHEN: 게스트 페이지 렌더링
    render(
      <TestWrapper>
        <GuestPageContent slug="gangnam-guide" />
      </TestWrapper>
    )

    // THEN: 제목이 표시됨
    await waitFor(() => {
      expect(screen.getByText('강남 숙소 가이드')).toBeInTheDocument()
    })
  })

  it('블록 목록이 렌더링되어야 함', async () => {
    // GIVEN: 여러 블록이 있는 안내서
    const mockGuide = {
      id: 'guide_3',
      userId: 'user_1',
      title: '이태원 스테이 안내',
      slug: 'itaewon-stay',
      description: null,
      coverImage: null,
      isPublished: true,
      theme: {
        primaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Pretendard',
        borderRadius: 'md' as const,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      blocks: [
        {
          id: 'block_1',
          guideId: 'guide_3',
          type: 'HERO' as const,
          order: 0,
          content: {
            imageUrl: null,
            title: 'Welcome to Itaewon',
            subtitle: 'Enjoy your stay',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'block_2',
          guideId: 'guide_3',
          type: 'QUICK_INFO' as const,
          order: 1,
          content: {
            items: [
              {
                icon: 'clock',
                label: 'Check-in',
                value: '15:00',
              },
            ],
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    }

    mockUsePublicGuide.mockReturnValue({
      data: { data: mockGuide },
      isLoading: false,
      isError: false,
      error: null,
    })

    // WHEN: 게스트 페이지 렌더링
    render(
      <TestWrapper>
        <GuestPageContent slug="itaewon-stay" />
      </TestWrapper>
    )

    // THEN: 블록이 표시됨
    await waitFor(() => {
      expect(screen.getByText('Welcome to Itaewon')).toBeInTheDocument()
    })
  })

  it('존재하지 않는 slug는 에러를 표시해야 함', async () => {
    // GIVEN: 존재하지 않는 슬러그
    mockUsePublicGuide.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('안내서를 찾을 수 없습니다'),
    })

    // WHEN: 존재하지 않는 페이지에 접근
    render(
      <TestWrapper>
        <GuestPageContent slug="nonexistent" />
      </TestWrapper>
    )

    // THEN: 에러 메시지가 표시됨
    await waitFor(() => {
      expect(screen.getByText('안내서를 찾을 수 없습니다')).toBeInTheDocument()
    })
  })

  it('발행되지 않은 안내서는 접근 불가해야 함', async () => {
    // GIVEN: 발행되지 않은 안내서 (서버에서 404 반환)
    mockUsePublicGuide.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('안내서를 찾을 수 없습니다'),
    })

    // WHEN: 발행되지 않은 안내서에 접근
    render(
      <TestWrapper>
        <GuestPageContent slug="unpublished-guide" />
      </TestWrapper>
    )

    // THEN: 에러 메시지가 표시됨
    await waitFor(() => {
      expect(screen.getByText('안내서를 찾을 수 없습니다')).toBeInTheDocument()
    })
  })

  it('로딩 중에 로딩 표시가 나타나야 함', async () => {
    // GIVEN: 로딩 상태
    mockUsePublicGuide.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    })

    // WHEN: 게스트 페이지에 접근
    render(
      <TestWrapper>
        <GuestPageContent slug="loading-test" />
      </TestWrapper>
    )

    // THEN: 로딩 표시가 나타남
    await waitFor(() => {
      expect(screen.getByText('로딩 중...')).toBeInTheDocument()
    })
  })
})
