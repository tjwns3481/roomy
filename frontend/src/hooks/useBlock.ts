// @TASK T2.2 - useBlock Hook 구현
// @SPEC docs/planning/02-trd.md#블록-API
// @TEST src/__tests__/hooks/useBlock.test.ts

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BlockSchema,
  CreateBlockInput,
  CreateBlockResponse,
  UpdateBlockInput,
  UpdateBlockResponse,
  ReorderBlocksInput,
  ReorderBlocksResponse,
  DeleteBlockResponse,
} from '@/contracts'
import { guideKeys } from './useGuide'

// ============================================================================
// API Functions
// ============================================================================

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
 * 블록 목록 조회 API
 */
async function fetchBlocks(guideId: string): Promise<{ data: Array<typeof BlockSchema._type> }> {
  const response = await fetch(`/api/guides/${guideId}/blocks`)
  return handleResponse(response)
}

/**
 * 블록 생성 API
 */
async function createBlock(
  guideId: string,
  data: CreateBlockInput
): Promise<CreateBlockResponse> {
  const response = await fetch(`/api/guides/${guideId}/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<CreateBlockResponse>(response)
}

/**
 * 블록 수정 API
 */
async function updateBlock(
  guideId: string,
  blockId: string,
  data: UpdateBlockInput
): Promise<UpdateBlockResponse> {
  const response = await fetch(`/api/guides/${guideId}/blocks/${blockId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<UpdateBlockResponse>(response)
}

/**
 * 블록 삭제 API
 */
async function deleteBlock(guideId: string, blockId: string): Promise<DeleteBlockResponse> {
  const response = await fetch(`/api/guides/${guideId}/blocks/${blockId}`, {
    method: 'DELETE',
  })
  return handleResponse<DeleteBlockResponse>(response)
}

/**
 * 블록 순서 변경 API
 */
async function reorderBlocks(
  guideId: string,
  data: ReorderBlocksInput
): Promise<ReorderBlocksResponse> {
  const response = await fetch(`/api/guides/${guideId}/blocks/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<ReorderBlocksResponse>(response)
}

// ============================================================================
// Query Keys
// ============================================================================

export const blockKeys = {
  all: ['blocks'] as const,
  lists: () => [...blockKeys.all, 'list'] as const,
  list: (guideId: string) => [...blockKeys.lists(), guideId] as const,
  details: () => [...blockKeys.all, 'detail'] as const,
  detail: (guideId: string, blockId: string) => [...blockKeys.details(), guideId, blockId] as const,
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * 블록 목록 조회 Hook
 *
 * @param guideId - 안내서 ID (undefined일 경우 쿼리 비활성화)
 * @returns 블록 목록 쿼리 결과
 *
 * @example
 * ```tsx
 * function BlockList({ guideId }: { guideId: string }) {
 *   const { data, isLoading } = useBlocks(guideId)
 *
 *   if (isLoading) return <Spinner />
 *
 *   return (
 *     <div>
 *       {data?.data.map(block => (
 *         <Block key={block.id} {...block} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useBlocks(guideId: string | undefined) {
  return useQuery({
    queryKey: blockKeys.list(guideId || ''),
    queryFn: () => fetchBlocks(guideId!),
    enabled: !!guideId,
  })
}

/**
 * 블록 생성 Mutation Hook
 *
 * @returns 블록 생성 mutation 결과
 *
 * @example
 * ```tsx
 * function AddBlockButton({ guideId }: { guideId: string }) {
 *   const createBlock = useCreateBlock()
 *
 *   const handleClick = () => {
 *     createBlock.mutate({
 *       guideId,
 *       data: {
 *         type: 'HERO',
 *         content: { title: '새 블록' }
 *       }
 *     })
 *   }
 *
 *   return <button onClick={handleClick}>블록 추가</button>
 * }
 * ```
 */
export function useCreateBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ guideId, data }: { guideId: string; data: CreateBlockInput }) =>
      createBlock(guideId, data),
    onSuccess: (_, variables) => {
      // 해당 안내서의 블록 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: blockKeys.list(variables.guideId) })
      // 안내서 상세 캐시도 무효화 (블록 포함)
      queryClient.invalidateQueries({ queryKey: guideKeys.detail(variables.guideId) })
    },
  })
}

/**
 * 블록 수정 Mutation Hook
 *
 * @returns 블록 수정 mutation 결과
 *
 * @example
 * ```tsx
 * function EditBlock({ guideId, blockId }: Props) {
 *   const updateBlock = useUpdateBlock()
 *
 *   const handleSave = (content: Record<string, unknown>) => {
 *     updateBlock.mutate({
 *       guideId,
 *       blockId,
 *       data: { content }
 *     })
 *   }
 *
 *   return <BlockEditor onSave={handleSave} />
 * }
 * ```
 */
export function useUpdateBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      guideId,
      blockId,
      data,
    }: {
      guideId: string
      blockId: string
      data: UpdateBlockInput
    }) => updateBlock(guideId, blockId, data),
    onSuccess: (_, variables) => {
      // 해당 블록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: blockKeys.detail(variables.guideId, variables.blockId),
      })
      // 블록 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: blockKeys.list(variables.guideId) })
      // 안내서 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: guideKeys.detail(variables.guideId) })
    },
  })
}

/**
 * 블록 삭제 Mutation Hook
 *
 * @returns 블록 삭제 mutation 결과
 *
 * @example
 * ```tsx
 * function DeleteButton({ guideId, blockId }: Props) {
 *   const deleteBlock = useDeleteBlock()
 *
 *   const handleDelete = () => {
 *     if (confirm('블록을 삭제하시겠습니까?')) {
 *       deleteBlock.mutate({ guideId, blockId })
 *     }
 *   }
 *
 *   return <button onClick={handleDelete}>삭제</button>
 * }
 * ```
 */
export function useDeleteBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ guideId, blockId }: { guideId: string; blockId: string }) =>
      deleteBlock(guideId, blockId),
    onSuccess: (_, variables) => {
      // 해당 블록 캐시 제거
      queryClient.removeQueries({
        queryKey: blockKeys.detail(variables.guideId, variables.blockId),
      })
      // 블록 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: blockKeys.list(variables.guideId) })
      // 안내서 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: guideKeys.detail(variables.guideId) })
    },
  })
}

/**
 * 블록 순서 변경 Mutation Hook
 *
 * @returns 블록 순서 변경 mutation 결과
 *
 * @example
 * ```tsx
 * function BlockReorder({ guideId, blocks }: Props) {
 *   const reorderBlocks = useReorderBlocks()
 *
 *   const handleReorder = (newOrder: Array<{ id: string; order: number }>) => {
 *     reorderBlocks.mutate({
 *       guideId,
 *       data: { blocks: newOrder }
 *     })
 *   }
 *
 *   return <DragDropList onReorder={handleReorder} />
 * }
 * ```
 */
export function useReorderBlocks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ guideId, data }: { guideId: string; data: ReorderBlocksInput }) =>
      reorderBlocks(guideId, data),
    onSuccess: (_, variables) => {
      // 블록 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: blockKeys.list(variables.guideId) })
      // 안내서 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: guideKeys.detail(variables.guideId) })
    },
  })
}
