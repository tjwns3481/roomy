// @TASK T2.5 - Sortable Block 컴포넌트
// @SPEC docs/planning/02-trd.md#드래그앤드롭

'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BlockEditor } from '@/components/blocks'
import type { EditorBlock } from '@/stores/blockStore'

interface SortableBlockProps {
  block: EditorBlock
  onUpdate: (content: Record<string, unknown>) => void
  onDelete: () => void
  isDragging?: boolean
}

/**
 * SortableBlock 컴포넌트
 *
 * @dnd-kit의 useSortable을 사용하여 드래그 가능한 블록을 렌더링합니다.
 *
 * 기능:
 * - 드래그 핸들 제공
 * - 드래그 중 시각적 피드백 (투명도, 커서)
 * - 키보드 접근성 (포커스 관리)
 *
 * @example
 * ```tsx
 * <SortableBlock
 *   block={block}
 *   onUpdate={(content) => updateBlock(block.id, { content })}
 *   onDelete={() => removeBlock(block.id)}
 * />
 * ```
 */
export function SortableBlock({
  block,
  onUpdate,
  onDelete,
  isDragging: _isDragging = false,
}: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
    cursor: isSortableDragging ? 'grabbing' : 'grab',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative"
      data-testid={`sortable-block-${block.id}`}
      {...attributes}
    >
      {/* Drag Handle */}
      <div
        className="absolute left-0 top-0 flex h-full items-center opacity-0 transition-opacity group-hover:opacity-100"
        style={{ marginLeft: '-2rem' }}
        {...listeners}
        aria-label="블록 이동"
      >
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          tabIndex={-1}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M10 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm4-8a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
          </svg>
        </button>
      </div>

      {/* Block Content */}
      <BlockEditor block={block} onUpdate={onUpdate} onDelete={onDelete} />
    </div>
  )
}
