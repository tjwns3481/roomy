// @TASK T2.4 - NOTICE 블록 에디터
// @SPEC docs/planning/02-trd.md#블록-타입별-에디터

'use client';

import { useState, useEffect } from 'react';
import type { NoticeContent } from '@/contracts';

interface NoticeEditorProps {
  content: Record<string, unknown>;
  onUpdate: (content: Record<string, unknown>) => void;
}

export function NoticeEditor({ content, onUpdate }: NoticeEditorProps) {
  const noticeContent = content as NoticeContent;
  const [title, setTitle] = useState(noticeContent.title || '주의사항');
  const [variant, setVariant] = useState(noticeContent.variant || 'info');
  const [items, setItems] = useState(noticeContent.items || []);

  useEffect(() => {
    setTitle(noticeContent.title || '주의사항');
    setVariant(noticeContent.variant || 'info');
    setItems(noticeContent.items || []);
  }, [noticeContent]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onUpdate({ ...noticeContent, title: newTitle });
  };

  const handleVariantChange = (newVariant: 'info' | 'warning' | 'danger') => {
    setVariant(newVariant);
    onUpdate({ ...noticeContent, variant: newVariant });
  };

  const handleAddItem = () => {
    const newItems = [
      ...items,
      {
        id: `notice-${Date.now()}`,
        icon: '',
        text: '',
      },
    ];
    setItems(newItems);
    onUpdate({ ...noticeContent, items: newItems });
  };

  const handleUpdateItem = (
    index: number,
    field: 'icon' | 'text',
    value: string
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    onUpdate({ ...noticeContent, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onUpdate({ ...noticeContent, items: newItems });
  };

  return (
    <div className="space-y-4">
      {/* 제목 */}
      <div>
        <label htmlFor="notice-title" className="block text-sm font-medium text-gray-700 mb-1">
          블록 제목
        </label>
        <input
          id="notice-title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="주의사항"
          maxLength={100}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* 타입 선택 */}
      <div>
        <label htmlFor="notice-variant" className="block text-sm font-medium text-gray-700 mb-1">
          타입
        </label>
        <select
          id="notice-variant"
          value={variant}
          onChange={(e) => handleVariantChange(e.target.value as 'info' | 'warning' | 'danger')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="info">정보</option>
          <option value="warning">경고</option>
          <option value="danger">위험</option>
        </select>
      </div>

      {/* 항목 목록 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">공지사항 항목</h3>
        <button
          onClick={handleAddItem}
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          + 항목 추가
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          공지사항 항목을 추가하세요
        </div>
      ) : (
        <div className="space-y-3">
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

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label htmlFor={`notice-icon-${index}`} className="block text-xs text-gray-600 mb-1">
                    아이콘 (선택)
                  </label>
                  <input
                    id={`notice-icon-${index}`}
                    type="text"
                    value={item.icon || ''}
                    onChange={(e) => handleUpdateItem(index, 'icon', e.target.value)}
                    placeholder="alert"
                    maxLength={50}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="col-span-3">
                  <label htmlFor={`notice-text-${index}`} className="block text-xs text-gray-600 mb-1">
                    내용
                  </label>
                  <input
                    id={`notice-text-${index}`}
                    type="text"
                    value={item.text}
                    onChange={(e) => handleUpdateItem(index, 'text', e.target.value)}
                    placeholder="주의사항을 입력하세요"
                    maxLength={500}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 미리보기 */}
      {items.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">미리보기</p>
          <div
            className={`p-4 rounded-md ${
              variant === 'info'
                ? 'bg-blue-50 border border-blue-200'
                : variant === 'warning'
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <h4
              className={`font-semibold mb-2 ${
                variant === 'info'
                  ? 'text-blue-900'
                  : variant === 'warning'
                  ? 'text-yellow-900'
                  : 'text-red-900'
              }`}
            >
              {title}
            </h4>
            <ul className="space-y-1">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`text-sm ${
                    variant === 'info'
                      ? 'text-blue-800'
                      : variant === 'warning'
                      ? 'text-yellow-800'
                      : 'text-red-800'
                  }`}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
