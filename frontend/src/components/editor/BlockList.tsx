'use client';

import { useMemo } from 'react';
import { useBlockStore } from '@/stores/blockStore';
import { BlockEditor } from '@/components/blocks';

interface BlockListProps {
  pageId: string;
}

export function BlockList({ pageId }: BlockListProps) {
  const blocks = useBlockStore((state) => state.blocks);
  const updateBlock = useBlockStore((state) => state.updateBlock);
  const removeBlock = useBlockStore((state) => state.removeBlock);

  const pageBlocks = useMemo(
    () => blocks.filter((block) => block.pageId === pageId),
    [blocks, pageId]
  );

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4" data-testid="block-list">
      <div className="space-y-4">
        {pageBlocks.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-gray-400">
            <p>블록을 추가하여 페이지를 만들어보세요</p>
          </div>
        ) : (
          pageBlocks.map((block) => (
            <BlockEditor
              key={block.id}
              block={block}
              onUpdate={(content) => updateBlock(block.id, { content })}
              onDelete={() => removeBlock(block.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
