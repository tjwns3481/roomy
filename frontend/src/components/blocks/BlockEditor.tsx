// @TASK T2.4 - 블록 컴포넌트 구현
// @SPEC docs/planning/02-trd.md#블록-타입별-에디터

'use client';

import type { EditorBlock } from '@/stores/blockStore';
import { HeroEditor } from './HeroEditor';
import { QuickInfoEditor } from './QuickInfoEditor';
import { AmenitiesEditor } from './AmenitiesEditor';
import { MapEditor } from './MapEditor';
import { GalleryEditor } from './GalleryEditor';
import { HostPickEditor } from './HostPickEditor';
import { NoticeEditor } from './NoticeEditor';

export interface BlockEditorProps {
  block: EditorBlock;
  onUpdate: (content: Record<string, unknown>) => void;
  onDelete: () => void;
}

/**
 * 블록 타입에 따라 적절한 에디터를 렌더링하는 컴포넌트
 */
export function BlockEditor({ block, onUpdate, onDelete }: BlockEditorProps) {
  const renderEditor = () => {
    switch (block.type) {
      case 'HERO':
        return <HeroEditor content={block.content} onUpdate={onUpdate} />;
      case 'QUICK_INFO':
        return <QuickInfoEditor content={block.content} onUpdate={onUpdate} />;
      case 'AMENITIES':
        return <AmenitiesEditor content={block.content} onUpdate={onUpdate} />;
      case 'MAP':
        return <MapEditor content={block.content} onUpdate={onUpdate} />;
      case 'GALLERY':
        return <GalleryEditor content={block.content} onUpdate={onUpdate} />;
      case 'HOST_PICK':
        return <HostPickEditor content={block.content} onUpdate={onUpdate} />;
      case 'NOTICE':
        return <NoticeEditor content={block.content} onUpdate={onUpdate} />;
      default:
        return (
          <div className="text-gray-500 text-sm">
            지원하지 않는 블록 타입: {block.type}
          </div>
        );
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4 shadow-sm">
      {/* 블록 헤더 */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
        <span className="text-xs font-medium text-gray-500 uppercase">
          {block.type}
        </span>
        <button
          onClick={onDelete}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
          aria-label="삭제"
        >
          삭제
        </button>
      </div>

      {/* 블록 에디터 */}
      <div>{renderEditor()}</div>
    </div>
  );
}
