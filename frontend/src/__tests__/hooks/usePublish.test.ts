// @TASK T4.1 - usePublish Hook 테스트
// @SPEC docs/planning/02-trd.md#발행-API

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { usePublishGuide, useUnpublishGuide, useCheckSlug } from '@/hooks/usePublish'

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

describe('usePublish Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // usePublishGuide
  // ==========================================================================
  describe('usePublishGuide', () => {
    it('안내서를 발행해야 함', async () => {
      const { result } = renderHook(() => usePublishGuide(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({
          id: 'guide_test_1',
          slug: 'my-awesome-guide',
        })
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data).toBeDefined()
      expect(result.current.data?.data.id).toBe('guide_test_1')
      expect(result.current.data?.data.slug).toBe('my-awesome-guide')
      expect(result.current.data?.data.isPublished).toBe(true)
    })

    it('발행 시 slug가 설정되어야 함', async () => {
      const { result } = renderHook(() => usePublishGuide(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({
          id: 'guide_test_1',
          slug: 'test-slug-123',
        })
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data.slug).toBe('test-slug-123')
    })

    it('발행 성공 시 캐시가 무효화되어야 함', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, gcTime: 0 },
          mutations: { retry: false },
        },
      })

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children)

      const { result } = renderHook(() => usePublishGuide(), { wrapper })

      await act(async () => {
        result.current.mutate({
          id: 'guide_test_1',
          slug: 'test-guide',
        })
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // 캐시 무효화 확인
      expect(invalidateSpy).toHaveBeenCalled()
    })

    it('중복된 slug로 발행하면 에러를 반환해야 함', async () => {
      const { result } = renderHook(() => usePublishGuide(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({
          id: 'guide_test_1',
          slug: 'guesthouse-guide', // 이미 사용 중인 slug
        })
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it('잘못된 형식의 slug는 에러를 반환해야 함', async () => {
      const { result } = renderHook(() => usePublishGuide(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({
          id: 'guide_test_1',
          slug: 'Invalid Slug!', // 공백 및 특수문자 포함
        })
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })
  })

  // ==========================================================================
  // useUnpublishGuide
  // ==========================================================================
  describe('useUnpublishGuide', () => {
    it('발행을 취소해야 함', async () => {
      const { result } = renderHook(() => useUnpublishGuide(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate('guide_test_1')
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data).toBeDefined()
      expect(result.current.data?.data.id).toBe('guide_test_1')
    })

    it('발행 취소 시 isPublished가 false가 되어야 함', async () => {
      const { result } = renderHook(() => useUnpublishGuide(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate('guide_test_1')
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data.isPublished).toBe(false)
    })

    it('존재하지 않는 안내서 발행 취소는 에러를 반환해야 함', async () => {
      const { result } = renderHook(() => useUnpublishGuide(), {
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

  // ==========================================================================
  // useCheckSlug
  // ==========================================================================
  describe('useCheckSlug', () => {
    it('slug 사용 가능 여부를 확인해야 함', async () => {
      const { result } = renderHook(() => useCheckSlug('new-unique-slug'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.available).toBe(true)
    })

    it('중복된 slug는 사용 불가해야 함', async () => {
      const { result } = renderHook(() => useCheckSlug('guesthouse-guide'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data?.available).toBe(false)
      expect(result.current.data?.suggestion).toBeDefined()
    })

    it('slug가 비어있으면 쿼리를 실행하지 않아야 함', async () => {
      const { result } = renderHook(() => useCheckSlug(''), {
        wrapper: createWrapper(),
      })

      // enabled: false이므로 로딩 상태가 아님
      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBeUndefined()
    })

    it('예약된 slug는 사용 불가해야 함', async () => {
      const { result } = renderHook(() => useCheckSlug('admin'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data?.available).toBe(false)
    })
  })
})
