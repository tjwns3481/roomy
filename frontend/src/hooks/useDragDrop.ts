// @TASK T2.5 - Drag and Drop 구현
// @SPEC docs/planning/02-trd.md#드래그앤드롭
// @TEST src/__tests__/hooks/useDragDrop.test.ts

'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useBlockStore } from '@/stores/blockStore'

/**
 * useDragDrop 훅
 *
 * @dnd-kit을 사용한 블록 드래그앤드롭 기능을 제공합니다.
 *
 * 기능:
 * - 마우스와 키보드로 블록 순서 변경
 * - 드래그 중 시각적 피드백
 * - 접근성 지원 (방향키로 이동)
 * - 페이지별 블록 필터링
 *
 * @param pageId - 대상 페이지 ID
 * @returns 드래그앤드롭 이벤트 핸들러와 상태
 *
 * @example
 * ```tsx
 * function BlockList({ pageId }: { pageId: string }) {
 *   const {
 *     sensors,
 *     sortedIds,
 *     activeId,
 *     handleDragStart,
 *     handleDragEnd,
 *     handleDragCancel,
 *   } = useDragDrop(pageId)
 *
 *   return (
 *     <DndContext
 *       sensors={sensors}
 *       collisionDetection={closestCenter}
 *       onDragStart={handleDragStart}
 *       onDragEnd={handleDragEnd}
 *       onDragCancel={handleDragCancel}
 *     >
 *       <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
 *         {sortedIds.map(id => <SortableBlock key={id} id={id} />)}
 *       </SortableContext>
 *     </DndContext>
 *   )
 * }
 * ```
 */
export function useDragDrop(pageId: string) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const blocks = useBlockStore((state) => state.blocks)
  const reorderBlocks = useBlockStore((state) => state.reorderBlocks)

  /**
   * 현재 페이지의 블록만 필터링하고 order로 정렬
   */
  const sortedBlocks = useMemo(() => {
    return blocks
      .filter((block) => block.pageId === pageId)
      .sort((a, b) => a.order - b.order)
  }, [blocks, pageId])

  /**
   * SortableContext에 전달할 ID 배열
   */
  const sortedIds = useMemo(() => {
    return sortedBlocks.map((block) => block.id)
  }, [sortedBlocks])

  /**
   * 센서 설정
   * - PointerSensor: 마우스/터치 드래그
   * - KeyboardSensor: 방향키로 순서 변경
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이동 후 드래그 시작 (클릭과 구분)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  /**
   * 드래그 시작 핸들러
   */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
  }

  /**
   * 드래그 종료 핸들러
   * 블록 순서를 변경하고 store에 반영
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      setActiveId(null)
      return
    }

    const activeIndex = sortedIds.indexOf(active.id as string)
    const overIndex = sortedIds.indexOf(over.id as string)

    // 블록이 존재하지 않으면 무시
    if (activeIndex === -1 || overIndex === -1) {
      setActiveId(null)
      return
    }

    // 전체 블록 목록에서의 실제 인덱스 찾기
    const allBlocks = useBlockStore.getState().blocks
    const activeBlock = sortedBlocks[activeIndex]
    const overBlock = sortedBlocks[overIndex]

    const actualActiveIndex = allBlocks.findIndex((b) => b.id === activeBlock.id)
    const actualOverIndex = allBlocks.findIndex((b) => b.id === overBlock.id)

    if (actualActiveIndex !== -1 && actualOverIndex !== -1) {
      reorderBlocks(actualActiveIndex, actualOverIndex)
    }

    setActiveId(null)
  }

  /**
   * 드래그 취소 핸들러
   */
  const handleDragCancel = () => {
    setActiveId(null)
  }

  return {
    sensors,
    sortedIds,
    activeId,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  }
}

/**
 * DndContext 타입을 re-export (편의성)
 */
export { DndContext, closestCenter }

/**
 * SortableContext 타입을 re-export (편의성)
 */
export { SortableContext, verticalListSortingStrategy }
