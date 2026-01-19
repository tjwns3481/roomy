// @TASK T2.4 - AMENITIES 블록 에디터
// @SPEC docs/planning/02-trd.md#블록-타입별-에디터

'use client';

import { useState, useEffect } from 'react';
import type { AmenitiesContent } from '@/contracts';

interface AmenitiesEditorProps {
  content: Record<string, unknown>;
  onUpdate: (content: Record<string, unknown>) => void;
}

export function AmenitiesEditor({ content, onUpdate }: AmenitiesEditorProps) {
  const amenitiesContent = content as AmenitiesContent;
  const [title, setTitle] = useState(amenitiesContent.title || '편의시설');
  const [items, setItems] = useState(amenitiesContent.items || []);

  useEffect(() => {
    setTitle(amenitiesContent.title || '편의시설');
    setItems(amenitiesContent.items || []);
  }, [amenitiesContent]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onUpdate({ ...amenitiesContent, title: newTitle });
  };

  const handleAddItem = () => {
    const newItems = [
      ...items,
      { icon: '', name: '', description: '' },
    ];
    setItems(newItems);
    onUpdate({ ...amenitiesContent, items: newItems });
  };

  const handleUpdateItem = (
    index: number,
    field: 'icon' | 'name' | 'description',
    value: string
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    onUpdate({ ...amenitiesContent, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onUpdate({ ...amenitiesContent, items: newItems });
  };

  return (
    <div className="space-y-4">
      {/* 제목 */}
      <div>
        <label htmlFor="amenities-title" className="block text-sm font-medium text-gray-700 mb-1">
          블록 제목
        </label>
        <input
          id="amenities-title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="편의시설"
          maxLength={100}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* 항목 목록 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">편의시설 항목</h3>
        <button
          onClick={handleAddItem}
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          + 항목 추가
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          편의시설 항목을 추가하세요
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">항목 {index + 1}</span>
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  삭제
                </button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor={`amenity-icon-${index}`} className="block text-xs text-gray-600 mb-1">
                      아이콘
                    </label>
                    <input
                      id={`amenity-icon-${index}`}
                      type="text"
                      value={item.icon}
                      onChange={(e) => handleUpdateItem(index, 'icon', e.target.value)}
                      placeholder="wifi"
                      maxLength={50}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor={`amenity-name-${index}`} className="block text-xs text-gray-600 mb-1">
                      이름
                    </label>
                    <input
                      id={`amenity-name-${index}`}
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                      placeholder="무료 Wi-Fi"
                      maxLength={100}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`amenity-description-${index}`} className="block text-xs text-gray-600 mb-1">
                    설명 (선택)
                  </label>
                  <input
                    id={`amenity-description-${index}`}
                    type="text"
                    value={item.description || ''}
                    onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                    placeholder="전 객실 무선 인터넷 제공"
                    maxLength={300}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
