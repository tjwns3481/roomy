'use client';

import { EditorHeader } from './EditorHeader';
import { BlockList } from './BlockList';
import { PreviewPanel } from './PreviewPanel';

interface EditorLayoutProps {
  pageId: string;
  title: string;
  isSaving?: boolean;
  onBack: () => void;
  onPublish: () => void;
}

export function EditorLayout({
  pageId,
  title,
  isSaving = false,
  onBack,
  onPublish,
}: EditorLayoutProps) {
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <EditorHeader
        title={title}
        isSaving={isSaving}
        onBack={onBack}
        onPublish={onPublish}
      />

      {/* Main Content: 3-column layout on desktop, single column on mobile */}
      <div className="grid flex-1 overflow-hidden md:grid-cols-2 lg:grid-cols-3">
        {/* Block Palette (hidden on mobile, shown on large screens) */}
        <aside className="hidden border-r border-gray-200 bg-gray-50 lg:block">
          <div className="h-full overflow-y-auto p-4">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">
              블록 추가
            </h2>
            <div className="space-y-2">
              <button className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left text-sm hover:bg-gray-50">
                텍스트
              </button>
              <button className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left text-sm hover:bg-gray-50">
                제목
              </button>
              <button className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left text-sm hover:bg-gray-50">
                이미지
              </button>
              <button className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left text-sm hover:bg-gray-50">
                코드
              </button>
            </div>
          </div>
        </aside>

        {/* Block List (main editing area) */}
        <BlockList pageId={pageId} />

        {/* Preview Panel (hidden on mobile, shown on medium+ screens) */}
        <aside className="hidden md:block">
          <PreviewPanel pageId={pageId} />
        </aside>
      </div>
    </div>
  );
}
