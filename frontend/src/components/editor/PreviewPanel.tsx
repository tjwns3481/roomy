'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useBlockStore } from '@/stores/blockStore';

interface PreviewPanelProps {
  pageId: string;
}

export function PreviewPanel({ pageId }: PreviewPanelProps) {
  const blocks = useBlockStore((state) => state.blocks);

  const pageBlocks = useMemo(
    () => blocks.filter((block) => block.pageId === pageId),
    [blocks, pageId]
  );

  return (
    <div
      className="h-full overflow-y-auto border-l border-gray-200 bg-white p-6"
      data-testid="preview-panel"
    >
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-6 text-xl font-bold text-gray-900">미리보기</h2>
        <div className="space-y-4">
          {pageBlocks.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-gray-400">
              <p>미리보기할 콘텐츠가 없습니다</p>
            </div>
          ) : (
            pageBlocks.map((block) => {
              const content = block.content as Record<string, unknown>;
              return (
                <div key={block.id} className="rounded-lg border border-gray-100 p-4">
                  <div className="prose prose-sm max-w-none">
                    {block.type === 'text' && (
                      <p>{String(content.text || '')}</p>
                    )}
                    {block.type === 'heading' && (
                      <h3>{String(content.text || '')}</h3>
                    )}
                    {block.type === 'image' && typeof content.url === 'string' && (
                      <div className="relative w-full aspect-video">
                        <Image
                          src={String(content.url)}
                          alt={String(content.caption || '')}
                          fill
                          className="rounded-lg object-cover"
                          sizes="(max-width: 768px) 100vw, 600px"
                        />
                      </div>
                    )}
                    {block.type === 'code' && (
                      <pre className="rounded-lg bg-gray-100 p-3">
                        <code>{String(content.code || '')}</code>
                      </pre>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
