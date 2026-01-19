// @TEST T2.2 - useBlock Hook 테스트
// @SPEC docs/planning/02-trd.md#블록-API
// @IMPL src/hooks/useBlock.ts

import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import type { ReactNode } from 'react'
import {
  useBlocks,
  useCreateBlock,
  useUpdateBlock,
  useDeleteBlock,
  useReorderBlocks,
} from '@/hooks/useBlock'
import type { CreateBlockInput, UpdateBlockInput, ReorderBlocksInput } from '@/contracts'

// ============================================================================
// Test Setup
// ============================================================================

/**
 * QueryClient Wrapper 생성
 */
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  Wrapper.displayName = 'QueryClientWrapper'
  return Wrapper
}

// ============================================================================
// useBlocks - 블록 목록 조회
// ============================================================================

describe('useBlocks', () => {
  it('안내서의 블록 목록을 가져와야 함', async () => {
    const guideId = 'guide_test_1'
    const wrapper = createWrapper()

    const { result } = renderHook(() => useBlocks(guideId), { wrapper })

    // 로딩 상태 확인
    expect(result.current.isLoading).toBe(true)

    // 데이터 로드 대기
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // 응답 데이터 확인
    expect(result.current.data).toBeDefined()
    expect(Array.isArray(result.current.data?.data)).toBe(true)
    expect(result.current.data?.data.length).toBeGreaterThan(0)

    // 첫 번째 블록 구조 확인
    const firstBlock = result.current.data?.data[0]
    expect(firstBlock).toHaveProperty('id')
    expect(firstBlock).toHaveProperty('guideId', guideId)
    expect(firstBlock).toHaveProperty('type')
    expect(firstBlock).toHaveProperty('order')
    expect(firstBlock).toHaveProperty('content')
    expect(firstBlock).toHaveProperty('createdAt')
    expect(firstBlock).toHaveProperty('updatedAt')
  })

  it('블록이 order 순서로 정렬되어야 함', async () => {
    const guideId = 'guide_test_1'
    const wrapper = createWrapper()

    const { result } = renderHook(() => useBlocks(guideId), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const blocks = result.current.data?.data || []

    // order가 오름차순인지 확인
    for (let i = 0; i < blocks.length - 1; i++) {
      expect(blocks[i].order).toBeLessThanOrEqual(blocks[i + 1].order)
    }
  })

  it('guideId가 undefined일 경우 쿼리가 비활성화되어야 함', () => {
    const wrapper = createWrapper()

    const { result } = renderHook(() => useBlocks(undefined), { wrapper })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

// ============================================================================
// useCreateBlock - 블록 생성
// ============================================================================

describe('useCreateBlock', () => {
  it('새 블록을 생성해야 함', async () => {
    const wrapper = createWrapper()
    const guideId = 'guide_test_1'

    const { result } = renderHook(() => useCreateBlock(), { wrapper })

    const newBlockData: CreateBlockInput = {
      type: 'HERO',
      order: 0,
      content: {
        imageUrl: null,
        title: '새로운 블록',
        subtitle: '부제목',
      },
    }

    // Mutation 실행
    result.current.mutate({ guideId, data: newBlockData })

    // 성공 대기
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // 응답 데이터 확인
    expect(result.current.data).toBeDefined()
    expect(result.current.data?.data).toHaveProperty('id')
    expect(result.current.data?.data.type).toBe('HERO')
    expect(result.current.data?.data.guideId).toBe(guideId)
  })

  it('content를 생략하면 기본값이 적용되어야 함', async () => {
    const wrapper = createWrapper()
    const guideId = 'guide_test_1'

    const { result } = renderHook(() => useCreateBlock(), { wrapper })

    const newBlockData: CreateBlockInput = {
      type: 'AMENITIES',
    }

    result.current.mutate({ guideId, data: newBlockData })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // 기본 content가 적용되었는지 확인
    expect(result.current.data?.data.content).toBeDefined()
  })

  it('블록 생성 실패 시 에러를 반환해야 함', async () => {
    const wrapper = createWrapper()
    const guideId = 'guide_test_1'

    const { result } = renderHook(() => useCreateBlock(), { wrapper })

    // 잘못된 데이터 (type 누락)
    const invalidData = {} as CreateBlockInput

    result.current.mutate({ guideId, data: invalidData })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })
})

// ============================================================================
// useUpdateBlock - 블록 수정
// ============================================================================

describe('useUpdateBlock', () => {
  it('블록을 수정해야 함', async () => {
    const wrapper = createWrapper()
    const guideId = 'guide_test_1'
    const blockId = 'block_test_1'

    const { result } = renderHook(() => useUpdateBlock(), { wrapper })

    const updateData: UpdateBlockInput = {
      content: {
        imageUrl: 'https://example.com/new-image.jpg',
        title: '수정된 제목',
        subtitle: '수정된 부제목',
      },
    }

    result.current.mutate({ guideId, blockId, data: updateData })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // 수정된 데이터 확인
    expect(result.current.data?.data.content).toEqual(updateData.content)
    expect(result.current.data?.data.id).toBe(blockId)
  })

  it('존재하지 않는 블록 수정 시 에러를 반환해야 함', async () => {
    const wrapper = createWrapper()
    const guideId = 'guide_test_1'
    const blockId = 'non_existent_block'

    const { result } = renderHook(() => useUpdateBlock(), { wrapper })

    const updateData: UpdateBlockInput = {
      content: { title: '수정' },
    }

    result.current.mutate({ guideId, blockId, data: updateData })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

// ============================================================================
// useDeleteBlock - 블록 삭제
// ============================================================================

describe('useDeleteBlock', () => {
  it('블록을 삭제해야 함', async () => {
    const wrapper = createWrapper()
    const guideId = 'guide_test_1'
    const blockId = 'block_test_4'

    const { result } = renderHook(() => useDeleteBlock(), { wrapper })

    result.current.mutate({ guideId, blockId })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // 삭제 성공 응답 확인
    expect(result.current.data?.data.deleted).toBe(true)
  })

  it('존재하지 않는 블록 삭제 시 에러를 반환해야 함', async () => {
    const wrapper = createWrapper()
    const guideId = 'guide_test_1'
    const blockId = 'non_existent_block'

    const { result } = renderHook(() => useDeleteBlock(), { wrapper })

    result.current.mutate({ guideId, blockId })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

// ============================================================================
// useReorderBlocks - 블록 순서 변경
// ============================================================================

describe('useReorderBlocks', () => {
  it('블록 순서를 변경해야 함', async () => {
    const wrapper = createWrapper()
    const guideId = 'guide_test_1'

    const { result } = renderHook(() => useReorderBlocks(), { wrapper })

    const reorderData: ReorderBlocksInput = {
      blocks: [
        { id: 'block_test_1', order: 2 },
        { id: 'block_test_2', order: 1 },
      ],
    }

    result.current.mutate({ guideId, data: reorderData })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // 업데이트된 블록 수 확인
    expect(result.current.data?.data.updated).toBe(2)
  })

  it('빈 배열로 순서 변경 시 성공하지만 업데이트 없음', async () => {
    const wrapper = createWrapper()
    const guideId = 'guide_test_1'

    const { result } = renderHook(() => useReorderBlocks(), { wrapper })

    const emptyData: ReorderBlocksInput = {
      blocks: [],
    }

    result.current.mutate({ guideId, data: emptyData })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // 업데이트된 블록이 0개
    expect(result.current.data?.data.updated).toBe(0)
  })

  it('일부 블록만 순서 변경 가능해야 함', async () => {
    const wrapper = createWrapper()
    const guideId = 'guide_test_1'

    const { result } = renderHook(() => useReorderBlocks(), { wrapper })

    const reorderData: ReorderBlocksInput = {
      blocks: [
        { id: 'block_test_1', order: 5 },
      ],
    }

    result.current.mutate({ guideId, data: reorderData })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.data.updated).toBe(1)
  })
})
