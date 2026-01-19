// @TASK T2.5 - BlockList with Drag and Drop
// @SPEC docs/planning/02-trd.md#드래그앤드롭

'use client'

import { useBlockStore } from '@/stores/blockStore'
import { SortableBlock } from './SortableBlock'
import {
  useDragDrop,
  DndContext,
  closestCenter,
  SortableContext,
  verticalListSortingStrategy,
} from '@/hooks/useDragDrop'

interface BlockListProps {
  pageId: string
}

/**
 * BlockList 컴포넌트
 *
 * 드래그앤드롭이 적용된 블록 목록을 렌더링합니다.
 *
 * 기능:
 * - 블록 순서 변경 (마우스/키보드)
 * - 드래그 중 시각적 피드백
 * - 접근성 지원
 *
 * @example
 * ```tsx
 * <BlockList pageId="page-123" />
 * ```
 */
export function BlockList({ pageId }: BlockListProps) {
  const updateBlock = useBlockStore((state) => state.updateBlock)
  const removeBlock = useBlockStore((state) => state.removeBlock)
  const blocks = useBlockStore((state) => state.blocks)

  const {
    sensors,
    sortedIds,
    activeId,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragDrop(pageId)

  const pageBlocks = blocks
    .filter((block) => block.pageId === pageId)
    .sort((a, b) => a.order - b.order)

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4" data-testid="block-list">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-4 pl-8">
            {pageBlocks.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-gray-400">
                <p>블록을 추가하여 페이지를 만들어보세요</p>
              </div>
            ) : (
              pageBlocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  onUpdate={(content) => updateBlock(block.id, { content })}
                  onDelete={() => removeBlock(block.id)}
                  isDragging={activeId === block.id}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
