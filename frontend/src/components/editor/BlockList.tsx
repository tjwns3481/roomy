'use client';

import { useMemo } from 'react';
import { useBlockStore } from '@/stores/blockStore';

interface BlockListProps {
  pageId: string;
}

export function BlockList({ pageId }: BlockListProps) {
  const blocks = useBlockStore((state) => state.blocks);

  const pageBlocks = useMemo(
    () => blocks.filter((block) => block.pageId === pageId),
    [blocks, pageId]
  );

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4" data-testid="block-list">
      <div className="space-y-2">
        {pageBlocks.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-gray-400">
            <p>블록을 추가하여 페이지를 만들어보세요</p>
          </div>
        ) : (
          pageBlocks.map((block) => (
            <div
              key={block.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="text-sm font-medium text-gray-700">
                {block.type}
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {JSON.stringify(block.content).substring(0, 100)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
