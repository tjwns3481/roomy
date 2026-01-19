// @TASK T2.4 - GALLERY 블록 에디터
// @SPEC docs/planning/02-trd.md#블록-타입별-에디터

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { GalleryContent } from '@/contracts';

interface GalleryEditorProps {
  content: Record<string, unknown>;
  onUpdate: (content: Record<string, unknown>) => void;
}

export function GalleryEditor({ content, onUpdate }: GalleryEditorProps) {
  const galleryContent = content as GalleryContent;
  const [title, setTitle] = useState(galleryContent.title || '갤러리');
  const [images, setImages] = useState(galleryContent.images || []);
  const [layout, setLayout] = useState(galleryContent.layout || 'grid');

  useEffect(() => {
    setTitle(galleryContent.title || '갤러리');
    setImages(galleryContent.images || []);
    setLayout(galleryContent.layout || 'grid');
  }, [galleryContent]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onUpdate({ ...galleryContent, title: newTitle });
  };

  const handleLayoutChange = (newLayout: 'grid' | 'carousel' | 'masonry') => {
    setLayout(newLayout);
    onUpdate({ ...galleryContent, layout: newLayout });
  };

  const handleAddImage = () => {
    const newImages = [
      ...images,
      {
        id: `img-${Date.now()}`,
        url: '',
        caption: '',
        order: images.length,
      },
    ];
    setImages(newImages);
    onUpdate({ ...galleryContent, images: newImages });
  };

  const handleUpdateImage = (
    index: number,
    field: 'url' | 'caption',
    value: string
  ) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    setImages(newImages);
    onUpdate({ ...galleryContent, images: newImages });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images
      .filter((_, i) => i !== index)
      .map((img, idx) => ({ ...img, order: idx }));
    setImages(newImages);
    onUpdate({ ...galleryContent, images: newImages });
  };

  return (
    <div className="space-y-4">
      {/* 제목 */}
      <div>
        <label htmlFor="gallery-title" className="block text-sm font-medium text-gray-700 mb-1">
          블록 제목
        </label>
        <input
          id="gallery-title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="갤러리"
          maxLength={100}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* 레이아웃 선택 */}
      <div>
        <label htmlFor="gallery-layout" className="block text-sm font-medium text-gray-700 mb-1">
          레이아웃
        </label>
        <select
          id="gallery-layout"
          value={layout}
          onChange={(e) => handleLayoutChange(e.target.value as 'grid' | 'carousel' | 'masonry')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="grid">그리드</option>
          <option value="carousel">캐러셀</option>
          <option value="masonry">메이슨리</option>
        </select>
      </div>

      {/* 이미지 목록 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">이미지 목록</h3>
        <button
          onClick={handleAddImage}
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          + 이미지 추가
        </button>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          이미지를 추가하세요
        </div>
      ) : (
        <div className="space-y-3">
          {images.map((image, index) => (
            <div key={image.id} className="border border-gray-200 rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">이미지 {index + 1}</span>
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  삭제
                </button>
              </div>

              <div>
                <label htmlFor={`gallery-img-url-${index}`} className="block text-xs text-gray-600 mb-1">
                  이미지 URL
                </label>
                <input
                  id={`gallery-img-url-${index}`}
                  type="text"
                  value={image.url}
                  onChange={(e) => handleUpdateImage(index, 'url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor={`gallery-img-caption-${index}`} className="block text-xs text-gray-600 mb-1">
                  캡션 (선택)
                </label>
                <input
                  id={`gallery-img-caption-${index}`}
                  type="text"
                  value={image.caption || ''}
                  onChange={(e) => handleUpdateImage(index, 'caption', e.target.value)}
                  placeholder="이미지 설명"
                  maxLength={200}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* 미리보기 */}
              {image.url && (
                <div className="mt-2 relative w-full h-32">
                  <Image
                    src={image.url}
                    alt={image.caption || `이미지 ${index + 1}`}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 768px) 100vw, 400px"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
