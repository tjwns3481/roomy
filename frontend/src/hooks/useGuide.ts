// @TASK T2.1 - useGuide Hook 구현
// @SPEC docs/planning/02-trd.md#안내서-API
// @TEST src/__tests__/hooks/useGuide.test.ts

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  GuideListQuery,
  GuideListResponse,
  GetGuideResponse,
  CreateGuideInput,
  CreateGuideResponse,
  UpdateGuideInput,
  UpdateGuideResponse,
} from '@/contracts'

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
 * 안내서 목록 조회 API
 */
async function fetchGuides(query?: GuideListQuery): Promise<GuideListResponse> {
  const params = new URLSearchParams()

  if (query?.page) params.set('page', String(query.page))
  if (query?.limit) params.set('limit', String(query.limit))
  if (query?.isPublished !== undefined) params.set('isPublished', String(query.isPublished))
  if (query?.search) params.set('search', query.search)

  const url = params.toString() ? `${API_BASE}?${params}` : API_BASE
  const response = await fetch(url)
  return handleResponse<GuideListResponse>(response)
}

/**
 * 안내서 상세 조회 API
 */
async function fetchGuide(id: string): Promise<GetGuideResponse> {
  const response = await fetch(`${API_BASE}/${id}`)
  return handleResponse<GetGuideResponse>(response)
}

/**
 * 안내서 생성 API
 */
async function createGuide(data: CreateGuideInput): Promise<CreateGuideResponse> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<CreateGuideResponse>(response)
}

/**
 * 안내서 수정 API
 */
async function updateGuide(id: string, data: UpdateGuideInput): Promise<UpdateGuideResponse> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<UpdateGuideResponse>(response)
}

/**
 * 안내서 삭제 API
 */
async function deleteGuide(id: string): Promise<{ data: { deleted: boolean } }> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })
  return handleResponse<{ data: { deleted: boolean } }>(response)
}

/**
 * 공개 안내서 조회 API (slug 기반)
 */
async function fetchPublicGuide(slug: string): Promise<GetGuideResponse> {
  const response = await fetch(`${API_BASE}/public/${slug}`)
  return handleResponse<GetGuideResponse>(response)
}

/**
 * 공개 안내서 조회수 증가 API
 */
async function incrementGuideView(slug: string): Promise<{ data: { success: boolean } }> {
  const response = await fetch(`${API_BASE}/public/${slug}/view`, {
    method: 'POST',
  })
  return handleResponse<{ data: { success: boolean } }>(response)
}

// ============================================================================
// Query Keys
// ============================================================================

export const guideKeys = {
  all: ['guides'] as const,
  lists: () => [...guideKeys.all, 'list'] as const,
  list: (query?: GuideListQuery) => [...guideKeys.lists(), query] as const,
  details: () => [...guideKeys.all, 'detail'] as const,
  detail: (id: string) => [...guideKeys.details(), id] as const,
  public: (slug: string) => [...guideKeys.all, 'public', slug] as const,
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * 안내서 목록 조회 Hook
 *
 * @param query - 페이지네이션 및 필터 옵션
 * @returns 안내서 목록 쿼리 결과
 *
 * @example
 * ```tsx
 * function GuidesList() {
 *   const { data, isLoading } = useGuideList({ page: 1, limit: 10 })
 *
 *   if (isLoading) return <Spinner />
 *
 *   return (
 *     <ul>
 *       {data?.data.map(guide => (
 *         <li key={guide.id}>{guide.title}</li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useGuideList(query?: GuideListQuery) {
  return useQuery({
    queryKey: guideKeys.list(query),
    queryFn: () => fetchGuides(query),
  })
}

/**
 * 안내서 상세 조회 Hook
 *
 * @param id - 안내서 ID (undefined일 경우 쿼리 비활성화)
 * @returns 안내서 상세 쿼리 결과
 *
 * @example
 * ```tsx
 * function GuideDetail({ id }: { id: string }) {
 *   const { data, isLoading, isError } = useGuide(id)
 *
 *   if (isLoading) return <Spinner />
 *   if (isError) return <ErrorMessage />
 *
 *   return <h1>{data?.data.title}</h1>
 * }
 * ```
 */
export function useGuide(id: string | undefined) {
  return useQuery({
    queryKey: guideKeys.detail(id || ''),
    queryFn: () => fetchGuide(id!),
    enabled: !!id,
  })
}

/**
 * 안내서 생성 Mutation Hook
 *
 * @returns 안내서 생성 mutation 결과
 *
 * @example
 * ```tsx
 * function CreateGuideForm() {
 *   const createGuide = useCreateGuide()
 *
 *   const handleSubmit = (data: CreateGuideInput) => {
 *     createGuide.mutate(data, {
 *       onSuccess: (result) => {
 *         router.push(`/editor/${result.data.id}`)
 *       }
 *     })
 *   }
 *
 *   return <form onSubmit={handleSubmit}>...</form>
 * }
 * ```
 */
export function useCreateGuide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGuide,
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: guideKeys.lists() })
    },
  })
}

/**
 * 안내서 수정 Mutation Hook
 *
 * @returns 안내서 수정 mutation 결과
 *
 * @example
 * ```tsx
 * function EditGuide({ id }: { id: string }) {
 *   const updateGuide = useUpdateGuide()
 *
 *   const handleSave = (data: UpdateGuideInput) => {
 *     updateGuide.mutate({ id, data })
 *   }
 *
 *   return <GuideEditor onSave={handleSave} />
 * }
 * ```
 */
export function useUpdateGuide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGuideInput }) =>
      updateGuide(id, data),
    onSuccess: (_, variables) => {
      // 해당 안내서 캐시 무효화
      queryClient.invalidateQueries({ queryKey: guideKeys.detail(variables.id) })
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: guideKeys.lists() })
    },
  })
}

/**
 * 안내서 삭제 Mutation Hook
 *
 * @returns 안내서 삭제 mutation 결과
 *
 * @example
 * ```tsx
 * function DeleteButton({ id }: { id: string }) {
 *   const deleteGuide = useDeleteGuide()
 *
 *   const handleDelete = () => {
 *     if (confirm('삭제하시겠습니까?')) {
 *       deleteGuide.mutate(id, {
 *         onSuccess: () => router.push('/dashboard')
 *       })
 *     }
 *   }
 *
 *   return <button onClick={handleDelete}>삭제</button>
 * }
 * ```
 */
export function useDeleteGuide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteGuide,
    onSuccess: (_, id) => {
      // 해당 안내서 캐시 제거
      queryClient.removeQueries({ queryKey: guideKeys.detail(id) })
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: guideKeys.lists() })
    },
  })
}

/**
 * 공개 안내서 조회 Hook (slug 기반)
 *
 * @param slug - 안내서 slug
 * @returns 공개 안내서 쿼리 결과
 *
 * @example
 * ```tsx
 * function GuestPage({ slug }: { slug: string }) {
 *   const { data, isLoading, isError } = usePublicGuide(slug)
 *
 *   if (isLoading) return <Spinner />
 *   if (isError) return <NotFound />
 *
 *   return <GuideViewer guide={data?.data} />
 * }
 * ```
 */
export function usePublicGuide(slug: string) {
  const { mutate: incrementView } = useMutation({
    mutationFn: () => incrementGuideView(slug),
  })

  const query = useQuery({
    queryKey: guideKeys.public(slug),
    queryFn: async () => {
      const data = await fetchPublicGuide(slug)
      // 조회수 증가 (조회 성공 시 한 번만 실행)
      incrementView()
      return data
    },
  })

  return query
}
