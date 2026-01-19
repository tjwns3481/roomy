// @TASK T2.3 - Block Store 구현
// @SPEC docs/planning/02-trd.md#블록-관리
// @TEST src/__tests__/stores/blockStore.test.ts

'use client'

import { create } from 'zustand'
import type { BlockType, BlockContent } from '@/contracts'

/**
 * Editor Block 인터페이스
 * UI 상태를 위한 클라이언트 사이드 블록 타입
 */
export interface EditorBlock {
  id: string
  pageId: string
  type: BlockType | 'text' | 'heading' | 'image' | 'code'
  order: number
  content: BlockContent | Record<string, unknown>
  createdAt: string
  updatedAt: string
}

/**
 * Block Store 상태 인터페이스
 */
interface BlockState {
  /**
   * 현재 편집 중인 블록 목록
   */
  blocks: EditorBlock[]
  /**
   * 현재 선택된 블록 ID
   */
  selectedBlockId: string | null
  /**
   * 드래그 중인 블록 ID
   */
  draggingBlockId: string | null
  /**
   * 블록 목록 설정
   */
  setBlocks: (blocks: EditorBlock[]) => void
  /**
   * 블록 추가
   */
  addBlock: (block: EditorBlock) => void
  /**
   * 블록 업데이트
   */
  updateBlock: (id: string, updates: Partial<EditorBlock>) => void
  /**
   * 블록 삭제
   */
  removeBlock: (id: string) => void
  /**
   * 블록 순서 변경
   */
  reorderBlocks: (sourceIndex: number, destinationIndex: number) => void
  /**
   * 선택된 블록 설정
   */
  setSelectedBlockId: (id: string | null) => void
  /**
   * 드래그 중인 블록 설정
   */
  setDraggingBlockId: (id: string | null) => void
  /**
   * 스토어 초기화
   */
  reset: () => void
}

const initialState = {
  blocks: [],
  selectedBlockId: null,
  draggingBlockId: null,
}

/**
 * Block Store
 *
 * 에디터에서 블록의 로컬 상태를 관리합니다.
 * API와의 동기화는 useBlock 훅에서 처리합니다.
 *
 * @example
 * ```tsx
 * function BlockEditor() {
 *   const { blocks, addBlock, updateBlock, removeBlock } = useBlockStore()
 *
 *   const handleAddText = () => {
 *     addBlock({
 *       id: crypto.randomUUID(),
 *       pageId: 'current-page',
 *       type: 'text',
 *       order: blocks.length,
 *       content: { text: '' },
 *       createdAt: new Date().toISOString(),
 *       updatedAt: new Date().toISOString(),
 *     })
 *   }
 *
 *   return (
 *     <div>
 *       {blocks.map(block => <BlockRenderer key={block.id} block={block} />)}
 *       <button onClick={handleAddText}>텍스트 추가</button>
 *     </div>
 *   )
 * }
 * ```
 */
export const useBlockStore = create<BlockState>((set) => ({
  ...initialState,

  setBlocks: (blocks) => set({ blocks }),

  addBlock: (block) =>
    set((state) => ({
      blocks: [...state.blocks, block],
    })),

  updateBlock: (id, updates) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id
          ? { ...block, ...updates, updatedAt: new Date().toISOString() }
          : block
      ),
    })),

  removeBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
      selectedBlockId:
        state.selectedBlockId === id ? null : state.selectedBlockId,
    })),

  reorderBlocks: (sourceIndex, destinationIndex) =>
    set((state) => {
      const blocks = [...state.blocks]
      const [removed] = blocks.splice(sourceIndex, 1)
      blocks.splice(destinationIndex, 0, removed)

      // Only update order values for blocks that were actually moved or affected
      // Get the pageId of the moved block
      const movedPageId = removed.pageId
      const minIndex = Math.min(sourceIndex, destinationIndex)
      const maxIndex = Math.max(sourceIndex, destinationIndex)

      return {
        blocks: blocks.map((block, index) => {
          // Only update blocks that were affected by the move (same page and within range)
          if (
            block.pageId === movedPageId &&
            index >= minIndex &&
            index <= maxIndex
          ) {
            // Find the order value for this block within its page
            const pageBlocks = blocks.filter((b) => b.pageId === movedPageId)
            const pageIndex = pageBlocks.findIndex((b) => b.id === block.id)
            return {
              ...block,
              order: pageIndex,
              updatedAt: new Date().toISOString(),
            }
          }
          return block
        }),
      }
    }),

  setSelectedBlockId: (id) => set({ selectedBlockId: id }),

  setDraggingBlockId: (id) => set({ draggingBlockId: id }),

  reset: () => set(initialState),
}))

/**
 * 특정 페이지의 블록만 반환하는 셀렉터
 */
export const getBlocksByPageId = (pageId: string) =>
  useBlockStore.getState().blocks.filter((block) => block.pageId === pageId)

/**
 * 선택된 블록을 반환하는 셀렉터
 */
export const getSelectedBlock = () => {
  const state = useBlockStore.getState()
  return state.blocks.find((block) => block.id === state.selectedBlockId) || null
}
