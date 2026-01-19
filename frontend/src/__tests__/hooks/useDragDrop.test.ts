// @TASK T2.5 - Drag and Drop 구현 테스트
// @SPEC docs/planning/02-trd.md#드래그앤드롭

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDragDrop } from '@/hooks/useDragDrop'
import { useBlockStore } from '@/stores/blockStore'
import type { EditorBlock } from '@/stores/blockStore'

// Mock blocks for testing
const mockBlocks: EditorBlock[] = [
  {
    id: 'block-1',
    pageId: 'page-1',
    type: 'text',
    order: 0,
    content: { text: 'First block' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'block-2',
    pageId: 'page-1',
    type: 'heading',
    order: 1,
    content: { text: 'Second block', level: 1 },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'block-3',
    pageId: 'page-1',
    type: 'text',
    order: 2,
    content: { text: 'Third block' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

describe('useDragDrop', () => {
  beforeEach(() => {
    // Reset store and set mock blocks
    useBlockStore.getState().reset()
    useBlockStore.getState().setBlocks(mockBlocks)
  })

  describe('기본 드래그앤드롭 기능', () => {
    it('블록을 아래로 드래그하면 순서가 변경된다', () => {
      const { result } = renderHook(() => useDragDrop('page-1'))
      const blocks = useBlockStore.getState().blocks

      // block-1을 block-3 위치로 이동 (0 -> 2)
      act(() => {
        result.current.handleDragEnd({
          active: { id: 'block-1' },
          over: { id: 'block-3' },
        })
      })

      const updatedBlocks = useBlockStore.getState().blocks
      expect(updatedBlocks[0].id).toBe('block-2')
      expect(updatedBlocks[1].id).toBe('block-3')
      expect(updatedBlocks[2].id).toBe('block-1')

      // order 값도 업데이트되어야 함
      expect(updatedBlocks[0].order).toBe(0)
      expect(updatedBlocks[1].order).toBe(1)
      expect(updatedBlocks[2].order).toBe(2)
    })

    it('블록을 위로 드래그하면 순서가 변경된다', () => {
      const { result } = renderHook(() => useDragDrop('page-1'))

      // block-3을 block-1 위치로 이동 (2 -> 0)
      act(() => {
        result.current.handleDragEnd({
          active: { id: 'block-3' },
          over: { id: 'block-1' },
        })
      })

      const updatedBlocks = useBlockStore.getState().blocks
      expect(updatedBlocks[0].id).toBe('block-3')
      expect(updatedBlocks[1].id).toBe('block-1')
      expect(updatedBlocks[2].id).toBe('block-2')
    })

    it('같은 위치에 드롭하면 순서가 변경되지 않는다', () => {
      const { result } = renderHook(() => useDragDrop('page-1'))
      const blocksBefore = useBlockStore.getState().blocks

      act(() => {
        result.current.handleDragEnd({
          active: { id: 'block-2' },
          over: { id: 'block-2' },
        })
      })

      const blocksAfter = useBlockStore.getState().blocks
      expect(blocksAfter).toEqual(blocksBefore)
    })

    it('드롭 대상이 없으면 순서가 변경되지 않는다', () => {
      const { result } = renderHook(() => useDragDrop('page-1'))
      const blocksBefore = useBlockStore.getState().blocks

      act(() => {
        result.current.handleDragEnd({
          active: { id: 'block-1' },
          over: null,
        })
      })

      const blocksAfter = useBlockStore.getState().blocks
      expect(blocksAfter).toEqual(blocksBefore)
    })
  })

  describe('드래그 상태 관리', () => {
    it('드래그 시작 시 activeId가 설정된다', () => {
      const { result } = renderHook(() => useDragDrop('page-1'))

      act(() => {
        result.current.handleDragStart({
          active: { id: 'block-1' },
        })
      })

      expect(result.current.activeId).toBe('block-1')
    })

    it('드래그 종료 시 activeId가 null로 초기화된다', () => {
      const { result } = renderHook(() => useDragDrop('page-1'))

      act(() => {
        result.current.handleDragStart({
          active: { id: 'block-1' },
        })
      })
      expect(result.current.activeId).toBe('block-1')

      act(() => {
        result.current.handleDragEnd({
          active: { id: 'block-1' },
          over: { id: 'block-2' },
        })
      })

      expect(result.current.activeId).toBe(null)
    })

    it('드래그 취소 시 activeId가 null로 초기화된다', () => {
      const { result } = renderHook(() => useDragDrop('page-1'))

      act(() => {
        result.current.handleDragStart({
          active: { id: 'block-1' },
        })
      })
      expect(result.current.activeId).toBe('block-1')

      act(() => {
        result.current.handleDragCancel()
      })

      expect(result.current.activeId).toBe(null)
    })
  })

  describe('페이지별 블록 필터링', () => {
    it('다른 페이지의 블록은 영향을 받지 않는다', () => {
      // 다른 페이지의 블록 추가
      useBlockStore.getState().addBlock({
        id: 'block-other',
        pageId: 'page-2',
        type: 'text',
        order: 0,
        content: { text: 'Other page block' },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      })

      const { result } = renderHook(() => useDragDrop('page-1'))

      act(() => {
        result.current.handleDragEnd({
          active: { id: 'block-1' },
          over: { id: 'block-3' },
        })
      })

      const allBlocks = useBlockStore.getState().blocks
      const otherPageBlock = allBlocks.find((b) => b.id === 'block-other')

      // 다른 페이지 블록은 그대로
      expect(otherPageBlock?.order).toBe(0)
      expect(otherPageBlock?.pageId).toBe('page-2')
    })

    it('sortedIds는 현재 페이지의 블록만 포함한다', () => {
      // 다른 페이지의 블록 추가
      useBlockStore.getState().addBlock({
        id: 'block-other',
        pageId: 'page-2',
        type: 'text',
        order: 0,
        content: { text: 'Other page block' },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      })

      const { result } = renderHook(() => useDragDrop('page-1'))

      expect(result.current.sortedIds).toEqual(['block-1', 'block-2', 'block-3'])
      expect(result.current.sortedIds).not.toContain('block-other')
    })
  })

  describe('키보드 접근성', () => {
    it('sensors가 정의되어 있다', () => {
      const { result } = renderHook(() => useDragDrop('page-1'))

      expect(result.current.sensors).toBeDefined()
      expect(Array.isArray(result.current.sensors)).toBe(true)
    })

    it('키보드와 마우스 센서가 모두 포함되어 있다', () => {
      const { result } = renderHook(() => useDragDrop('page-1'))

      // sensors 배열에 최소 2개 이상의 센서가 있어야 함
      expect(result.current.sensors.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('엣지 케이스', () => {
    it('존재하지 않는 블록을 드래그하면 아무 일도 일어나지 않는다', () => {
      const { result } = renderHook(() => useDragDrop('page-1'))
      const blocksBefore = useBlockStore.getState().blocks

      act(() => {
        result.current.handleDragEnd({
          active: { id: 'non-existent-block' },
          over: { id: 'block-1' },
        })
      })

      const blocksAfter = useBlockStore.getState().blocks
      expect(blocksAfter).toEqual(blocksBefore)
    })

    it('빈 페이지에서는 sortedIds가 빈 배열이다', () => {
      const { result } = renderHook(() => useDragDrop('empty-page'))

      expect(result.current.sortedIds).toEqual([])
    })
  })
})
