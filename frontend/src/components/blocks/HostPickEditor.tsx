// @TASK T2.4 - HOST_PICK 블록 에디터
// @SPEC docs/planning/02-trd.md#블록-타입별-에디터

'use client';

import { useState, useEffect } from 'react';
import type { HostPickContent } from '@/contracts';

interface HostPickEditorProps {
  content: Record<string, unknown>;
  onUpdate: (content: Record<string, unknown>) => void;
}

export function HostPickEditor({ content, onUpdate }: HostPickEditorProps) {
  const hostPickContent = content as HostPickContent;
  const [title, setTitle] = useState(hostPickContent.title || '호스트 추천');
  const [items, setItems] = useState(hostPickContent.items || []);

  useEffect(() => {
    setTitle(hostPickContent.title || '호스트 추천');
    setItems(hostPickContent.items || []);
  }, [hostPickContent]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onUpdate({ ...hostPickContent, title: newTitle });
  };

  const handleAddItem = () => {
    const newItems = [
      ...items,
      {
        id: `pick-${Date.now()}`,
        category: '',
        name: '',
        description: '',
        imageUrl: null,
        address: '',
        link: '',
      },
    ];
    setItems(newItems);
    onUpdate({ ...hostPickContent, items: newItems });
  };

  const handleUpdateItem = (
    index: number,
    field: keyof typeof items[0],
    value: string | null
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    onUpdate({ ...hostPickContent, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onUpdate({ ...hostPickContent, items: newItems });
  };

  return (
    <div className="space-y-4">
      {/* 제목 */}
      <div>
        <label htmlFor="host-pick-title" className="block text-sm font-medium text-gray-700 mb-1">
          블록 제목
        </label>
        <input
          id="host-pick-title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="호스트 추천"
          maxLength={100}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* 항목 목록 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">추천 항목</h3>
        <button
          onClick={handleAddItem}
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          + 항목 추가
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          추천 항목을 추가하세요
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="border border-gray-200 rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">항목 {index + 1}</span>
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  삭제
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor={`pick-category-${index}`} className="block text-xs text-gray-600 mb-1">
                    카테고리
                  </label>
                  <input
                    id={`pick-category-${index}`}
                    type="text"
                    value={item.category}
                    onChange={(e) => handleUpdateItem(index, 'category', e.target.value)}
                    placeholder="맛집"
                    maxLength={50}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor={`pick-name-${index}`} className="block text-xs text-gray-600 mb-1">
                    이름
                  </label>
                  <input
                    id={`pick-name-${index}`}
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                    placeholder="맛있는 집"
                    maxLength={100}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`pick-description-${index}`} className="block text-xs text-gray-600 mb-1">
                  설명
                </label>
                <textarea
                  id={`pick-description-${index}`}
                  value={item.description}
                  onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                  placeholder="추천 이유를 설명해주세요"
                  maxLength={500}
                  rows={2}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label htmlFor={`pick-image-${index}`} className="block text-xs text-gray-600 mb-1">
                  이미지 URL (선택)
                </label>
                <input
                  id={`pick-image-${index}`}
                  type="text"
                  value={item.imageUrl || ''}
                  onChange={(e) => handleUpdateItem(index, 'imageUrl', e.target.value || null)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor={`pick-address-${index}`} className="block text-xs text-gray-600 mb-1">
                  주소 (선택)
                </label>
                <input
                  id={`pick-address-${index}`}
                  type="text"
                  value={item.address || ''}
                  onChange={(e) => handleUpdateItem(index, 'address', e.target.value)}
                  placeholder="서울시 강남구"
                  maxLength={300}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor={`pick-link-${index}`} className="block text-xs text-gray-600 mb-1">
                  링크 (선택)
                </label>
                <input
                  id={`pick-link-${index}`}
                  type="text"
                  value={item.link || ''}
                  onChange={(e) => handleUpdateItem(index, 'link', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
