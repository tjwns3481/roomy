// @TASK T2.4 - HERO 블록 에디터
// @SPEC docs/planning/02-trd.md#블록-타입별-에디터

'use client';

import { useState, useEffect } from 'react';
import type { HeroContent } from '@/contracts';

interface HeroEditorProps {
  content: Record<string, unknown>;
  onUpdate: (content: Record<string, unknown>) => void;
}

export function HeroEditor({ content, onUpdate }: HeroEditorProps) {
  const heroContent = content as HeroContent;

  const [imageUrl, setImageUrl] = useState(heroContent.imageUrl || '');
  const [title, setTitle] = useState(heroContent.title || '');
  const [subtitle, setSubtitle] = useState(heroContent.subtitle || '');

  useEffect(() => {
    setImageUrl(heroContent.imageUrl || '');
    setTitle(heroContent.title || '');
    setSubtitle(heroContent.subtitle || '');
  }, [heroContent]);

  const handleUpdate = (field: keyof HeroContent, value: string | null) => {
    const updated = {
      ...heroContent,
      [field]: value,
    };
    onUpdate(updated);
  };

  return (
    <div className="space-y-4">
      {/* 이미지 URL */}
      <div>
        <label htmlFor="hero-image-url" className="block text-sm font-medium text-gray-700 mb-1">
          이미지 URL
        </label>
        <input
          id="hero-image-url"
          type="text"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            handleUpdate('imageUrl', e.target.value || null);
          }}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* 제목 */}
      <div>
        <label htmlFor="hero-title" className="block text-sm font-medium text-gray-700 mb-1">
          제목
        </label>
        <input
          id="hero-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            handleUpdate('title', e.target.value);
          }}
          placeholder="환영합니다"
          maxLength={100}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* 부제목 */}
      <div>
        <label htmlFor="hero-subtitle" className="block text-sm font-medium text-gray-700 mb-1">
          부제목
        </label>
        <input
          id="hero-subtitle"
          type="text"
          value={subtitle}
          onChange={(e) => {
            setSubtitle(e.target.value);
            handleUpdate('subtitle', e.target.value);
          }}
          placeholder="편안한 휴식 공간"
          maxLength={200}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* 미리보기 */}
      {imageUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">미리보기</p>
          <div className="relative h-48 rounded-md overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt={title || '히어로 이미지'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3C/svg%3E';
              }}
            />
            {title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-white text-lg font-bold">{title}</h3>
                {subtitle && (
                  <p className="text-white/90 text-sm">{subtitle}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
