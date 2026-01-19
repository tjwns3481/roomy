// @TASK T5.1 - Dashboard 페이지 테스트
// @SPEC docs/planning/03-frontend-spec.md#대시보드

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from '@/app/(protected)/dashboard/page';
import { GuideListResponse } from '@/contracts';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock useGuideList hook
vi.mock('@/hooks/useGuide', () => ({
  useGuideList: vi.fn(),
  useCreateGuide: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

import { useGuideList } from '@/hooks/useGuide';

const mockUseGuideList = vi.mocked(useGuideList);

// Test wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return Wrapper;
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('페이지 제목이 표시되어야 함', async () => {
    mockUseGuideList.mockReturnValue({
      data: {
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      } as GuideListResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('내 안내서')).toBeInTheDocument();
    });
  });

  it('새 안내서 만들기 버튼이 있어야 함', async () => {
    mockUseGuideList.mockReturnValue({
      data: {
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      } as GuideListResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('새 안내서 만들기')).toBeInTheDocument();
    });
  });

  it('안내서 목록이 표시되어야 함', async () => {
    mockUseGuideList.mockReturnValue({
      data: {
        data: [
          {
            id: '1',
            title: '첫 번째 안내서',
            slug: 'first-guide',
            coverImage: null,
            isPublished: true,
            createdAt: new Date('2024-01-01T00:00:00Z'),
            updatedAt: new Date('2024-01-01T00:00:00Z'),
            blockCount: 5,
            viewCount: 100,
          },
          {
            id: '2',
            title: '두 번째 안내서',
            slug: null,
            coverImage: null,
            isPublished: false,
            createdAt: new Date('2024-01-02T00:00:00Z'),
            updatedAt: new Date('2024-01-02T00:00:00Z'),
            blockCount: 3,
            viewCount: 0,
          },
        ],
        meta: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      } as GuideListResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('첫 번째 안내서')).toBeInTheDocument();
      expect(screen.getByText('두 번째 안내서')).toBeInTheDocument();
    });
  });

  it('안내서가 없을 때 빈 상태 UI를 표시해야 함', async () => {
    mockUseGuideList.mockReturnValue({
      data: {
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      } as GuideListResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('아직 만든 안내서가 없습니다')).toBeInTheDocument();
    });
  });

  it('로딩 중일 때 스켈레톤이 표시되어야 함', async () => {
    mockUseGuideList.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('guide-list-skeleton')).toBeInTheDocument();
    });
  });
});
