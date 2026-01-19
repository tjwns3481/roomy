// @TASK T2.4 - QUICK_INFO 블록 에디터
// @SPEC docs/planning/02-trd.md#블록-타입별-에디터

'use client';

import { useState, useEffect } from 'react';
import type { QuickInfoContent } from '@/contracts';

interface QuickInfoEditorProps {
  content: Record<string, unknown>;
  onUpdate: (content: Record<string, unknown>) => void;
}

export function QuickInfoEditor({ content, onUpdate }: QuickInfoEditorProps) {
  const quickInfoContent = content as QuickInfoContent;
  const [items, setItems] = useState(quickInfoContent.items || []);

  useEffect(() => {
    setItems(quickInfoContent.items || []);
  }, [quickInfoContent]);

  const handleAddItem = () => {
    const newItems = [
      ...items,
      { icon: '', label: '', value: '' },
    ];
    setItems(newItems);
    onUpdate({ items: newItems });
  };

  const handleUpdateItem = (index: number, field: 'icon' | 'label' | 'value', value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    onUpdate({ items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onUpdate({ items: newItems });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">빠른 정보</h3>
        <button
          onClick={handleAddItem}
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          + 항목 추가
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          항목을 추가하여 빠른 정보를 입력하세요
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

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor={`quick-info-icon-${index}`} className="block text-xs text-gray-600 mb-1">
                    아이콘
                  </label>
                  <input
                    id={`quick-info-icon-${index}`}
                    type="text"
                    value={item.icon}
                    onChange={(e) => handleUpdateItem(index, 'icon', e.target.value)}
                    placeholder="clock"
                    maxLength={50}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor={`quick-info-label-${index}`} className="block text-xs text-gray-600 mb-1">
                    라벨
                  </label>
                  <input
                    id={`quick-info-label-${index}`}
                    type="text"
                    value={item.label}
                    onChange={(e) => handleUpdateItem(index, 'label', e.target.value)}
                    placeholder="체크인"
                    maxLength={50}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor={`quick-info-value-${index}`} className="block text-xs text-gray-600 mb-1">
                    값
                  </label>
                  <input
                    id={`quick-info-value-${index}`}
                    type="text"
                    value={item.value}
                    onChange={(e) => handleUpdateItem(index, 'value', e.target.value)}
                    placeholder="15:00"
                    maxLength={200}
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
