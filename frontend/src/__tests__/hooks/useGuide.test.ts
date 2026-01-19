// @TASK T2.1 - useGuide Hook 테스트
// @SPEC docs/planning/02-trd.md#안내서-API

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useGuide, useGuideList, useCreateGuide, useUpdateGuide, useDeleteGuide } from '@/hooks/useGuide'

// ============================================================================
// Test Setup
// ============================================================================

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    )
  }
}

describe('useGuide Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // useGuideList
  // ==========================================================================
  describe('useGuideList', () => {
    it('안내서 목록을 가져와야 함', async () => {
      const { result } = renderHook(() => useGuideList(), {
        wrapper: createWrapper(),
      })

      // 초기 로딩 상태
      expect(result.current.isLoading).toBe(true)

      // 데이터 로드 완료 대기
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // 데이터 확인
      expect(result.current.data).toBeDefined()
      expect(result.current.data?.data).toBeInstanceOf(Array)
      expect(result.current.data?.meta).toBeDefined()
    })

    it('페이지네이션 파라미터를 적용해야 함', async () => {
      const { result } = renderHook(
        () => useGuideList({ page: 1, limit: 10 }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data?.meta.page).toBe(1)
      expect(result.current.data?.meta.limit).toBe(10)
    })

    it('검색 필터를 적용해야 함', async () => {
      const { result } = renderHook(
        () => useGuideList({ page: 1, limit: 10, search: '게스트하우스' }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data?.data).toBeDefined()
      // 검색 결과가 적용되었는지 확인
      const guides = result.current.data?.data || []
      expect(guides.every(g => g.title.includes('게스트하우스'))).toBe(true)
    })

    it('발행 상태 필터를 적용해야 함', async () => {
      const { result } = renderHook(
        () => useGuideList({ page: 1, limit: 10, isPublished: true }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data?.data).toBeDefined()
      const guides = result.current.data?.data || []
      expect(guides.every(g => g.isPublished === true)).toBe(true)
    })
  })

  // ==========================================================================
  // useGuide (상세 조회)
  // ==========================================================================
  describe('useGuide', () => {
    it('안내서 상세 정보를 가져와야 함', async () => {
      const { result } = renderHook(() => useGuide('guide_test_1'), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.data.id).toBe('guide_test_1')
      expect(result.current.data?.data.title).toBe('게스트하우스 이용 안내')
      expect(result.current.data?.data.blocks).toBeInstanceOf(Array)
    })

    it('존재하지 않는 안내서는 에러를 반환해야 함', async () => {
      const { result } = renderHook(() => useGuide('non_existent_id'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it('id가 없으면 쿼리를 실행하지 않아야 함', async () => {
      const { result } = renderHook(() => useGuide(undefined), {
        wrapper: createWrapper(),
      })

      // enabled: false이므로 로딩 상태가 아님
      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBeUndefined()
    })
  })

  // ==========================================================================
  // useCreateGuide
  // ==========================================================================
  describe('useCreateGuide', () => {
    it('새 안내서를 생성해야 함', async () => {
      const { result } = renderHook(() => useCreateGuide(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({
          title: '새로운 안내서',
          description: '테스트 설명',
        })
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data).toBeDefined()
      expect(result.current.data?.data.title).toBe('새로운 안내서')
      expect(result.current.data?.data.isPublished).toBe(false)
    })

    it('제목 없이 생성하면 에러를 반환해야 함', async () => {
      const { result } = renderHook(() => useCreateGuide(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({
          title: '',
        })
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })
  })

  // ==========================================================================
  // useUpdateGuide
  // ==========================================================================
  describe('useUpdateGuide', () => {
    it('안내서를 수정해야 함', async () => {
      const { result } = renderHook(() => useUpdateGuide(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({
          id: 'guide_test_1',
          data: { title: '수정된 제목' },
        })
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data).toBeDefined()
      expect(result.current.data?.data.title).toBe('수정된 제목')
    })

    it('존재하지 않는 안내서 수정은 에러를 반환해야 함', async () => {
      const { result } = renderHook(() => useUpdateGuide(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({
          id: 'non_existent_id',
          data: { title: '수정된 제목' },
        })
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })
  })

  // ==========================================================================
  // useDeleteGuide
  // ==========================================================================
  describe('useDeleteGuide', () => {
    it('안내서를 삭제해야 함', async () => {
      const { result } = renderHook(() => useDeleteGuide(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate('guide_test_2')
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data.deleted).toBe(true)
    })

    it('존재하지 않는 안내서 삭제는 에러를 반환해야 함', async () => {
      const { result } = renderHook(() => useDeleteGuide(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate('non_existent_id')
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })
  })
})
