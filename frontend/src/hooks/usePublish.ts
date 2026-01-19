// @TASK T4.1 - usePublish Hook 구현
// @SPEC docs/planning/02-trd.md#발행-API
// @TEST src/__tests__/hooks/usePublish.test.ts

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PublishGuideResponse,
  CheckSlugResponse,
} from '@/contracts'
import { guideKeys } from './useGuide'

// ============================================================================
// API Functions
// ============================================================================

const API_BASE = '/api/guides'

/**
 * API 에러 처리 헬퍼
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
    throw new Error(error.error?.message || `HTTP ${response.status}`)
  }
  return response.json()
}

/**
 * 안내서 발행 API
 */
async function publishGuide(id: string, slug: string): Promise<PublishGuideResponse> {
  const response = await fetch(`${API_BASE}/${id}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug }),
  })
  return handleResponse<PublishGuideResponse>(response)
}

/**
 * 안내서 발행 취소 API
 */
async function unpublishGuide(id: string): Promise<PublishGuideResponse> {
  const response = await fetch(`${API_BASE}/${id}/unpublish`, {
    method: 'POST',
  })
  return handleResponse<PublishGuideResponse>(response)
}

/**
 * 슬러그 중복 확인 API
 */
async function checkSlug(slug: string): Promise<CheckSlugResponse> {
  const response = await fetch(`${API_BASE}/check-slug`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug }),
  })
  return handleResponse<CheckSlugResponse>(response)
}

// ============================================================================
// Query Keys
// ============================================================================

export const publishKeys = {
  checkSlug: (slug: string) => ['check-slug', slug] as const,
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * 안내서 발행 Mutation Hook
 *
 * @returns 안내서 발행 mutation 결과
 *
 * @example
 * ```tsx
 * function PublishButton({ guideId }: { guideId: string }) {
 *   const publishGuide = usePublishGuide()
 *
 *   const handlePublish = (slug: string) => {
 *     publishGuide.mutate({ id: guideId, slug }, {
 *       onSuccess: () => {
 *         toast.success('안내서가 발행되었습니다')
 *       }
 *     })
 *   }
 *
 *   return <button onClick={() => handlePublish('my-guide')}>발행</button>
 * }
 * ```
 */
export function usePublishGuide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, slug }: { id: string; slug: string }) =>
      publishGuide(id, slug),
    onSuccess: (_, variables) => {
      // 해당 안내서 캐시 무효화
      queryClient.invalidateQueries({ queryKey: guideKeys.detail(variables.id) })
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: guideKeys.lists() })
    },
  })
}

/**
 * 안내서 발행 취소 Mutation Hook
 *
 * @returns 안내서 발행 취소 mutation 결과
 *
 * @example
 * ```tsx
 * function UnpublishButton({ guideId }: { guideId: string }) {
 *   const unpublishGuide = useUnpublishGuide()
 *
 *   const handleUnpublish = () => {
 *     if (confirm('발행을 취소하시겠습니까?')) {
 *       unpublishGuide.mutate(guideId, {
 *         onSuccess: () => {
 *           toast.success('발행이 취소되었습니다')
 *         }
 *       })
 *     }
 *   }
 *
 *   return <button onClick={handleUnpublish}>발행 취소</button>
 * }
 * ```
 */
export function useUnpublishGuide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: unpublishGuide,
    onSuccess: (_, id) => {
      // 해당 안내서 캐시 무효화
      queryClient.invalidateQueries({ queryKey: guideKeys.detail(id) })
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: guideKeys.lists() })
    },
  })
}

/**
 * 슬러그 중복 확인 Query Hook
 *
 * @param slug - 확인할 슬러그 (비어있으면 쿼리 비활성화)
 * @returns 슬러그 사용 가능 여부
 *
 * @example
 * ```tsx
 * function SlugInput() {
 *   const [slug, setSlug] = useState('')
 *   const { data, isLoading } = useCheckSlug(slug)
 *
 *   return (
 *     <div>
 *       <input
 *         value={slug}
 *         onChange={(e) => setSlug(e.target.value)}
 *       />
 *       {!isLoading && data && (
 *         data.available
 *           ? <span>사용 가능</span>
 *           : <span>사용 불가: {data.suggestion}</span>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useCheckSlug(slug: string) {
  return useQuery({
    queryKey: publishKeys.checkSlug(slug),
    queryFn: () => checkSlug(slug),
    enabled: !!slug && slug.length >= 3,
    staleTime: 30000, // 30초간 캐시 유지
  })
}
